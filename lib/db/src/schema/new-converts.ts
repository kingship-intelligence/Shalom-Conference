import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const newConvertsTable = pgTable("new_converts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  city: text("city").notNull().default(""),
  consentToContact: boolean("consent_to_contact").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
