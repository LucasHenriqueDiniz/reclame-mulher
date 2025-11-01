import { z } from "zod";

/** USER (Pessoa) — Passo 1 (signUp) */
export const RegisterUserStep1Schema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  cpf: z.string().min(11, "CPF inválido").optional(), // se coletar aqui
  email: z.string().email(),
  password: z.string().min(8),
  confirm: z.string().min(8),
  terms: z.boolean().refine(v => v, "Aceite os termos"),
}).refine(v => v.password === v.confirm, {
  path: ["confirm"], message: "Senhas não conferem"
});
export type RegisterUserStep1 = z.infer<typeof RegisterUserStep1Schema>;

/** USER (Pessoa) — Passo 2 (perfil) */
export const RegisterUserStep2Schema = z.object({
  phone: z.string().optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  how_heard_option_id: z.string().uuid().optional(),
  how_heard_free_text: z.string().optional(),
});
export type RegisterUserStep2 = z.infer<typeof RegisterUserStep2Schema>;

/** COMPANY — criação (após signUp/login) */
export const RegisterCompanySchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().optional(),
  responsible_name: z.string().min(3),
  contact_phone: z.string().optional(),
  responsible_email: z.string().email(),
  sector: z.string().optional(),
  website: z.string().url().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
});
export type RegisterCompany = z.infer<typeof RegisterCompanySchema>;
