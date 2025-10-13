import { z } from "zod";

export const ComplaintMessageSchema = z
  .object({
    id: z.string().uuid(),
    complaint_id: z.string().uuid(),
    author_user_id: z.string().uuid(),
    content: z.string(),
    attachment_path: z.string().nullable().optional(),
    created_at: z.string().datetime(),
    author: z
      .object({
        id: z.string().uuid(),
        name: z.string().nullable().optional(),
        role: z.enum(["USER", "COMPANY", "ADMIN"]).optional(),
      })
      .optional(),
  })
  .passthrough();

export const CreateComplaintMessageDto = z.object({
  complaint_id: z.string().uuid(),
  content: z.string().min(1),
  attachment_path: z.string().optional(),
});

export type ComplaintMessage = z.infer<typeof ComplaintMessageSchema>;
export type CreateComplaintMessageInput = z.input<typeof CreateComplaintMessageDto>;
