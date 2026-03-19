import "server-only";
import { AuditFiltersInput } from "../dto/audit";

export class AuditRepo {
  static async find(_filters: AuditFiltersInput) {
    // Placeholder: audit table not implemented yet. Returns empty until implemented.
    return { logs: [], total: 0 };
  }

  static async recordCompanyVerificationAction(input: {
    actorUserId: string;
    companyId: string;
    verified: boolean;
  }) {
    void input;
    // Audit persistence remains P1. Keep this hook so admin verification flows
    // already have a stable integration point.
  }
}
