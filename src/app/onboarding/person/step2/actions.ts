"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function updateProfilePerson(input: {
  cpf?: string | null;
  phone?: string | null;
  address: string;
  city: string;
  state: string;
  how_heard?: string | null;
  how_heard_other?: string | null;
  accepted_terms?: boolean;
  locale?: string;
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

  // Normaliza CPF (remove formatação)
  const cpfNormalized = input.cpf && input.cpf.trim() 
    ? input.cpf.trim().replace(/\D/g, "") 
    : null;

  // Valida CPF único (se fornecido)
  if (cpfNormalized) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("cpf", cpfNormalized)
      .maybeSingle();

    // Se CPF já existe e não é do usuário atual
    if (existingProfile && existingProfile.user_id !== user.id) {
      throw new Error("Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
    }
  }

  // Prepara how_heard_other: só salva se how_heard = 'OUTRO'
  const howHeardOtherValue = input.how_heard === "OUTRO" && input.how_heard_other
    ? input.how_heard_other.trim()
    : null;

  // Chama a função RPC (precisa atualizar para aceitar how_heard)
  const { error: rpcError } = await supabase.rpc("update_profile_person", {
    p_name: null,
    p_cpf: cpfNormalized,
    p_phone: input.phone && input.phone.trim() ? input.phone.trim() : null,
    p_address: input.address.trim(),
    p_city: input.city.trim(),
    p_state: input.state.trim(),
    p_how_heard: input.how_heard || null,
    p_how_heard_other: howHeardOtherValue,
    p_accepted_terms: input.accepted_terms ?? true,
    p_locale: input.locale || "pt-BR",
  });

  if (rpcError) {
    // Mensagens de erro mais amigáveis
    if (rpcError.message.includes("duplicate") || rpcError.message.includes("unique") || rpcError.message.includes("already exists")) {
      if (rpcError.message.includes("cpf")) {
        throw new Error("Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
      } else if (rpcError.message.includes("email")) {
        throw new Error("Este email já está cadastrado. Por favor, use outro email.");
      } else {
        throw new Error("Os dados informados já estão cadastrados. Por favor, verifique e tente novamente.");
      }
    }
    throw new Error(rpcError.message || "Erro ao salvar dados. Tente novamente.");
  }

  return { success: true };
}
