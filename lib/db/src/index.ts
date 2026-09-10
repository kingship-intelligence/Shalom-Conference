import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Db = NodePgDatabase<typeof schema>;

let pool: pg.Pool | undefined;
let dbInstance: Db | undefined;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return url;
}

function getDbInstance(): Db {
  if (!dbInstance) {
    pool = new Pool({ connectionString: databaseUrl() });
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDbInstance() as object, prop, receiver);
  },
});

export function getPool(): pg.Pool {
  if (!pool) {
    getDbInstance();
  }
  return pool!;
}

export * from "./schema";
