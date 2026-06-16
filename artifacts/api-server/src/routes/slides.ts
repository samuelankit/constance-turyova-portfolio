import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, slidesTable } from "@workspace/db";
import {
  ListSlidesResponseItem,
  CreateSlideBody,
  DeleteSlideParams,
  UpdateSlideParams,
  UpdateSlideBody,
} from "@workspace/api-zod";
const router: IRouter = Router();

function serializeSlide(s: typeof slidesTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt };
}

router.get("/slides", async (_req, res): Promise<void> => {
  const slides = await db.select().from(slidesTable).orderBy(slidesTable.sortOrder);
  res.json(slides.map((s) => ListSlidesResponseItem.parse(serializeSlide(s))));
});

router.post("/slides", async (req, res): Promise<void> => {
  const parsed = CreateSlideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [slide] = await db
    .insert(slidesTable)
    .values({
      imageUrl: parsed.data.imageUrl,
      altText: parsed.data.altText ?? "",
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(ListSlidesResponseItem.parse(serializeSlide(slide)));
});

router.delete("/slides/:id", async (req, res): Promise<void> => {
  const params = DeleteSlideParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(slidesTable).where(eq(slidesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Slide not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/slides/:id", async (req, res): Promise<void> => {
  const params = UpdateSlideParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = UpdateSlideBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (body.data.imageUrl !== undefined) updateData.imageUrl = body.data.imageUrl;
  if (body.data.altText !== undefined) updateData.altText = body.data.altText;
  if (body.data.sortOrder !== undefined) updateData.sortOrder = body.data.sortOrder;

  const [slide] = await db
    .update(slidesTable)
    .set(updateData)
    .where(eq(slidesTable.id, params.data.id))
    .returning();
  if (!slide) {
    res.status(404).json({ error: "Slide not found" });
    return;
  }
  res.json(ListSlidesResponseItem.parse(serializeSlide(slide)));
});

export default router;
