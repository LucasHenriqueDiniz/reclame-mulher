import { z } from "zod";

export const CreateProjectDto = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  company_id: z.string().uuid("ID da empresa inválido"),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PLANNING"),
});

export const UpdateProjectDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectDto>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectDto>;
