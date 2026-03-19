"use client";

import { companyTheme as S } from "./theme";
import { TagChip } from "./TagChip";

/** region = região macro; tags = array de áreas como #Rodovia, #Hidrovia (ou sector como fallback) */
export function CompanyAreasCard({
  region,
  tags,
  sector,
}: {
  region?: string | null;
  tags?: string[];
  sector?: string | null;
}) {
  const tagList = tags?.length
    ? tags
    : sector
      ? [sector]
      : [];
  if (!region && !tagList.length) return null;

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
        Áreas de atuação
      </div>
      {region && (
        <div style={{ fontSize: 14, color: S.text, marginBottom: tagList.length ? 10 : 0 }}>
          Região: <strong>{region}</strong>
        </div>
      )}
      {tagList.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tagList.map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </div>
      )}
    </div>
  );
}
