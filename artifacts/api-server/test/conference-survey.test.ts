// @ts-nocheck
import { beforeEach, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
let rows = [];
let failInsert = false;
mock.module("@workspace/db", { namedExports: {
  conferenceSurveyTable: { createdAt: {} },
  db: {
    insert: () => ({ values: async value => { if (failInsert) throw new Error("database unavailable"); rows.push(value); } }),
    select: () => ({ from: () => ({ orderBy: async () => rows }) }),
  },
} });
mock.module("drizzle-orm", { namedExports: { desc: () => ({}) } });
mock.module(pathToFileURL(resolve("src/lib/admin-session.ts")).href, { namedExports: { hasAdminSession: req => req.headers["x-test-admin"] === "yes" } });
const { default: router } = await import(pathToFileURL(resolve("src/routes/conference-survey.ts")).href);
async function request(method, body, admin = false) {
  const app = express();
  app.use(express.json()); app.use(router);
  app.use((error, req, res, next) => res.status(500).json({ error: "Unable to save" }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/conference-survey`, { method, headers: { "content-type": "application/json", ...(admin ? { "x-test-admin": "yes" } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  } finally { await new Promise(resolve => server.close(resolve)); }
}
beforeEach(() => { rows = []; failInsert = false; });
const valid = { conferenceYear: 2026, rating: 5, highlight: " Great worship ", improvements: " More seating ", wouldAttendAgain: "yes" };
it("stores anonymous feedback and trims written answers", async () => {
  const response = await request("POST", valid);
  assert.equal(response.status, 201);
  assert.deepEqual(response.body, { success: true });
  assert.equal(rows[0].highlight, "Great worship");
  assert.equal(rows[0].improvements, "More seating");
});
it("rejects invalid ratings, attendance preferences and oversized feedback", async () => {
  for (const change of [{ rating: 0 }, { rating: 6 }, { rating: 2.5 }, { wouldAttendAgain: "other" }, { highlight: "a".repeat(3001) }, { improvements: 4 }, { conferenceYear: 2025 }]) {
    assert.equal((await request("POST", { ...valid, ...change })).status, 400);
  }
  assert.equal(rows.length, 0);
});
it("restricts survey responses to full administrators", async () => {
  await request("POST", valid);
  assert.equal((await request("GET")).status, 403);
  const response = await request("GET", undefined, true);
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
});
it("does not report successful feedback when persistence fails", async () => {
  failInsert = true;
  assert.equal((await request("POST", valid)).status, 500);
});
