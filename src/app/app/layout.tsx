import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { AppHeader } from "@/components/layout/AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
