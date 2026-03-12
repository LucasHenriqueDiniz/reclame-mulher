import "server-only";
import { db } from "@/db/client";
import { companies, companyUsers } from "@/db/schema";
import { eq, ilike, or, isNotNull } from "drizzle-orm";
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

  static async findPublic(search?: string, _verified?: boolean) {
    if (search) {
      return db
        .select()
        .from(companies)
        .where(
          or(
            ilike(companies.name, `%${search}%`),
            ilike(companies.corporateName, `%${search}%`)
          )
        );
    }
    return db.select().from(companies);
  }

  static async update(id: string, data: UpdateCompanyInput) {
    const [company] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  static async verify(id: string, verified: boolean) {
    const [company] = await db
      .update(companies)
      .set({ verifiedAt: verified ? new Date() : null, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  static async findByUser(userId: string) {
    return db
      .select({
        role: companyUsers.role,
        company: companies,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(eq(companyUsers.userId, userId));
  }
}
