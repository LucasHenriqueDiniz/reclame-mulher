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

  // Prepara how_heard_other: só salva se how_heard = 'OUTRO'
  const howHeardOtherValue = input.how_heard === "OUTRO" && input.how_heard_other
    ? input.how_heard_other.trim()
    : null;

  // Chama a função RPC (precisa atualizar para aceitar how_heard)
  const { error: rpcError } = await supabase.rpc("update_profile_person", {
    p_name: null,
    p_cpf: input.cpf && input.cpf.trim() ? input.cpf.trim().replace(/\D/g, "") : null,
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
    throw new Error(rpcError.message);
  }

  return { success: true };
}
