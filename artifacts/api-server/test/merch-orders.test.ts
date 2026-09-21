// @ts-nocheck
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { mock } from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHmac } from "node:crypto";

const table = {
  id: { name: "id" },
  createdAt: { name: "created_at" },
  status: { name: "status" },
  paymentConfirmedAt: { name: "payment_confirmed_at" },
  paymentConfirmedBy: { name: "payment_confirmed_by" },
};
const state = { rows: [], nextId: 1 };

const validOrder = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
  paymentReference: "$ada-123",
  items: [{ productName: "The Comforter Tee", size: "M", quantity: 2 }],
  total: 60,
};

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
            orderBy: async () => [...state.rows],
            where: async () => [...state.rows],
          };
        },
      };
    },
    update() {
      return {
        set(values) {
          return {
            where() {
              return {
                returning: async () => {
                  const row = state.rows.find((candidate) => candidate.status === "awaiting_verification");
                  if (!row) return [];
                  Object.assign(row, values);
                  return [row];
                },
              };
            },
          };
        },
      };
    },
  };
}

const routePath = pathToFileURL(resolve("src/routes/merch-orders.ts")).href;
const emailPath = pathToFileURL(resolve("src/lib/email.ts")).href;

mock.module("@workspace/db", {
  namedExports: { db: fakeDb(), merchOrdersTable: table },
});
mock.module("drizzle-orm", {
  namedExports: { eq: () => ({}), and: () => ({}), desc: () => ({}) },
});
mock.module(emailPath, {
  namedExports: {
    sendMerchOrderReceived: async () => {},
    sendMerchOrderNotification: async () => {},
    sendMerchOrderPaymentConfirmed: async () => {},
  },
});

const { default: merchOrdersRouter } = await import(routePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { error() {}, warn() {} };
    next();
  });
  app.use(express.json());
  app.use(merchOrdersRouter);
  return app;
}

async function request(method, path, body, headers = {}) {
  const server = makeApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  try {
    return await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe("merch preorder persistence and validation", () => {
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    delete process.env.SESSION_SECRET;
    delete process.env.ADMIN_USERNAME;
  });

  it("saves every fulfillment field from a valid preorder", async () => {
    const response = await request("POST", "/merch-orders", validOrder);
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(state.rows.length, 1);
    assert.equal(body.name, validOrder.name);
    assert.equal(body.email, validOrder.email);
    assert.equal(body.paymentReference, validOrder.paymentReference);
    assert.deepEqual(body.items, validOrder.items);
    assert.equal(body.total, validOrder.total);
    assert.deepEqual(
      {
        name: state.rows[0].name,
        email: state.rows[0].email,
        items: state.rows[0].items,
        total: state.rows[0].total,
        paymentReference: state.rows[0].paymentReference,
      },
      {
        name: validOrder.name,
        email: validOrder.email,
        items: validOrder.items,
        total: validOrder.total,
        paymentReference: validOrder.paymentReference,
      },
    );
  });

  it("rejects mismatched totals and malformed item details without persisting", async () => {
    const invalidOrders = [
      { ...validOrder, total: 50 },
      { ...validOrder, items: [{ ...validOrder.items[0], quantity: 1.5 }], total: 75 },
      { ...validOrder, items: [{ ...validOrder.items[0], size: "invalid" }] },
      { ...validOrder, items: [{ ...validOrder.items[0], productName: "Unknown tee" }] },
      { ...validOrder, items: [] },
    ];

    for (const order of invalidOrders) {
      const response = await request("POST", "/merch-orders", order);
      assert.equal(response.status, 400);
    }
    assert.equal(state.rows.length, 0);
  });

  it("accepts the updated tee and crewneck prices", async () => {
    const order = {
      ...validOrder,
      items: [
        { productName: "The Comforter Tee — Shalom Edition", size: "L", quantity: 1 },
        { productName: "The Comforter Crewneck", size: "XL", quantity: 1 },
        { productName: "The Comforter Crewneck — Shalom Edition", size: "S", quantity: 1 },
      ],
      total: 110,
    };

    const response = await request("POST", "/merch-orders", order);

    assert.equal(response.status, 201);
    assert.equal(state.rows[0].total, 110);
    assert.deepEqual(state.rows[0].items, order.items);
  });

  it("does not expose the private preorder list without an admin session", async () => {
    await request("POST", "/merch-orders", validOrder);
    const response = await request("GET", "/merch-orders");

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Admin sign-in is required." });
  });

  it("records the confirming admin and timestamp", async () => {
    process.env.SESSION_SECRET = "test-session-secret";
    const username = "finance.admin@example.com";
    const issuedAt = Math.floor(Date.now() / 1000);
    const encodedUsername = Buffer.from(username, "utf8").toString("base64url");
    const tokenData = `${issuedAt}.${encodedUsername}`;
    const signature = createHmac("sha256", process.env.SESSION_SECRET).update(tokenData).digest("hex");
    const cookie = `shalom_admin_session=${tokenData}.${signature}`;

    await request("POST", "/merch-orders", validOrder);
    const response = await request("PATCH", "/merch-orders/1/verify", undefined, { cookie });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "verified");
    assert.equal(body.paymentConfirmedBy, username);
    assert.ok(body.paymentConfirmedAt);
    assert.equal(state.rows[0].paymentConfirmedBy, username);
    assert.ok(state.rows[0].paymentConfirmedAt instanceof Date);
  });
});