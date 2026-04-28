import "server-only";
import { db } from "@/db/client";
import { blogPosts, blogTags, blogPostTags } from "@/db/schema";
import { eq, ilike, or, and, desc, inArray, count } from "drizzle-orm";
import { CreatePostInput, UpdatePostInput } from "../dto/blog";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  static async findByIdentifier(identifier: string, includeDrafts = false) {
    const where = UUID_REGEX.test(identifier)
      ? or(eq(blogPosts.id, identifier), eq(blogPosts.slug, identifier))
      : eq(blogPosts.slug, identifier);

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(where)
      .limit(1);

    if (!post) {
      return null;
    }

    if (!includeDrafts && (post.status !== "PUBLISHED" || !post.publishedAt)) {
      return null;
    }

    return post;
  }

  static async findPublic(search?: string, page = 1, limit = 10) {
    const where = search
      ? and(
          eq(blogPosts.status, "PUBLISHED"),
          or(
            ilike(blogPosts.title, `%${search}%`),
            ilike(blogPosts.content, `%${search}%`)
          )
        )
      : eq(blogPosts.status, "PUBLISHED");

    const [{ total }] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(where);

    const posts = await db
      .select()
      .from(blogPosts)
      .where(where)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit);
    return { posts, total };
  }

  static async findByTagSlug(tagSlug: string, page = 1, limit = 20) {
    const [tag] = await db.select({ id: blogTags.id }).from(blogTags).where(eq(blogTags.slug, tagSlug)).limit(1);
    if (!tag) return { posts: [], total: 0 };

    const postTagRows = await db.select({ postId: blogPostTags.postId }).from(blogPostTags).where(eq(blogPostTags.tagId, tag.id));
    if (postTagRows.length === 0) return { posts: [], total: 0 };

    const postIds = postTagRows.map((r) => r.postId);
    const where = and(inArray(blogPosts.id, postIds), eq(blogPosts.status, "PUBLISHED"));

    const [{ total }] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(where);

    const posts = await db
      .select()
      .from(blogPosts)
      .where(where)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { posts, total };
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
    const [post] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });

    return post ?? null;
  }

  static async findAll(page = 1, limit = 10, _includeTags = false) {
    const [{ total }] = await db.select({ total: count() }).from(blogPosts);
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { posts, total };
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

  static async getPostTagsBatch(postIds: string[]) {
    if (postIds.length === 0) return new Map<string, typeof blogTags.$inferSelect[]>();

    const rows = await db
      .select({ postId: blogPostTags.postId, tag: blogTags })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(inArray(blogPostTags.postId, postIds));

    const map = new Map<string, typeof blogTags.$inferSelect[]>();
    for (const row of rows) {
      const list = map.get(row.postId) ?? [];
      list.push(row.tag);
      map.set(row.postId, list);
    }
    return map;
  }
}
