import type { ReactNode } from "react";

interface CompanyPageShellProps {
  children: ReactNode;
  className?: string;
}

export function CompanyPageShell({ children, className = "" }: CompanyPageShellProps) {
  return (
    <div className={`min-h-screen bg-[#F5F7FA] ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
