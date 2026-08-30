"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyProfileHero,
  MetricCard,
  CompanyComplaintList,
  CompanyProjectList,
  CompanyProjectFormModal,
  CompanyDeleteProjectModal,
  CompanyProfileDataForm,
  CompanyPasswordForm,
  CompanyTeamManagement,
  CompanyVerificationPanel,
  CompanyDeleteAccountModal,
  SearchInput,
} from "@/components/company";

type Company = Record<string, string | null | boolean | number | undefined>;
type Stats = {
  totalComplaints: number;
  resolvedCases: number;
  unansweredCount: number;
  activeDialogsCount: number;
  avgResponseHours: number | null;
  resolutionRate: number;
  activeProjectsCount: number;
};
type Project = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
};
type Complaint = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  author?: { name: string | null } | null;
  project?: { name: string } | null;
};

// ─── Reclamações Tab ─────────────────────────────────────────────────────────
function ReclamacoesTab({
  complaints,
  detailBasePath,
}: {
  complaints: Complaint[];
  detailBasePath: string;
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const filtered = complaints.filter((c) => {
    const matchFilter = filter === "ALL" || c.status === filter;
    const matchSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filters = [
    { key: "ALL", label: "Todas" },
    { key: "OPEN", label: "Abertas" },
    { key: "RESPONDED", label: "Respondidas" },
    { key: "RESOLVED", label: "Resolvidas" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar reclamações..."
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
        </div>
      </div>
      <CompanyComplaintList
        complaints={filtered.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          createdAt: c.createdAt,
          author: c.author,
          project: c.project,
        }))}
        detailBasePath={detailBasePath}
        showAuthor={true}
      />
    </div>
  );
}

// ─── Projetos Tab ───────────────────────────────────────────────────────────
function ProjetosTab({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : projects;

  const handleSave = (p: unknown) => {
    const proj = p as Project & { createdAt?: string };
    if (editingProject) {
      setProjects((prev) =>
        prev.map((x) =>
          x.id === editingProject.id
            ? {
                ...x,
                ...proj,
                startDate: proj.startDate ?? x.startDate,
                endDate: proj.endDate ?? x.endDate,
              }
            : x
        )
      );
    } else {
      setProjects((prev) => [...prev, { ...proj }]);
    }
    setShowFormModal(false);
    setEditingProject(null);
  };

  const handleDeleteSuccess = () => {
    if (deletingProject) {
      setProjects((prev) => prev.filter((x) => x.id !== deletingProject.id));
      setDeletingProject(null);
    }
  };

  const projectForEdit = editingProject
    ? {
        id: editingProject.id,
        name: editingProject.name,
        description: editingProject.description ?? null,
        location: editingProject.location ?? null,
        status: editingProject.status,
        startDate: editingProject.startDate ?? null,
        endDate: editingProject.endDate ?? null,
      }
    : null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar projetos..."
        />
        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setShowFormModal(true);
          }}
          style={{
            background: S.primary,
            color: S.white,
            border: "none",
            borderRadius: 8,
            padding: "11px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Adicionar novo projeto
        </button>
      </div>
      <CompanyProjectList
        projects={filtered}
        companyId=""
        isLoggedIn={true}
        showActions={true}
        onEdit={(p) => {
          setEditingProject({
            ...p,
            description: p.description ?? null,
            location: p.location ?? null,
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
          } as Project);
          setShowFormModal(true);
        }}
        onDelete={(p) => setDeletingProject({ id: p.id, name: p.name })}
      />
      {showFormModal && (
        <CompanyProjectFormModal
          project={projectForEdit}
          onClose={() => {
            setShowFormModal(false);
            setEditingProject(null);
          }}
          onSuccess={handleSave}
        />
      )}
      {deletingProject && (
        <CompanyDeleteProjectModal
          project={{ id: deletingProject.id, name: deletingProject.name }}
          onClose={() => setDeletingProject(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

// ─── Configurações Tab ──────────────────────────────────────────────────────
function ConfiguracoesTab({ company }: { company: Company }) {
  const [subTab, setSubTab] = useState("dados");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const subTabs = [
    { key: "dados", label: "Dados" },
    { key: "equipe", label: "Equipe" },
    { key: "senha", label: "Mudar senha" },
    { key: "verificar", label: "Verificar" },
    { key: "deletar", label: "Deletar conta" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
          borderBottom: `1px solid ${S.border}`,
          paddingBottom: 12,
        }}
      >
        {subTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSubTab(t.key)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: "none",
              background: subTab === t.key ? S.purple + "18" : "transparent",
              color: subTab === t.key ? S.purple : S.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "dados" && (
        <CompanyProfileDataForm
          company={{
            name: company.name ? String(company.name) : undefined,
            corporateName: company.corporateName
              ? String(company.corporateName)
              : undefined,
            cnpj: company.cnpj ? String(company.cnpj) : undefined,
            phone: company.phone ? String(company.phone) : undefined,
            website: company.website ? String(company.website) : undefined,
            email: company.email ? String(company.email) : undefined,
            city: company.city ? String(company.city) : undefined,
            neighborhood: company.neighborhood
              ? String(company.neighborhood)
              : undefined,
            state: company.state ? String(company.state) : undefined,
            streetNumber: company.streetNumber
              ? String(company.streetNumber)
              : undefined,
            address: company.address ? String(company.address) : undefined,
            description: company.description
              ? String(company.description)
              : undefined,
            region: company.region ? String(company.region) : undefined,
            sector: company.sector ? String(company.sector) : undefined,
            responsibleName: company.responsibleName
              ? String(company.responsibleName)
              : undefined,
            responsibleEmail: company.responsibleEmail
              ? String(company.responsibleEmail)
              : undefined,
            contactPhone: company.contactPhone
              ? String(company.contactPhone)
              : undefined,
            foundationDate: company.foundationDate
              ? String(company.foundationDate)
              : undefined,
          }}
        />
      )}
      {subTab === "equipe" && <CompanyTeamManagement />}
      {subTab === "senha" && <CompanyPasswordForm />}
      {subTab === "verificar" && (
        <CompanyVerificationPanel
          verifiedAt={
            company.verifiedAt ? String(company.verifiedAt) : null
          }
        />
      )}
      {subTab === "deletar" && (
        <div style={{ maxWidth: 480 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: S.red,
              marginBottom: 16,
            }}
          >
            Excluir conta da empresa
          </h3>
          <div
            style={{
              background: "#FEE2E2",
              border: `1px solid ${S.red}22`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: S.text,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Ao excluir, os dados serão ocultados e a conta será permanentemente
              excluída após <strong>90 dias</strong>. Até lá você pode reativar
              fazendo login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            style={{
              background: S.red,
              color: S.white,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Excluir minha conta
          </button>
        </div>
      )}
      {deleteModalOpen && (
        <CompanyDeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export function CompanyDashboard({
  company,
  stats,
  projects,
  complaints,
  initialTab,
}: {
  company: Company;
  stats: Stats;
  projects: Project[];
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
          <ReclamacoesTab
            complaints={complaints}
            detailBasePath="/app/company/complaints"
          />
        )}
        {tab === "projects" && <ProjetosTab initial={projects} />}
        {tab === "settings" && <ConfiguracoesTab company={company} />}
      </div>
    </div>
  );
}
