import { z } from "zod";

export const CreateCompanyUserDto = z.object({
  user_id: z.string().uuid("ID do usuário inválido"),
  company_id: z.string().uuid("ID da empresa inválido"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export type CreateCompanyUserInput = z.infer<typeof CreateCompanyUserDto>;
