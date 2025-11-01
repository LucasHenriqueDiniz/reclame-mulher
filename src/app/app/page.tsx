import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

import { AppHomeContent } from "./_components/app-home-content";

export default async function AppHome() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Busca o perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, onboarding_completed_at, cpf, address, city, state, provider")
    .eq("user_id", user.id)
    .maybeSingle();

  // Se não existe perfil, o usuário precisa completar o onboarding
  if (!profile) {
    redirect("/onboarding/role");
  }

  // Se o onboarding não foi completado, verifica qual etapa precisa
  if (!profile.onboarding_completed_at) {
    const { ProfilesRepo } = await import("@/server/repos/profiles");
    const step = await ProfilesRepo.getRequiredOnboardingStep(user.id);
    
    if (step === "role") {
      redirect("/onboarding/role");
    } else if (step === "person_step1") {
      redirect("/onboarding/person/step1");
    } else if (step === "person_step2") {
      redirect("/onboarding/person/step2");
    } else if (step === "company_step1") {
      redirect("/onboarding/company/step1");
    } else if (step === "company_step2") {
      redirect("/onboarding/company/step2");
    }
    
    // Se chegou aqui mas ainda não completou, força step2 baseado no role
    if (profile.role === "COMPANY") {
      redirect("/onboarding/company/step2");
    } else {
      redirect("/onboarding/person/step2");
    }
  }

  return <AppHomeContent name={profile?.name} role={profile?.role} email={user.email} />;
}

