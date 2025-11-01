"use server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Atualiza ou cria o perfil do usuário após login OAuth (Google, etc)
 * Extrai informações do user_metadata do Supabase Auth
 */
export async function syncProfileFromOAuth() {
  const supabase = await supabaseServer();
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Usuário não autenticado");
  }

  // Extrai informações do OAuth (se disponível)
  const metadata = user.user_metadata || {};
  const identities = user.identities || [];
  const oauthProvider = identities.find((id: { provider?: string }) => id.provider === "google");
  
  const provider = oauthProvider ? "google" : "email";
  const providerId = oauthProvider?.id || null;
  const avatarUrl = metadata.avatar_url || metadata.picture || null;
  const fullName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "Usuário";
  const email = user.email || metadata.email || null;

  // Verifica se já existe perfil
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    // Atualiza perfil existente com dados do OAuth
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: fullName,
        email,
        avatar_url: avatarUrl,
        provider,
        provider_id: providerId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }
  } else {
    // Cria novo perfil
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        name: fullName,
        email,
        avatar_url: avatarUrl,
        provider,
        provider_id: providerId,
        role: "USER",
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }
  }

  return { success: true };
}
