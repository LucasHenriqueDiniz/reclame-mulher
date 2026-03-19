"use client";

import { companyTheme as S } from "./theme";
import type { CompanyStats } from "./utils";

export function CompanyPerformanceCard({ stats }: { stats: CompanyStats }) {
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
          marginBottom: 16,
        }}
      >
        Desempenho
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
        }}
      >
        <Item label="Total de reclamações" value={stats.totalComplaints} />
        <Item
          label="Casos resolvidos"
          value={stats.resolvedCases}
          color={S.green}
        />
        <Item
          label="Não respondidas"
          value={stats.unansweredCount}
          color={stats.unansweredCount > 0 ? S.red : undefined}
        />
        <Item
          label="Tempo médio de resposta"
          value={
            stats.avgResponseHours != null
              ? `${stats.avgResponseHours}h`
              : "-"
          }
        />
        <Item
          label="Taxa de resolução"
          value={`${stats.resolutionRate}%`}
          color={stats.resolutionRate >= 70 ? S.green : S.orange}
        />
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: color ?? S.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}
