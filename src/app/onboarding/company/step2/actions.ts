"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { HowHeardRepo } from "@/server/repos/how-heard";

export async function completeCompanyOnboarding(input: {
  phone: string;
  address: string;
  city: string;
  state: string;
  contact_name: string;
  how_heard_option_id?: string | null;
  how_heard_free_text?: string | null;
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

  // Salvar how_heard na nova tabela
  if (input.how_heard_option_id || input.how_heard_free_text) {
    await HowHeardRepo.createForUser(
      user.id,
      input.how_heard_option_id,
      input.how_heard_free_text
    );
  }

  return { success: true };
}

