"use client";

import Link from "next/link";
import { companyTheme as S } from "./theme";
import { StatusBadge } from "./StatusBadge";
import { protocolId, formatDate } from "./utils";

export type ComplaintListItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  isAnonymous?: boolean;
  author?: { name: string | null } | null;
  project?: { name: string } | null;
  location?: string | null;
};

export function CompanyComplaintList({
  complaints,
  detailBasePath = "/app/complaints",
  showAuthor = true,
}: {
  complaints: ComplaintListItem[];
  detailBasePath?: string;
  showAuthor?: boolean;
}) {
  if (complaints.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: S.muted,
          fontSize: 14,
        }}
      >
        Nenhum relato encontrado.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {complaints.map((c) => (
        <div
          key={c.id}
          style={{
            background: S.white,
            border: `1px solid ${S.border}`,
            borderRadius: 12,
            padding: "16px 20px",
            boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: S.muted,
                    fontFamily: "monospace",
                    background: S.light,
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {protocolId(c.id)}
                </span>
                <StatusBadge status={c.status} variant="complaint" />
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: S.text,
                  marginBottom: 3,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 12, color: S.muted }}>
                {showAuthor &&
                  (c.isAnonymous
                    ? "Autora anônima"
                    : c.author?.name ?? "—")}
                {" · "}
                {formatDate(c.createdAt)}
                {c.project && ` · Projeto: ${c.project.name}`}
                {c.location && ` · ${c.location}`}
              </div>
            </div>
            <Link
              href={`${detailBasePath}/${c.id}`}
              style={{
                color: S.primary,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded px-2 py-1"
              aria-label={`Ver detalhes da reclamação ${c.title}`}
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
