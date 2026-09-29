// @ts-nocheck
import { beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const table = {
  id: { name: "id" },
  username: { name: "username" },
  passwordHash: { name: "password_hash" },
  role: { name: "role" },
  createdAt: { name: "created_at" },
};
const state = { rows: [], nextId: 1 };

function insertRow(values) {
  if (state.rows.some((row) => row.username === values.username)) {
    throw { code: "23505" };
  }
  const row = { id: state.nextId++, createdAt: new Date(), ...values };
  state.rows.push(row);
  return row;
}

function fakeDb() {
  const database = {
    select(fields) {
      return {
        from() {
          const project = (rows) => fields
            ? rows.map((row) => Object.fromEntries(Object.keys(fields).map((key) => [key, row[key]])))
            : rows;
          const query = {
            where: async (condition) => project(
              state.rows.filter((row) => row[condition.column.name] === condition.value),
            ),
            limit: async (count) => project(state.rows.slice(0, count)),
            orderBy: async () => project([...state.rows].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )),
          };
          return query;
        },
      };
    },
    insert() {
      return {
        values(values) {
          const builder = {
            returning: async (fields) => {
              const row = insertRow(values);
              return [Object.fromEntries(Object.keys(fields).map((key) => [key, row[key]]))];
            },
            then(resolve, reject) {
              return Promise.resolve(insertRow(values)).then(resolve, reject);
            },
          };
          return builder;
        },
      };
    },
    async transaction(callback) {
      return callback({
        execute: async () => {},
        select: database.select.bind(database),
        insert: database.insert.bind(database),
      });
    },
  };
  return database;
}

mock.module("@workspace/db", {
  namedExports: { db: fakeDb(), adminUsersTable: table },
});
mock.module("drizzle-orm", {
  namedExports: {
    desc: () => ({}),
    eq: (column, value) => ({ column, value }),
    sql: () => ({}),
  },
});

const routePath = pathToFileURL(resolve("src/routes/admin.ts")).href;
const { default: adminRouter } = await import(routePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { error() {}, warn() {} };
    next();
  });
  app.use(express.json());
  app.use(adminRouter);
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

const bootstrapCredentials = {
  username: "Primary.Admin@example.com",
  password: "test-bootstrap-password",
};

async function signIn(credentials) {
  return request("POST", "/admin/login", credentials);
}

describe("admin account management", () => {
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    process.env.SESSION_SECRET = "test-admin-session-secret";
    process.env.ADMIN_USERNAME = bootstrapCredentials.username;
    process.env.ADMIN_PASSWORD = bootstrapCredentials.password;
  });

  it("bootstraps the first admin with a password hash and returns no hash to clients", async () => {
    const login = await signIn(bootstrapCredentials);
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie"), /^shalom_admin_session=/);
    assert.equal(state.rows.length, 1);
    assert.notEqual(state.rows[0].passwordHash, bootstrapCredentials.password);
    assert.match(state.rows[0].passwordHash, /^scrypt\$/);

    const cookie = login.headers.get("set-cookie").split(";")[0];
    const list = await request("GET", "/admin/users", undefined, { cookie });
    assert.equal(list.status, 200);
    const listedUsers = await list.json();
    assert.deepEqual(listedUsers, [
      {
        id: 1,
        username: "primary.admin@example.com",
        role: "admin",
        createdAt: state.rows[0].createdAt.toISOString(),
      },
    ]);
    assert.equal(JSON.stringify(listedUsers).includes("passwordHash"), false);
  });

  it("lets an authenticated admin create another account that can sign in", async () => {
    const primaryLogin = await signIn(bootstrapCredentials);
    const cookie = primaryLogin.headers.get("set-cookie").split(";")[0];
    const created = await request(
      "POST",
      "/admin/users",
      { username: "Second.Admin@example.com", password: "a-long-new-admin-password" },
      { cookie },
    );

    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), {
      id: 2,
      username: "second.admin@example.com",
      role: "admin",
      createdAt: state.rows[1].createdAt.toISOString(),
    });
    assert.notEqual(state.rows[1].passwordHash, "a-long-new-admin-password");

    const secondLogin = await signIn({
      username: "SECOND.ADMIN@example.com",
      password: "a-long-new-admin-password",
    });
    assert.equal(secondLogin.status, 200);
    assert.equal(state.rows.length, 2);
  });

  it("requires an active admin session and rejects duplicate or weak account details", async () => {
    const unauthorizedList = await request("GET", "/admin/users");
    const unauthorizedCreate = await request("POST", "/admin/users", {
      username: "someone",
      password: "this-is-a-long-password",
    });
    assert.equal(unauthorizedList.status, 401);
    assert.equal(unauthorizedCreate.status, 401);

    const login = await signIn(bootstrapCredentials);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const session = await request("GET", "/admin/session", undefined, { cookie });
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), {
      ok: true,
      username: "primary.admin@example.com",
      role: "admin",
    });

    const weakPassword = await request(
      "POST",
      "/admin/users",
      { username: "weak-password", password: "short" },
      { cookie },
    );
    assert.equal(weakPassword.status, 400);

    const duplicate = await request(
      "POST",
      "/admin/users",
      { username: " PRIMARY.ADMIN@EXAMPLE.COM ", password: "another-long-password" },
      { cookie },
    );
    assert.equal(duplicate.status, 409);

    const wrongPassword = await signIn({
      username: bootstrapCredentials.username,
      password: "wrong-bootstrap-password",
    });
    assert.equal(wrongPassword.status, 401);

    const logout = await request("DELETE", "/admin/session", undefined, { cookie });
    assert.equal(logout.status, 200);
    assert.deepEqual(await logout.json(), { ok: true });
    assert.match(logout.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/i);
  });

  it("creates check-in-only accounts and keeps them out of admin account management", async () => {
    const primaryLogin = await signIn(bootstrapCredentials);
    const adminCookie = primaryLogin.headers.get("set-cookie").split(";")[0];
    const created = await request(
      "POST",
      "/admin/users",
      {
        username: "checkin.staff@example.org",
        password: "a-long-checkin-password",
        role: "checkin",
      },
      { cookie: adminCookie },
    );

    assert.equal(created.status, 201);
    assert.equal((await created.json()).role, "checkin");

    const staffLogin = await signIn({
      username: "checkin.staff@example.org",
      password: "a-long-checkin-password",
    });
    assert.equal(staffLogin.status, 200);
    assert.deepEqual(await staffLogin.json(), {
      ok: true,
      username: "checkin.staff@example.org",
      role: "checkin",
    });

    const staffCookie = staffLogin.headers.get("set-cookie").split(";")[0];
    const deniedUsersList = await request("GET", "/admin/users", undefined, {
      cookie: staffCookie,
    });
    const deniedUserCreate = await request(
      "POST",
      "/admin/users",
      { username: "another.staff", password: "another-long-password" },
      { cookie: staffCookie },
    );
    assert.equal(deniedUsersList.status, 403);
    assert.equal(deniedUserCreate.status, 403);
  });
});