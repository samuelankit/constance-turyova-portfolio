import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portfolioPhotosTable = pgTable("portfolio_photos", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioPhotoSchema = createInsertSchema(portfolioPhotosTable).omit({ id: true, createdAt: true });
export type InsertPortfolioPhoto = z.infer<typeof insertPortfolioPhotoSchema>;
export type PortfolioPhoto = typeof portfolioPhotosTable.$inferSelect;

export const portfolioVideosTable = pgTable("portfolio_videos", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url").notNull(),
  title: text("title").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioVideoSchema = createInsertSchema(portfolioVideosTable).omit({ id: true, createdAt: true });
export type InsertPortfolioVideo = z.infer<typeof insertPortfolioVideoSchema>;
export type PortfolioVideo = typeof portfolioVideosTable.$inferSelect;

export const portfolioVoiceRecordsTable = pgTable("portfolio_voice_records", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  audioUrl: text("audio_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioVoiceRecordSchema = createInsertSchema(portfolioVoiceRecordsTable).omit({ id: true, createdAt: true });
export type InsertPortfolioVoiceRecord = z.infer<typeof insertPortfolioVoiceRecordSchema>;
export type PortfolioVoiceRecord = typeof portfolioVoiceRecordsTable.$inferSelect;
