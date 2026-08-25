import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  conferenceYear: integer("conference_year").notNull().default(2026),
  volunteer: boolean("volunteer").notNull().default(false),
  volunteerRole: text("volunteer_role"),
  badgePhotoObjectPath: text("badge_photo_object_path"),
  badgeUploadTokenHash: text("badge_upload_token_hash"),
  badgeUploadExpiresAt: timestamp("badge_upload_expires_at", { withTimezone: true }),
  badgeSentAt: timestamp("badge_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({ id: true, createdAt: true });
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

export const testimoniesTable = pgTable("testimonies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  conferenceYear: integer("conference_year").notNull().default(2026),
  testimony: text("testimony").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTestimonySchema = createInsertSchema(testimoniesTable).omit({ id: true, createdAt: true });
export type InsertTestimony = z.infer<typeof insertTestimonySchema>;
export type Testimony = typeof testimoniesTable.$inferSelect;

export const merchOrdersTable = pgTable("merch_orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  paymentReference: text("payment_reference").notNull(),
  items: jsonb("items").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("awaiting_verification"),
  paymentConfirmedAt: timestamp("payment_confirmed_at", { withTimezone: true }),
  paymentConfirmedBy: text("payment_confirmed_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMerchOrderSchema = createInsertSchema(merchOrdersTable).omit({ id: true, createdAt: true });
export type InsertMerchOrder = z.infer<typeof insertMerchOrderSchema>;
export type MerchOrder = typeof merchOrdersTable.$inferSelect;
