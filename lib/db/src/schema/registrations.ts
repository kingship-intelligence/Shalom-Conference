import { pgTable, text, serial, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    smsConsent: boolean("sms_consent").notNull().default(false),
    conferenceYear: integer("conference_year").notNull().default(2026),
    volunteer: boolean("volunteer").notNull().default(false),
    volunteerRole: text("volunteer_role"),
    badgePhotoObjectPath: text("badge_photo_object_path"),
    badgeUploadTokenHash: text("badge_upload_token_hash"),
    badgeUploadExpiresAt: timestamp("badge_upload_expires_at", { withTimezone: true }),
    badgeSentAt: timestamp("badge_sent_at", { withTimezone: true }),
    checkInTokenHash: text("check_in_token_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("registrations_check_in_token_hash_unique").on(table.checkInTokenHash)],
);

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({ id: true, createdAt: true });
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;