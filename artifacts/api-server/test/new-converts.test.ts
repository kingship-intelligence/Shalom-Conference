// @ts-nocheck
import { beforeEach, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
let rows = [];
let failInsert = false;
mock.module("@workspace/db", { namedExports: {
  newConvertsTable: { createdAt: {} },
  db: {
    insert: () => ({ values: async value => { if (failInsert) throw new Error("database unavailable"); rows.push(value); } }),
    select: () => ({ from: () => ({ orderBy: async () => rows }) }),
  },
} });
mock.module("drizzle-orm", { namedExports: { desc: () => ({}) } });
mock.module(pathToFileURL(resolve("src/lib/admin-session.ts")).href, { namedExports: { hasNewConvertsAccess: req => req.headers["x-test-admin"] === "yes" } });
const { default: router } = await import(pathToFileURL(resolve("src/routes/new-converts.ts")).href);
async function request(method, body, admin = false) {
  const app = express();
  app.use(express.json()); app.use(router);
  app.use((error, req, res, next) => res.status(500).json({ error: "Unable to save" }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/new-converts`, { method, headers: { "content-type": "application/json", ...(admin ? { "x-test-admin": "yes" } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  } finally { await new Promise(resolve => server.close(resolve)); }
}
beforeEach(() => { rows = []; failInsert = false; });
const valid = { name: " Test Believer ", email: " TEST@example.com ", phone: "", city: "", consentToContact: true };
it("saves normalized details without exposing them in the response", async () => {
  const response = await request("POST", valid);
  assert.equal(response.status, 201); assert.deepEqual(response.body, { success: true });
  assert.equal(rows[0].name, "Test Believer"); assert.equal(rows[0].email, "test@example.com");
});
it("rejects missing consent, invalid email, blank names and oversized fields", async () => {
  for (const change of [{ consentToContact: false }, { email: "bad" }, { name: " " }, { city: "a".repeat(121) }]) assert.equal((await request("POST", { ...valid, ...change })).status, 400);
  assert.equal(rows.length, 0);
});
it("protects follow-up records with admin authentication", async () => {
  await request("POST", valid);
  assert.equal((await request("GET")).status, 401);
  const response = await request("GET", undefined, true);
  assert.equal(response.status, 200); assert.equal(response.body.length, 1);
});
it("does not report success when storage fails", async () => {
  failInsert = true; assert.equal((await request("POST", valid)).status, 500); assert.equal(rows.length, 0);
});

it("saves yes and no local church answers and preserves unanswered submissions", async () => {
  for (const hasLocalChurch of [true, false, null]) {
    assert.equal((await request("POST", { ...valid, hasLocalChurch })).status, 201);
    assert.equal(rows.at(-1).hasLocalChurch, hasLocalChurch);
  }
  assert.equal((await request("POST", valid)).status, 201);
  assert.equal(rows.at(-1).hasLocalChurch, null);
  const response = await request("GET", undefined, true);
  assert.deepEqual(response.body.map(row => row.hasLocalChurch), [true, false, null, null]);
});
it("rejects invalid local church answers without saving", async () => {
  for (const hasLocalChurch of ["yes", "false", 0, {}, []]) {
    assert.equal((await request("POST", { ...valid, hasLocalChurch })).status, 400);
  }
  assert.equal(rows.length, 0);
});
