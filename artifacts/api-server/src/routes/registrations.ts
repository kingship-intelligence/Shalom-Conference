import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";
import { CreateRegistrationBody, ListRegistrationsResponse, ListRegistrationsResponseItem } from "@workspace/api-zod";
import { sendRegistrationConfirmation } from "../lib/email";

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

  sendRegistrationConfirmation({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    conferenceYear: String(parsed.data.conferenceYear),
    isVolunteer: parsed.data.volunteer ?? false,
    volunteerRole: parsed.data.volunteerRole,
  }).catch((err: unknown) => {
    req.log.error({ err }, "Failed to send registration confirmation email");
  });

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
