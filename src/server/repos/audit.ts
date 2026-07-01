import "server-only";
import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

import { db } from "@/db/client";
import { auditLogs, profiles } from "@/db/schema";
import { AuditFiltersInput } from "../dto/audit";

export class AuditRepo {
  static async find(filters: AuditFiltersInput) {
    const page = filters.page;
    const limit = filters.limit;
    const where = and(
      filters.entity ? eq(auditLogs.entityType, filters.entity) : undefined,
      filters.from ? gte(auditLogs.createdAt, filters.from) : undefined,
      filters.to ? lte(auditLogs.createdAt, filters.to) : undefined,
      filters.actor
        ? or(
            ilike(profiles.name, `%${filters.actor}%`),
            ilike(profiles.email, `%${filters.actor}%`)
          )
        : undefined
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(auditLogs)
      .leftJoin(profiles, eq(auditLogs.actorUserId, profiles.userId))
      .where(where);

    const rows = await db
      .select({
        id: auditLogs.id,
        actorUserId: auditLogs.actorUserId,
        actorName: profiles.name,
        actorEmail: profiles.email,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(profiles, eq(auditLogs.actorUserId, profiles.userId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { logs: rows, total };
  }

  static async recordCompanyVerificationAction(input: {
    actorUserId: string;
    companyId: string;
    verified: boolean;
  }) {
    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: input.verified ? "COMPANY_VERIFIED" : "COMPANY_UNVERIFIED",
      entityType: "company",
      entityId: input.companyId,
      metadata: JSON.stringify({ verified: input.verified }),
    });
  }
}
