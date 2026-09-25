import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  CreateAdminUserBody,
  CreateAdminUserResponse,
  GetAdminSessionResponse,
  LoginAdminBody,
  LoginAdminResponse,
  ListAdminUsersResponse,
  LogoutAdminResponse,
} from "@workspace/api-zod";
import { clearAdminSession, establishAdminSession, getAdminIdentity } from "../lib/admin-session";
import { hashAdminPassword, verifyAdminPassword } from "../lib/admin-password";

const router: IRouter = Router();
const BOOTSTRAP_LOCK_ID = 7_313_026;

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function bootstrapFirstAdmin(): Promise<void> {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword) return;

  const username = normalizeUsername(configuredUsername);
  if (username.length < 3 || username.length > 254 || configuredPassword.length > 200) {
    return;
  }

  const [existingUser] = await db
    .select({ id: adminUsersTable.id })
    .from(adminUsersTable)
    .limit(1);
  if (existingUser) return;

  await db.transaction(async (transaction) => {
    await transaction.execute(sql`SELECT pg_advisory_xact_lock(${BOOTSTRAP_LOCK_ID})`);
    const [userAfterLock] = await transaction
      .select({ id: adminUsersTable.id })
      .from(adminUsersTable)
      .limit(1);
    if (userAfterLock) return;

    await transaction.insert(adminUsersTable).values({
      username,
      passwordHash: await hashAdminPassword(configuredPassword),
    });
  });
}

router.get("/admin/session", (req, res): void => {
  const username = getAdminIdentity(req);
  if (!username) {
    res.status(401).json({ error: "Admin session required" });
    return;
  }

  res.json(GetAdminSessionResponse.parse({ ok: true, username }));
});

router.delete("/admin/session", (_req, res): void => {
  clearAdminSession(res);
  res.json(LogoutAdminResponse.parse({ ok: true }));
});

router.get("/admin/users", async (req, res): Promise<void> => {
  if (!getAdminIdentity(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const users = await db
    .select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      createdAt: adminUsersTable.createdAt,
    })
    .from(adminUsersTable)
    .orderBy(desc(adminUsersTable.createdAt));
  res.json(ListAdminUsersResponse.parse(users));
});

router.post("/admin/users", async (req, res): Promise<void> => {
  if (!getAdminIdentity(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const parsed = CreateAdminUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const username = normalizeUsername(parsed.data.username);
  if (username.length < 3) {
    res.status(400).json({ error: "Username must contain at least 3 characters." });
    return;
  }

  try {
    const [user] = await db
      .insert(adminUsersTable)
      .values({
        username,
        passwordHash: await hashAdminPassword(parsed.data.password),
      })
      .returning({
        id: adminUsersTable.id,
        username: adminUsersTable.username,
        createdAt: adminUsersTable.createdAt,
      });

    res.status(201).json(CreateAdminUserResponse.parse(user));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({ error: "Username is already in use." });
      return;
    }
    throw error;
  }
});

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await bootstrapFirstAdmin();
  const username = normalizeUsername(parsed.data.username);
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, username));

  if (!user || !(await verifyAdminPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  if (!establishAdminSession(res, user.username)) {
    req.log.error("Session secret not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  res.json(LoginAdminResponse.parse({ ok: true }));
});

export default router;
