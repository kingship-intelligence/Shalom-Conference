import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";
import { CreateRegistrationBody, ListRegistrationsResponse, ListRegistrationsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check for duplicate email + year
  const [existing] = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.email, parsed.data.email),
        eq(registrationsTable.conferenceYear, parsed.data.conferenceYear)
      )
    );

  if (existing) {
    res.status(409).json({ error: "This email is already registered." });
    return;
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(ListRegistrationsResponseItem.parse(registration));
});

router.get("/registrations", async (_req, res): Promise<void> => {
  const registrations = await db
    .select()
    .from(registrationsTable)
    .orderBy(registrationsTable.createdAt);
  res.json(ListRegistrationsResponse.parse(registrations));
});

export default router;
