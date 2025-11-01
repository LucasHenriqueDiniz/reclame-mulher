"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function completeCompanyOnboarding(input: {
  phone: string;
  address: string;
  city: string;
  state: string;
  contact_name: string;
  how_heard?: string | null;
  how_heard_other?: string | null;
}) {
  const supabase = await supabaseServer();

  // Verifica autenticação
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("unauthenticated");
  }

  // Prepara how_heard_other: só salva se how_heard = 'OUTRO'
  const howHeardOtherValue = input.how_heard === "OUTRO" && input.how_heard_other
    ? input.how_heard_other.trim()
    : null;

  // Chama a função RPC para criar empresa
  const { error: rpcError } = await supabase.rpc("create_company_self", {
    p_company_name: null, // já foi criado no step1
    p_cnpj: null, // já foi criado no step1
    p_phone: input.phone,
    p_address: input.address,
    p_city: input.city,
    p_state: input.state,
    p_contact_name: input.contact_name,
    p_accepted_terms: true,
    p_locale: "pt-BR",
  });

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  // Atualizar how_heard diretamente no perfil
  if (input.how_heard) {
    await supabase
      .from("profiles")
      .update({
        how_heard: input.how_heard,
        how_heard_other: howHeardOtherValue,
      })
      .eq("user_id", user.id);
  }

  return { success: true };
}

