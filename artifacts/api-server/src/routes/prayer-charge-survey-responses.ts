import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, prayerChargeSurveyResponsesTable } from "@workspace/db";
import {
  CreatePrayerChargeSurveyResponseBody,
  CreatePrayerChargeSurveyResponseResponse,
  ListPrayerChargeSurveyResponsesResponse,
} from "@workspace/api-zod";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/prayer-charge-survey-responses", async (req, res): Promise<void> => {
  const normalizedBody =
    typeof req.body === "object" && req.body !== null
      ? {
          ...req.body,
          meaningfulMoment:
            typeof req.body.meaningfulMoment === "string"
              ? req.body.meaningfulMoment.trim()
              : req.body.meaningfulMoment,
          suggestion:
            typeof req.body.suggestion === "string"
              ? req.body.suggestion.trim()
              : req.body.suggestion,
        }
      : req.body;
  const parsed = CreatePrayerChargeSurveyResponseBody.safeParse(normalizedBody);
  if (!parsed.success) {
    req.log.warn(
      { errors: parsed.error.message },
      "Invalid Prayer Charge survey response",
    );
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [response] = await db
    .insert(prayerChargeSurveyResponsesTable)
    .values({
      rating: parsed.data.rating,
      meaningfulMoment: parsed.data.meaningfulMoment ?? "",
      suggestion: parsed.data.suggestion ?? "",
      wouldAttendAgain: parsed.data.wouldAttendAgain,
    })
    .returning();

  res.status(201).json(CreatePrayerChargeSurveyResponseResponse.parse(response));
});

router.get("/prayer-charge-survey-responses", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const responses = await db
    .select()
    .from(prayerChargeSurveyResponsesTable)
    .orderBy(desc(prayerChargeSurveyResponsesTable.createdAt));

  res.json(ListPrayerChargeSurveyResponsesResponse.parse(responses));
});

export default router;