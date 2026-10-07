import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, newConvertsTable } from "@workspace/db";
import { hasAdminSession } from "../lib/admin-session";

const router: IRouter = Router();

router.post("/new-converts", async (req, res): Promise<void> => {
  const body = req.body;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || phone.length > 40 || city.length > 120 || body?.consentToContact !== true) {
    res.status(400).json({ error: "Please enter your name, a valid email, and permission for us to contact you." });
    return;
  }
  await db.insert(newConvertsTable).values({ name, email, phone, city, consentToContact: true });
  res.status(201).json({ success: true });
});

router.get("/new-converts", async (req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return;
  }
  const responses = await db.select().from(newConvertsTable).orderBy(desc(newConvertsTable.createdAt));
  res.json(responses);
});

export default router;
