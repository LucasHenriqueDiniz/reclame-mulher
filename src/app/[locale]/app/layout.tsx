import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

type AppLayoutProps = {
  children: ReactNode;
  params: { locale: Locale };
};

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  return <>{children}</>;
}
