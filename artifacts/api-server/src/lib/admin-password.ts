import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const HASH_BYTES = 64;
const SCRYPT_PREFIX = "scrypt";

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, HASH_BYTES, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = await deriveKey(password, salt);
  return `${SCRYPT_PREFIX}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, encodedHash: string): Promise<boolean> {
  const [prefix, saltText, hashText, extra] = encodedHash.split("$");
  if (
    prefix !== SCRYPT_PREFIX ||
    !saltText ||
    !hashText ||
    extra !== undefined ||
    !/^[A-Za-z0-9_-]+$/.test(saltText) ||
    !/^[A-Za-z0-9_-]+$/.test(hashText)
  ) {
    return false;
  }

  const salt = Buffer.from(saltText, "base64url");
  const expectedHash = Buffer.from(hashText, "base64url");
  if (salt.length !== SALT_BYTES || expectedHash.length !== HASH_BYTES) return false;

  const actualHash = await deriveKey(password, salt);
  return timingSafeEqual(actualHash, expectedHash);
}