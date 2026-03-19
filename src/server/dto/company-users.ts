import { z } from "zod";

export const CreateCompanyUserDto = z.object({
  user_id: z.string().uuid("ID do usuário inválido"),
  company_id: z.string().uuid("ID da empresa inválido"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export type CreateCompanyUserInput = z.infer<typeof CreateCompanyUserDto>;

export const CreateCompanyMemberDto = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const UpdateCompanyMemberRoleDto = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type CreateCompanyMemberInput = z.infer<typeof CreateCompanyMemberDto>;
export type UpdateCompanyMemberRoleInput = z.infer<typeof UpdateCompanyMemberRoleDto>;
