"use client";

import { ReactNode } from "react";

interface ComplaintWizardShellProps {
  children: ReactNode;
}

/**
 * Shell principal do wizard de reclamação
 * Define o layout, background e container centralizado
 */
export function ComplaintWizardShell({ children }: ComplaintWizardShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F0F4F8] to-[#E8EEF4] py-8 px-4">
      <div className="mx-auto max-w-[800px] w-full space-y-4 animate-in fade-in duration-500">
        {children}
      </div>
    </main>
  );
}
