"use client";

import { companyTheme as S } from "./theme";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "./utils";

export type ProjectListItem = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
};

export function CompanyProjectList({
  projects,
  isLoggedIn,
  onComplaintClick,
  showActions,
  onEdit,
  onDelete,
}: {
  projects: ProjectListItem[];
  companyId?: string;
  isLoggedIn: boolean;
  onComplaintClick?: (projectId: string) => void;
  showActions?: boolean;
  onEdit?: (p: ProjectListItem) => void;
  onDelete?: (p: ProjectListItem) => void;
}) {
  if (projects.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: S.muted,
          fontSize: 14,
        }}
      >
        Nenhum projeto cadastrado.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            background: S.white,
            border: `1px solid ${S.border}`,
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: S.text,
                flex: 1,
              }}
            >
              {p.name}
            </div>
            <StatusBadge status={p.status} variant="project" />
          </div>
          {p.description && (
            <p
              style={{
                fontSize: 13,
                color: S.muted,
                margin: "0 0 8px 0",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {p.description}
            </p>
          )}
          {p.location && (
            <div
              style={{
                fontSize: 12,
                color: S.muted,
                marginBottom: 8,
              }}
            >
              📍 {p.location}
            </div>
          )}
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>
            {p.startDate && `Início: ${formatDate(p.startDate)}`}
            {p.startDate && p.endDate && " · "}
            {p.endDate && `Término: ${formatDate(p.endDate)}`}
          </div>
          {onComplaintClick && (
            <button
              type="button"
              onClick={() => onComplaintClick(p.id)}
              disabled={!isLoggedIn}
              style={{
                width: "100%",
                background: isLoggedIn ? S.primary : S.light,
                color: isLoggedIn ? S.white : S.muted,
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoggedIn ? "pointer" : "not-allowed",
              }}
            >
              Fazer um relato sobre este projeto
            </button>
          )}
          {showActions && onEdit && onDelete && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => onEdit(p)}
                style={{
                  fontSize: 12,
                  color: S.primary,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
                style={{
                  fontSize: 12,
                  color: S.red,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
