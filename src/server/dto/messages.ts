import { z } from "zod";

export const CreateMessageDto = z.object({
  complaint_id: z.string().uuid("ID da reclamação inválido"),
  content: z.string().min(1, "Mensagem não pode estar vazia"),
  attachment_path: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageDto>;
