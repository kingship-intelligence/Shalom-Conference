import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "shalom_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminRole = "admin" | "checkin" | "registration_viewer" | "new_converts" | "registration_checkin";

export type AdminSession = {
  username: string;
  role: AdminRole;
};

function getSessionSecret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function encodeIdentity(username: string): string {
  return Buffer.from(username, "utf8").toString("base64url");
}

function decodeIdentity(value: string): string | null {
  try {
    const username = Buffer.from(value, "base64url").toString("utf8");
    return username || null;
  } catch {
    return null;
  }
}

function readCookie(req: Request): string | null {
  const rawCookies = req.headers.cookie;
  if (!rawCookies) return null;
  const prefix = `${COOKIE_NAME}=`;
  const value = rawCookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

export function establishAdminSession(
  res: Response,
  username: string,
  role: AdminRole = "admin",
): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  const issuedAt = Math.floor(Date.now() / 1000);
  const encodedUsername = encodeIdentity(username);
  const tokenData = `${issuedAt}.${encodedUsername}.${role}`;
  const token = `${tokenData}.${sign(tokenData, secret)}`;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/api",
  });
  return true;
}

export function clearAdminSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api",
  });
}

export function hasAdminSession(req: Request): boolean {
  return getAdminSession(req)?.role === "admin";
}

export function hasCheckInAccess(req: Request): boolean {
  const role = getAdminSession(req)?.role;
  return role === "admin" || role === "checkin" || role === "registration_checkin";
}

export function getAdminIdentity(req: Request): string | null {
  return getAdminSession(req)?.username ?? null;
}

export function getAdminSession(req: Request): AdminSession | null {
  const secret = getSessionSecret();
  const token = readCookie(req);
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 && parts.length !== 4) return null;

  const [issuedAtText, encodedUsername] = parts;
  const signature = parts.at(-1);
  // Three-part cookies predate role-based access. They were issued only to
  // full admins, so keep them valid as admin sessions until they expire.
  const role = (parts.length === 3 ? "admin" : parts[2]) as AdminRole;
  const issuedAt = Number(issuedAtText);
  if (
    !Number.isInteger(issuedAt) ||
    !encodedUsername ||
    !signature ||
    !isAdminRole(role) ||
    Date.now() / 1000 - issuedAt > MAX_AGE_SECONDS
  ) {
    return null;
  }

  const tokenData = parts.slice(0, -1).join(".");
  const expected = sign(tokenData, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }
  const username = decodeIdentity(encodedUsername);
  return username ? { username, role } : null;
}
export function isAdminRole(value: unknown): value is AdminRole {
  return ["admin", "checkin", "registration_viewer", "new_converts", "registration_checkin"].includes(value as string);
}
export function hasRegistrationAccess(req: Request): boolean {
  const role = getAdminSession(req)?.role;
  return role === "admin" || role === "registration_checkin";
}
export function hasRegistrationCountAccess(req: Request): boolean {
  const role = getAdminSession(req)?.role;
  return hasRegistrationAccess(req) || role === "registration_viewer";
}
export function hasNewConvertsAccess(req: Request): boolean {
  const role = getAdminSession(req)?.role;
  return role === "admin" || role === "new_converts";
}
