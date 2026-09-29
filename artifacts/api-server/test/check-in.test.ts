// @ts-nocheck
import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createCheckInQrCredential, hashCheckInQrPayload } from "../src/lib/check-in-qr.ts";

const sessionColumn = (property) => ({ table: "sessions", property });
const checkInColumn = (property) => ({ table: "checkIns", property });
const registrationColumn = (property) => ({ table: "registrations", property });

const checkInSessionsTable = {
  id: sessionColumn("id"),
  conferenceYear: sessionColumn("conferenceYear"),
  sessionDate: sessionColumn("sessionDate"),
  name: sessionColumn("name"),
  createdAt: sessionColumn("createdAt"),
  createdBy: sessionColumn("createdBy"),
};
const registrationCheckInsTable = {
  id: checkInColumn("id"),
  sessionId: checkInColumn("sessionId"),
  registrationId: checkInColumn("registrationId"),
  checkedInAt: checkInColumn("checkedInAt"),
  checkedInBy: checkInColumn("checkedInBy"),
};
const registrationsTable = {
  id: registrationColumn("id"),
  conferenceYear: registrationColumn("conferenceYear"),
  checkInTokenHash: registrationColumn("checkInTokenHash"),
  firstName: registrationColumn("firstName"),
  lastName: registrationColumn("lastName"),
  email: registrationColumn("email"),
};

const defaultRegistrations = [
  { id: 101, firstName: "Ada", lastName: "Lovelace", email: "ada@example.org", conferenceYear: 2026, checkInTokenHash: null },
  { id: 102, firstName: "Grace", lastName: "Hopper", email: "grace@example.org", conferenceYear: 2025, checkInTokenHash: null },
];
const sentQrEmails = [];
const state = {
  sessions: [],
  checkIns: [],
  registrations: defaultRegistrations.map((registration) => ({ ...registration })),
  nextSessionId: 1,
  nextCheckInId: 1,
};

function rowsFor(table) {
  if (table === checkInSessionsTable) return state.sessions;
  if (table === registrationCheckInsTable) return state.checkIns;
  if (table === registrationsTable) return state.registrations;
  throw new Error("Unexpected table in check-in test");
}

function matches(row, condition) {
  if (!condition) return true;
  if (condition.kind === "and") return condition.conditions.every((item) => matches(row, item));
  return row[condition.column.property] === condition.value;
}

function project(row, selection) {
  if (!selection) return { ...row };
  return Object.fromEntries(
    Object.entries(selection).map(([key, column]) => [key, row[column.property]]),
  );
}

function fakeDb() {
  const db = {
    select(selection) {
      let table;
      let condition;
      const execute = async (limit) =>
        rowsFor(table)
          .filter((row) => matches(row, condition))
          .slice(0, limit)
          .map((row) => project(row, selection));

      const builder = {
        from(value) {
          table = value;
          return this;
        },
        where(value) {
          condition = value;
          return this;
        },
        orderBy() {
          return execute();
        },
        for() {
          return execute();
        },
        limit(count) {
          return execute(count);
        },
      };
      return builder;
    },
    insert(table) {
      let values;
      return {
        values(value) {
          values = value;
          return this;
        },
        onConflictDoNothing() {
          return this;
        },
        async returning() {
          if (table === checkInSessionsTable) {
            const duplicate = state.sessions.some(
              (session) =>
                session.conferenceYear === values.conferenceYear &&
                session.sessionDate === values.sessionDate &&
                session.name === values.name,
            );
            if (duplicate) return [];
            const row = {
              ...values,
              id: state.nextSessionId++,
              createdAt: new Date("2026-09-28T12:00:00.000Z"),
            };
            state.sessions.push(row);
            return [{ ...row }];
          }

          const duplicate = state.checkIns.some(
            (checkIn) =>
              checkIn.sessionId === values.sessionId &&
              checkIn.registrationId === values.registrationId,
          );
          if (duplicate) return [];
          const row = {
            ...values,
            id: state.nextCheckInId++,
            checkedInAt: new Date("2026-09-28T12:00:00.000Z"),
          };
          state.checkIns.push(row);
          return [{ ...row }];
        },
      };
    },
    delete(table) {
      let condition;
      const execute = async () => {
        const rows = rowsFor(table);
        const deleted = rows.filter((row) => matches(row, condition));
        const remaining = rows.filter((row) => !matches(row, condition));
        rows.splice(0, rows.length, ...remaining);
        if (table === checkInSessionsTable) {
          const deletedIds = new Set(deleted.map((row) => row.id));
          state.checkIns = state.checkIns.filter((row) => !deletedIds.has(row.sessionId));
        }
        return deleted.map((row) => ({ ...row }));
      };

      const builder = {
        where(value) {
          condition = value;
          return this;
        },
        returning() {
          return execute();
        },
        then(resolve, reject) {
          return execute().then(resolve, reject);
        },
      };
      return builder;
    },
    update(table) {
      let values;
      return {
        set(value) {
          values = value;
          return this;
        },
        async where(condition) {
          const rows = rowsFor(table).filter((row) => matches(row, condition));
          for (const row of rows) Object.assign(row, values);
          return rows.map((row) => ({ ...row }));
        },
      };
    },
    transaction(callback) {
      return callback(db);
    },
  };
  return db;
}

const db = fakeDb();
const routePath = pathToFileURL(resolve("src/routes/check-in.ts")).href;
const adminSessionPath = pathToFileURL(resolve("src/lib/admin-session.ts")).href;
const emailPath = pathToFileURL(resolve("src/lib/email.ts")).href;

mock.module("@workspace/db", {
  namedExports: {
    db,
    checkInSessionsTable,
    registrationCheckInsTable,
    registrationsTable,
  },
});
mock.module("drizzle-orm", {
  namedExports: {
    and: (...conditions) => ({ kind: "and", conditions }),
    asc: (column) => ({ column, direction: "asc" }),
    desc: (column) => ({ column, direction: "desc" }),
    eq: (column, value) => ({ kind: "eq", column, value }),
  },
});
mock.module(adminSessionPath, {
  namedExports: {
    getAdminIdentity: (req) =>
      req.headers["x-test-admin"] === "1" || req.headers["x-test-checkin"] === "1"
        ? "staff@example.org"
        : null,
    hasAdminSession: (req) => req.headers["x-test-admin"] === "1",
    hasCheckInAccess: (req) =>
      req.headers["x-test-admin"] === "1" || req.headers["x-test-checkin"] === "1",
  },
});
mock.module(emailPath, {
  namedExports: {
    sendCheckInQrEmail: async (email) => {
      sentQrEmails.push(email);
    },
  },
});

const { default: checkInRouter } = await import(routePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { error() {} };
    next();
  });
  app.use(express.json());
  app.use(checkInRouter);
  return app;
}

async function request(method, path, body, access = false) {
  const app = makeApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(access === "checkin"
          ? { "x-test-checkin": "1" }
          : access
            ? { "x-test-admin": "1" }
            : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

beforeEach(() => {
  state.sessions.length = 0;
  state.checkIns.length = 0;
  state.registrations.splice(
    0,
    state.registrations.length,
    ...defaultRegistrations.map((registration) => ({ ...registration })),
  );
  sentQrEmails.length = 0;
  state.nextSessionId = 1;
  state.nextCheckInId = 1;
});

describe("admin check-in", () => {
  it("creates unique opaque QR credentials", () => {
    const first = createCheckInQrCredential();
    const second = createCheckInQrCredential();

    assert.match(first.payload, /^shalom-checkin:v1:[A-Za-z0-9_-]{43}$/);
    assert.notEqual(first.payload, second.payload);
    assert.equal(first.tokenHash, hashCheckInQrPayload(first.payload));
    assert.notEqual(first.tokenHash, first.payload);
    assert.doesNotMatch(first.payload, /ada@example\.org|101/);
  });

  it("requires an admin session before accessing every check-in endpoint", async () => {
    const requests = [
      ["GET", "/check-in-sessions"],
      ["POST", "/check-in-sessions", { conferenceYear: 2026, sessionDate: "2026-09-28", name: "Opening" }],
      ["DELETE", "/check-in-sessions/1"],
      ["GET", "/check-in-sessions/1/check-ins"],
      ["GET", "/check-in-sessions/1/roster"],
      ["POST", "/check-in-sessions/1/scan", { payload: `shalom-checkin:v1:${"A".repeat(43)}` }],
      ["POST", "/check-in-sessions/1/registrations/101/qr-email"],
      ["POST", "/check-in-sessions/1/registrations/101/check-in"],
      ["DELETE", "/check-in-sessions/1/registrations/101/check-in"],
    ];

    for (const [method, path, body] of requests) {
      const response = await request(method, path, body);
      assert.equal(response.status, 401, `${method} ${path} should require an admin session`);
    }
    assert.equal(state.sessions.length, 0);
    assert.equal(state.checkIns.length, 0);
  });

  it("limits check-in staff to the minimal roster and arrival actions", async () => {
    const session = await request(
      "POST",
      "/check-in-sessions",
      { conferenceYear: 2026, sessionDate: "2026-09-28", name: "Opening" },
      true,
    );
    assert.equal(session.status, 201);
    const sessionId = (await session.json()).id;

    const sessions = await request("GET", "/check-in-sessions", undefined, "checkin");
    assert.equal(sessions.status, 200);

    const roster = await request(
      "GET",
      `/check-in-sessions/${sessionId}/roster`,
      undefined,
      "checkin",
    );
    assert.equal(roster.status, 200);
    assert.deepEqual(await roster.json(), [
      { id: 101, firstName: "Ada", lastName: "Lovelace", conferenceYear: 2026 },
    ]);
    assert.equal(roster.headers.get("content-type")?.includes("application/json"), true);

    const checkedIn = await request(
      "POST",
      `/check-in-sessions/${sessionId}/registrations/101/check-in`,
      undefined,
      "checkin",
    );
    assert.equal(checkedIn.status, 201);
    assert.equal((await checkedIn.json()).checkedInBy, "staff@example.org");

    const undo = await request(
      "DELETE",
      `/check-in-sessions/${sessionId}/registrations/101/check-in`,
      undefined,
      "checkin",
    );
    assert.equal(undo.status, 204);

    const createSession = await request(
      "POST",
      "/check-in-sessions",
      { conferenceYear: 2026, sessionDate: "2026-09-29", name: "Evening" },
      "checkin",
    );
    const deleteSession = await request(
      "DELETE",
      `/check-in-sessions/${sessionId}`,
      undefined,
      "checkin",
    );
    const replaceQr = await request(
      "POST",
      `/check-in-sessions/${sessionId}/registrations/101/qr-email`,
      undefined,
      "checkin",
    );
    assert.equal(createSession.status, 403);
    assert.equal(deleteSession.status, 403);
    assert.equal(replaceQr.status, 403);
    assert.equal(state.sessions.length, 1);
  });

  it("creates configurable sessions and rejects duplicate session names for the same date", async () => {
    const sessionInput = {
      conferenceYear: 2026,
      sessionDate: "2026-09-28",
      name: "Opening gathering",
    };
    const created = await request("POST", "/check-in-sessions", sessionInput, true);
    assert.equal(created.status, 201);
    const createdSession = await created.json();
    assert.equal(createdSession.name, sessionInput.name);
    assert.equal(createdSession.createdBy, "staff@example.org");

    const duplicate = await request("POST", "/check-in-sessions", sessionInput, true);
    assert.equal(duplicate.status, 409);

    const list = await request("GET", "/check-in-sessions", undefined, true);
    assert.equal(list.status, 200);
    assert.equal((await list.json()).length, 1);
  });

  it("tracks each attendee by session, enforces conference year, and supports undo", async () => {
    const createSession = async (name, sessionDate) => {
      const response = await request(
        "POST",
        "/check-in-sessions",
        { conferenceYear: 2026, sessionDate, name },
        true,
      );
      assert.equal(response.status, 201);
      return response.json();
    };

    const firstSession = await createSession("Opening gathering", "2026-09-28");
    const secondSession = await createSession("Evening worship", "2026-09-28");
    const firstCheckIn = await request(
      "POST",
      `/check-in-sessions/${firstSession.id}/registrations/101/check-in`,
      undefined,
      true,
    );
    assert.equal(firstCheckIn.status, 201);
    assert.equal((await firstCheckIn.json()).checkedInBy, "staff@example.org");

    const duplicate = await request(
      "POST",
      `/check-in-sessions/${firstSession.id}/registrations/101/check-in`,
      undefined,
      true,
    );
    assert.equal(duplicate.status, 409);

    const secondCheckIn = await request(
      "POST",
      `/check-in-sessions/${secondSession.id}/registrations/101/check-in`,
      undefined,
      true,
    );
    assert.equal(secondCheckIn.status, 201);

    const wrongYear = await request(
      "POST",
      `/check-in-sessions/${firstSession.id}/registrations/102/check-in`,
      undefined,
      true,
    );
    assert.equal(wrongYear.status, 404);

    const roster = await request(
      "GET",
      `/check-in-sessions/${firstSession.id}/check-ins`,
      undefined,
      true,
    );
    assert.equal(roster.status, 200);
    assert.deepEqual((await roster.json()).map((item) => item.registrationId), [101]);

    const blockedDelete = await request(
      "DELETE",
      `/check-in-sessions/${firstSession.id}`,
      undefined,
      true,
    );
    assert.equal(blockedDelete.status, 409);

    const undone = await request(
      "DELETE",
      `/check-in-sessions/${firstSession.id}/registrations/101/check-in`,
      undefined,
      true,
    );
    assert.equal(undone.status, 204);

    const afterUndo = await request(
      "GET",
      `/check-in-sessions/${firstSession.id}/check-ins`,
      undefined,
      true,
    );
    assert.deepEqual(await afterUndo.json(), []);

    const deletedSession = await request(
      "DELETE",
      `/check-in-sessions/${firstSession.id}`,
      undefined,
      true,
    );
    assert.equal(deletedSession.status, 204);
  });

  it("checks attendees in by QR, enforces conference year, and rejects duplicates", async () => {
    const sessionResponse = await request(
      "POST",
      "/check-in-sessions",
      { conferenceYear: 2026, sessionDate: "2026-09-28", name: "Opening gathering" },
      true,
    );
    const session = await sessionResponse.json();
    const credential = createCheckInQrCredential();
    state.registrations[0].checkInTokenHash = credential.tokenHash;

    const scanned = await request(
      "POST",
      `/check-in-sessions/${session.id}/scan`,
      { payload: credential.payload },
      "checkin",
    );
    assert.equal(scanned.status, 201);
    assert.equal((await scanned.json()).registrationId, 101);

    const duplicate = await request(
      "POST",
      `/check-in-sessions/${session.id}/scan`,
      { payload: credential.payload },
      "checkin",
    );
    assert.equal(duplicate.status, 409);

    const wrongYearCredential = createCheckInQrCredential();
    state.registrations[1].checkInTokenHash = wrongYearCredential.tokenHash;
    const wrongYear = await request(
      "POST",
      `/check-in-sessions/${session.id}/scan`,
      { payload: wrongYearCredential.payload },
      true,
    );
    assert.equal(wrongYear.status, 404);

    const malformed = await request(
      "POST",
      `/check-in-sessions/${session.id}/scan`,
      { payload: "101" },
      true,
    );
    assert.equal(malformed.status, 400);
  });

  it("emails an admin-requested replacement QR and stores only its hash", async () => {
    const sessionResponse = await request(
      "POST",
      "/check-in-sessions",
      { conferenceYear: 2026, sessionDate: "2026-09-28", name: "Opening gathering" },
      true,
    );
    const session = await sessionResponse.json();
    const previousCredential = createCheckInQrCredential();
    state.registrations[0].checkInTokenHash = previousCredential.tokenHash;

    const sent = await request(
      "POST",
      `/check-in-sessions/${session.id}/registrations/101/qr-email`,
      undefined,
      true,
    );
    assert.equal(sent.status, 204);
    assert.equal(sentQrEmails.length, 1);
    assert.equal(sentQrEmails[0].email, "ada@example.org");
    assert.equal(sentQrEmails[0].firstName, "Ada");
    assert.notEqual(state.registrations[0].checkInTokenHash, previousCredential.tokenHash);
    assert.equal(
      state.registrations[0].checkInTokenHash,
      hashCheckInQrPayload(sentQrEmails[0].payload),
    );
    assert.notEqual(state.registrations[0].checkInTokenHash, sentQrEmails[0].payload);
  });
});