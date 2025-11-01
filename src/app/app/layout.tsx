import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
