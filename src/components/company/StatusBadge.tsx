"use client";

import { companyTheme as S } from "./theme";
import { complaintStatusLabel } from "@/lib/constants/complaint-status";

// Só as cores ficam aqui: este selo é o desenho do tema da empresa, mais
// suave que o do detalhe da reclamação. O texto vem de
// `@/lib/constants/complaint-status`, que é o único mapa de rótulos do
// repositório desde a task `54`.
const COMPLAINT_COLORS: Record<string, string> = {
  OPEN: S.muted,
  RESPONDED: S.yellow,
  RESOLVED: S.green,
  CANCELLED: S.orange,
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
  const colors = variant === "complaint" ? COMPLAINT_COLORS : PROJECT_COLORS;
  const label =
    variant === "complaint"
      ? complaintStatusLabel(status)
      : (PROJECT_LABELS[status] ?? status);
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
