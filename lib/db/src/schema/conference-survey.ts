import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const conferenceSurveyTable = pgTable("conference_survey_responses", {
  id: serial("id").primaryKey(),
  conferenceYear: integer("conference_year").notNull(),
  rating: integer("rating").notNull(),
  highlight: text("highlight").notNull().default(""),
  improvements: text("improvements").notNull().default(""),
  wouldAttendAgain: text("would_attend_again").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
