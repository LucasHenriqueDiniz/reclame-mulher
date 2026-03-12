"use client";
import { useState, useTransition } from "react";

const S = {
  bg: "#F4F6F8",
  primary: "#2189E5",
  purple: "#1E0F62",
  text: "#2E435B",
  muted: "#6E8195",
  border: "#D9E3EC",
  white: "#FFFFFF",
  green: "#1CA85B",
  yellow: "#E0A800",
  orange: "#E07B00",
  red: "#D93025",
  light: "#F0F4F8",
};

type Company = Record<string, string | null | boolean | number>;
type Complaint = { id: string; title: string; status: string; createdAt: string; updatedAt?: string | null; project?: { name: string } | null };
type Project = { id: string; name: string; description: string | null; location: string | null; status: string; startDate: string | null; endDate: string | null };
type Stats = { totalComplaints: number; resolvedCases: number; unansweredCount: number; activeDialogsCount: number; avgResponseHours: number | null; resolutionRate: number; activeProjectsCount: number };

function statusLabel(s: string) {
  const m: Record<string, string> = { OPEN: "Aberta", RESPONDED: "Respondida", RESOLVED: "Resolvida", CANCELLED: "Cancelada", PENDING: "Pendente" };
  return m[s] ?? s;
}
function statusColor(s: string) {
  const m: Record<string, string> = { OPEN: S.muted, RESPONDED: S.yellow, RESOLVED: S.green, CANCELLED: S.orange };
  return m[s] ?? S.muted;
}
function projectStatusLabel(s: string) {
  const m: Record<string, string> = { PLANNING: "Planejamento", IN_PROGRESS: "Em andamento", COMPLETED: "Concluído", CANCELLED: "Cancelado" };
  return m[s] ?? s;
}
function projectStatusColor(s: string) {
  const m: Record<string, string> = { PLANNING: S.muted, IN_PROGRESS: S.primary, COMPLETED: S.green, CANCELLED: S.orange };
  return m[s] ?? S.muted;
}
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function protocolId(id: string) {
  const raw = id.replace(/-/g, "").toUpperCase().slice(0, 8);
  return `#R-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "18px 22px", flex: "1 1 140px" }}>
      <div style={{ fontSize: 12, color: S.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? S.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, paddingBottom: 14, borderBottom: `1px solid ${S.border}`, marginBottom: 14 }}>
      <div style={{ width: 140, fontSize: 13, color: S.muted, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 14, color: S.text, fontWeight: 500, flex: 1 }}>{value}</div>
    </div>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: S.white, borderRadius: 16, padding: 28, width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ company, stats, complaints, projects, isLoggedIn, onReport }: { company: Company; stats: Stats; complaints: Complaint[]; projects: Project[]; isLoggedIn: boolean; onReport: () => void }) {
  const isVerified = !!company.verifiedAt;
  const recent = complaints.slice(0, 3);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Reclamações públicas" value={stats.totalComplaints} />
        <StatCard label="Casos resolvidos" value={stats.resolvedCases} color={S.green} />
        <StatCard label="Taxa de resolução" value={`${stats.resolutionRate}%`} sub={stats.avgResponseHours != null ? `Resp. média: ${stats.avgResponseHours}h` : undefined} color={stats.resolutionRate >= 70 ? S.green : S.orange} />
        <StatCard label="Projetos ativos" value={stats.activeProjectsCount} color={S.primary} />
      </div>

      {/* About snippet */}
      {company.description && (
        <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Sobre</div>
          <p style={{ fontSize: 15, color: S.text, lineHeight: 1.7, margin: 0 }}>{String(company.description)}</p>
        </div>
      )}

      {/* Verification banner */}
      {isVerified && (
        <div style={{ background: "#D1FAE5", border: `1px solid ${S.green}44`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>✓</span>
          <div>
            <div style={{ fontWeight: 700, color: S.green, fontSize: 14 }}>Empresa verificada pela plataforma</div>
            <div style={{ fontSize: 12, color: S.muted }}>Os dados desta empresa foram verificados pela equipe ComunicaMulher.</div>
          </div>
        </div>
      )}

      {/* Recent complaints */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 12 }}>Reclamações recentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recent.map((c) => (
              <div key={c.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: S.muted, fontFamily: "monospace", background: S.light, borderRadius: 4, padding: "1px 5px" }}>{protocolId(c.id)}</span>
                    <Badge label={statusLabel(c.status)} color={statusColor(c.status)} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{c.title}</div>
                </div>
                <div style={{ fontSize: 12, color: S.muted, whiteSpace: "nowrap" }}>{fmt(c.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 12 }}>Projetos em destaque</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {projects.slice(0, 3).map((p) => (
              <div key={p.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{p.name}</div>
                  <Badge label={projectStatusLabel(p.status)} color={projectStatusColor(p.status)} />
                </div>
                {p.location && <div style={{ fontSize: 12, color: S.muted }}>📍 {p.location}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg, ${S.purple}11, ${S.primary}11)`, border: `1px solid ${S.primary}33`, borderRadius: 12, padding: "22px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: S.text, marginBottom: 4 }}>Teve problema com esta empresa?</div>
          <div style={{ fontSize: 13, color: S.muted }}>Registre sua reclamação e acompanhe a resposta.</div>
        </div>
        {isLoggedIn ? (
          <a href={`/app/complaints/new?company=${company.id}`} style={{ background: S.primary, color: S.white, borderRadius: 8, padding: "11px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Reclamar agora
          </a>
        ) : (
          <a href="/login" style={{ background: S.primary, color: S.white, borderRadius: 8, padding: "11px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Entrar para reclamar
          </a>
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={onReport} style={{ background: "none", border: "none", color: S.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
          Denunciar esta empresa
        </button>
      </div>
    </div>
  );
}

// ─── Complaints Tab ───────────────────────────────────────────────────────────
function ReclamacoesTab({ complaints, isLoggedIn, companyId }: { complaints: Complaint[]; isLoggedIn: boolean; companyId: string }) {
  const [filter, setFilter] = useState("ALL");
  const filters = [
    { key: "ALL", label: "Todas" },
    { key: "OPEN", label: "Abertas" },
    { key: "RESPONDED", label: "Respondidas" },
    { key: "RESOLVED", label: "Resolvidas" },
  ];
  const visible = filter === "ALL" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${filter === f.key ? S.primary : S.border}`, background: filter === f.key ? S.primary : S.white, color: filter === f.key ? S.white : S.text, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>
        {isLoggedIn ? (
          <a href={`/app/complaints/new?company=${companyId}`} style={{ background: S.primary, color: S.white, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            + Reclamar
          </a>
        ) : (
          <a href="/login" style={{ background: S.light, color: S.primary, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Entrar para reclamar
          </a>
        )}
      </div>
      {visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.muted }}>
          {filter === "ALL" ? "Nenhuma reclamação pública registrada." : `Nenhuma reclamação com status "${statusLabel(filter)}".`}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((c) => (
          <div key={c.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: S.muted, fontFamily: "monospace", background: S.light, borderRadius: 4, padding: "2px 6px" }}>{protocolId(c.id)}</span>
                  <Badge label={statusLabel(c.status)} color={statusColor(c.status)} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: S.text, marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: S.muted }}>
                  {fmt(c.createdAt)}
                  {c.project && ` · Projeto: ${c.project.name}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Informações Tab ──────────────────────────────────────────────────────────
function InformacoesTab({ company }: { company: Company }) {
  const addr = [company.address, company.streetNumber && `nº ${company.streetNumber}`, company.neighborhood, company.city, company.state].filter(Boolean).join(", ");

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "20px 24px" }}>
        <InfoRow label="Nome fantasia" value={String(company.name ?? "")} />
        <InfoRow label="Razão social" value={company.corporateName ? String(company.corporateName) : null} />
        <InfoRow label="CNPJ" value={company.cnpj ? String(company.cnpj) : null} />
        <InfoRow label="Setor" value={company.sector ? String(company.sector) : null} />
        <InfoRow label="Região" value={company.region ? String(company.region) : null} />
        <InfoRow label="Endereço" value={addr || null} />
        <InfoRow label="Site" value={company.website ? String(company.website) : null} />
        <InfoRow label="E-mail" value={company.email ? String(company.email) : null} />
        <InfoRow label="Telefone" value={company.phone ? String(company.phone) : null} />
        <InfoRow label="Responsável" value={company.responsibleName ? String(company.responsibleName) : null} />
        {company.foundationDate && (
          <InfoRow label="Fundação" value={fmt(String(company.foundationDate))} />
        )}
        <InfoRow label="Membro desde" value={fmt(String(company.createdAt))} />
      </div>
    </div>
  );
}

// ─── Projetos Tab ─────────────────────────────────────────────────────────────
function ProjetosTab({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <div style={{ textAlign: "center", padding: "48px 0", color: S.muted }}>Esta empresa ainda não publicou projetos.</div>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {projects.map((p) => (
        <div key={p.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: S.text, flex: 1 }}>{p.name}</div>
            <Badge label={projectStatusLabel(p.status)} color={projectStatusColor(p.status)} />
          </div>
          {p.description && <p style={{ fontSize: 13, color: S.muted, margin: "0 0 8px", lineHeight: 1.6 }}>{p.description}</p>}
          {p.location && <div style={{ fontSize: 12, color: S.muted, marginBottom: 8 }}>📍 {p.location}</div>}
          <div style={{ fontSize: 12, color: S.muted }}>
            {p.startDate && `Início: ${fmt(p.startDate)}`}
            {p.startDate && p.endDate && " · "}
            {p.endDate && `Término: ${fmt(p.endDate)}`}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const reasons = ["Informações falsas", "Empresa inexistente", "Comportamento abusivo", "Spam", "Outro"];

  function submit() {
    if (!reason) { setErr("Selecione um motivo"); return; }
    setErr("");
    start(async () => {
      const res = await fetch("/api/company/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, reason, details }) });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Erro ao enviar"); return; }
      setDone(true);
    });
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 20 }}>Denunciar empresa</h2>
      {done ? (
        <div>
          <div style={{ background: "#D1FAE5", color: S.green, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14 }}>Denúncia enviada com sucesso. Nossa equipe irá analisar.</div>
          <button onClick={onClose} style={{ background: S.primary, color: S.white, border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>Fechar</button>
        </div>
      ) : (
        <>
          {err && <div style={{ background: "#FEE2E2", color: S.red, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{err}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 8 }}>Motivo *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reasons.map((r) => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                  <span style={{ fontSize: 14, color: S.text }}>{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 6 }}>Detalhes adicionais</label>
            <textarea rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${S.border}`, fontSize: 14, color: S.text, resize: "vertical", boxSizing: "border-box" }} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Descreva brevemente..." />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button onClick={submit} disabled={pending} style={{ background: S.red, color: S.white, border: "none", borderRadius: 8, padding: "10px 20px", cursor: pending ? "not-allowed" : "pointer", fontWeight: 600, opacity: pending ? 0.6 : 1 }}>
              {pending ? "Enviando…" : "Enviar denúncia"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CompanyProfileContent({ company, complaints, projects, stats, isMember, isLoggedIn, initialTab }: {
  company: Company; complaints: Complaint[]; projects: Project[]; stats: Stats; isMember: boolean; isLoggedIn: boolean; initialTab: string;
}) {
  const tabMap: Record<string, string> = { overview: "overview", complaints: "complaints", info: "info", projects: "projects" };
  const [tab, setTab] = useState(tabMap[initialTab] ?? "overview");
  const [reportOpen, setReportOpen] = useState(false);

  const isVerified = !!company.verifiedAt;
  const loc = [company.city, company.state].filter(Boolean).join(", ");

  const tabs = [
    { key: "overview", label: "Início" },
    { key: "complaints", label: `Reclamações (${stats.totalComplaints})` },
    { key: "info", label: "Informações" },
    { key: "projects", label: `Projetos (${stats.activeProjectsCount})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${S.purple} 0%, #3A1F9E 60%, ${S.primary} 100%)`, padding: "36px 24px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: S.white, fontWeight: 700, flexShrink: 0 }}>
              {String(company.name ?? "E").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: S.white, margin: 0 }}>{String(company.name ?? "")}</h1>
                {isVerified && <span style={{ background: S.green, color: S.white, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>VERIFICADA</span>}
                {isMember && <span style={{ background: "rgba(255,255,255,0.25)", color: S.white, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>MEMBRO</span>}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                {[company.sector, loc].filter(Boolean).join(" · ") || "Perfil público"}
              </div>
            </div>
            {isMember && (
              <a href="/app/company/dashboard" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "8px 16px", whiteSpace: "nowrap" }}>
                Painel da empresa →
              </a>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 18px", background: tab === t.key ? S.white : "transparent", color: tab === t.key ? S.purple : "rgba(255,255,255,0.75)", border: "none", borderRadius: "10px 10px 0 0", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 60px" }}>
        {tab === "overview" && <OverviewTab company={company} stats={stats} complaints={complaints} projects={projects} isLoggedIn={isLoggedIn} onReport={() => setReportOpen(true)} />}
        {tab === "complaints" && <ReclamacoesTab complaints={complaints} isLoggedIn={isLoggedIn} companyId={String(company.id)} />}
        {tab === "info" && <InformacoesTab company={company} />}
        {tab === "projects" && <ProjetosTab projects={projects} />}
      </div>

      {reportOpen && <ReportModal companyId={String(company.id)} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
