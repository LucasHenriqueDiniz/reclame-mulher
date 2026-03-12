import "server-only";
import { AuditFiltersInput } from "../dto/audit";

export class AuditRepo {
  static async find(_filters: AuditFiltersInput) {
    // Audit logs were a Supabase-managed feature.
    // Returning empty result until a custom audit table is implemented.
    return { logs: [], total: 0 };
  }
}
