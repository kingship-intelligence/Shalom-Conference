import { date, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { registrationsTable } from "./registrations";

export const checkInSessionsTable = pgTable(
  "check_in_sessions",
  {
    id: serial("id").primaryKey(),
    conferenceYear: integer("conference_year").notNull(),
    sessionDate: date("session_date", { mode: "string" }).notNull(),
    name: text("name").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("check_in_sessions_year_date_name_unique").on(
      table.conferenceYear,
      table.sessionDate,
      table.name,
    ),
    index("check_in_sessions_year_date_idx").on(table.conferenceYear, table.sessionDate),
  ],
);

export const insertCheckInSessionSchema = createInsertSchema(checkInSessionsTable).omit({
  id: true,
  createdAt: true,
  createdBy: true,
});
export type InsertCheckInSession = z.infer<typeof insertCheckInSessionSchema>;
export type CheckInSession = typeof checkInSessionsTable.$inferSelect;

export const registrationCheckInsTable = pgTable(
  "registration_check_ins",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => checkInSessionsTable.id, { onDelete: "cascade" }),
    registrationId: integer("registration_id")
      .notNull()
      .references(() => registrationsTable.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
    checkedInBy: text("checked_in_by").notNull(),
  },
  (table) => [
    uniqueIndex("registration_check_ins_session_registration_unique").on(
      table.sessionId,
      table.registrationId,
    ),
    index("registration_check_ins_session_idx").on(table.sessionId),
  ],
);

export const insertRegistrationCheckInSchema = createInsertSchema(registrationCheckInsTable).omit({
  id: true,
  checkedInAt: true,
});
export type InsertRegistrationCheckIn = z.infer<typeof insertRegistrationCheckInSchema>;
export type RegistrationCheckIn = typeof registrationCheckInsTable.$inferSelect;