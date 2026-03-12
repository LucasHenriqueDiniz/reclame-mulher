import "server-only";
import { db } from "@/db/client";
import { profiles, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export class ProfilesRepo {
  static async isProfileComplete(userId: string): Promise<boolean> {
    const [profile] = await db
      .select({
        userId: profiles.userId,
        name: profiles.name,
        cpf: profiles.cpf,
        address: profiles.address,
        city: profiles.city,
        state: profiles.state,
        onboardingCompletedAt: profiles.onboardingCompletedAt,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) return false;
    if (profile.onboardingCompletedAt) return true;

    return !!(
      profile.name &&
      profile.cpf &&
      profile.address &&
      profile.city &&
      profile.state
    );
  }

  static async getRequiredOnboardingStep(
    userId: string
  ): Promise<"role" | "person_step1" | "person_step2" | "company_step1" | "company_step2" | null> {
    const [profile] = await db
      .select({
        role: profiles.role,
        onboardingCompletedAt: profiles.onboardingCompletedAt,
        cpf: profiles.cpf,
        address: profiles.address,
        city: profiles.city,
        state: profiles.state,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) return "role";
    if (profile.onboardingCompletedAt) return null;

    if (!profile.role || profile.role === "USER") {
      if (!profile.cpf) return "role";
      if (!profile.address || !profile.city || !profile.state) return "person_step2";
    }

    if (profile.role === "COMPANY") {
      const [companyUser] = await db
        .select({ companyId: companyUsers.companyId })
        .from(companyUsers)
        .where(eq(companyUsers.userId, userId))
        .limit(1);

      if (!companyUser) return "company_step2";

      if (!profile.address || !profile.city || !profile.state) return "company_step2";
    }

    return null;
  }

  static async findById(userId: string) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return profile ?? null;
  }

  static async update(userId: string, data: Partial<typeof profiles.$inferInsert>) {
    const [updated] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }
}
