import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prayerChainSignupsTable = pgTable("prayer_chain_signups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  timeSlots: text("time_slots").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrayerChainSignupSchema = createInsertSchema(prayerChainSignupsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPrayerChainSignup = z.infer<typeof insertPrayerChainSignupSchema>;
export type PrayerChainSignup = typeof prayerChainSignupsTable.$inferSelect;