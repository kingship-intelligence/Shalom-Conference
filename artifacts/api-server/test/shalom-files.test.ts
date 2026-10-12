// @ts-nocheck
import { beforeEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { establishAdminSession } from "../src/lib/admin-session.ts";

const table = {
  id: { name: "id" },
  fileName: { name: "file_name" },
  objectPath: { name: "object_path" },
  contentType: { name: "content_type" },
  size: { name: "size" },
  status: { name: "status" },
  uploadedBy: { name: "uploaded_by" },
  createdAt: { name: "created_at" },
};
const state = { rows: [], nextId: 1, metadata: null, deleted: [] };

function matches(row, condition) {
  if (!condition) return true;
  if (condition.and) return condition.and.every((item) => matches(row, item));
  return row[condition.column] === condition.value;
}

function fakeDb() {
  const database = {
    select() {
      return {
        from() {
          const query = {
            where(condition) {
              const filtered = () => state.rows.filter((row) => matches(row, condition));
              const result = Promise.resolve(filtered());
              result.orderBy = async () =>
                filtered().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              return result;
            },
          };
          return query;
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
                status: "pending",
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
          return {
            where(condition) {
              return {
                returning: async () => {
                  const row = state.rows.find((candidate) => matches(candidate, condition));
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
    delete() {
      return {
        where(condition) {
          const remove = async () => {
            const deleted = [];
            state.rows = state.rows.filter((row) => {
              const matched = matches(row, condition);
              if (matched) deleted.push(row);
              return !matched;
            });
            return deleted;
          };
          const result = remove();
          result.returning = remove;
          return result;
        },
      };
    },
  };
  return database;
}

mock.module("@workspace/db", {
  namedExports: { db: fakeDb(), shalomFilesTable: table },
});
mock.module("drizzle-orm", {
  namedExports: {
    and: (...conditions) => ({ and: conditions }),
    desc: () => ({}),
    eq: (column, value) => ({ column: column.name, value }),
  },
});
mock.module(pathToFileURL(resolve("src/lib/shalom-file-storage.ts")).href, {
  namedExports: {
    MAX_SHALOM_FILE_BYTES: 100 * 1024 * 1024,
    shalomFileStorage: {
      createUpload: async () => ({
        uploadURL: "https://storage.example/upload",
        objectPath: `/objects/shalom-2026/${state.nextId}`,
      }),
      verifyUpload: async () => state.metadata,
      createDownloadUrl: async (objectPath) => `https://storage.example/download?path=${objectPath}`,
      deleteObject: async (objectPath) => {
        state.deleted.push(objectPath);
      },
    },
  },
});

const routePath = pathToFileURL(resolve("src/routes/shalom-files.ts")).href;
const { default: shalomFilesRouter } = await import(routePath);

function makeApp() {
  const app = express();
  app.use((req, _res, next) => {
    req.log = { error() {}, warn() {} };
    next();
  });
  app.use(express.json());
  app.use(shalomFilesRouter);
  return app;
}

async function request(method, path, body, headers = {}) {
  const server = makeApp().listen(0);
  await new Promise((resolvePromise) => server.once("listening", resolvePromise));
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
    await new Promise((resolvePromise) => server.close(resolvePromise));
  }
}

function cookieFor(role, username = "files.user@example.org") {
  let cookie = "";
  establishAdminSession({
    cookie(_name, value) {
      cookie = `shalom_admin_session=${encodeURIComponent(value)}`;
    },
  }, username, role);
  return cookie;
}

const upload = {
  fileName: "../Day 1 notes.pdf",
  contentType: "application/pdf",
  size: 2048,
};

describe("Shalom 2026 files", () => {
  beforeEach(() => {
    state.rows.length = 0;
    state.nextId = 1;
    state.metadata = { contentType: "application/pdf", size: upload.size };
    state.deleted.length = 0;
    process.env.SESSION_SECRET = "test-shalom-files-secret";
  });

  it("keeps the folder private and accepts any file type up to 100 MB", async () => {
    assert.equal((await request("GET", "/shalom-files")).status, 401);
    assert.equal(
      (await request("GET", "/shalom-files", undefined, { cookie: cookieFor("merch") })).status,
      403,
    );

    const adminCookie = cookieFor("admin", "primary.admin@example.com");
    const oversized = await request(
      "POST",
      "/shalom-files/upload-url",
      { ...upload, size: 100 * 1024 * 1024 + 1 },
      { cookie: adminCookie },
    );
    assert.equal(oversized.status, 400);
    assert.equal(state.rows.length, 0);

    const created = await request("POST", "/shalom-files/upload-url", upload, { cookie: adminCookie });
    assert.equal(created.status, 200);
    const createdBody = await created.json();
    assert.equal(createdBody.uploadURL, "https://storage.example/upload");
    assert.equal(state.rows[0].fileName, "Day 1 notes.pdf");
    assert.equal((await request("GET", "/shalom-files", undefined, { cookie: adminCookie })).status, 200);
    assert.deepEqual(await (await request("GET", "/shalom-files", undefined, { cookie: adminCookie })).json(), []);

    const completed = await request(
      "POST",
      `/shalom-files/${createdBody.id}/complete`,
      undefined,
      { cookie: adminCookie },
    );
    assert.equal(completed.status, 200);
    const listed = await (await request("GET", "/shalom-files", undefined, { cookie: adminCookie })).json();
    assert.equal(listed.length, 1);
    assert.equal(listed[0].fileName, "Day 1 notes.pdf");
    assert.equal(listed[0].uploadedBy, "primary.admin@example.com");
    assert.equal(listed[0].size, upload.size);

    const folderCookie = cookieFor("shalom_files");
    const download = await request(
      "POST",
      `/shalom-files/${createdBody.id}/download`,
      undefined,
      { cookie: folderCookie },
    );
    assert.equal(download.status, 200);
    assert.match((await download.json()).downloadURL, /^https:\/\/storage\.example\/download/);
  });

  it("rejects an upload whose stored size does not match the request", async () => {
    state.metadata = { contentType: "application/pdf", size: upload.size + 10 };
    const cookie = cookieFor("shalom_files");
    const created = await (await request("POST", "/shalom-files/upload-url", upload, { cookie })).json();
    const completed = await request(
      "POST",
      `/shalom-files/${created.id}/complete`,
      undefined,
      { cookie },
    );

    assert.equal(completed.status, 400);
    assert.deepEqual(state.deleted, [state.rows[0] ? state.rows[0].objectPath : `/objects/shalom-2026/${created.id}`]);
    assert.equal(state.rows.length, 0);
  });
});
