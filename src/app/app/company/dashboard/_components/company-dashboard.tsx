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
type Stat = { totalComplaints: number; resolvedCases: number; unansweredCount: number; activeDialogsCount: number; avgResponseHours: number | null; resolutionRate: number; activeProjectsCount: number };
type Project = { id: string; name: string; description: string | null; location: string | null; status: string; startDate: string | null; endDate: string | null; createdAt: string };
type Complaint = { id: string; title: string; status: string; createdAt: string; updatedAt: string; author?: { name: string | null } | null; project?: { name: string } | null };

function statusLabel(s: string) {
  const m: Record<string, string> = { OPEN: "Aberta", RESPONDED: "Respondida", RESOLVED: "Resolvida", CANCELLED: "Cancelada", PENDING: "Pendente" };
  return m[s] ?? s;
}
function statusColor(s: string) {
  const m: Record<string, string> = { OPEN: S.muted, RESPONDED: S.yellow, RESOLVED: S.green, CANCELLED: S.orange, PENDING: S.muted };
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

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "20px 24px", flex: "1 1 160px" }}>
      <div style={{ fontSize: 13, color: S.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? S.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ background: color + "22", color, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: S.white, borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean }) {
  const style = { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${S.border}`, fontSize: 14, color: S.text, outline: "none", background: S.white, resize: "vertical" as const, boxSizing: "border-box" as const };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 6 }}>{label}</label>
      {textarea
        ? <textarea rows={3} style={style} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} style={style} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 6 }}>{label}</label>
      <select style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${S.border}`, fontSize: 14, color: S.text, background: S.white, boxSizing: "border-box" }} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ label, onClick, variant = "primary", disabled, small }: { label: string; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; small?: boolean }) {
  const bg = variant === "primary" ? S.primary : variant === "danger" ? S.red : "transparent";
  const color = variant === "ghost" ? S.primary : S.white;
  const border = variant === "ghost" ? `1px solid ${S.primary}` : "none";
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: bg, color, border, borderRadius: 8, padding: small ? "8px 16px" : "11px 22px", fontSize: small ? 13 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}>
      {label}
    </button>
  );
}

// ─── Reclamações Tab ──────────────────────────────────────────────────────────
function ReclamacoesTab({ complaints }: { complaints: Complaint[] }) {
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
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${filter === f.key ? S.primary : S.border}`, background: filter === f.key ? S.primary : S.white, color: filter === f.key ? S.white : S.text, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {f.label}
          </button>
        ))}
      </div>
      {visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.muted }}>Nenhuma reclamação encontrada.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((c) => (
          <div key={c.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: S.muted, fontFamily: "monospace", background: S.light, borderRadius: 4, padding: "2px 6px" }}>{protocolId(c.id)}</span>
                <Badge label={statusLabel(c.status)} color={statusColor(c.status)} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: S.text, marginBottom: 2 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: S.muted }}>
                {c.author?.name ?? "Anônima"} · {fmt(c.createdAt)}
                {c.project && ` · Projeto: ${c.project.name}`}
              </div>
            </div>
            <a href={`/app/complaints/${c.id}`} style={{ color: S.primary, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>Ver →</a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Projetos Tab ─────────────────────────────────────────────────────────────
function ProjetosTab({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", location: "", status: "PLANNING", start_date: "", end_date: "" });
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  function openAdd() { setForm({ name: "", description: "", location: "", status: "PLANNING", start_date: "", end_date: "" }); setEditing(null); setShowModal(true); }
  function openEdit(p: Project) { setForm({ name: p.name, description: p.description ?? "", location: p.location ?? "", status: p.status, start_date: p.startDate?.slice(0, 10) ?? "", end_date: p.endDate?.slice(0, 10) ?? "" }); setEditing(p); setShowModal(true); }

  function save() {
    setErr("");
    if (!form.name.trim()) { setErr("Nome obrigatório"); return; }
    start(async () => {
      const url = editing ? `/api/company/projects/${editing.id}` : "/api/company/projects";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Erro"); return; }
      const d = await res.json();
      if (editing) setProjects((prev) => prev.map((p) => p.id === editing.id ? { ...d.project, startDate: d.project.startDate, endDate: d.project.endDate } : p));
      else setProjects((prev) => [...prev, { ...d.project }]);
      setShowModal(false);
    });
  }

  function remove(p: Project) {
    start(async () => {
      const res = await fetch(`/api/company/projects/${p.id}`, { method: "DELETE" });
      if (res.ok) { setProjects((prev) => prev.filter((x) => x.id !== p.id)); setDeleting(null); }
    });
  }

  const statusOpts = [
    { value: "PLANNING", label: "Planejamento" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Btn label="+ Novo Projeto" onClick={openAdd} />
      </div>
      {projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: S.muted }}>Nenhum projeto cadastrado. Adicione o primeiro!</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {projects.map((p) => (
          <div key={p.id} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.text, flex: 1 }}>{p.name}</div>
              <Badge label={projectStatusLabel(p.status)} color={projectStatusColor(p.status)} />
            </div>
            {p.description && <div style={{ fontSize: 13, color: S.muted, marginBottom: 8 }}>{p.description}</div>}
            {p.location && <div style={{ fontSize: 12, color: S.muted, marginBottom: 8 }}>📍 {p.location}</div>}
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>
              {p.startDate && `Início: ${fmt(p.startDate)}`}
              {p.startDate && p.endDate && " · "}
              {p.endDate && `Término: ${fmt(p.endDate)}`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(p)} style={{ fontSize: 12, color: S.primary, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>Editar</button>
              <button onClick={() => setDeleting(p)} style={{ fontSize: 12, color: S.red, background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 20 }}>{editing ? "Editar Projeto" : "Novo Projeto"}</h2>
          {err && <div style={{ background: "#FEE2E2", color: S.red, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{err}</div>}
          <Input label="Nome do projeto *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Input label="Descrição" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} textarea />
          <Input label="Local / Cidade" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} placeholder="Ex: São Paulo, SP" />
          <Select label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={statusOpts} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Data de início" value={form.start_date} onChange={(v) => setForm((f) => ({ ...f, start_date: v }))} type="date" />
            <Input label="Data de término" value={form.end_date} onChange={(v) => setForm((f) => ({ ...f, end_date: v }))} type="date" />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn label="Cancelar" variant="ghost" onClick={() => setShowModal(false)} />
            <Btn label={editing ? "Salvar" : "Criar"} disabled={pending} onClick={save} />
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 12 }}>Excluir projeto?</h2>
          <p style={{ color: S.muted, marginBottom: 24 }}>O projeto <strong>{deleting.name}</strong> será excluído permanentemente. Esta ação não pode ser desfeita.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Btn label="Cancelar" variant="ghost" onClick={() => setDeleting(null)} />
            <Btn label="Excluir" variant="danger" disabled={pending} onClick={() => remove(deleting)} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Configurações Tab ────────────────────────────────────────────────────────
function ConfiguracoesTab({ company }: { company: Company }) {
  const [subTab, setSubTab] = useState("dados");
  const subTabs = [
    { key: "dados", label: "Dados" },
    { key: "senha", label: "Senha" },
    { key: "verificar", label: "Verificação" },
    { key: "deletar", label: "Excluir conta" },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", borderBottom: `1px solid ${S.border}`, paddingBottom: 12 }}>
        {subTabs.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{ padding: "7px 18px", borderRadius: 20, border: "none", background: subTab === t.key ? S.purple + "18" : "transparent", color: subTab === t.key ? S.purple : S.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "dados" && <DadosTab company={company} />}
      {subTab === "senha" && <SenhaTab />}
      {subTab === "verificar" && <VerificarTab company={company} />}
      {subTab === "deletar" && <DeletarTab />}
    </div>
  );
}

function DadosTab({ company }: { company: Company }) {
  const [form, setForm] = useState({
    name: String(company.name ?? ""),
    corporateName: String(company.corporateName ?? ""),
    email: String(company.email ?? ""),
    phone: String(company.phone ?? ""),
    website: String(company.website ?? ""),
    description: String(company.description ?? ""),
    address: String(company.address ?? ""),
    neighborhood: String(company.neighborhood ?? ""),
    streetNumber: String(company.streetNumber ?? ""),
    city: String(company.city ?? ""),
    state: String(company.state ?? ""),
    region: String(company.region ?? ""),
    sector: String(company.sector ?? ""),
    responsibleName: String(company.responsibleName ?? ""),
    responsibleEmail: String(company.responsibleEmail ?? ""),
    contactPhone: String(company.contactPhone ?? ""),
  });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function f(k: keyof typeof form) { return { value: form[k], onChange: (v: string) => setForm((p) => ({ ...p, [k]: v })) }; }

  function save() {
    setMsg(""); setErr("");
    start(async () => {
      const res = await fetch("/api/company/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Erro ao salvar"); return; }
      setMsg("Dados atualizados com sucesso!");
    });
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>Informações da empresa</h3>
      {msg && <div style={{ background: "#D1FAE5", color: S.green, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: "#FEE2E2", color: S.red, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{err}</div>}
      <Input label="Nome fantasia" {...f("name")} />
      <Input label="Razão social" {...f("corporateName")} />
      <Input label="E-mail da empresa" {...f("email")} type="email" />
      <Input label="Telefone" {...f("phone")} />
      <Input label="Site" {...f("website")} placeholder="https://..." />
      <Input label="Descrição" {...f("description")} textarea />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: "24px 0 16px" }}>Endereço</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
        <Input label="Logradouro" {...f("address")} />
        <Input label="Número" {...f("streetNumber")} />
      </div>
      <Input label="Bairro" {...f("neighborhood")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 12 }}>
        <Input label="Cidade" {...f("city")} />
        <Input label="UF" {...f("state")} placeholder="SP" />
      </div>
      <Input label="Região" {...f("region")} placeholder="Ex: Sudeste" />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: "24px 0 16px" }}>Contato responsável</h3>
      <Input label="Nome do responsável" {...f("responsibleName")} />
      <Input label="E-mail do responsável" {...f("responsibleEmail")} type="email" />
      <Input label="Telefone de contato" {...f("contactPhone")} />
      <Input label="Setor de atuação" {...f("sector")} placeholder="Ex: Varejo, Saúde…" />
      <div style={{ marginTop: 8 }}>
        <Btn label={pending ? "Salvando…" : "Salvar alterações"} disabled={pending} onClick={save} />
      </div>
    </div>
  );
}

function SenhaTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function change() {
    setMsg(""); setErr("");
    if (form.next !== form.confirm) { setErr("As senhas não coincidem"); return; }
    if (form.next.length < 8) { setErr("Mínimo 8 caracteres"); return; }
    start(async () => {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }) });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Erro"); return; }
      setMsg("Senha alterada com sucesso!");
      setForm({ current: "", next: "", confirm: "" });
    });
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>Alterar senha</h3>
      {msg && <div style={{ background: "#D1FAE5", color: S.green, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: "#FEE2E2", color: S.red, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{err}</div>}
      <Input label="Senha atual" value={form.current} onChange={(v) => setForm((p) => ({ ...p, current: v }))} type="password" />
      <Input label="Nova senha" value={form.next} onChange={(v) => setForm((p) => ({ ...p, next: v }))} type="password" />
      <Input label="Confirmar nova senha" value={form.confirm} onChange={(v) => setForm((p) => ({ ...p, confirm: v }))} type="password" />
      <Btn label={pending ? "Alterando…" : "Alterar senha"} disabled={pending} onClick={change} />
    </div>
  );
}

function VerificarTab({ company }: { company: Company }) {
  const isVerified = !!company.verifiedAt;
  return (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>Verificação da empresa</h3>
      <div style={{ background: isVerified ? "#D1FAE5" : S.light, border: `1px solid ${isVerified ? S.green : S.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: isVerified ? S.green : S.text, marginBottom: 8 }}>
          {isVerified ? "✓ Empresa verificada" : "Sua empresa ainda não foi verificada"}
        </div>
        <div style={{ fontSize: 14, color: S.muted }}>
          {isVerified
            ? `Verificada em ${company.verifiedAt}. O selo de empresa verificada é exibido no seu perfil público.`
            : "Empresas verificadas recebem um selo no perfil público e têm mais visibilidade na plataforma."}
        </div>
      </div>
      {!isVerified && (
        <>
          <p style={{ fontSize: 14, color: S.text, marginBottom: 12, lineHeight: 1.6 }}>Para solicitar a verificação, siga os passos:</p>
          <ol style={{ paddingLeft: 20, color: S.muted, fontSize: 14, lineHeight: 1.8 }}>
            <li>Preencha todos os dados da empresa (CNPJ, endereço, responsável)</li>
            <li>Envie e-mail para <strong>verificacao@comunicamulher.com.br</strong> com o assunto <em>Verificação de empresa</em></li>
            <li>Anexe cópia do Cartão CNPJ e documento do responsável</li>
            <li>Nossa equipe analisará em até 5 dias úteis</li>
          </ol>
        </>
      )}
    </div>
  );
}

function DeletarTab() {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function schedule() {
    start(async () => {
      const res = await fetch("/api/company/profile", { method: "DELETE" });
      if (res.ok) { setDone(true); }
    });
  }

  if (done) return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ background: "#FEF3C7", border: `1px solid ${S.yellow}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 700, color: S.orange, marginBottom: 8 }}>Exclusão agendada</div>
        <p style={{ fontSize: 14, color: S.text }}>Sua conta será excluída definitivamente em 90 dias. Até lá, você pode reativar sua conta a qualquer momento fazendo login.</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.red, marginBottom: 16 }}>Excluir conta da empresa</h3>
      <div style={{ background: "#FEE2E2", border: `1px solid ${S.red}22`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: S.text, lineHeight: 1.6, margin: 0 }}>
          Ao excluir a conta, todos os dados da empresa, projetos e histórico de respostas serão ocultados do perfil público. A conta será permanentemente excluída após <strong>90 dias</strong>.
        </p>
      </div>
      {!confirm ? (
        <Btn label="Quero excluir minha conta" variant="danger" onClick={() => setConfirm(true)} />
      ) : (
        <div>
          <p style={{ fontSize: 14, color: S.text, marginBottom: 16 }}>Tem certeza? Esta ação agendará a exclusão definitiva da conta.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn label="Cancelar" variant="ghost" onClick={() => setConfirm(false)} />
            <Btn label={pending ? "Processando…" : "Confirmar exclusão"} variant="danger" disabled={pending} onClick={schedule} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function CompanyDashboard({ company, stats, projects, complaints, initialTab }: {
  company: Company; stats: Stat; projects: Project[]; complaints: Complaint[]; initialTab: string;
}) {
  const tabMap: Record<string, string> = { complaints: "complaints", projects: "projects", settings: "settings" };
  const [tab, setTab] = useState(tabMap[initialTab] ?? "complaints");

  const tabs = [
    { key: "complaints", label: "Reclamações" },
    { key: "projects", label: "Projetos" },
    { key: "settings", label: "Configurações" },
  ];

  const isVerified = !!company.verifiedAt;
  const loc = [company.city, company.state].filter(Boolean).join(", ");

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${S.purple} 0%, #3A1F9E 60%, ${S.primary} 100%)`, padding: "36px 24px 0", position: "relative" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: S.white, fontWeight: 700 }}>
              {String(company.name ?? "E").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: S.white, margin: 0 }}>{String(company.name ?? "Empresa")}</h1>
                {isVerified && <span style={{ background: S.green, color: S.white, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>VERIFICADA</span>}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                {[company.sector, loc].filter(Boolean).join(" · ") || "Painel da empresa"}
              </div>
            </div>
            <a href={`/company/${company.slug ?? company.id}`} style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "8px 16px", whiteSpace: "nowrap" }}>
              Ver perfil público →
            </a>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginTop: 24 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", background: tab === t.key ? S.white : "transparent", color: tab === t.key ? S.purple : "rgba(255,255,255,0.75)", border: "none", borderRadius: "10px 10px 0 0", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard label="Reclamações recebidas" value={stats.totalComplaints} />
          <StatCard label="Casos resolvidos" value={stats.resolvedCases} color={S.green} />
          <StatCard label="Sem resposta" value={stats.unansweredCount} color={stats.unansweredCount > 0 ? S.red : S.text} />
          <StatCard label="Taxa de resolução" value={`${stats.resolutionRate}%`} sub={stats.avgResponseHours != null ? `Resp. média: ${stats.avgResponseHours}h` : undefined} color={stats.resolutionRate >= 70 ? S.green : S.orange} />
          <StatCard label="Projetos ativos" value={stats.activeProjectsCount} color={S.primary} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 48px" }}>
        {tab === "complaints" && <ReclamacoesTab complaints={complaints} />}
        {tab === "projects" && <ProjetosTab initial={projects} />}
        {tab === "settings" && <ConfiguracoesTab company={company} />}
      </div>
    </div>
  );
}
