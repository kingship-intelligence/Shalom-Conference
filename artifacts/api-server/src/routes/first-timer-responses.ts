import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, firstTimerResponsesTable } from "@workspace/db";
import {
  CreateFirstTimerResponseBody,
  CreateFirstTimerResponseResponse,
  ListFirstTimerResponsesResponse,
} from "@workspace/api-zod";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/first-timer-responses", async (req, res): Promise<void> => {
  const normalizedBody =
    typeof req.body === "object" && req.body !== null
      ? {
          ...req.body,
          name: typeof req.body.name === "string" ? req.body.name.trim() : req.body.name,
          email:
            typeof req.body.email === "string"
              ? req.body.email.trim().toLowerCase()
              : req.body.email,
        }
      : req.body;
  const parsed = CreateFirstTimerResponseBody.safeParse(normalizedBody);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid first-timer response body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [response] = await db
      .insert(firstTimerResponsesTable)
      .values({
        ...parsed.data,
      })
      .returning();

    res.status(201).json(CreateFirstTimerResponseResponse.parse(response));
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        error: "A response for this email has already been submitted for this conference.",
      });
      return;
    }
    throw error;
  }
});

router.get("/first-timer-responses", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const responses = await db
    .select()
    .from(firstTimerResponsesTable)
    .orderBy(desc(firstTimerResponsesTable.createdAt));

  res.json(ListFirstTimerResponsesResponse.parse(responses));
});

export default router;