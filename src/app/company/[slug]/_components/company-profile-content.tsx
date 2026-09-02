"use client";

import { useState, useMemo } from "react";
import { MessageCircle, BarChart3, Clock, Check, MapPin, FileText, Shield } from "lucide-react";
import { CompanyAboutCard, CompanyContactsCard, CompanyAreasCard, CompanyComplaintCtaCard, CompanyReportCtaCard, CompanyRecentComplaintsCard, CompanyPerformanceCard, CompanyComplaintList, CompanyProjectList, CompanyReportModal, SearchInput, formatDate, type CompanyStats } from "@/components/company";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="flex gap-3 pb-3 border-b border-gray-100 mb-3 last:border-0 last:mb-0 last:pb-0">
      <div className="w-32 text-xs text-gray-400 flex-shrink-0 font-medium">
        {label}
      </div>
      <div className="text-sm text-[#2A3F54] font-medium flex-1">
        {value}
      </div>
    </div>
  );
}

// ─── HERO MODERNO ────────────────────────────────────────────────────────────
function CompanyHero({
  company,
  stats,
  isMember,
  isVerified,
  dashboardLink,
  complaintCtaHref,
  tabs,
  activeTab,
  onTabChange,
}: {
  company: Company;
  stats: CompanyStats;
  isMember: boolean;
  isVerified: boolean;
  dashboardLink?: string;
  complaintCtaHref?: string;
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}) {
  const region = company.region ?? ([company.city, company.state].filter(Boolean).join(", ") || null);
  const projectsCount = stats.activeProjectsCount ?? 0;

  return (
    <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0]">
      <div className="max-w-[960px] mx-auto px-6 pt-8 pb-4">
        {/* Header row */}
        <div className="flex items-start gap-5 flex-wrap mb-6">
          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-[28px] font-bold flex-shrink-0 overflow-hidden">
            {company.logoUrl ? (
              <img src={String(company.logoUrl)} alt="" className="w-full h-full object-cover" />
            ) : (
              String(company.name ?? "E").charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[22px] font-bold text-white m-0">
                {String(company.name ?? "")}
              </h1>
              {isVerified && (
                <Badge className="bg-white/25 text-white border-0 text-[11px] font-bold px-2 py-0.5 hover:bg-white/25">
                  <Shield className="w-3 h-3 mr-1" />
                  VERIFICADA
                </Badge>
              )}
              {isMember && (
                <Badge className="bg-white/25 text-white border-0 text-[11px] font-bold px-2 py-0.5 hover:bg-white/25">
                  MEMBRO
                </Badge>
              )}
            </div>

            {region && (
              <div className="flex items-center gap-1.5 text-[13px] text-white/90 mb-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{region}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[13px] text-white/85">
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {projectsCount} {projectsCount === 1 ? "projeto" : "projetos"} em andamento
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {dashboardLink && (
              <Link href={dashboardLink}>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white text-[13px] font-semibold"
                >
                  Painel da empresa →
                </Button>
              </Link>
            )}
            {complaintCtaHref && (
              <Link href={complaintCtaHref}>
                <Button className="bg-white text-[#1E88E5] hover:bg-gray-100 text-sm font-semibold gap-2">
                  <FileText className="w-4 h-4" />
                  Reclamar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap items-center">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-xl transition-all cursor-pointer border-none ${
                activeTab === t.key
                  ? "bg-white text-[#1E88E5]"
                  : "bg-transparent text-white/85 hover:text-white"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === t.key ? "bg-[#1E88E5]/10 text-[#1E88E5]" : "bg-white/20 text-white"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── METRICS BAR ────────────────────────────────────────────────────────────
function MetricsBar({ stats }: { stats: CompanyStats }) {
  const metrics = [
    {
      label: "Tempo médio de resposta",
      value: stats.avgResponseHours != null ? `${stats.avgResponseHours}h` : "-",
      icon: <Clock className="w-4 h-4" />,
      color: "#1E88E5",
      bg: "#E3F2FD",
    },
    {
      label: "Taxa de resolução",
      value: `${stats.resolutionRate}%`,
      icon: <Check className="w-4 h-4" />,
      color: stats.resolutionRate >= 70 ? "#22C55E" : "#F97316",
      bg: stats.resolutionRate >= 70 ? "#F0FDF4" : "#FFF7ED",
    },
    {
      label: "Diálogos ativos",
      value: stats.activeDialogsCount,
      icon: <MessageCircle className="w-4 h-4" />,
      color: "#1E88E5",
      bg: "#E3F2FD",
    },
    {
      label: "Casos resolvidos",
      value: stats.resolvedCases,
      icon: <Check className="w-4 h-4" />,
      color: "#22C55E",
      bg: "#F0FDF4",
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto px-6 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: m.bg, color: m.color }}
                >
                  {m.icon}
                </div>
                <span className="text-2xl font-bold font-['Poppins']" style={{ color: m.color }}>
                  {m.value}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium font-['Poppins']">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── PUBLIC PROFILE - OVERVIEW TAB ──────────────────────────────────────────
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

// ─── PUBLIC PROFILE - COMPANY INFO TAB ──────────────────────────────────────
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
    <Card className="border-0 shadow-md max-w-xl">
      <CardContent className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Informações cadastrais
        </h2>
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
          <InfoRow label="Fundação" value={formatDate(String(company.foundationDate))} />
        )}
        <InfoRow label="Cadastrada desde" value={company.createdAt ? formatDate(String(company.createdAt)) : null} />
      </CardContent>
    </Card>
  );
}

// ─── PUBLIC PROFILE - PROJECTS TAB ─────────────────────────────────────────
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
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar projetos..." />
        <div className="flex gap-2 flex-wrap">
          {statusOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setStatusFilter(o.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all border ${
                statusFilter === o.key
                  ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                  : "bg-white text-[#2A3F54] border-gray-200 hover:bg-gray-50"
              }`}
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

// ─── PUBLIC PROFILE - COMPLAINTS TAB ────────────────────────────────────────
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
    { key: "ALL", label: "Todas", count: stats.totalComplaints },
    { key: "OPEN", label: "Abertas", count: complaints.filter((c) => c.status === "OPEN").length },
    { key: "RESPONDED", label: "Respondidas", count: complaints.filter((c) => c.status === "RESPONDED").length },
    { key: "RESOLVED", label: "Resolvidas", count: complaints.filter((c) => c.status === "RESOLVED").length },
    { key: "CANCELLED", label: "Canceladas", count: complaints.filter((c) => c.status === "CANCELLED").length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap items-center">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all border ${
              filter === f.key
                ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                : "bg-white text-[#2A3F54] border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
        {isLoggedIn && (
          <Link href={`/app/complaints/new?company=${companyId}`} className="ml-auto">
            <Button className="bg-[#1E88E5] hover:bg-[#1976D2] text-sm gap-1">
              <MessageCircle className="w-4 h-4" />
              Reclamar
            </Button>
          </Link>
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
