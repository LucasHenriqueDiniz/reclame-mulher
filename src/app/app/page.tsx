import { supabaseServer } from "@/lib/supabase/server";

import { AppHomeContent } from "./_components/app-home-content";

export default async function AppHome() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return <AppHomeContent name={profile?.name} role={profile?.role} />;
}

