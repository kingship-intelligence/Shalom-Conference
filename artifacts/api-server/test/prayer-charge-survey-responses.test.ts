// @ts-nocheck
import { beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const surveyTable = {
  id: { name: "id" },
  createdAt: { name: "created_at" },
};
const prayerChainTable = {};
const state = { rows: [], nextId: 1 };

function fakeDb() {
  return {
    insert() {
      return {
        values(values) {
          return {
            returning: async () => {
              const row = { id: state.nextId++, createdAt: new Date(), ...values };
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
            orderBy: async () => [...state.rows].sort(
              (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
            ),
          };
        },
      };
    },
  };
}

mock.module("@workspace/db", {
  namedExports: {
    db: fakeDb(),
    prayerChargeSurveyResponsesTable: surveyTable,
    prayerChainSignupsTable: prayerChainTable,
  },
});
mock.module("drizzle-orm", {
  namedExports: { desc: () => ({}) },
});

const surveyRoutePath = pathToFileURL(
  resolve("src/routes/prayer-charge-survey-responses.ts"),
).href;
const prayerChainRoutePath = pathToFileURL(
  resolve("src/routes/prayer-chain-signups.ts"),
).href;
const { default: surveyRouter } = await import(surveyRoutePath);
const { default: prayerChainRouter } = await import(prayerChainRoutePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { warn() {} };
    next();
  });
  app.use(express.json());
  app.use(surveyRouter);
  app.use(prayerChainRouter);
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

function adminCookie(username = "admin@shalomconference.com") {
  const issuedAt = Math.floor(Date.now() / 1000);
  const encodedUsername = Buffer.from(username, "utf8").toString("base64url");
  const tokenData = `${issuedAt}.${encodedUsername}`;
  const signature = createHmac("sha256", process.env.SESSION_SECRET)
    .update(tokenData)
    .digest("hex");
  return `shalom_admin_session=${tokenData}.${signature}`;
}

describe("Prayer Charge survey responses", () => {
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    process.env.SESSION_SECRET = "test-session-secret";
  });

  it("saves anonymous feedback and trims optional written responses", async () => {
    const response = await request("POST", "/prayer-charge-survey-responses", {
      rating: 5,
      meaningfulMoment: "  The shared prayer  ",
      suggestion: "  More time together  ",
      wouldAttendAgain: "yes",
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.rating, 5);
    assert.equal(body.meaningfulMoment, "The shared prayer");
    assert.equal(body.suggestion, "More time together");
    assert.equal(body.wouldAttendAgain, "yes");
    assert.equal("name" in body, false);
    assert.equal(state.rows.length, 1);
  });

  it("rejects invalid ratings and attendance choices", async () => {
    const response = await request("POST", "/prayer-charge-survey-responses", {
      rating: 6,
      wouldAttendAgain: "definitely",
    });

    assert.equal(response.status, 400);
    assert.equal(state.rows.length, 0);
  });

  it("keeps survey responses private to authenticated admins", async () => {
    await request("POST", "/prayer-charge-survey-responses", {
      rating: 4,
      wouldAttendAgain: "maybe",
    });

    const unauthorized = await request("GET", "/prayer-charge-survey-responses");
    assert.equal(unauthorized.status, 401);

    const authorized = await request(
      "GET",
      "/prayer-charge-survey-responses",
      undefined,
      { cookie: adminCookie() },
    );
    assert.equal(authorized.status, 200);
    const responses = await authorized.json();
    assert.equal(responses.length, 1);
    assert.equal(responses[0].rating, 4);
  });

  it("closes the former public Prayer Charge signup endpoint", async () => {
    const response = await request("POST", "/prayer-chain-signups", {
      name: "Attendee",
      email: "attendee@example.com",
      phone: "5555555555",
      timeSlots: ["01:00"],
    });

    assert.equal(response.status, 410);
    assert.match((await response.json()).error, /sign-ups are closed/i);
    assert.equal(state.rows.length, 0);
  });
});