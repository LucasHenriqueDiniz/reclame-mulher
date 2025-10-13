import { supabaseServer } from "@/lib/supabase/server";

export default async function AppHome() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Olá, {profile?.name ?? "usuário"}</h1>
      <p>Role: {profile?.role}</p>
    </main>
  );
}

