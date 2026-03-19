import "server-only";
import { db } from "@/db/client";
import { companyUsers, companies, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CreateCompanyUserInput } from "../dto/company-users";

export class CompanyUsersRepo {
  static async create(data: CreateCompanyUserInput) {
    const [companyUser] = await db.insert(companyUsers).values({
      userId: data.user_id,
      companyId: data.company_id,
      role: data.role ?? "MEMBER",
    }).returning();
    return companyUser;
  }

  static async findByUser(userId: string) {
    return db
      .select({
        userId: companyUsers.userId,
        role: companyUsers.role,
        company: companies,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(eq(companyUsers.userId, userId));
  }

  static async findByCompany(companyId: string) {
    return db
      .select({
        userId: companyUsers.userId,
        role: companyUsers.role,
        profile: {
          name: profiles.name,
          email: profiles.email,
        },
      })
      .from(companyUsers)
      .innerJoin(profiles, eq(companyUsers.userId, profiles.userId))
      .where(eq(companyUsers.companyId, companyId));
  }

  static async findMembership(userId: string) {
    const [membership] = await CompanyUsersRepo.findByUser(userId);
    return membership ?? null;
  }

  static async updateRole(userId: string, companyId: string, role: "ADMIN" | "MEMBER") {
    const [updated] = await db
      .update(companyUsers)
      .set({ role })
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)))
      .returning();
    return updated ?? null;
  }

  static async delete(userId: string, companyId: string) {
    await db
      .delete(companyUsers)
      .where(and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId)));
  }
}
