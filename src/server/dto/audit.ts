import { z } from "zod";

export const AuditFiltersDto = z.object({
  entity: z.string().optional(),
  actor: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type AuditFiltersInput = z.infer<typeof AuditFiltersDto>;
