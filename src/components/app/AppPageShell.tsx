import type { ReactNode } from "react";

interface AppPageShellProps {
  children: ReactNode;
}

export function AppPageShell({ children }: AppPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-12">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {children}
      </div>
    </div>
  );
}
