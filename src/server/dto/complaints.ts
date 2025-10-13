import { z } from "zod";

export const complaintStatusEnum = z.enum([
  "OPEN",
  "RESPONDED",
  "RESOLVED",
  "CANCELLED",
]);

export const ComplaintSchema = z
  .object({
    id: z.string().uuid(),
    company_id: z.string().uuid(),
    project_id: z.string().uuid().nullable().optional(),
    author_user_id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    occurred_at: z.string().datetime().nullable().optional(),
    expected_solution: z.string().nullable().optional(),
    is_public: z.boolean().default(false),
    is_anonymous: z.boolean().default(false),
    status: complaintStatusEnum.default("OPEN"),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime().nullable().optional(),
    company: z
      .object({
        id: z.string().uuid(),
        name: z.string(),
        slug: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export const CreateComplaintDto = z.object({
  company_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  occurred_at: z.coerce.date().optional(),
  expected_solution: z.string().optional(),
  is_public: z.boolean().default(false),
  is_anonymous: z.boolean().default(false),
});

export const UpdateComplaintDto = CreateComplaintDto.partial().extend({
  id: z.string().uuid(),
});

export const UpdateComplaintStatusDto = z.object({
  status: complaintStatusEnum,
});

export const ListComplaintsDto = z
  .object({
    mine: z.coerce.boolean().optional(),
    companyId: z.string().uuid().optional(),
    status: complaintStatusEnum.optional(),
    search: z.string().min(1).optional(),
  })
  .partial();

export type Complaint = z.infer<typeof ComplaintSchema>;
export type CreateComplaintInput = z.input<typeof CreateComplaintDto>;
export type UpdateComplaintInput = z.input<typeof UpdateComplaintDto>;
export type UpdateComplaintStatusInput = z.input<typeof UpdateComplaintStatusDto>;
export type ListComplaintsInput = z.input<typeof ListComplaintsDto>;
