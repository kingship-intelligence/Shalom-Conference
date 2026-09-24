import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const firstTimerResponsesTable = pgTable(
  "first_timer_responses",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    isFirstTime: boolean("is_first_time").notNull(),
    conferenceYear: integer("conference_year").notNull().default(2026),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("first_timer_responses_email_year_unique").on(table.email, table.conferenceYear),
  ],
);

export const insertFirstTimerResponseSchema = createInsertSchema(firstTimerResponsesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFirstTimerResponse = z.infer<typeof insertFirstTimerResponseSchema>;
export type FirstTimerResponse = typeof firstTimerResponsesTable.$inferSelect;