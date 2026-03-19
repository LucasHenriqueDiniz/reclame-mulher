import { z } from "zod";

const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const nullableEmail = z
  .union([z.string().email("E-mail inválido"), z.null()])
  .optional()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
  });

const nullableUrl = z
  .union([z.string().url("URL inválida"), z.null()])
  .optional()
  .transform((value) => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const CreateCompanyDto = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório e deve ter 14 dígitos"),
  corporate_name: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url().optional(),
  contact_phone: z.string().optional(),
  responsible_name: z.string().min(1, "Nome do responsável é obrigatório"),
  responsible_title: z.string().optional(),
  responsible_email: z.string().email("E-mail inválido"),
  slug: z.string().optional(),
  logo_url: z.string().url().optional(),
});

export const UpdateCompanyDto = z.object({
  name: z.string().min(1).optional(),
  cnpj: z.string().optional(),
  corporate_name: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url().optional(),
  contact_phone: z.string().optional(),
  responsible_name: z.string().min(1).optional(),
  responsible_title: z.string().optional(),
  responsible_email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
});

export const VerifyCompanyDto = z.object({
  verified: z.boolean(),
});

export const UpdateCompanyProfileDto = z.object({
  name: nullableTrimmedString,
  corporateName: nullableTrimmedString,
  cnpj: nullableTrimmedString,
  description: nullableTrimmedString,
  phone: nullableTrimmedString,
  email: nullableEmail,
  website: nullableUrl,
  address: nullableTrimmedString,
  neighborhood: nullableTrimmedString,
  streetNumber: nullableTrimmedString,
  city: nullableTrimmedString,
  state: nullableTrimmedString,
  region: nullableTrimmedString,
  sector: nullableTrimmedString,
  contactName: nullableTrimmedString,
  contactPhone: nullableTrimmedString,
  responsibleName: nullableTrimmedString,
  responsibleEmail: nullableEmail,
  foundationDate: z.union([z.string(), z.null()]).optional(),
});

export const CreateCompanyReportDto = z.object({
  companyId: z.string().uuid("ID da empresa inválido"),
  reason: z.string().min(3, "Informe o motivo da denúncia"),
  details: z.string().max(2000, "A denúncia é muito longa").optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanyDto>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyDto>;
export type VerifyCompanyInput = z.infer<typeof VerifyCompanyDto>;
export type UpdateCompanyProfileInput = z.infer<typeof UpdateCompanyProfileDto>;
export type CreateCompanyReportInput = z.infer<typeof CreateCompanyReportDto>;
