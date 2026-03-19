"use client";

import { companyTheme as S } from "./theme";

type CompanyContacts = {
  email?: string | null;
  phone?: string | null;
  website?: string | null;
};

export function CompanyContactsCard({ company }: { company: CompanyContacts }) {
  const hasAny = company.email || company.phone || company.website;
  if (!hasAny) return null;

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
        Contatos
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {company.email && (
          <div style={{ fontSize: 14, color: S.text }}>
            <span style={{ color: S.muted, marginRight: 8 }}>E-mail:</span>
            <a
              href={`mailto:${company.email}`}
              style={{ color: S.primary, textDecoration: "none", fontWeight: 500 }}
            >
              {company.email}
            </a>
          </div>
        )}
        {company.phone && (
          <div style={{ fontSize: 14, color: S.text }}>
            <span style={{ color: S.muted, marginRight: 8 }}>Telefone:</span>
            <a
              href={`tel:${company.phone.replace(/\D/g, "")}`}
              style={{ color: S.primary, textDecoration: "none", fontWeight: 500 }}
            >
              {company.phone}
            </a>
          </div>
        )}
        {company.website && (
          <div style={{ fontSize: 14, color: S.text }}>
            <span style={{ color: S.muted, marginRight: 8 }}>Site:</span>
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: S.primary, textDecoration: "none", fontWeight: 500 }}
            >
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
