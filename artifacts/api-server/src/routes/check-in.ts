import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  CheckInRegistrationParams,
  CheckInRegistrationResponse,
  CreateCheckInSessionBody,
  CreateCheckInSessionResponse,
  DeleteCheckInSessionParams,
  ListCheckInSessionsResponse,
  ListSessionCheckInsParams,
  ListSessionCheckInsResponse,
  UndoRegistrationCheckInParams,
} from "@workspace/api-zod";
import {
  checkInSessionsTable,
  db,
  registrationCheckInsTable,
  registrationsTable,
} from "@workspace/db";
import { getAdminIdentity } from "../lib/admin-session";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response): string | null {
  const identity = getAdminIdentity(req);
  if (!identity) {
    res.status(401).json({ error: "Admin sign-in is required." });
    return null;
  }
  return identity;
}

function isValidCalendarDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

router.get("/check-in-sessions", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const sessions = await db
    .select()
    .from(checkInSessionsTable)
    .orderBy(
      desc(checkInSessionsTable.conferenceYear),
      desc(checkInSessionsTable.sessionDate),
      asc(checkInSessionsTable.name),
    );
  res.json(ListCheckInSessionsResponse.parse(sessions));
});

router.post("/check-in-sessions", async (req, res): Promise<void> => {
  const adminIdentity = requireAdmin(req, res);
  if (!adminIdentity) return;

  const parsed = CreateCheckInSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isValidCalendarDate(parsed.data.sessionDate)) {
    res.status(400).json({ error: "Enter a real calendar date." });
    return;
  }

  const name = parsed.data.name.trim();
  if (!name) {
    res.status(400).json({ error: "Session name cannot be blank." });
    return;
  }

  try {
    const [session] = await db
      .insert(checkInSessionsTable)
      .values({
        ...parsed.data,
        name,
        createdBy: adminIdentity,
      })
      .onConflictDoNothing({
        target: [
          checkInSessionsTable.conferenceYear,
          checkInSessionsTable.sessionDate,
          checkInSessionsTable.name,
        ],
      })
      .returning();

    if (!session) {
      res.status(409).json({ error: "A session with this name already exists for that date." });
      return;
    }

    res.status(201).json(CreateCheckInSessionResponse.parse(session));
  } catch (err) {
    req.log.error({ err }, "Failed to create check-in session");
    res.status(500).json({ error: "We could not create that session. Please try again." });
  }
});

router.delete("/check-in-sessions/:sessionId", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const parsed = DeleteCheckInSessionParams.safeParse(req.params);
  if (!parsed.success || parsed.data.sessionId < 1) {
    res.status(400).json({ error: "Invalid session ID." });
    return;
  }

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .select({ id: checkInSessionsTable.id })
      .from(checkInSessionsTable)
      .where(eq(checkInSessionsTable.id, parsed.data.sessionId))
      .for("update");

    if (!session) return "not-found" as const;

    const [checkIn] = await tx
      .select({ id: registrationCheckInsTable.id })
      .from(registrationCheckInsTable)
      .where(eq(registrationCheckInsTable.sessionId, parsed.data.sessionId))
      .limit(1);

    if (checkIn) return "has-check-ins" as const;

    await tx
      .delete(checkInSessionsTable)
      .where(eq(checkInSessionsTable.id, parsed.data.sessionId));
    return "deleted" as const;
  });

  if (result === "not-found") {
    res.status(404).json({ error: "Check-in session not found." });
    return;
  }
  if (result === "has-check-ins") {
    res.status(409).json({ error: "A session with check-ins cannot be deleted." });
    return;
  }

  res.sendStatus(204);
});

router.get("/check-in-sessions/:sessionId/check-ins", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const parsed = ListSessionCheckInsParams.safeParse(req.params);
  if (!parsed.success || parsed.data.sessionId < 1) {
    res.status(400).json({ error: "Invalid session ID." });
    return;
  }

  const [session] = await db
    .select({ id: checkInSessionsTable.id })
    .from(checkInSessionsTable)
    .where(eq(checkInSessionsTable.id, parsed.data.sessionId))
    .limit(1);
  if (!session) {
    res.status(404).json({ error: "Check-in session not found." });
    return;
  }

  const checkIns = await db
    .select()
    .from(registrationCheckInsTable)
    .where(eq(registrationCheckInsTable.sessionId, parsed.data.sessionId))
    .orderBy(asc(registrationCheckInsTable.checkedInAt));
  res.json(ListSessionCheckInsResponse.parse(checkIns));
});

router.post(
  "/check-in-sessions/:sessionId/registrations/:registrationId/check-in",
  async (req, res): Promise<void> => {
    const adminIdentity = requireAdmin(req, res);
    if (!adminIdentity) return;

    const parsed = CheckInRegistrationParams.safeParse(req.params);
    if (!parsed.success || parsed.data.sessionId < 1 || parsed.data.registrationId < 1) {
      res.status(400).json({ error: "Invalid session or registration ID." });
      return;
    }

    const result = await db.transaction(async (tx) => {
      const [session] = await tx
        .select({
          id: checkInSessionsTable.id,
          conferenceYear: checkInSessionsTable.conferenceYear,
        })
        .from(checkInSessionsTable)
        .where(eq(checkInSessionsTable.id, parsed.data.sessionId))
        .for("update");

      if (!session) return { kind: "session-not-found" as const };

      const [registration] = await tx
        .select({
          id: registrationsTable.id,
          conferenceYear: registrationsTable.conferenceYear,
        })
        .from(registrationsTable)
        .where(eq(registrationsTable.id, parsed.data.registrationId))
        .for("update");

      if (!registration || registration.conferenceYear !== session.conferenceYear) {
        return { kind: "registration-not-found" as const };
      }

      const [checkIn] = await tx
        .insert(registrationCheckInsTable)
        .values({
          sessionId: session.id,
          registrationId: registration.id,
          checkedInBy: adminIdentity,
        })
        .onConflictDoNothing({
          target: [
            registrationCheckInsTable.sessionId,
            registrationCheckInsTable.registrationId,
          ],
        })
        .returning();

      return checkIn ? { kind: "created" as const, checkIn } : { kind: "duplicate" as const };
    });

    if (result.kind === "session-not-found") {
      res.status(404).json({ error: "Check-in session not found." });
      return;
    }
    if (result.kind === "registration-not-found") {
      res.status(404).json({ error: "Registration not found for this session." });
      return;
    }
    if (result.kind === "duplicate") {
      res.status(409).json({ error: "This attendee is already checked in to this session." });
      return;
    }

    res.status(201).json(CheckInRegistrationResponse.parse(result.checkIn));
  },
);

router.delete(
  "/check-in-sessions/:sessionId/registrations/:registrationId/check-in",
  async (req, res): Promise<void> => {
    if (!requireAdmin(req, res)) return;

    const parsed = UndoRegistrationCheckInParams.safeParse(req.params);
    if (!parsed.success || parsed.data.sessionId < 1 || parsed.data.registrationId < 1) {
      res.status(400).json({ error: "Invalid session or registration ID." });
      return;
    }

    const [deletedCheckIn] = await db
      .delete(registrationCheckInsTable)
      .where(
        and(
          eq(registrationCheckInsTable.sessionId, parsed.data.sessionId),
          eq(registrationCheckInsTable.registrationId, parsed.data.registrationId),
        ),
      )
      .returning();

    if (!deletedCheckIn) {
      res.status(404).json({ error: "Check-in not found." });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;