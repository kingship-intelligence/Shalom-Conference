import { Router, type IRouter } from "express";
import { createHash, randomBytes } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";
import {
  CompleteRegistrationBadgeBody,
  CompleteRegistrationBadgeParams,
  CreateRegistrationBody,
  RequestExistingRegistrationBadgeBody,
  ListRegistrationsResponse,
  ListRegistrationsResponseItem,
  RequestRegistrationBadgeUploadUrlBody,
  RequestRegistrationBadgeUploadUrlParams,
  RequestRegistrationBadgeUploadUrlResponse,
  SkipRegistrationBadgeBody,
  SkipRegistrationBadgeParams,
} from "@workspace/api-zod";
import { createAttendeeBadge } from "../lib/attendee-badge";
import { badgeStorage } from "../lib/badge-storage";
import { sendRegistrationConfirmation } from "../lib/email";

const router: IRouter = Router();
const MAX_PORTRAIT_BYTES = 5 * 1024 * 1024;
const ALLOWED_PORTRAIT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

class DuplicateRegistrationError extends Error {}

function hashUploadToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createUploadToken(): string {
  return randomBytes(32).toString("hex");
}

function getBadgeUploadExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000);
}

function toRegistrationResponse(registration: typeof registrationsTable.$inferSelect) {
  return ListRegistrationsResponseItem.parse(registration);
}

async function sendStandardConfirmation(registration: typeof registrationsTable.$inferSelect): Promise<void> {
  await sendRegistrationConfirmation({
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    conferenceYear: String(registration.conferenceYear),
    isVolunteer: registration.volunteer,
    volunteerRole: registration.volunteerRole,
  });
}

async function getAuthorizedBadgeRegistration(
  registrationId: number,
  token: string,
): Promise<typeof registrationsTable.$inferSelect | null> {
  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, registrationId));

  if (
    !registration ||
    registration.badgeSentAt ||
    !registration.badgeUploadTokenHash ||
    registration.badgeUploadTokenHash !== hashUploadToken(token) ||
    !registration.badgeUploadExpiresAt ||
    registration.badgeUploadExpiresAt <= new Date()
  ) {
    return null;
  }

  return registration;
}

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { wantsAttendeeBadge = false, plusOne, ...registrationInput } = parsed.data;
  const badgeUploadToken = wantsAttendeeBadge ? createUploadToken() : undefined;
  const badgeUploadExpiresAt = badgeUploadToken ? getBadgeUploadExpiry() : null;

  try {
    const created = await db.transaction(async (tx) => {
      const attendeeEmails = [registrationInput.email, ...(plusOne ? [plusOne.email] : [])];
      if (new Set(attendeeEmails.map((email) => email.toLowerCase())).size !== attendeeEmails.length) {
        throw new DuplicateRegistrationError();
      }

      for (const email of attendeeEmails) {
        const [existing] = await tx
          .select()
          .from(registrationsTable)
          .where(
            and(
              eq(registrationsTable.email, email),
              eq(registrationsTable.conferenceYear, registrationInput.conferenceYear),
            ),
          );
        if (existing) {
          throw new DuplicateRegistrationError();
        }
      }

      const [registration] = await tx
        .insert(registrationsTable)
        .values({
          ...registrationInput,
          badgeUploadTokenHash: badgeUploadToken ? hashUploadToken(badgeUploadToken) : null,
          badgeUploadExpiresAt,
        })
        .returning();

      const [plusOneRegistration] = plusOne
        ? await tx
            .insert(registrationsTable)
            .values({
              firstName: plusOne.firstName,
              lastName: plusOne.lastName,
              email: plusOne.email,
              phone: plusOne.phone,
              conferenceYear: registrationInput.conferenceYear,
              volunteer: false,
              volunteerRole: null,
            })
            .returning()
        : [undefined];

      return { registration, plusOneRegistration };
    });

    for (const attendee of [created.registration, created.plusOneRegistration]) {
      if (!attendee) continue;
      sendStandardConfirmation(attendee).catch((err: unknown) => {
        req.log.error(
          { err, registrationId: attendee.id },
          "Failed to send registration confirmation email",
        );
      });
    }

    res.status(201).json({
      ...toRegistrationResponse(created.registration),
      ...(badgeUploadToken ? { badgeUploadToken } : {}),
    });
  } catch (err) {
    if (err instanceof DuplicateRegistrationError) {
      res.status(409).json({ error: "One of these attendees is already registered." });
      return;
    }
    req.log.error({ err }, "Failed to create registration");
    res.status(500).json({ error: "We could not complete the registration. Please try again." });
  }
});

router.post("/registrations/badge-request", async (req, res): Promise<void> => {
  const parsed = RequestExistingRegistrationBadgeBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid existing registration badge request");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [registration] = await db
    .select()
    .from(registrationsTable)
    .where(
      and(
        eq(registrationsTable.firstName, parsed.data.firstName),
        eq(registrationsTable.lastName, parsed.data.lastName),
        eq(registrationsTable.email, parsed.data.email),
        eq(registrationsTable.conferenceYear, parsed.data.conferenceYear),
      ),
    );

  if (!registration || registration.badgeSentAt) {
    res.status(404).json({ error: "We couldn't find an eligible registration for those details." });
    return;
  }

  const badgeUploadToken = createUploadToken();
  await db
    .update(registrationsTable)
    .set({
      badgeUploadTokenHash: hashUploadToken(badgeUploadToken),
      badgeUploadExpiresAt: getBadgeUploadExpiry(),
      badgePhotoObjectPath: null,
    })
    .where(eq(registrationsTable.id, registration.id));

  res.json({
    registrationId: registration.id,
    badgeUploadToken,
  });
});

router.get("/registrations", async (_req, res): Promise<void> => {
  const registrations = await db
    .select()
    .from(registrationsTable)
    .orderBy(registrationsTable.createdAt);
  res.json(ListRegistrationsResponse.parse(registrations));
});

router.post(
  "/registrations/:registrationId/badge/upload-url",
  async (req, res): Promise<void> => {
    const params = RequestRegistrationBadgeUploadUrlParams.safeParse(req.params);
    const body = RequestRegistrationBadgeUploadUrlBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid badge photo upload request." });
      return;
    }

    const registration = await getAuthorizedBadgeRegistration(params.data.registrationId, body.data.token);
    if (!registration) {
      res.status(401).json({ error: "This badge upload link is invalid or has expired." });
      return;
    }

    try {
      const upload = await badgeStorage.createPortraitUpload();
      await db
        .update(registrationsTable)
        .set({ badgePhotoObjectPath: upload.objectPath })
        .where(eq(registrationsTable.id, registration.id));

      res.json(RequestRegistrationBadgeUploadUrlResponse.parse(upload));
    } catch (err) {
      req.log.error({ err }, "Failed to create attendee badge upload URL");
      res.status(500).json({ error: "We could not prepare your photo upload. Please try again." });
    }
  },
);

router.post(
  "/registrations/:registrationId/badge/complete",
  async (req, res): Promise<void> => {
    const params = CompleteRegistrationBadgeParams.safeParse(req.params);
    const body = CompleteRegistrationBadgeBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid attendee badge request." });
      return;
    }

    const registration = await getAuthorizedBadgeRegistration(params.data.registrationId, body.data.token);
    if (!registration) {
      res.status(401).json({ error: "This badge request is invalid or has expired." });
      return;
    }
    if (registration.badgePhotoObjectPath !== body.data.objectPath) {
      res.status(400).json({ error: "The uploaded photo does not match this registration." });
      return;
    }

    try {
      const portrait = await badgeStorage.downloadPortrait(body.data.objectPath);
      if (!ALLOWED_PORTRAIT_TYPES.has(portrait.contentType) || portrait.size > MAX_PORTRAIT_BYTES) {
        throw new Error("Uploaded portrait did not meet image requirements");
      }

      const attendeeBadge = await createAttendeeBadge({
        portrait: portrait.buffer,
        firstName: registration.firstName,
        lastName: registration.lastName,
        conferenceYear: registration.conferenceYear,
      });

      await sendRegistrationConfirmation({
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        conferenceYear: String(registration.conferenceYear),
        isVolunteer: registration.volunteer,
        volunteerRole: registration.volunteerRole,
        attendeeBadge,
      });

      const [updatedRegistration] = await db
        .update(registrationsTable)
        .set({
          badgeSentAt: new Date(),
          badgeUploadTokenHash: null,
          badgeUploadExpiresAt: null,
        })
        .where(eq(registrationsTable.id, registration.id))
        .returning();

      res.json({
        ...toRegistrationResponse(updatedRegistration),
        badgeDeliveryStatus: "delivered",
      });
    } catch (err) {
      req.log.error({ err }, "Failed to create attendee badge");
      const [updatedRegistration] = await db
        .update(registrationsTable)
        .set({
          badgeUploadTokenHash: null,
          badgeUploadExpiresAt: null,
        })
        .where(eq(registrationsTable.id, registration.id))
        .returning();
      res.status(202).json({
        ...toRegistrationResponse(updatedRegistration),
        badgeDeliveryStatus: "fallback",
      });
    }
  },
);

router.post(
  "/registrations/:registrationId/badge/skip",
  async (req, res): Promise<void> => {
    const params = SkipRegistrationBadgeParams.safeParse(req.params);
    const body = SkipRegistrationBadgeBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid badge request." });
      return;
    }

    const registration = await getAuthorizedBadgeRegistration(params.data.registrationId, body.data.token);
    if (!registration) {
      res.status(401).json({ error: "This badge request is invalid or has expired." });
      return;
    }

    const [updatedRegistration] = await db
      .update(registrationsTable)
      .set({
        badgeUploadTokenHash: null,
        badgeUploadExpiresAt: null,
      })
      .where(eq(registrationsTable.id, registration.id))
      .returning();
    res.json(toRegistrationResponse(updatedRegistration));
  },
);

export default router;
