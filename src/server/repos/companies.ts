import "server-only";
import { db } from "@/db/client";
import { companies, companyUsers, complaints, projects } from "@/db/schema";
import { eq, ilike, or, count, and, sql } from "drizzle-orm";
import { CreateCompanyInput, UpdateCompanyInput } from "../dto/companies";

export class CompaniesRepo {
  static async create(data: CreateCompanyInput) {
    const [company] = await db.insert(companies).values({
      name: data.name,
      cnpj: data.cnpj ?? null,
      responsibleName: data.responsible_name,
      contactPhone: data.contact_phone ?? null,
      responsibleEmail: data.responsible_email,
      sector: data.sector ?? null,
      website: data.website ?? null,
      slug: data.slug ?? null,
    }).returning();
    return company;
  }

  static async findById(id: string) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!company) throw new Error("Company not found");
    return company;
  }

  static async findBySlug(slug: string) {
    const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
    if (!company) throw new Error("Company not found");
    return company;
  }

  static async findPublic(search?: string) {
    if (search) {
      return db.select().from(companies).where(
        or(ilike(companies.name, `%${search}%`), ilike(companies.corporateName, `%${search}%`))
      );
    }
    return db.select().from(companies);
  }

  static async update(id: string, data: Partial<typeof companies.$inferInsert>) {
    const [company] = await db.update(companies).set({ ...data, updatedAt: new Date() }).where(eq(companies.id, id)).returning();
    return company;
  }

  static async verify(id: string, verified: boolean) {
    const [company] = await db.update(companies).set({ verifiedAt: verified ? new Date() : null, updatedAt: new Date() }).where(eq(companies.id, id)).returning();
    return company;
  }

  static async softDelete(id: string) {
    const now = new Date();
    const scheduled = new Date(now);
    scheduled.setDate(scheduled.getDate() + 90);
    const [company] = await db.update(companies).set({ deletedAt: now, scheduledPermanentDeletionAt: scheduled, updatedAt: now }).where(eq(companies.id, id)).returning();
    return company;
  }

  static async findByUser(userId: string) {
    return db.select({ role: companyUsers.role, company: companies }).from(companyUsers).innerJoin(companies, eq(companyUsers.companyId, companies.id)).where(eq(companyUsers.userId, userId));
  }

  static async getStats(companyId: string) {
    const [totals] = await db.select({
      total: count(complaints.id),
      resolved: sql<number>`sum(case when ${complaints.status} = 'RESOLVED' then 1 else 0 end)::int`,
      unanswered: sql<number>`sum(case when ${complaints.status} = 'OPEN' then 1 else 0 end)::int`,
      activeDialogs: sql<number>`sum(case when ${complaints.status} = 'RESPONDED' then 1 else 0 end)::int`,
      avgResponseSec: sql<number>`avg(case when ${complaints.updatedAt} is not null and ${complaints.status} != 'OPEN' then extract(epoch from (${complaints.updatedAt} - ${complaints.createdAt})) else null end)`,
    }).from(complaints).where(eq(complaints.companyId, companyId));

    const [projCount] = await db.select({ c: count(projects.id) }).from(projects).where(and(eq(projects.companyId, companyId), eq(projects.status, "IN_PROGRESS")));

    const total = Number(totals?.total ?? 0);
    const resolved = Number(totals?.resolved ?? 0);
    const unanswered = Number(totals?.unanswered ?? 0);
    const activeDialogs = Number(totals?.activeDialogs ?? 0);
    const avgSec = Number(totals?.avgResponseSec ?? 0);
    const avgHours = avgSec > 0 ? Math.round(avgSec / 3600) : null;

    return {
      totalComplaints: total,
      resolvedCases: resolved,
      unansweredCount: unanswered,
      activeDialogsCount: activeDialogs,
      avgResponseHours: avgHours,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      activeProjectsCount: Number(projCount?.c ?? 0),
    };
  }
}
