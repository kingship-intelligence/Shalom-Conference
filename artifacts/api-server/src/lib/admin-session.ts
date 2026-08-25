import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "shalom_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

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

export function establishAdminSession(res: Response, username: string): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  const issuedAt = Math.floor(Date.now() / 1000);
  const encodedUsername = encodeIdentity(username);
  const tokenData = `${issuedAt}.${encodedUsername}`;
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

export function hasAdminSession(req: Request): boolean {
  return getAdminIdentity(req) !== null;
}

export function getAdminIdentity(req: Request): string | null {
  const secret = getSessionSecret();
  const token = readCookie(req);
  if (!secret || !token) return null;
  const [issuedAtText, encodedUsername, signature] = token.split(".");
  const issuedAt = Number(issuedAtText);
  if (!Number.isInteger(issuedAt) || !encodedUsername || !signature || Date.now() / 1000 - issuedAt > MAX_AGE_SECONDS) {
    return null;
  }

  const tokenData = `${issuedAtText}.${encodedUsername}`;
  const expected = sign(tokenData, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }
  return decodeIdentity(encodedUsername);
}