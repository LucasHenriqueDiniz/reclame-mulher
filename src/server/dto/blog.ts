import { z } from "zod";

const coverUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || value.startsWith("/") || URL.canParse(value),
    "Invalid URL"
  );

export const CreatePostDto = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  content_md: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().min(1, "Slug é obrigatório"),
  cover_url: coverUrlSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  published_at: z.coerce.date().optional(),
  author_id: z.string().uuid("ID do autor inválido").optional(),
  tag_names: z.array(z.string()).optional(),
});

export const UpdatePostDto = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  content_md: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().min(1).optional(),
  cover_url: coverUrlSchema.optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  published_at: z.coerce.date().optional(),
  tag_names: z.array(z.string()).optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostDto>;
export type UpdatePostInput = z.infer<typeof UpdatePostDto>;
