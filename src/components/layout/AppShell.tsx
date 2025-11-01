import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppShell({ sidebar, topbar, children, className }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {sidebar ? (
        <aside className="hidden w-72 shrink-0 border-r bg-muted/30 lg:block">
          {sidebar}
        </aside>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        {topbar ? (
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
            {topbar}
          </header>
        ) : null}

        <main className={cn("flex-1", className)}>{children}</main>
      </div>
    </div>
  );
}
