"use client";

import { useState, useMemo } from "react";
import { Home, MessageCircle, Info, BarChart3, Clock, Check } from "lucide-react";
import {
  companyTheme as S,
  CompanyProfileHero,
  CompanyAboutCard,
  CompanyContactsCard,
  CompanyAreasCard,
  CompanyComplaintCtaCard,
  CompanyReportCtaCard,
  CompanyRecentComplaintsCard,
  CompanyPerformanceCard,
  CompanyComplaintList,
  CompanyProjectList,
  CompanyReportModal,
  SearchInput,
  MetricCard,
  formatDate,
  type CompanyStats,
} from "@/components/company";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";

type Company = Record<string, string | null | boolean | number | undefined>;
type Complaint = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  isAnonymous?: boolean;
  author?: { name: string | null } | null;
  project?: { name: string } | null;
  problemLocation?: string | null;
};
type Project = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        paddingBottom: 14,
        borderBottom: `1px solid ${S.border}`,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 140,
          fontSize: 13,
          color: S.muted,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: S.text, fontWeight: 500, flex: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─── PERFIL PÚBLICO - ABA INÍCIO ────────────────────────────────────────────
function OverviewTab({
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: 24,
        alignItems: "start",
      }}
      className="company-overview-grid"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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

// Adicionar CSS responsivo para mobile
const responsiveStyles = `
  @media (max-width: 768px) {
    .company-overview-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

// ─── PERFIL PÚBLICO - ABA INFORMAÇÕES ───────────────────────────────────────
function InformacoesTab({ company }: { company: Company }) {
  const addr = [
    company.address,
    company.streetNumber && `nº ${company.streetNumber}`,
    company.neighborhood,
    company.city,
    company.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      style={{
        background: S.white,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        maxWidth: 560,
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: S.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 16,
        }}
      >
        Informações cadastrais
      </div>
      <InfoRow label="Nome fantasia" value={company.name ? String(company.name) : null} />
      <InfoRow label="Razão social" value={company.corporateName ? String(company.corporateName) : null} />
      <InfoRow label="CNPJ" value={company.cnpj ? String(company.cnpj) : null} />
      <InfoRow label="Setor" value={company.sector ? String(company.sector) : null} />
      <InfoRow label="Região" value={company.region ? String(company.region) : null} />
      <InfoRow label="Endereço" value={addr || undefined} />
      <InfoRow label="Site" value={company.website ? String(company.website) : null} />
      <InfoRow label="E-mail" value={company.email ? String(company.email) : null} />
      <InfoRow label="Telefone" value={company.phone ? String(company.phone) : null} />
      {company.foundationDate && (
        <InfoRow
          label="Fundação"
          value={formatDate(String(company.foundationDate))}
        />
      )}
      <InfoRow label="Cadastrada desde" value={company.createdAt ? formatDate(String(company.createdAt)) : null} />
    </div>
  );
}

// ─── PERFIL PÚBLICO - ABA PROJETOS ─────────────────────────────────────────
function ProjetosTab({
  projects,
  companyId,
  isLoggedIn,
}: {
  projects: Project[];
  companyId: string;
  isLoggedIn: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const filtered = useMemo(() => {
    let list = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.location?.toLowerCase().includes(q) ?? false)
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [projects, search, statusFilter]);

  const statusOpts = [
    { key: "ALL", label: "Todos" },
    { key: "PLANNING", label: "Planejamento" },
    { key: "IN_PROGRESS", label: "Em andamento" },
    { key: "COMPLETED", label: "Concluído" },
    { key: "CANCELLED", label: "Cancelado" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar projetos..." />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statusOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setStatusFilter(o.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1px solid ${statusFilter === o.key ? S.primary : S.border}`,
                background: statusFilter === o.key ? S.primary : S.white,
                color: statusFilter === o.key ? S.white : S.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <CompanyProjectList
        projects={filtered}
        companyId={companyId}
        isLoggedIn={isLoggedIn}
        onComplaintClick={(projectId) => {
          window.location.href = isLoggedIn
            ? `/app/complaints/new?company=${companyId}&project=${projectId}`
            : "/login";
        }}
      />
      <CompanyComplaintCtaCard companyId={companyId} isLoggedIn={isLoggedIn} />
    </div>
  );
}

// ─── PERFIL PÚBLICO - ABA RECLAMAÇÕES ───────────────────────────────────────
function ReclamacoesTab({
  complaints,
  stats,
  isLoggedIn,
  companyId,
}: {
  complaints: Complaint[];
  stats: CompanyStats;
  isLoggedIn: boolean;
  companyId: string;
}) {
  const [filter, setFilter] = useState("ALL");
  const filtered =
    filter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  const filters = [
    { key: "ALL", label: "Todas" },
    { key: "OPEN", label: "Abertas" },
    { key: "RESPONDED", label: "Respondidas" },
    { key: "RESOLVED", label: "Resolvidas" },
    { key: "CANCELLED", label: "Canceladas" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: `1px solid ${filter === f.key ? S.primary : S.border}`,
              background: filter === f.key ? S.primary : S.white,
              color: filter === f.key ? S.white : S.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
        {isLoggedIn && (
          <a
            href={`/app/complaints/new?company=${companyId}`}
            style={{
              background: S.primary,
              color: S.white,
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            + Reclamar
          </a>
        )}
      </div>
      <CompanyComplaintList
        complaints={filtered.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          createdAt: c.createdAt,
          isAnonymous: c.isAnonymous,
          author: c.author,
          project: c.project,
        }))}
        detailBasePath="/app/complaints"
        showAuthor={true}
      />
      <CompanyPerformanceCard stats={stats} />
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
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
    { key: "overview", label: "Início", icon: <Home style={{ width: 18, height: 18 }} /> },
    {
      key: "complaints",
      label: `Reclamações (${stats.totalComplaints})`,
      icon: <MessageCircle style={{ width: 18, height: 18 }} />,
    },
    { key: "info", label: "Informações", icon: <Info style={{ width: 18, height: 18 }} /> },
    {
      key: "projects",
      label: `Projetos (${stats.activeProjectsCount})`,
      icon: <BarChart3 style={{ width: 18, height: 18 }} />,
    },
  ];

  return (
    <>
      <MainHeader />
      <div style={{ minHeight: "100vh", background: S.bg }}>
        <style>{responsiveStyles}</style>
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
        tabs={publicTabs}
        activeTab={tab}
        onTabChange={setTab}
        isMember={isMember}
        showMetrics={false}
        dashboardLink={isMember ? "/app/company/dashboard" : undefined}
        complaintCtaHref={!isMember ? `/app/complaints/new?company=${company.id}` : undefined}
      />

      {/* Métricas em cards brancos abaixo do banner */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: -1,
            padding: "20px 0",
            background: S.bg,
            borderTop: `1px solid ${S.border}`,
          }}
        >
          <MetricCard
            label="Tempo médio de resposta"
            value={stats.avgResponseHours != null ? `${stats.avgResponseHours}h` : "-"}
            icon={<Clock style={{ width: 16, height: 16 }} />}
          />
          <MetricCard
            label="Taxa de resolução"
            value={`${stats.resolutionRate}%`}
            color={stats.resolutionRate >= 70 ? S.green : S.orange}
            icon={<Check style={{ width: 16, height: 16 }} />}
          />
          <MetricCard
            label="Diálogos ativos"
            value={stats.activeDialogsCount}
            color={S.primary}
            icon={<MessageCircle style={{ width: 16, height: 16 }} />}
          />
          <MetricCard
            label="Casos resolvidos"
            value={stats.resolvedCases}
            color={S.green}
            icon={<Check style={{ width: 16, height: 16 }} />}
          />
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 60px" }}>
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
          <ReclamacoesTab
            complaints={complaints}
            stats={stats}
            isLoggedIn={isLoggedIn}
            companyId={String(company.id)}
          />
        )}
        {tab === "info" && <InformacoesTab company={company} />}
        {tab === "projects" && (
          <ProjetosTab
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
