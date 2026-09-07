"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyProfileHero,
  MetricCard,
} from "@/components/company";
import { ComplaintsTab, type Complaint } from "./complaints-tab";
import { ProjectsTab } from "./projects-tab";
import { SettingsTab, type Company } from "./settings-tab";

type Stats = {
  totalComplaints: number;
  resolvedCases: number;
  unansweredCount: number;
  activeDialogsCount: number;
  avgResponseHours: number | null;
  resolutionRate: number;
  activeProjectsCount: number;
};

export function CompanyDashboard({
  company,
  stats,
  complaints,
  initialTab,
}: {
  company: Company;
  stats: Stats;
  complaints: Complaint[];
  initialTab: string;
}) {
  const tabMap: Record<string, string> = {
    complaints: "complaints",
    projects: "projects",
    settings: "settings",
    configuracoes: "settings",
  };
  const [tab, setTab] = useState(tabMap[initialTab] ?? "complaints");

  const tabs = [
    { key: "complaints", label: "Reclamações" },
    { key: "projects", label: "Projetos" },
    { key: "settings", label: "Configurações" },
  ];

  const companySlug = company.slug ? String(company.slug) : String(company.id);
  const publicProfileLink = `/company/${companySlug}`;

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      <CompanyProfileHero
        company={{
          id: String(company.id),
          name: company.name ? String(company.name) : null,
          logoUrl: company.logoUrl ? String(company.logoUrl) : null,
          verifiedAt: company.verifiedAt != null ? String(company.verifiedAt) : null,
          region: company.region ? String(company.region) : null,
          city: company.city ? String(company.city) : null,
          state: company.state ? String(company.state) : null,
          sector: company.sector ? String(company.sector) : null,
          slug: company.slug ? String(company.slug) : null,
        }}
        stats={stats}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        publicProfileLink={publicProfileLink}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard
            label="Reclamações recebidas"
            value={stats.totalComplaints}
          />
          <MetricCard
            label="Casos resolvidos"
            value={stats.resolvedCases}
            color={S.green}
          />
          <MetricCard
            label="Sem resposta"
            value={stats.unansweredCount}
            color={stats.unansweredCount > 0 ? S.red : undefined}
          />
          <MetricCard
            label="Taxa de resolução"
            value={`${stats.resolutionRate}%`}
            sub={
              stats.avgResponseHours != null
                ? `Resp. média: ${stats.avgResponseHours}h`
                : undefined
            }
            color={stats.resolutionRate >= 70 ? S.green : S.orange}
          />
          <MetricCard
            label="Projetos ativos"
            value={stats.activeProjectsCount}
            color={S.primary}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "24px 24px 48px",
        }}
      >
        {tab === "complaints" && (
          <ComplaintsTab
            complaints={complaints}
            detailBasePath="/app/company/complaints"
          />
        )}
        {tab === "projects" && <ProjectsTab />}
        {tab === "settings" && <SettingsTab company={company} />}
      </div>
    </div>
  );
}
