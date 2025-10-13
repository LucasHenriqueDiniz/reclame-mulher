import { supabaseServer } from "@/lib/supabase/server";
import {
  AuditLogSchema,
  ListAuditLogsDto,
  type AuditLog,
  type ListAuditLogsInput,
} from "@/server/dto/audit";

const auditSelect = `
  id,
  entity,
  action,
  actor_id,
  metadata,
  created_at,
  actor:actor_id (
    id,
    name,
    role
  )
`;

export async function listAuditLogs(filters: ListAuditLogsInput = {}): Promise<AuditLog[]> {
  const parsed = ListAuditLogsDto.parse(filters);
  const client = await supabaseServer();

  let query = client
    .from("audit_logs")
    .select(auditSelect)
    .order("created_at", { ascending: false });

  if (parsed.entity) {
    query = query.eq("entity", parsed.entity);
  }

  if (parsed.actor) {
    query = query.eq("actor_id", parsed.actor);
  }

  if (parsed.from) {
    query = query.gte("created_at", parsed.from.toISOString());
  }

  if (parsed.to) {
    query = query.lte("created_at", parsed.to.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return AuditLogSchema.array().parse(data ?? []);
}
