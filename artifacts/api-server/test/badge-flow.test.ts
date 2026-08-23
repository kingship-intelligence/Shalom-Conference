// The API tests deliberately use in-memory collaborators. This keeps regressions
// in authorization and delivery decisions testable without sending mail or
// requiring an object-storage sidecar.
// @ts-nocheck
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { mock } from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const table = {
  id: { name: "id" },
  email: { name: "email" },
  conferenceYear: { name: "conference_year" },
  createdAt: { name: "created_at" },
};

const state = { rows: [], nextId: 1, storage: null, badge: Buffer.from("badge"), badgeError: false };
const sent: any[] = [];

function fakeDb() {
  return {
    select() {
      return {
        from() {
          return {
            where: async () => [...state.rows],
            orderBy: async () => [...state.rows],
          };
        },
      };
    },
    insert() {
      return {
        values(values) {
          return {
            returning: async () => {
              const row = {
                id: state.nextId++,
                createdAt: new Date(),
                volunteer: false,
                ...values,
              };
              state.rows.push(row);
              return [row];
            },
          };
        },
      };
    },
    update() {
      return {
        set(values) {
          const updateResult = {
            where: () => updateResult,
            then: (resolve) => {
              Object.assign(state.rows[0], values);
              return resolve([state.rows[0]]);
            },
            returning: async () => {
              Object.assign(state.rows[0], values);
              return [state.rows[0]];
            },
          };
          return updateResult;
        },
      };
    },
  };
}

const registrationsPath = pathToFileURL(resolve("src/routes/registrations.ts")).href;
const storagePath = pathToFileURL(resolve("src/lib/badge-storage.ts")).href;
const badgePath = pathToFileURL(resolve("src/lib/attendee-badge.ts")).href;
const emailPath = pathToFileURL(resolve("src/lib/email.ts")).href;

mock.module("@workspace/db", {
  namedExports: { db: fakeDb(), registrationsTable: table },
});
mock.module("drizzle-orm", {
  namedExports: { eq: () => ({}), and: () => ({}) },
});
mock.module(storagePath, {
  namedExports: {
    badgeStorage: {
      createPortraitUpload: async () => ({ uploadURL: "https://upload.test", objectPath: "/objects/attendee-badges/photo" }),
      downloadPortrait: async () => state.storage,
    },
  },
});
mock.module(badgePath, {
  namedExports: {
    createAttendeeBadge: async () => {
      if (state.badgeError) throw new Error("renderer failed");
      return state.badge;
    },
  },
});
mock.module(emailPath, {
  namedExports: {
    sendRegistrationConfirmation: async (options) => {
      sent.push(options);
    },
  },
});

const { default: registrationsRouter } = await import(registrationsPath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { error() {}, warn() {} };
    next();
  });
  app.use(express.json());
  app.use(registrationsRouter);
  return app;
}

async function request(app, method, path, body) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const registration = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
  conferenceYear: 2026,
  volunteer: false,
  wantsAttendeeBadge: true,
};

describe("attendee badge delivery flow", () => {
  before(() => mock.timers.enable({ apis: ["Date"], now: new Date("2026-08-23T12:00:00Z") }));
  after(() => mock.timers.reset());
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    state.storage = { buffer: Buffer.from("portrait"), contentType: "image/png", size: 8 };
    state.badgeError = false;
    sent.length = 0;
  });

  it("registers an attendee and returns a one-time badge token", async () => {
    const response = await request(makeApp(), "POST", "/registrations", registration);
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.match(body.badgeUploadToken, /^[a-f0-9]{64}$/);
    assert.equal(state.rows[0].badgeUploadTokenHash.length, 64);
    assert.notEqual(body.badgeUploadToken, state.rows[0].badgeUploadTokenHash);
  });

  it("authorizes portrait upload only with the issued token", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    const uploadDetails = { name: "portrait.png", size: 8, contentType: "image/png" };
    const denied = await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, { token: "0".repeat(64), ...uploadDetails });
    const allowed = await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, { token: created.badgeUploadToken, ...uploadDetails });
    assert.equal(denied.status, 401);
    assert.equal(allowed.status, 200);
    assert.equal((await allowed.json()).objectPath, "/objects/attendee-badges/photo");
  });

  it("delivers a badge and rejects reuse of its token", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, {
      token: created.badgeUploadToken,
      name: "portrait.png",
      size: 8,
      contentType: "image/png",
    });
    const completed = await request(makeApp(), "POST", `/registrations/${created.id}/badge/complete`, {
      token: created.badgeUploadToken,
      objectPath: "/objects/attendee-badges/photo",
    });
    const reused = await request(makeApp(), "POST", `/registrations/${created.id}/badge/complete`, {
      token: created.badgeUploadToken,
      objectPath: "/objects/attendee-badges/photo",
    });
    assert.equal(completed.status, 200);
    assert.equal((await completed.json()).badgeDeliveryStatus, "delivered");
    assert.equal(reused.status, 401);
    assert.equal(sent.at(-1).attendeeBadge.toString(), "badge");
  });

  it("uses the safe fallback for invalid or oversized portraits", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, {
      token: created.badgeUploadToken,
      name: "portrait.png",
      size: 8,
      contentType: "image/png",
    });
    state.storage = { buffer: Buffer.from("not an image"), contentType: "image/gif", size: 8 };
    const response = await request(makeApp(), "POST", `/registrations/${created.id}/badge/complete`, {
      token: created.badgeUploadToken,
      objectPath: "/objects/attendee-badges/photo",
    });
    assert.equal(response.status, 202);
    assert.equal((await response.json()).badgeDeliveryStatus, "fallback");
    assert.equal(sent.length, 1);
    assert.equal(sent[0].attendeeBadge, undefined);
  });

  it("falls back safely when the badge renderer fails", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, {
      token: created.badgeUploadToken,
      name: "portrait.png",
      size: 8,
      contentType: "image/png",
    });
    state.badgeError = true;
    const response = await request(makeApp(), "POST", `/registrations/${created.id}/badge/complete`, {
      token: created.badgeUploadToken,
      objectPath: "/objects/attendee-badges/photo",
    });
    assert.equal(response.status, 202);
    assert.equal((await response.json()).badgeDeliveryStatus, "fallback");
    assert.equal(sent.length, 1);
    assert.equal(sent[0].attendeeBadge, undefined);
  });

  it("falls back safely when the portrait is oversized", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, {
      token: created.badgeUploadToken,
      name: "portrait.png",
      size: 8,
      contentType: "image/png",
    });
    state.storage = { buffer: Buffer.from("portrait"), contentType: "image/png", size: 5 * 1024 * 1024 + 1 };
    const response = await request(makeApp(), "POST", `/registrations/${created.id}/badge/complete`, {
      token: created.badgeUploadToken,
      objectPath: "/objects/attendee-badges/photo",
    });
    assert.equal(response.status, 202);
    assert.equal((await response.json()).badgeDeliveryStatus, "fallback");
    assert.equal(sent[0].attendeeBadge, undefined);
  });

  it("rejects expired badge tokens", async () => {
    const created = await (await request(makeApp(), "POST", "/registrations", registration)).json();
    state.rows[0].badgeUploadExpiresAt = new Date("2026-08-23T11:59:00Z");
    const response = await request(makeApp(), "POST", `/registrations/${created.id}/badge/upload-url`, {
      token: created.badgeUploadToken,
      name: "portrait.png",
      size: 8,
      contentType: "image/png",
    });
    assert.equal(response.status, 401);
  });
});