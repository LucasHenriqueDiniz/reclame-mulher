import { z } from "zod";

export const ComplaintStatus = z.enum(["OPEN", "RESPONDED", "RESOLVED", "CANCELLED"]);

export const CreateComplaintDto = z.object({
  company_id: z.string().uuid("ID da empresa inválido"),
  project_id: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  occurred_at: z.coerce.date().optional(),
  expected_solution: z.string().optional(),
  is_public: z.boolean().default(false),
  is_anonymous: z.boolean().default(false),
});

export const UpdateComplaintDto = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  occurred_at: z.coerce.date().optional(),
  expected_solution: z.string().optional(),
  is_public: z.boolean().optional(),
  is_anonymous: z.boolean().optional(),
});

export const UpdateComplaintStatusDto = z.object({
  status: ComplaintStatus,
});

export type CreateComplaintInput = z.infer<typeof CreateComplaintDto>;
export type UpdateComplaintInput = z.infer<typeof UpdateComplaintDto>;
export type UpdateComplaintStatusInput = z.infer<typeof UpdateComplaintStatusDto>;
