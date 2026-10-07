import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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

export * from "./registrations";
export * from "./check-in";
export * from "./prayer-chain-signups";
export * from "./first-timer-responses";
export * from "./prayer-charge-survey-responses";
export * from "./admin-users";

export * from "./new-converts";
