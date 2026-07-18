import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Constance T"),
  tagline: text("tagline").notNull().default("Actor"),
  email: text("email").notNull().default("contact@lcperforms.com"),
  instagramUrl: text("instagram_url").notNull().default("https://www.instagram.com/lcperforms/"),
  metaDescription: text("meta_description").notNull().default("Constance T is an actor dedicated to character-driven storytelling across stage and screen."),
  metaKeywords: text("meta_keywords").notNull().default("actor, acting, theatre, stage, screen, Constance T"),
  aboutHeading: text("about_heading").notNull().default("Character-driven storytelling across stage and screen."),
  aboutBody: text("about_body").notNull().default("Constance Turyova is an actor dedicated to character-driven storytelling across stage and screen.\n\nShe brings curiosity, focus, and collaborative commitment to every production, contributing meaningfully to the creative process. Constance's work is guided by a belief that every performance is an opportunity to illuminate truth, engage audiences, and enrich the story being told."),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
