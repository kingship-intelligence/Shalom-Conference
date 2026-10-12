import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const shalomFilesTable = pgTable("shalom_2026_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  objectPath: text("object_path").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ShalomFile = typeof shalomFilesTable.$inferSelect;
