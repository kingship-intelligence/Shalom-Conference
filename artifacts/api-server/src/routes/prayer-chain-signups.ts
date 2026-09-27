import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, prayerChainSignupsTable } from "@workspace/db";
import {
  ListPrayerChainSignupsResponse,
} from "@workspace/api-zod";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/prayer-chain-signups", (_req, res): void => {
  res.status(410).json({ error: "Prayer Charge sign-ups are closed." });
});

router.get("/prayer-chain-signups", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }

  const signups = await db
    .select()
    .from(prayerChainSignupsTable)
    .orderBy(desc(prayerChainSignupsTable.createdAt));

  res.json(ListPrayerChainSignupsResponse.parse(signups));
});

export default router;