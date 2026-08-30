"use client";

import type { ReactNode } from "react";
import { MapPin, BarChart3, FileText } from "lucide-react";
import { companyTheme as S } from "./theme";
import type { CompanyBase } from "./utils";
import type { CompanyStats } from "./utils";

export type TabItem = { key: string; label: string; icon?: ReactNode };

export function CompanyProfileHero({
  company,
  stats,
  tabs,
  activeTab,
  onTabChange,
  isMember,
  dashboardLink,
  publicProfileLink,
  complaintCtaHref,
}: {
  company: CompanyBase;
  stats: CompanyStats;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  isMember?: boolean;
  dashboardLink?: string;
  publicProfileLink?: string;
  /** Link para "Iniciar um relato" (perfil público) */
  complaintCtaHref?: string;
}) {
  const isVerified = !!company.verifiedAt;
  const region = company.region ?? ([company.city, company.state].filter(Boolean).join(", ") || null);
  const projectsCount = stats.activeProjectsCount ?? 0;

  return (
    <div
      style={{
        background: S.primary,
        padding: "28px 24px 0",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: S.white,
              fontWeight: 700,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              String(company.name ?? "E").charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: S.white,
                  margin: 0,
                }}
              >
                {String(company.name ?? "")}
              </h1>
              {isVerified && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: S.white,
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  VERIFICADA
                </span>
              )}
              {isMember && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: S.white,
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  MEMBRO
                </span>
              )}
            </div>
            {region && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 2,
                }}
              >
                <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{region}</span>
              </div>
            )}
            {projectsCount >= 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <BarChart3 style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>
                  {projectsCount} {projectsCount === 1 ? "projeto" : "projetos"} em andamento
                </span>
              </div>
            )}
          </div>
          {dashboardLink && (
            <a
              href={dashboardLink}
              style={{
                color: S.white,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 8,
                padding: "8px 16px",
                whiteSpace: "nowrap",
              }}
            >
              Painel da empresa →
            </a>
          )}
          {publicProfileLink && (
            <a
              href={publicProfileLink}
              style={{
                color: S.white,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 8,
                padding: "8px 16px",
                whiteSpace: "nowrap",
              }}
            >
              Ver perfil público →
            </a>
          )}
          {complaintCtaHref && !dashboardLink && (
            <a
              href={complaintCtaHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: S.white,
                color: S.primary,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: 8,
                padding: "10px 18px",
                whiteSpace: "nowrap",
              }}
            >
              <FileText style={{ width: 18, height: 18 }} />
              Iniciar um relato
            </a>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: activeTab === t.key ? S.white : "transparent",
                color: activeTab === t.key ? S.primary : "rgba(255,255,255,0.85)",
                border: "none",
                borderRadius: "10px 10px 0 0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {t.icon != null && <span style={{ display: "flex" }}>{t.icon}</span>}
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
