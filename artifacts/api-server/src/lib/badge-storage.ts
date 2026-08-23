import { randomUUID } from "node:crypto";

import { Storage, type File } from "@google-cloud/storage";

const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const PRIVATE_BADGE_PREFIX = "attendee-badges/";

const storageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function getPrivateObjectDir(): string {
  const value = process.env.PRIVATE_OBJECT_DIR;
  if (!value) {
    throw new Error("PRIVATE_OBJECT_DIR is not configured");
  }
  return value.replace(/\/+$/, "");
}

function parseGcsPath(value: string): { bucketName: string; objectName: string } {
  const parts = value.replace(/^\/+/, "").split("/");
  const [bucketName, ...objectParts] = parts;
  if (!bucketName || objectParts.length === 0) {
    throw new Error("Invalid object storage path");
  }
  return { bucketName, objectName: objectParts.join("/") };
}

function getFileForKey(key: string): File {
  const { bucketName, objectName } = parseGcsPath(`${getPrivateObjectDir()}/${key}`);
  return storageClient.bucket(bucketName).file(objectName);
}

async function signPutUrl(key: string): Promise<string> {
  const { bucketName, objectName } = parseGcsPath(`${getPrivateObjectDir()}/${key}`);
  const response = await fetch(`${SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to sign private upload URL (${response.status})`);
  }

  const payload = (await response.json()) as { signed_url?: string };
  if (!payload.signed_url) {
    throw new Error("Object storage did not return an upload URL");
  }
  return payload.signed_url;
}

export const badgeStorage = {
  async createPortraitUpload(): Promise<{ uploadURL: string; objectPath: string }> {
    const key = `${PRIVATE_BADGE_PREFIX}${randomUUID()}`;
    return {
      uploadURL: await signPutUrl(key),
      objectPath: `/objects/${key}`,
    };
  },

  async downloadPortrait(objectPath: string): Promise<{ buffer: Buffer; contentType: string; size: number }> {
    if (!objectPath.startsWith(`/objects/${PRIVATE_BADGE_PREFIX}`)) {
      throw new Error("Invalid attendee portrait location");
    }

    const key = objectPath.slice("/objects/".length);
    const file = getFileForKey(key);
    const [metadata] = await file.getMetadata();
    const [buffer] = await file.download();

    return {
      buffer,
      contentType: String(metadata.contentType ?? ""),
      size: Number(metadata.size ?? buffer.length),
    };
  },
};