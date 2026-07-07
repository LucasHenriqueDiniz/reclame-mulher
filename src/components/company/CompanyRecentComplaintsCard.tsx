"use client";

import Link from "next/link";
import { companyTheme as S } from "./theme";
import { StatusBadge } from "./StatusBadge";
import { protocolId, formatDate } from "./utils";

export type ComplaintItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  /** Localização do problema (ex.: endereço ou cidade) */
  location?: string | null;
};

export function CompanyRecentComplaintsCard({
  complaints,
  viewAllHref,
}: {
  complaints: ComplaintItem[];
  companySlug?: string;
  viewAllHref?: string;
}) {

  return (
    <div
      style={{
        background: S.white,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: S.text,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Reclamações recentes
        </div>
        {viewAllHref && complaints.length > 0 && (
          <Link
            href={viewAllHref}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: S.primary,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Ver todas
            <span style={{ fontSize: 16 }}>→</span>
          </Link>
        )}
      </div>
      {complaints.length === 0 ? (
        <div 
          style={{ 
            fontSize: 14, 
            color: S.muted,
            padding: "32px 0",
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Nenhum relato público ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {complaints.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "16px 18px",
                background: S.light,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 0.2s ease",
                cursor: "pointer",
                border: `1px solid transparent`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F5F7FA";
                e.currentTarget.style.borderColor = S.border;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = S.light;
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: S.muted,
                      fontFamily: "monospace",
                      background: S.white,
                      borderRadius: 6,
                      padding: "3px 8px",
                      border: `1px solid ${S.border}`,
                    }}
                  >
                    {protocolId(c.id)}
                  </span>
                  <StatusBadge status={c.status} variant="complaint" />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: S.muted,
                    whiteSpace: "nowrap",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {formatDate(c.createdAt)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: S.text,
                  lineHeight: "1.5",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {c.title}
              </div>
              {c.location && (
                <div
                  style={{
                    fontSize: 13,
                    color: S.muted,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  <span style={{ fontSize: 12 }}>📍</span>
                  {c.location}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
