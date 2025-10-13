import { z } from "zod";

export const CompanyUserSchema = z
  .object({
    company_id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: z.enum(["OWNER", "MEMBER", "ADMIN"]),
    created_at: z.string().datetime(),
    companies: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        slug: z.string().nullable().optional(),
        verified_at: z.string().datetime().nullable().optional(),
      })
      .optional(),
  })
  .passthrough();

export const AttachCompanyUserDto = z.object({
  company_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["OWNER", "MEMBER", "ADMIN"]).default("MEMBER"),
});

export const DetachCompanyUserDto = z.object({
  company_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export type CompanyUser = z.infer<typeof CompanyUserSchema>;
export type AttachCompanyUserInput = z.input<typeof AttachCompanyUserDto>;
export type DetachCompanyUserInput = z.input<typeof DetachCompanyUserDto>;
