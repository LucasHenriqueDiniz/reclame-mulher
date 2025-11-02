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

  // Busca dados do metadata do usuário (company_name e cnpj do step1)
  const { data: authData } = await supabase.auth.getUser();
  const companyName = authData.user?.user_metadata?.company_name || null;
  const cnpjRaw = authData.user?.user_metadata?.cnpj || null;
  
  // Normaliza CNPJ (remove formatação)
  const cnpj = cnpjRaw ? cnpjRaw.replace(/\D/g, "") : null;

  // Valida CNPJ único (se fornecido)
  if (cnpj) {
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("cnpj", cnpj)
      .maybeSingle();

    // Busca empresa do usuário atual (se existe)
    const { data: userCompany } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Se CNPJ já existe e não é da empresa do usuário atual
    if (existingCompany && (!userCompany || existingCompany.id !== userCompany.company_id)) {
      throw new Error("Este CNPJ já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
    }
  }

  // Chama a função RPC para criar ou atualizar empresa
  const { error: rpcError } = await supabase.rpc("create_company_self", {
    p_company_name: companyName,
    p_cnpj: cnpj ? cnpj : null,
    p_phone: input.phone,
    p_address: input.address,
    p_city: input.city,
    p_state: input.state,
    p_contact_name: input.contact_name,
    p_accepted_terms: true,
    p_locale: "pt-BR",
  });

  if (rpcError) {
    // Mensagens de erro mais amigáveis
    if (rpcError.message.includes("duplicate") || rpcError.message.includes("unique") || rpcError.message.includes("already exists")) {
      if (rpcError.message.includes("cnpj")) {
        throw new Error("Este CNPJ já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
      } else if (rpcError.message.includes("email")) {
        throw new Error("Este email já está cadastrado. Por favor, use outro email.");
      } else {
        throw new Error("Os dados informados já estão cadastrados. Por favor, verifique e tente novamente.");
      }
    }
    throw new Error(rpcError.message || "Erro ao salvar dados. Tente novamente.");
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

