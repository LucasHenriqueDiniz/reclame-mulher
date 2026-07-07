"use client";

import { companyTheme as S } from "./theme";

const COMPLAINT_LABELS: Record<string, string> = {
  OPEN: "Aberta",
  RESPONDED: "Respondida",
  RESOLVED: "Resolvida",
  CANCELLED: "Cancelada",
  PENDING: "Pendente",
};

const COMPLAINT_COLORS: Record<string, string> = {
  OPEN: S.muted,
  RESPONDED: S.yellow,
  RESOLVED: S.green,
  CANCELLED: S.orange,
  PENDING: S.muted,
};

const PROJECT_LABELS: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const PROJECT_COLORS: Record<string, string> = {
  PLANNING: S.muted,
  IN_PROGRESS: S.primary,
  COMPLETED: S.green,
  CANCELLED: S.orange,
};

type Variant = "complaint" | "project";

export function StatusBadge({
  status,
  variant = "complaint",
}: {
  status: string;
  variant?: Variant;
}) {
  const labels = variant === "complaint" ? COMPLAINT_LABELS : PROJECT_LABELS;
  const colors = variant === "complaint" ? COMPLAINT_COLORS : PROJECT_COLORS;
  const label = labels[status] ?? status;
  const color = colors[status] ?? S.muted;

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      style={{
        background: color + "22",
        color,
        borderRadius: 6,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
