import { randomUUID } from "node:crypto";

import { Storage, type File } from "@google-cloud/storage";

const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const SHALOM_FILE_PREFIX = "shalom-2026/";
export const MAX_SHALOM_FILE_BYTES = 100 * 1024 * 1024;

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

function assertShalomPath(objectPath: string): string {
  const prefix = `/objects/${SHALOM_FILE_PREFIX}`;
  if (!objectPath.startsWith(prefix)) {
    throw new Error("Invalid Shalom 2026 file location");
  }
  return objectPath.slice("/objects/".length);
}

function getFileForKey(key: string): File {
  const { bucketName, objectName } = parseGcsPath(`${getPrivateObjectDir()}/${key}`);
  return storageClient.bucket(bucketName).file(objectName);
}

async function signUrl(key: string, method: "GET" | "PUT"): Promise<string> {
  const { bucketName, objectName } = parseGcsPath(`${getPrivateObjectDir()}/${key}`);
  const response = await fetch(`${SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to sign private ${method} URL (${response.status})`);
  }

  const payload = (await response.json()) as { signed_url?: string };
  if (!payload.signed_url) {
    throw new Error("Object storage did not return a signed URL");
  }
  return payload.signed_url;
}

export const shalomFileStorage = {
  async createUpload(): Promise<{ uploadURL: string; objectPath: string }> {
    const key = `${SHALOM_FILE_PREFIX}${randomUUID()}`;
    return {
      uploadURL: await signUrl(key, "PUT"),
      objectPath: `/objects/${key}`,
    };
  },

  async verifyUpload(objectPath: string): Promise<{ contentType: string; size: number }> {
    const file = getFileForKey(assertShalomPath(objectPath));
    const [metadata] = await file.getMetadata();
    return {
      contentType: String(metadata.contentType ?? "application/octet-stream"),
      size: Number(metadata.size ?? 0),
    };
  },

  async createDownloadUrl(objectPath: string): Promise<string> {
    return signUrl(assertShalomPath(objectPath), "GET");
  },

  async deleteObject(objectPath: string): Promise<void> {
    await getFileForKey(assertShalomPath(objectPath)).delete({ ignoreNotFound: true });
  },
};
