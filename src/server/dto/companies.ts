import { z } from "zod";

export const CompanyKpiSchema = z
  .object({
    publicComplaints: z.number().int().nonnegative().optional(),
    resolvedComplaints: z.number().int().nonnegative().optional(),
    activeProjects: z.number().int().nonnegative().optional(),
  })
  .partial();

export const CompanySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    logo_url: z.string().url().nullable().optional(),
    website_url: z.string().url().nullable().optional(),
    cnpj: z.string().min(10).max(18).nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    state: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    verified_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime().nullable().optional(),
    kpis: CompanyKpiSchema.optional(),
  })
  .passthrough();

export const ListCompaniesDto = z
  .object({
    search: z.string().min(1).optional(),
    verified: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  })
  .partial();

export const CreateCompanyDto = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().max(400).optional(),
  website_url: z.string().url().optional(),
  cnpj: z.string().min(10).max(18).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const UpdateCompanyDto = CreateCompanyDto.partial().extend({
  is_public: z.boolean().optional(),
});

export const VerifyCompanyDto = z.object({
  verified: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type Company = z.infer<typeof CompanySchema>;
export type ListCompaniesInput = z.input<typeof ListCompaniesDto>;
export type CreateCompanyInput = z.input<typeof CreateCompanyDto>;
export type UpdateCompanyInput = z.input<typeof UpdateCompanyDto>;
export type VerifyCompanyInput = z.input<typeof VerifyCompanyDto>;
