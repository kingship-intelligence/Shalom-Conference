import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, prayerChainSignupsTable } from "@workspace/db";
import {
  CreatePrayerChainSignupBody,
  ListPrayerChainSignupsResponse,
  ListPrayerChainSignupsResponseItem,
} from "@workspace/api-zod";
import { hasAdminSession } from "../lib/admin-session";
import { sendPrayerChainConfirmation } from "../lib/email";

const router: IRouter = Router();

router.post("/prayer-chain-signups", async (req, res): Promise<void> => {
  const parsed = CreatePrayerChainSignupBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid prayer-chain signup body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [signup] = await db
    .insert(prayerChainSignupsTable)
    .values({
      ...parsed.data,
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone.trim(),
    })
    .returning();

  sendPrayerChainConfirmation({
    name: signup.name,
    email: signup.email,
    timeSlots: signup.timeSlots,
  }).catch((err: unknown) => {
    req.log.error(
      { err, prayerChainSignupId: signup.id },
      "Failed to send prayer-chain confirmation email",
    );
  });

  res.status(201).json(ListPrayerChainSignupsResponseItem.parse(signup));
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