import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatSettings(s: typeof siteSettingsTable.$inferSelect) {
  return {
    id: s.id,
    siteName: s.siteName,
    tagline: s.tagline,
    email: s.email,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    spotlightUrl: s.spotlightUrl,
    metaDescription: s.metaDescription,
    metaKeywords: s.metaKeywords,
    aboutHeading: s.aboutHeading,
    aboutBody: s.aboutBody,
    updatedAt: s.updatedAt.toISOString(),
  };
}

async function ensureSettings() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length === 0) {
    const [row] = await db.insert(siteSettingsTable).values({}).returning();
    return row;
  }
  return rows[0];
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(formatSettings(settings));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const settings = await ensureSettings();
  const updateData: Record<string, unknown> = {};
  if (parsed.data.siteName !== undefined) updateData.siteName = parsed.data.siteName;
  if (parsed.data.tagline !== undefined) updateData.tagline = parsed.data.tagline;
  if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
  if (parsed.data.instagramUrl !== undefined) updateData.instagramUrl = parsed.data.instagramUrl;
  if (parsed.data.facebookUrl !== undefined) updateData.facebookUrl = parsed.data.facebookUrl;
  if (parsed.data.spotlightUrl !== undefined) updateData.spotlightUrl = parsed.data.spotlightUrl;
  if (parsed.data.metaDescription !== undefined) updateData.metaDescription = parsed.data.metaDescription;
  if (parsed.data.metaKeywords !== undefined) updateData.metaKeywords = parsed.data.metaKeywords;
  if (parsed.data.aboutHeading !== undefined) updateData.aboutHeading = parsed.data.aboutHeading;
  if (parsed.data.aboutBody !== undefined) updateData.aboutBody = parsed.data.aboutBody;

  const [updated] = await db
    .update(siteSettingsTable)
    .set(updateData)
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to update settings" });
    return;
  }
  res.json(formatSettings(updated));
});

export default router;
