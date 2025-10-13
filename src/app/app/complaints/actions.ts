"use server";
import { supabaseServer } from "@/lib/supabase/server";

export async function createComplaint(input: { company_id: string; title: string; description: string; is_public?: boolean }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");

  const payload = { author_user_id: user.id, company_id: input.company_id, title: input.title, description: input.description, is_public: !!input.is_public };
  const { data, error } = await supabase.from("complaints").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

