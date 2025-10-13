import { z } from "zod";

export const ProjectSchema = z
  .object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
    status: z.enum(["PLANNED", "ACTIVE", "PAUSED", "ARCHIVED"]).default("PLANNED"),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime().nullable().optional(),
  })
  .passthrough();

export const ListProjectsDto = z
  .object({
    companyId: z.string().uuid(),
  })
  .partial();

export const CreateProjectDto = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().max(500).optional(),
  status: z.enum(["PLANNED", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
});

export const UpdateProjectDto = CreateProjectDto.partial().extend({
  id: z.string().uuid(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ListProjectsInput = z.input<typeof ListProjectsDto>;
export type CreateProjectInput = z.input<typeof CreateProjectDto>;
export type UpdateProjectInput = z.input<typeof UpdateProjectDto>;
