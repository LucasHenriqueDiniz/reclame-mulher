import { supabaseServer } from "@/lib/supabase/server";
import { AuditFiltersInput } from "../dto/audit";

export class AuditRepo {
  static async find(filters: AuditFiltersInput) {
    const supabase = await supabaseServer();

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.entity) {
      query = query.eq("entity_type", filters.entity);
    }

    if (filters.actor) {
      query = query.eq("actor_id", filters.actor);
    }

    if (filters.from) {
      query = query.gte("created_at", filters.from.toISOString());
    }

    if (filters.to) {
      query = query.lte("created_at", filters.to.toISOString());
    }

    const { data, error, count } = await query
      .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

    if (error) throw error;
    return { logs: data, total: count };
  }
}
