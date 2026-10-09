// @ts-nocheck
import { beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const table = {
  id: { name: "id" },
  createdAt: { name: "created_at" },
};
const state = { rows: [], nextId: 1 };

function fakeDb() {
  return {
    insert() {
      return {
        values(values) {
          return {
            returning: async () => {
              const duplicate = state.rows.some(
                (row) =>
                  row.email === values.email &&
                  row.conferenceYear === values.conferenceYear,
              );
              if (duplicate) {
                throw { code: "23505" };
              }
              const row = {
                id: state.nextId++,
                createdAt: new Date(),
                ...values,
              };
              state.rows.push(row);
              return [row];
            },
          };
        },
      };
    },
    select() {
      return {
        from() {
          return {
            orderBy: async () => [...state.rows],
          };
        },
      };
    },
  };
}

const routePath = pathToFileURL(
  resolve("src/routes/first-timer-responses.ts"),
).href;
mock.module("@workspace/db", {
  namedExports: { db: fakeDb(), firstTimerResponsesTable: table },
});
mock.module("drizzle-orm", {
  namedExports: { desc: () => ({}) },
});

const { default: firstTimerResponsesRouter } = await import(routePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { warn() {} };
    next();
  });
  app.use(express.json());
  app.use(firstTimerResponsesRouter);
  return app;
}

async function request(method, path, body, headers = {}) {
  const server = makeApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function adminCookie(username = "admin@shalomconference.com", role) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const encodedUsername = Buffer.from(username, "utf8").toString("base64url");
  const tokenData = role
    ? `${issuedAt}.${encodedUsername}.${role}`
    : `${issuedAt}.${encodedUsername}`;
  const signature = createHmac("sha256", process.env.SESSION_SECRET)
    .update(tokenData)
    .digest("hex");
  return `shalom_admin_session=${tokenData}.${signature}`;
}

const validResponse = {
  name: "  Ada Lovelace  ",
  email: "  ADA@EXAMPLE.COM ",
  isFirstTime: true,
  conferenceYear: 2026,
};

describe("first-timer responses", () => {
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    process.env.SESSION_SECRET = "test-session-secret";
  });

  it("normalizes and saves a valid response", async () => {
    const response = await request(
      "POST",
      "/first-timer-responses",
      validResponse,
    );
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.name, "Ada Lovelace");
    assert.equal(body.email, "ada@example.com");
    assert.equal(body.isFirstTime, true);
    assert.equal(body.conferenceYear, 2026);
  });

  it("rejects invalid or incomplete submissions", async () => {
    const response = await request("POST", "/first-timer-responses", {
      name: "",
      email: "not-an-email",
      conferenceYear: 2026,
    });

    assert.equal(response.status, 400);
    assert.equal(state.rows.length, 0);
  });

  it("prevents duplicate email submissions for the same conference", async () => {
    await request("POST", "/first-timer-responses", validResponse);
    const duplicate = await request("POST", "/first-timer-responses", {
      ...validResponse,
      name: "Ada L.",
      email: "ada@example.com",
    });

    assert.equal(duplicate.status, 409);
    assert.match((await duplicate.json()).error, /already been submitted/i);
    assert.equal(state.rows.length, 1);
  });

  it("keeps the response list private and available to admins and first-timer staff", async () => {
    await request("POST", "/first-timer-responses", validResponse);

    const unauthorized = await request("GET", "/first-timer-responses");
    assert.equal(unauthorized.status, 401);

    const authorized = await request(
      "GET",
      "/first-timer-responses",
      undefined,
      { cookie: adminCookie() },
    );
    assert.equal(authorized.status, 200);
    assert.equal((await authorized.json()).length, 1);

    const scopedStaff = await request(
      "GET",
      "/first-timer-responses",
      undefined,
      { cookie: adminCookie("first-timers@example.org", "first_timers") },
    );
    assert.equal(scopedStaff.status, 200);

    const unrelatedStaff = await request(
      "GET",
      "/first-timer-responses",
      undefined,
      { cookie: adminCookie("checkin@example.org", "checkin") },
    );
    assert.equal(unrelatedStaff.status, 401);
  });
});
