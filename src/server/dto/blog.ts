import { z } from "zod";

export const BlogPostSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().nullable().optional(),
    content: z.string(),
    published_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime().nullable().optional(),
    author_id: z.string().uuid().nullable().optional(),
  })
  .passthrough();

export const ListBlogPostsDto = z
  .object({
    search: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .partial();

export const CreateBlogPostDto = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10),
  published_at: z.coerce.date().optional(),
});

export const UpdateBlogPostDto = CreateBlogPostDto.partial().extend({
  id: z.string().uuid(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ListBlogPostsInput = z.input<typeof ListBlogPostsDto>;
export type CreateBlogPostInput = z.input<typeof CreateBlogPostDto>;
export type UpdateBlogPostInput = z.input<typeof UpdateBlogPostDto>;
