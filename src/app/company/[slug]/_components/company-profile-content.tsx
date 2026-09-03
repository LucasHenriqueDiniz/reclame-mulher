"use client";

import { useState } from "react";
import { CompanyReportModal, type CompanyStats } from "@/components/company";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { CompanyHero } from "./company-hero";
import { MetricsBar } from "./metrics-bar";
import { OverviewTab } from "./overview-tab";
import { InformationTab } from "./information-tab";
import { ProjectsTab } from "./projects-tab";
import { ComplaintsTab } from "./complaints-tab";
import { type Company, type Complaint, type Project } from "./types";

export function CompanyProfileContent({
  company,
  complaints,
  projects,
  stats,
  isMember,
  isLoggedIn,
  initialTab,
}: {
  company: Company;
  complaints: Complaint[];
  projects: Project[];
  stats: CompanyStats;
  isMember: boolean;
  isLoggedIn: boolean;
  initialTab: string;
}) {
  const tabMap: Record<string, string> = {
    overview: "overview",
    inicio: "overview",
    complaints: "complaints",
    info: "info",
    informacoes: "info",
    projects: "projects",
    projetos: "projects",
  };
  const [tab, setTab] = useState(tabMap[initialTab] ?? "overview");
  const [reportOpen, setReportOpen] = useState(false);

  const companySlug = company.slug ? String(company.slug) : String(company.id);

  const publicTabs = [
    { key: "overview", label: "Início" },
    { key: "complaints", label: "Reclamações", count: stats.totalComplaints },
    { key: "info", label: "Informações" },
    { key: "projects", label: "Projetos", count: stats.activeProjectsCount },
  ];

  const isVerified = !!company.verifiedAt;

  return (
    <>
      <MainHeader />
      <div className="min-h-screen bg-[#F5F7FA]">
        <CompanyHero
          company={company}
          stats={stats}
          isMember={isMember}
          isVerified={isVerified}
          dashboardLink={isMember ? "/app/company/dashboard" : undefined}
          complaintCtaHref={!isMember ? `/app/complaints/new?company=${company.id}` : undefined}
          tabs={publicTabs}
          activeTab={tab}
          onTabChange={setTab}
        />

        <MetricsBar stats={stats} />

        <div className="max-w-[960px] mx-auto px-6 py-8">
          {tab === "overview" && (
            <OverviewTab
              company={company}
              stats={stats}
              complaints={complaints}
              isLoggedIn={isLoggedIn}
              onReport={() => setReportOpen(true)}
              companySlug={companySlug}
            />
          )}
          {tab === "complaints" && (
            <ComplaintsTab
              complaints={complaints}
              stats={stats}
              isLoggedIn={isLoggedIn}
              companyId={String(company.id)}
            />
          )}
          {tab === "info" && <InformationTab company={company} />}
          {tab === "projects" && (
            <ProjectsTab
              projects={projects}
              companyId={String(company.id)}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>

        {reportOpen && (
          <CompanyReportModal
            companyId={String(company.id)}
            onClose={() => setReportOpen(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
