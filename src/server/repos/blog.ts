import "server-only";
import { db } from "@/db/client";
import { blogPosts, blogTags, blogPostTags } from "@/db/schema";
import { eq, ilike, or, isNotNull, desc, inArray } from "drizzle-orm";
import { CreatePostInput, UpdatePostInput } from "../dto/blog";

export class BlogRepo {
  static async create(data: CreatePostInput) {
    const { tag_names, ...postData } = data;

    const [post] = await db.insert(blogPosts).values({
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      contentMd: postData.content_md,
      excerpt: postData.excerpt,
      coverUrl: postData.cover_url,
      status: postData.status ?? "DRAFT",
      publishedAt: postData.published_at ? new Date(postData.published_at) : null,
    }).returning();

    if (tag_names && tag_names.length > 0 && post?.id) {
      await BlogRepo.linkTags(post.id, tag_names);
    }

    return post;
  }

  static async linkTags(postId: string, tagNames: string[]) {
    if (tagNames.length === 0) {
      await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));
      return;
    }

    // Upsert tags and get their IDs
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const [tag] = await db
        .insert(blogTags)
        .values({ name, slug })
        .onConflictDoUpdate({ target: blogTags.name, set: { name } })
        .returning({ id: blogTags.id });
      tagIds.push(tag.id);
    }

    // Replace all tag links
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));
    if (tagIds.length > 0) {
      await db.insert(blogPostTags).values(tagIds.map((tagId) => ({ postId, tagId })));
    }
  }

  static async findBySlug(slug: string, _includeTags = false) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (!post || post.status !== "PUBLISHED" || !post.publishedAt) throw new Error("Post not found");
    return post;
  }

  static async findPublic(search?: string, page = 1, limit = 10, _includeTags = false) {
    let query = db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "PUBLISHED"))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit) as ReturnType<typeof db.select>;

    if (search) {
      query = db
        .select()
        .from(blogPosts)
        .where(
          or(
            ilike(blogPosts.title, `%${search}%`),
            ilike(blogPosts.content, `%${search}%`)
          )
        )
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset((page - 1) * limit) as ReturnType<typeof db.select>;
    }

    const posts = await query;
    return { posts, total: posts.length };
  }

  static async findByTagSlug(tagSlug: string, page = 1, limit = 20) {
    const [tag] = await db.select({ id: blogTags.id }).from(blogTags).where(eq(blogTags.slug, tagSlug)).limit(1);
    if (!tag) return { posts: [], total: 0 };

    const postTagRows = await db.select({ postId: blogPostTags.postId }).from(blogPostTags).where(eq(blogPostTags.tagId, tag.id));
    if (postTagRows.length === 0) return { posts: [], total: 0 };

    const postIds = postTagRows.map((r) => r.postId);
    const posts = await db
      .select()
      .from(blogPosts)
      .where(inArray(blogPosts.id, postIds))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { posts, total: posts.length };
  }

  static async update(id: string, data: UpdatePostInput) {
    const { tag_names, ...postData } = data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.slug !== undefined) updateData.slug = postData.slug;
    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.content_md !== undefined) updateData.contentMd = postData.content_md;
    if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt;
    if (postData.cover_url !== undefined) updateData.coverUrl = postData.cover_url;
    if (postData.status !== undefined) updateData.status = postData.status;
    if (postData.published_at !== undefined) updateData.publishedAt = postData.published_at ? new Date(postData.published_at) : null;

    const [post] = await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id)).returning();

    if (tag_names !== undefined && post?.id) {
      await BlogRepo.linkTags(post.id, tag_names);
    }

    return post;
  }

  static async delete(id: string) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  static async findAll(page = 1, limit = 10, _includeTags = false) {
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { posts, total: posts.length };
  }

  static async getAllTags(_publicOnly = false) {
    return db.select().from(blogTags).orderBy(blogTags.name);
  }

  static async searchTags(query: string, limit = 50) {
    return db
      .select()
      .from(blogTags)
      .where(ilike(blogTags.name, `%${query}%`))
      .limit(limit);
  }

  static async getPostTags(postId: string) {
    const rows = await db
      .select({ tag: blogTags })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, postId));

    return rows.map((r) => r.tag);
  }
}
