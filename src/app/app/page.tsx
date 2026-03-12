import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

import { AppHomeContent } from "./_components/app-home-content";

export default async function AppHome() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    redirect("/onboarding/role");
  }

  if (!profile.onboardingCompletedAt) {
    const { ProfilesRepo } = await import("@/server/repos/profiles");
    const step = await ProfilesRepo.getRequiredOnboardingStep(session.userId);

    if (step === "role") redirect("/onboarding/role");
    else if (step === "person_step1") redirect("/onboarding/person/step1");
    else if (step === "person_step2") redirect("/onboarding/person/step2");
    else if (step === "company_step1") redirect("/onboarding/company/step1");
    else if (step === "company_step2") redirect("/onboarding/company/step2");

    if (profile.role === "COMPANY") {
      redirect("/onboarding/company/step2");
    } else {
      redirect("/onboarding/person/step2");
    }
  }

  return <AppHomeContent name={profile?.name} role={profile?.role} email={session.email} />;
}
