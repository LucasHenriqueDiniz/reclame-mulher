"use client";

import { companyTheme as S } from "./theme";
import { formatCnpj, formatDate } from "./utils";

type CompanyAbout = {
  description?: string | null;
  cnpj?: string | null;
  corporateName?: string | null;
  createdAt?: string | null;
  foundationDate?: string | null;
  name?: string | null;
};

type CompanyStats = {
  activeProjectsCount?: number;
};

export function CompanyAboutCard({
  company,
  stats,
}: {
  company: CompanyAbout;
  stats?: CompanyStats;
}) {
  const cnpjFormatted = formatCnpj(company.cnpj);
  const registeredSince = company.createdAt
    ? formatDate(company.createdAt)
    : null;
  const foundationDate = company.foundationDate
    ? formatDate(String(company.foundationDate))
    : null;

  return (
    <div
      style={{
        background: S.white,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: S.muted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 12,
        }}
      >
        Sobre a empresa
      </div>
      {company.description && (
        <p
          style={{
            fontSize: 15,
            color: S.text,
            lineHeight: 1.7,
            margin: "0 0 16px 0",
          }}
        >
          {company.description}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {company.corporateName && (
          <Row label="Razão social" value={company.corporateName} />
        )}
        {cnpjFormatted && <Row label="CNPJ" value={cnpjFormatted} />}
        {registeredSince && (
          <Row label="Cadastrada desde" value={registeredSince} />
        )}
        {stats?.activeProjectsCount != null && (
          <Row
            label="Projetos em andamento"
            value={String(stats.activeProjectsCount)}
          />
        )}
        {foundationDate && (
          <Row label="Data de fundação" value={foundationDate} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        paddingBottom: 8,
        borderBottom: `1px solid ${S.border}`,
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 140,
          color: S.muted,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ color: S.text, fontWeight: 500, flex: 1 }}>{value}</div>
    </div>
  );
}
