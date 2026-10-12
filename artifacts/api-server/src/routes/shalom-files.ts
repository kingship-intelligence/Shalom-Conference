import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, shalomFilesTable } from "@workspace/db";
import {
  CompleteShalomFileUploadParams,
  CompleteShalomFileUploadResponse,
  ListShalomFilesResponse,
  RequestShalomFileDownloadUrlParams,
  RequestShalomFileDownloadUrlResponse,
  RequestShalomFileUploadUrlBody,
  RequestShalomFileUploadUrlResponse,
} from "@workspace/api-zod";
import { getAdminSession, hasShalomFilesAccess } from "../lib/admin-session";
import {
  MAX_SHALOM_FILE_BYTES,
  shalomFileStorage,
} from "../lib/shalom-file-storage";

const router: IRouter = Router();

function requireShalomFilesAccess(req: Request, res: Response): boolean {
  if (!getAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return false;
  }
  if (!hasShalomFilesAccess(req)) {
    res.status(403).json({ error: "Shalom 2026 file access is required." });
    return false;
  }
  return true;
}

export function sanitizeShalomFileName(fileName: string): string | null {
  const baseName = fileName.split(/[/\\]/).pop() ?? "";
  const cleaned = baseName.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 180);
  if (!cleaned || cleaned === "." || cleaned === "..") return null;
  return cleaned;
}

router.get("/shalom-files", async (req, res): Promise<void> => {
  if (!requireShalomFilesAccess(req, res)) return;

  const files = await db
    .select()
    .from(shalomFilesTable)
    .where(eq(shalomFilesTable.status, "ready"))
    .orderBy(desc(shalomFilesTable.createdAt));
  res.json(ListShalomFilesResponse.parse(files));
});

router.post("/shalom-files/upload-url", async (req, res): Promise<void> => {
  if (!requireShalomFilesAccess(req, res)) return;
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const parsed = RequestShalomFileUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Choose a file no larger than 100 MB." });
    return;
  }

  const fileName = sanitizeShalomFileName(parsed.data.fileName);
  const contentType = parsed.data.contentType.trim();
  if (!fileName || !contentType || parsed.data.size > MAX_SHALOM_FILE_BYTES) {
    res.status(400).json({ error: "Choose a file no larger than 100 MB." });
    return;
  }

  try {
    const upload = await shalomFileStorage.createUpload();
    const [file] = await db
      .insert(shalomFilesTable)
      .values({
        fileName,
        objectPath: upload.objectPath,
        contentType,
        size: parsed.data.size,
        status: "pending",
        uploadedBy: session.username,
      })
      .returning();
    res.json(RequestShalomFileUploadUrlResponse.parse({
      id: file.id,
      uploadURL: upload.uploadURL,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Failed to prepare Shalom 2026 file upload");
    res.status(500).json({ error: "The file upload could not be prepared." });
  }
});

router.post("/shalom-files/:fileId/complete", async (req, res): Promise<void> => {
  if (!requireShalomFilesAccess(req, res)) return;

  const parsed = CompleteShalomFileUploadParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid file upload." });
    return;
  }

  const [file] = await db
    .select()
    .from(shalomFilesTable)
    .where(and(
      eq(shalomFilesTable.id, parsed.data.fileId),
      eq(shalomFilesTable.status, "pending"),
    ));
  if (!file) {
    res.status(404).json({ error: "This file upload was not found." });
    return;
  }

  try {
    const uploaded = await shalomFileStorage.verifyUpload(file.objectPath);
    if (
      !Number.isInteger(uploaded.size) ||
      uploaded.size !== file.size ||
      uploaded.size > MAX_SHALOM_FILE_BYTES
    ) {
      throw new Error("Uploaded file failed verification");
    }

    const [readyFile] = await db
      .update(shalomFilesTable)
      .set({
        status: "ready",
        size: uploaded.size,
        contentType: (uploaded.contentType || file.contentType).slice(0, 200),
      })
      .where(and(
        eq(shalomFilesTable.id, file.id),
        eq(shalomFilesTable.status, "pending"),
      ))
      .returning();
    if (!readyFile) {
      res.status(404).json({ error: "This file upload was not found." });
      return;
    }
    res.json(CompleteShalomFileUploadResponse.parse(readyFile));
  } catch (error) {
    await shalomFileStorage.deleteObject(file.objectPath).catch((deleteError: unknown) => {
      req.log.error({ err: deleteError, fileId: file.id }, "Failed to remove rejected Shalom 2026 file");
    });
    await db.delete(shalomFilesTable).where(eq(shalomFilesTable.id, file.id));
    req.log.warn({ err: error, fileId: file.id }, "Rejected Shalom 2026 file upload");
    res.status(400).json({ error: "The uploaded file could not be verified." });
  }
});

router.post("/shalom-files/:fileId/download", async (req, res): Promise<void> => {
  if (!requireShalomFilesAccess(req, res)) return;

  const parsed = RequestShalomFileDownloadUrlParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid file." });
    return;
  }

  const [file] = await db
    .select()
    .from(shalomFilesTable)
    .where(and(
      eq(shalomFilesTable.id, parsed.data.fileId),
      eq(shalomFilesTable.status, "ready"),
    ));
  if (!file) {
    res.status(404).json({ error: "File not found." });
    return;
  }

  try {
    const downloadURL = await shalomFileStorage.createDownloadUrl(file.objectPath);
    res.json(RequestShalomFileDownloadUrlResponse.parse({ downloadURL }));
  } catch (error) {
    req.log.error({ err: error, fileId: file.id }, "Failed to prepare Shalom 2026 file download");
    res.status(500).json({ error: "The file download could not be prepared." });
  }
});

export default router;
