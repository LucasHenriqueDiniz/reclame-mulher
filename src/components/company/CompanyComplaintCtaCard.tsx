"use client";

import { FileText } from "lucide-react";
import { companyTheme as S } from "./theme";

export function CompanyComplaintCtaCard({
  companyId,
  companyName,
  isLoggedIn,
}: {
  companyId: string;
  companyName?: string;
  isLoggedIn: boolean;
}) {
  const href = isLoggedIn
    ? `/app/complaints/new?company=${companyId}`
    : "/login";
  const label = isLoggedIn ? "Iniciar um relato" : "Entrar para relatar";
  const title = companyName
    ? `Teve algum problema com a ${companyName}?`
    : "Teve algum problema com a empresa?";

  return (
    <div
      style={{
        background: S.primary,
        border: `1px solid ${S.primary}`,
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 700,
            color: S.white,
            marginBottom: 6,
            fontSize: 16,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
          Sua voz é importante. Registre sua experiência e ajude a melhorar a relação entre a comunidade e as empresas de infraestrutura.
        </div>
      </div>
      <a
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: S.white,
          color: S.primary,
          borderRadius: 10,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        <FileText style={{ width: 18, height: 18 }} />
        {label}
      </a>
    </div>
  );
}
