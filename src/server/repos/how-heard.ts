import { supabaseServer } from "@/lib/supabase/server";

export class HowHeardRepo {
  static async getAllOptions() {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("how_heard_options")
      .select("*")
      .eq("is_active", true)
      .order("label", { ascending: true });

    if (error) throw error;
    return data;
  }

  static async createForUser(
    userId: string,
    optionId?: string | null,
    freeText?: string | null
  ) {
    const supabase = await supabaseServer();

    // Se não tem nem option nem freeText, não cria nada
    if (!optionId && (!freeText || !freeText.trim())) {
      return null;
    }

    const sourceType = optionId ? "PREDEFINED" : "FREE_TEXT";

    const { data, error } = await supabase
      .from("user_how_heard")
      .insert({
        user_id: userId,
        source_type: sourceType,
        option_id: optionId || null,
        free_text: freeText?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserHowHeard(userId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("user_how_heard")
      .select("*, option:how_heard_options(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Analytics para admin
  static async getStats() {
    const supabase = await supabaseServer();

    // Stats por opção pré-definida
    const { data: optionStats, error: optionError } = await supabase
      .from("user_how_heard")
      .select("option:how_heard_options(label, slug), count")
      .eq("source_type", "PREDEFINED")
      .not("option_id", "is", null);

    if (optionError) throw optionError;

    // Stats de free text (top 10)
    const { data: freeTextStats, error: freeTextError } = await supabase
      .from("user_how_heard")
      .select("free_text, count")
      .eq("source_type", "FREE_TEXT")
      .not("free_text", "is", null)
      .order("count", { ascending: false })
      .limit(10);

    if (freeTextError) throw freeTextError;

    return {
      byOption: optionStats || [],
      byFreeText: freeTextStats || [],
    };
  }
}

