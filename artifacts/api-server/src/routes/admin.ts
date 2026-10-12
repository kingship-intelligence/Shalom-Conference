import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  CreateAdminUserBody,
  CreateAdminUserResponse,
  DeleteAdminUserParams,
  GetAdminSessionResponse,
  LoginAdminBody,
  LoginAdminResponse,
  ListAdminUsersResponse,
  LogoutAdminResponse,
} from "@workspace/api-zod";
import {
  clearAdminSession,
  establishAdminSession,
  getAdminSession,
  hasAdminSession,
  isAdminRole,
} from "../lib/admin-session";
import { randomBytes } from "node:crypto";
import { hashAdminPassword, verifyAdminPassword } from "../lib/admin-password";
import { sendShalomFilesPortalInvite } from "../lib/email";

const router: IRouter = Router();
const BOOTSTRAP_LOCK_ID = 7_313_026;

function requireFullAdmin(req: Request, res: Response): boolean {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return false;
  }
  if (!hasAdminSession(req)) {
    res.status(403).json({ error: "Full admin access is required." });
    return false;
  }
  return true;
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

const EMAIL_USERNAME_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateShalomFilesPassword(): string {
  return randomBytes(18).toString("base64url");
}

function isEmailUsername(username: string): boolean {
  return EMAIL_USERNAME_PATTERN.test(username);
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
      role: "admin",
      createdBy: null,
    });
  });
}

router.get("/admin/session", (req, res): void => {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: "Admin session required" });
    return;
  }

  res.json(GetAdminSessionResponse.parse({
    ok: true,
    username: session.username,
    role: session.role,
  }));
});

router.delete("/admin/session", (_req, res): void => {
  clearAdminSession(res);
  res.json(LogoutAdminResponse.parse({ ok: true }));
});

router.get("/admin/users", async (req, res): Promise<void> => {
  if (!requireFullAdmin(req, res)) return;

  const users = await db
    .select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      role: adminUsersTable.role,
      createdBy: adminUsersTable.createdBy,
      createdAt: adminUsersTable.createdAt,
    })
    .from(adminUsersTable)
    .orderBy(desc(adminUsersTable.createdAt));
  res.json(ListAdminUsersResponse.parse(users));
});

router.post("/admin/users", async (req, res): Promise<void> => {
  if (!requireFullAdmin(req, res)) return;

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

  const role = parsed.data.role ?? "admin";
  let password = parsed.data.password;
  if (role === "shalom_files") {
    if (!isEmailUsername(username)) {
      res.status(400).json({
        error: "Shalom 2026 file access requires a valid email address.",
      });
      return;
    }
    password = generateShalomFilesPassword();
  } else if (!password) {
    res.status(400).json({ error: "Password is required for this access level." });
    return;
  }

  try {
    const [user] = await db
      .insert(adminUsersTable)
      .values({
        username,
        passwordHash: await hashAdminPassword(password),
        role,
        createdBy: getAdminSession(req)?.username ?? null,
      })
      .returning({
        id: adminUsersTable.id,
        username: adminUsersTable.username,
        role: adminUsersTable.role,
        createdBy: adminUsersTable.createdBy,
        createdAt: adminUsersTable.createdAt,
      });

    if (role === "shalom_files") {
      try {
        await sendShalomFilesPortalInvite({ email: username, password });
      } catch (inviteError) {
        await db.delete(adminUsersTable).where(eq(adminUsersTable.id, user.id));
        req.log.error({ err: inviteError }, "Shalom files invite email failed");
        res.status(502).json({
          error: "The invite email could not be sent. Check mail configuration and try again.",
        });
        return;
      }
    }

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

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  if (!requireFullAdmin(req, res)) return;
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const parsed = DeleteAdminUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid account ID." });
    return;
  }

  const [target] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, parsed.data.id));
  if (!target) {
    res.status(404).json({ error: "Account not found." });
    return;
  }
  if (!target.createdBy) {
    res.status(403).json({ error: "Only accounts created in the portal can be deleted." });
    return;
  }
  if (target.username === session.username) {
    res.status(403).json({ error: "You cannot delete the account you are signed in with." });
    return;
  }
  if (target.role === "admin") {
    const admins = await db
      .select({ id: adminUsersTable.id })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.role, "admin"));
    if (admins.length <= 1) {
      res.status(409).json({ error: "The last full admin account cannot be deleted." });
      return;
    }
  }

  const [deletedUser] = await db
    .delete(adminUsersTable)
    .where(eq(adminUsersTable.id, target.id))
    .returning({ id: adminUsersTable.id });
  if (!deletedUser) {
    res.status(404).json({ error: "Account not found." });
    return;
  }

  res.status(204).send();
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

  const role = user.role ?? "admin";
  if (!isAdminRole(role)) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  if (!establishAdminSession(res, user.username, role)) {
    req.log.error("Session secret not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  res.json(LoginAdminResponse.parse({ ok: true, username: user.username, role }));
});

export default router;
