"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { HowHeardRepo } from "@/server/repos/how-heard";

export async function updateProfilePerson(input: {
  cpf?: string | null;
  phone?: string | null;
  address: string;
  city: string;
  state: string;
  how_heard_option_id?: string | null;
  how_heard_free_text?: string | null;
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

  // Chama a função RPC
  const { error: rpcError } = await supabase.rpc("update_profile_person", {
    p_name: null,
    p_cpf: input.cpf && input.cpf.trim() ? input.cpf.trim().replace(/\D/g, "") : null,
    p_phone: input.phone && input.phone.trim() ? input.phone.trim() : null,
    p_address: input.address.trim(),
    p_city: input.city.trim(),
    p_state: input.state.trim(),
    p_accepted_terms: input.accepted_terms ?? true,
    p_locale: input.locale || "pt-BR",
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
