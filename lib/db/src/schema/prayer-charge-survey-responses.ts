import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prayerChargeSurveyResponsesTable = pgTable("prayer_charge_survey_responses", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  meaningfulMoment: text("meaningful_moment").notNull().default(""),
  suggestion: text("suggestion").notNull().default(""),
  wouldAttendAgain: text("would_attend_again").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrayerChargeSurveyResponseSchema = createInsertSchema(
  prayerChargeSurveyResponsesTable,
).omit({
  id: true,
  createdAt: true,
});

export type InsertPrayerChargeSurveyResponse = z.infer<
  typeof insertPrayerChargeSurveyResponseSchema
>;
export type PrayerChargeSurveyResponse =
  typeof prayerChargeSurveyResponsesTable.$inferSelect;