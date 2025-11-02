import { z } from "zod";

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

export type CreateCompanyInput = z.infer<typeof CreateCompanyDto>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyDto>;
export type VerifyCompanyInput = z.infer<typeof VerifyCompanyDto>;
