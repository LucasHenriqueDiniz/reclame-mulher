import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Permite acesso sem autenticação no step1 (onde cria a conta)
  // Mas verifica autenticação e confirmação de email nos próximos passos
  if (user && !user.email_confirmed_at) {
    // Usuário criado mas email não confirmado - redireciona para verificação
    redirect(`/auth/verify/check-email?email=${encodeURIComponent(user.email || "")}`);
  }

  return <>{children}</>;
}
