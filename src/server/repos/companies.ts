import "server-only";
import { db } from "@/db/client";
import { companies, companyUsers, complaints, projects } from "@/db/schema";
import { eq, ilike, or, count, and, sql, isNull, like, ne } from "drizzle-orm";
import { CreateCompanyInput } from "../dto/companies";
import { slugify } from "@/lib/normalize";

export class CompaniesRepo {
  static async generateUniqueSlug(source: string, excludeId?: string) {
    const base = slugify(source).slice(0, 80) || "empresa";
    const rows = await db
      .select({ slug: companies.slug })
      .from(companies)
      .where(
        and(
          or(eq(companies.slug, base), like(companies.slug, `${base}-%`)),
          excludeId ? ne(companies.id, excludeId) : undefined
        )
      );

    const existing = new Set(
      rows
        .map((row) => row.slug)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    );

    if (!existing.has(base)) {
      return base;
    }

    let suffix = 2;
    while (existing.has(`${base}-${suffix}`)) {
      suffix += 1;
    }

    return `${base}-${suffix}`;
  }

  static async create(data: CreateCompanyInput) {
    const slugSource = data.slug ?? data.name;
    const slug = slugSource ? await CompaniesRepo.generateUniqueSlug(slugSource) : null;
    const [company] = await db.insert(companies).values({
      name: data.name,
      cnpj: data.cnpj ?? null,
      responsibleName: data.responsible_name,
      contactPhone: data.contact_phone ?? null,
      responsibleEmail: data.responsible_email,
      sector: data.sector ?? null,
      website: data.website ?? null,
      slug,
    }).returning();
    return company;
  }

  static async findById(id: string) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (!company) throw new Error("Company not found");
    return company;
  }

  static async findByIdOrNull(id: string) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return company ?? null;
  }

  static async findBySlug(slug: string) {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.slug, slug), isNull(companies.deletedAt)))
      .limit(1);
    if (!company) throw new Error("Company not found");
    return company;
  }

  static async findPublic(search?: string, verifiedOnly?: boolean) {
    const where = and(
      isNull(companies.deletedAt),
      verifiedOnly ? sql`${companies.verifiedAt} is not null` : undefined,
      search
        ? or(
            ilike(companies.name, `%${search}%`),
            ilike(companies.corporateName, `%${search}%`)
          )
        : undefined
    );

    return db
      .select({
        id: companies.id,
        name: companies.name,
        corporateName: companies.corporateName,
        sector: companies.sector,
        website: companies.website,
        phone: companies.phone,
        city: companies.city,
        state: companies.state,
        region: companies.region,
        slug: companies.slug,
        logoUrl: companies.logoUrl,
        verifiedAt: companies.verifiedAt,
        createdAt: companies.createdAt,
      })
      .from(companies)
      .where(where);
  }

  static async update(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

    if (data.slug !== undefined) {
      updateData.slug = data.slug
        ? await CompaniesRepo.generateUniqueSlug(String(data.slug), id)
        : null;
    }

    const [company] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  static async verify(id: string, verified: boolean) {
    const [company] = await db.update(companies).set({ verifiedAt: verified ? new Date() : null, updatedAt: new Date() }).where(eq(companies.id, id)).returning();
    return company;
  }

  static async findForAdmin(status: "all" | "pending" | "verified" = "all") {
    const where = and(
      isNull(companies.deletedAt),
      status === "pending"
        ? isNull(companies.verifiedAt)
        : status === "verified"
          ? sql`${companies.verifiedAt} is not null`
          : undefined
    );

    return db
      .select({
        id: companies.id,
        name: companies.name,
        cnpj: companies.cnpj,
        city: companies.city,
        state: companies.state,
        contactName: companies.contactName,
        responsibleName: companies.responsibleName,
        responsibleEmail: companies.responsibleEmail,
        verifiedAt: companies.verifiedAt,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
      })
      .from(companies)
      .where(where)
      .orderBy(companies.createdAt);
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
