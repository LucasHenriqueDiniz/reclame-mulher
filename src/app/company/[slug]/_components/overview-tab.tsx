"use client";

import { CompanyAboutCard, CompanyContactsCard, CompanyAreasCard, CompanyComplaintCtaCard, CompanyReportCtaCard, CompanyRecentComplaintsCard, type CompanyStats } from "@/components/company";
import { type Company, type Complaint } from "./types";

export function OverviewTab({
  company,
  stats,
  complaints,
  isLoggedIn,
  onReport,
  companySlug,
}: {
  company: Company;
  stats: CompanyStats;
  complaints: Complaint[];
  isLoggedIn: boolean;
  onReport: () => void;
  companySlug: string;
}) {
  const recent = complaints.slice(0, 5);
  const viewAllHref = `/company/${companySlug}?tab=complaints`;
  const companyName = company.name ? String(company.name) : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="flex flex-col gap-6">
        <CompanyRecentComplaintsCard
          complaints={recent.map((c) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            createdAt: c.createdAt,
            location: c.problemLocation ?? null,
          }))}
          viewAllHref={recent.length > 0 ? viewAllHref : undefined}
        />
        <CompanyComplaintCtaCard
          companyId={String(company.id)}
          companyName={companyName}
          isLoggedIn={isLoggedIn}
        />
        <CompanyAreasCard
          region={company.region ? String(company.region) : null}
          sector={company.sector ? String(company.sector) : null}
        />
      </div>
      <div className="flex flex-col gap-6">
        <CompanyAboutCard company={company} stats={stats} />
        <CompanyContactsCard
          company={{
            email: company.email ? String(company.email) : null,
            phone: company.phone ? String(company.phone) : null,
            website: company.website ? String(company.website) : null,
          }}
        />
        <CompanyReportCtaCard onReport={onReport} />
      </div>
    </div>
  );
}
