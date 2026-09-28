import { createHash, randomBytes } from "node:crypto";

export const CHECK_IN_QR_PREFIX = "shalom-checkin:v1:";
const QR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type CheckInQrCredential = {
  payload: string;
  tokenHash: string;
};

export function hashCheckInQrPayload(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

export function createCheckInQrCredential(): CheckInQrCredential {
  const payload = `${CHECK_IN_QR_PREFIX}${randomBytes(32).toString("base64url")}`;
  return { payload, tokenHash: hashCheckInQrPayload(payload) };
}

export function isValidCheckInQrPayload(payload: unknown): payload is string {
  return (
    typeof payload === "string" &&
    payload.startsWith(CHECK_IN_QR_PREFIX) &&
    QR_TOKEN_PATTERN.test(payload.slice(CHECK_IN_QR_PREFIX.length))
  );
}