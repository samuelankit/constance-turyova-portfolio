import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import {
  CreateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  UpdateBlogPostBody,
  DeleteBlogPostParams,
  ListBlogPostsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    imageUrl: p.imageUrl,
    published: p.published,
    slug: p.slug,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

router.get("/blog", async (req, res): Promise<void> => {
  const qp = ListBlogPostsQueryParams.safeParse(req.query);
  const limit = qp.success && qp.data.limit ? Number(qp.data.limit) : 20;
  const offset = qp.success && qp.data.offset ? Number(qp.data.offset) : 0;

  const posts = await db
    .select()
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ value: total }] = await db.select({ value: count() }).from(blogPostsTable);

  res.json({ posts: posts.map(formatPost), total: Number(total) });
});

router.post("/blog", async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const slug =
    parsed.data.slug ||
    parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? "",
      content: parsed.data.content ?? "",
      imageUrl: parsed.data.imageUrl ?? null,
      published: parsed.data.published ?? true,
      slug,
    })
    .returning();
  res.status(201).json(formatPost(post));
});

router.get("/blog/:id", async (req, res): Promise<void> => {
  const params = GetBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(formatPost(post));
});

router.patch("/blog/:id", async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = UpdateBlogPostBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (body.data.title !== undefined) updateData.title = body.data.title;
  if (body.data.excerpt !== undefined) updateData.excerpt = body.data.excerpt;
  if (body.data.content !== undefined) updateData.content = body.data.content;
  if (body.data.imageUrl !== undefined) updateData.imageUrl = body.data.imageUrl;
  if (body.data.published !== undefined) updateData.published = body.data.published;
  if (body.data.slug !== undefined) updateData.slug = body.data.slug;

  const [post] = await db
    .update(blogPostsTable)
    .set(updateData)
    .where(eq(blogPostsTable.id, params.data.id))
    .returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(formatPost(post));
});

router.delete("/blog/:id", async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
