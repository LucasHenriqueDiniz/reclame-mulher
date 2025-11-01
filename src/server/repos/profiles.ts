import { supabaseServer } from "@/lib/supabase/server";

export class ProfilesRepo {
  /**
   * Verifica se o perfil do usuário está completo (necessário para onboarding)
   * Retorna true se está completo, false se precisa completar
   */
  static async isProfileComplete(userId: string): Promise<boolean> {
    const supabase = await supabaseServer();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        user_id,
        name,
        cpf,
        phone,
        address,
        city,
        state,
        onboarding_completed_at,
        provider
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !profile) {
      return false;
    }

    // Se já completou onboarding, está OK
    if (profile.onboarding_completed_at) {
      return true;
    }

    // Se veio de OAuth, precisa ter pelo menos name (do Google)
    const isOAuth = profile.provider && profile.provider !== "email";

    if (isOAuth) {
      // Para OAuth, name geralmente vem do provider
      // Mas precisa completar: CPF, endereço (address, city, state)
      return !!(
        profile.name &&
        profile.cpf &&
        profile.address &&
        profile.city &&
        profile.state
      );
    } else {
      // Para email/password, precisa ter tudo
      return !!(
        profile.name &&
        profile.cpf &&
        profile.address &&
        profile.city &&
        profile.state
      );
    }
  }

  /**
   * Verifica qual etapa do onboarding o usuário precisa completar
   */
  static async getRequiredOnboardingStep(
    userId: string
  ): Promise<"role" | "person_step1" | "person_step2" | "company_step1" | "company_step2" | null> {
    const supabase = await supabaseServer();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, onboarding_completed_at, cpf, address, city, state")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !profile) {
      return "role";
    }

    // Se já completou, não precisa de onboarding
    if (profile.onboarding_completed_at) {
      return null;
    }

    // Se não tem role definido, precisa escolher
    if (!profile.role || profile.role === "USER") {
      // Se é USER mas não tem dados básicos, volta para role
      // (pode ser que criou com OAuth)
      if (!profile.cpf) {
        return "role";
      }

      // Se tem CPF mas não tem endereço, precisa step2
      if (profile.cpf && (!profile.address || !profile.city || !profile.state)) {
        return "person_step2";
      }
    }

    // Se é COMPANY, verifica etapas da empresa
    if (profile.role === "COMPANY") {
      // Verificar se tem dados da empresa
      const { data: companyUser } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!companyUser) {
        return "company_step1";
      }

      // Verifica dados adicionais do perfil
      if (!profile.address || !profile.city || !profile.state) {
        return "company_step2";
      }
    }

    return null;
  }
}

