import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, portfolioVoiceRecordsTable } from "@workspace/db";
import {
  ListPortfolioVoiceRecordsResponseItem,
  CreatePortfolioVoiceRecordBody,
  DeletePortfolioVoiceRecordParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeRecord(r: typeof portfolioVoiceRecordsTable.$inferSelect) {
  return { ...r, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt };
}

router.get("/portfolio/voice-records", async (_req, res): Promise<void> => {
  const records = await db.select().from(portfolioVoiceRecordsTable).orderBy(desc(portfolioVoiceRecordsTable.createdAt));
  res.json(records.map((r) => ListPortfolioVoiceRecordsResponseItem.parse(serializeRecord(r))));
});

router.post("/portfolio/voice-records", async (req, res): Promise<void> => {
  const parsed = CreatePortfolioVoiceRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db
    .insert(portfolioVoiceRecordsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      audioUrl: parsed.data.audioUrl,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(ListPortfolioVoiceRecordsResponseItem.parse(serializeRecord(record)));
});

router.delete("/portfolio/voice-records/:id", async (req, res): Promise<void> => {
  const params = DeletePortfolioVoiceRecordParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(portfolioVoiceRecordsTable)
    .where(eq(portfolioVoiceRecordsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Voice record not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
