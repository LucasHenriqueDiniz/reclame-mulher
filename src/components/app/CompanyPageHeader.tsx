import type { ReactNode } from "react";
import { PageTabs, type PageTabItem } from "./PageTabs";

export type CompanyNavTab = PageTabItem;

interface CompanyPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tabs?: CompanyNavTab[];
  activeTab?: string;
}

export function CompanyPageHeader({ title, subtitle, icon, action, tabs, activeTab }: CompanyPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-[#1E88E5]">{icon}</span>}
            <h1 className="font-['Poppins'] text-3xl font-bold text-[#2A3F54]">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="font-['Poppins'] text-[#607D8B]">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {tabs && tabs.length > 0 && activeTab && (
        <PageTabs tabs={tabs} activeTab={activeTab} variant="underline" />
      )}
    </div>
  );
}
