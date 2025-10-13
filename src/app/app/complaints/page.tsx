import { supabaseServer } from "@/lib/supabase/server";

export default async function ComplaintsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("complaints").select("id,title,status,created_at").eq("author_user_id", user!.id).order("created_at", { ascending:false });
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Minhas reclamações</h1>
      <ul className="space-y-1">{data?.map(c=>(
        <li key={c.id} className="border p-2 rounded">{c.title} — <span className="opacity-70">{c.status}</span></li>
      ))}</ul>
    </main>
  );
}

