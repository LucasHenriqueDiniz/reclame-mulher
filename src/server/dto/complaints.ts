import { z } from "zod";

export const ComplaintStatus = z.enum(["OPEN", "RESPONDED", "RESOLVED", "CANCELLED"]);

export const CreateComplaintDto = z.object({
  company_id: z.string().uuid("ID da empresa inválido"),
  project_id: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  problem_location: z.string().optional(),
  occurred_at: z.coerce.date().optional(),
  expected_solution: z.string().optional(),
  has_previous_complaint_elsewhere: z.boolean().default(false),
  previous_complaint_channel: z.string().optional(),
  impact_category: z.string().optional(),
  urgency_level: z.string().optional(),
  impact_scope: z.string().optional(),
  is_public: z.boolean().default(true),
  is_anonymous: z.boolean().default(false),
  attachment_paths: z.array(z.object({
    file_path: z.string(),
    file_name: z.string(),
    content_type: z.string().optional(),
    size_bytes: z.number().optional(),
  })).optional(),
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
