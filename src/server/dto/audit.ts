import { z } from "zod";

export const AuditLogSchema = z
  .object({
    id: z.string().uuid(),
    entity: z.string(),
    action: z.string(),
    actor_id: z.string().uuid().nullable().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    created_at: z.string().datetime(),
    actor: z
      .object({
        id: z.string().uuid(),
        name: z.string().nullable().optional(),
        role: z.enum(["USER", "COMPANY", "ADMIN"]).optional(),
      })
      .optional(),
  })
  .passthrough();

export const ListAuditLogsDto = z
  .object({
    entity: z.string().optional(),
    actor: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .partial();

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type ListAuditLogsInput = z.input<typeof ListAuditLogsDto>;
