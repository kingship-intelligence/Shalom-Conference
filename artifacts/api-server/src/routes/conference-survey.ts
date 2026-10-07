import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { CreateConferenceSurveyBody } from "@workspace/api-zod";
import { db, conferenceSurveyTable } from "@workspace/db";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();
router.post("/conference-survey", async (req, res): Promise<void> => {
  const parsed = CreateConferenceSurveyBody.safeParse(req.body && {
    ...req.body,
    highlight: typeof req.body.highlight === "string" ? req.body.highlight.trim() : req.body.highlight,
    improvements: typeof req.body.improvements === "string" ? req.body.improvements.trim() : req.body.improvements,
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a rating, attendance preference, and feedback of at most 3,000 characters per answer." });
    return;
  }
  await db.insert(conferenceSurveyTable).values(parsed.data);
  res.status(201).json({ success: true });
});
router.get("/conference-survey", async (req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  if (!hasAdminSession(req)) {
    res.status(403).json({ error: "Full admin access is required." });
    return;
  }
  res.json(await db.select().from(conferenceSurveyTable).orderBy(desc(conferenceSurveyTable.createdAt)));
});
export default router;
