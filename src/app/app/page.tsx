import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanyUsersRepo } from "@/server/repos/company-users";

export default async function AppHome() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [{ ProfilesRepo }, profile, user, membership] = await Promise.all([
    import("@/server/repos/profiles"),
    db.select().from(profiles).where(eq(profiles.userId, session.userId)).limit(1).then((rows) => rows[0] ?? null),
    db
      .select({ mustChangePassword: users.mustChangePassword })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    CompanyUsersRepo.findMembership(session.userId),
  ]);

  if (!profile) {
    redirect("/onboarding/role");
  }

  if (user?.mustChangePassword) {
    redirect("/app/settings?forcePasswordChange=1");
  }

  if (profile.role === "ADMIN") {
    redirect("/app/admin");
  }

  if (membership) {
    redirect("/app/company/dashboard");
  }

  const step = await ProfilesRepo.getRequiredOnboardingStep(session.userId);

  if (step === "role") redirect("/onboarding/role");
  if (step === "person_step1") redirect("/onboarding/person/step1");
  if (step === "person_step2") redirect("/onboarding/person/step2");
  if (step === "company_step1") redirect("/onboarding/company/step1");
  if (step === "company_step2") redirect("/onboarding/company/step2");

  if (!profile.onboardingCompletedAt) {
    redirect(profile.role === "COMPANY" ? "/onboarding/company/step2" : "/onboarding/person/step2");
  }

  redirect("/app/complaints");
}
