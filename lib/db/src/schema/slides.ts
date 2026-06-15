import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const slidesTable = pgTable("slides", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSlideSchema = createInsertSchema(slidesTable).omit({ id: true, createdAt: true });
export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type Slide = typeof slidesTable.$inferSelect;
