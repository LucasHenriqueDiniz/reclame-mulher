"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, FileText, Plus, CalendarDays, ChevronRight } from "lucide-react";

const PRIMARY = "#2189E5";
const PURPLE = "#1E0F62";
const TEXT = "#2E435B";
const MUTED = "#6E8195";
const BORDER = "#D9E3EC";
const BG = "#F4F6F8";

type Status = "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  company: { name: string | null };
  project: { name: string } | null;
}

interface Props {
  complaints: Complaint[];
  profileName: string;
  profileCity: string | null;
  profileState: string | null;
  avatarUrl: string | null;
}

const STATUS_CONFIG: Record<Status, { label: string; style: React.CSSProperties }> = {
  OPEN: {
    label: "Esperando Resposta",
    style: { background: "#F1F5F9", color: "#64748B", border: "1px solid #CBD5E1" },
  },
  RESPONDED: {
    label: "Em Réplica",
    style: { background: "#FEFCE8", color: "#854D0E", border: "1px solid #FDE047" },
  },
  RESOLVED: {
    label: "Resolvido",
    style: { background: "#DCFCE7", color: "#166534", border: "1px solid #86EFAC" },
  },
  CANCELLED: {
    label: "Não-Resolvido",
    style: { background: "#FFF7ED", color: "#9A3412", border: "1px solid #FDBA74" },
  },
};

type Filter = "all" | "OPEN" | "RESPONDED" | "RESOLVED";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Últimas" },
  { key: "OPEN", label: "Não Respondidas" },
  { key: "RESPONDED", label: "Respondidas" },
  { key: "RESOLVED", label: "Concluídas" },
];

function formatProtocol(id: string) {
  const hash = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `#R-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        ...cfg.style,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        border: "4px solid #fff",
        overflow: "hidden",
        background: PRIMARY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  );
}

export function ComplaintsContent({ complaints, profileName, profileCity, profileState, avatarUrl }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filtered = complaints.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "RESOLVED") return c.status === "RESOLVED" || c.status === "CANCELLED";
    return c.status === activeFilter;
  });

  const location = [profileCity, profileState].filter(Boolean).join(", ");

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 48 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* ── Profile Hero Card ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Blue banner */}
          <div style={{ height: 96, background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a6fc9 100%)` }} />

          {/* Content below banner */}
          <div style={{ padding: "0 28px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44 }}>
              {/* Avatar + info */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                <Avatar name={profileName} avatarUrl={avatarUrl} />
                <div style={{ paddingBottom: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: PURPLE, margin: 0 }}>{profileName}</h2>
                  <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                    {location && (
                      <span style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={13} />
                        {location}
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                      <FileText size={13} />
                      {complaints.length} {complaints.length === 1 ? "reclamação" : "reclamações"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <div style={{ paddingBottom: 12 }}>
                <Link href="/app/complaints/new" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      background: PRIMARY,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Plus size={16} />
                    Nova reclamação
                  </button>
                </Link>
              </div>
            </div>

            {/* Profile tabs navigation */}
            <div style={{ display: "flex", gap: 0, marginTop: 16, borderTop: `1px solid ${BORDER}` }}>
              {[
                { label: "Reclamações", href: "/app/complaints", active: true },
                { label: "Configurações", href: "/app/settings", active: false },
              ].map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  style={{
                    textDecoration: "none",
                    padding: "14px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: tab.active ? PRIMARY : MUTED,
                    borderBottom: tab.active ? `2px solid ${PRIMARY}` : "2px solid transparent",
                    marginBottom: -1,
                    transition: "color 0.15s",
                  }}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Complaint list card ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, marginTop: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "16px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeFilter === f.key ? PRIMARY : MUTED,
                  borderBottom: activeFilter === f.key ? `2px solid ${PRIMARY}` : "2px solid transparent",
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <FileText size={24} color={MUTED} />
              </div>
              <p style={{ color: TEXT, fontWeight: 600, fontSize: 16, margin: 0 }}>Nenhuma reclamação encontrada</p>
              <p style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>Você ainda não fez nenhuma reclamação nesta categoria.</p>
              <Link href="/app/complaints/new" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: 20,
                    background: PRIMARY,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Plus size={16} />
                  Começar uma nova reclamação
                </button>
              </Link>
            </div>
          ) : (
            <div>
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    padding: "20px 24px",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    justifyContent: "space-between",
                  }}
                >
                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span
                        style={{
                          background: "#EEF5FF",
                          color: PRIMARY,
                          border: `1px solid #BFDBFE`,
                          borderRadius: 20,
                          padding: "2px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {formatProtocol(c.id)}
                      </span>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
                        {c.title}
                      </h3>
                    </div>

                    <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                        <CalendarDays size={13} />
                        {formatDate(c.createdAt)}
                      </span>
                      {c.company?.name && (
                        <span style={{ fontSize: 13, color: MUTED }}>
                          Empresa: <strong style={{ color: TEXT }}>{c.company.name}</strong>
                        </span>
                      )}
                      {c.project?.name && (
                        <span style={{ fontSize: 13, color: MUTED }}>
                          Obra: <strong style={{ color: TEXT }}>{c.project.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: status + link */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <StatusBadge status={c.status} />
                    <Link
                      href={`/app/complaints/${c.id}`}
                      style={{
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 600,
                        color: PRIMARY,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Ver detalhes
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
