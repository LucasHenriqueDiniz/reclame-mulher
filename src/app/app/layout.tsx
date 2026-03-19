import type { ReactNode } from "react";

import { getSession } from "@/lib/auth/session";
import { AppLayoutGuard } from "./_components/app-layout-guard";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getSession();

  return (
    <AppLayoutGuard session={session}>
      {children}
    </AppLayoutGuard>
  );
}
