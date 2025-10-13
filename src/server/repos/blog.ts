import { supabaseServer } from "@/lib/supabase/server";
import {
  BlogPostSchema,
  CreateBlogPostDto,
  ListBlogPostsDto,
  UpdateBlogPostDto,
  type BlogPost,
  type CreateBlogPostInput,
  type ListBlogPostsInput,
  type UpdateBlogPostInput,
} from "@/server/dto/blog";

const blogSelect = `
  id,
  slug,
  title,
  excerpt,
  content,
  published_at,
  created_at,
  updated_at,
  author_id
`;

function toDateOrNull(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export async function listBlogPosts(
  filters: ListBlogPostsInput = {},
  options: { onlyPublished?: boolean } = {}
): Promise<BlogPost[]> {
  const parsed = ListBlogPostsDto.parse(filters);
  const client = await supabaseServer();

  const page = parsed.page ?? 1;
  const limit = parsed.limit ?? 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from("blog_posts")
    .select(blogSelect)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (options.onlyPublished) {
    query = query.not("published_at", "is", null);
  }

  if (parsed.search) {
    query = query.or(`title.ilike.%${parsed.search}%,content.ilike.%${parsed.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return BlogPostSchema.array().parse(data ?? []);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("blog_posts")
    .select(blogSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? BlogPostSchema.parse(data) : null;
}

export async function createBlogPost(
  authorId: string,
  input: CreateBlogPostInput
): Promise<BlogPost> {
  const payload = CreateBlogPostDto.parse(input);
  const client = await supabaseServer();

  const insertPayload = {
    ...payload,
    published_at: toDateOrNull(payload.published_at ?? null),
    author_id: authorId,
  };

  const { data, error } = await client
    .from("blog_posts")
    .insert(insertPayload)
    .select(blogSelect)
    .single();

  if (error) {
    throw error;
  }

  return BlogPostSchema.parse(data);
}

export async function updateBlogPost(
  id: string,
  input: UpdateBlogPostInput
): Promise<BlogPost> {
  const payload = UpdateBlogPostDto.parse({ ...input, id });
  const { id: _id, published_at, ...rest } = payload;
  void _id;
  const client = await supabaseServer();

  const updates = {
    ...rest,
    published_at: toDateOrNull(published_at ?? null),
  };

  const { data, error } = await client
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select(blogSelect)
    .single();

  if (error) {
    throw error;
  }

  return BlogPostSchema.parse(data);
}
