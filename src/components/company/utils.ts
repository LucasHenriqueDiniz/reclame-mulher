export function formatCnpj(cnpj: string | null | undefined): string {
  if (cnpj == null || cnpj === "") return "";
  const digits = String(cnpj).replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function protocolId(id: string): string {
  const raw = id.replace(/-/g, "").toUpperCase().slice(0, 8);
  return `#R-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export type CompanyBase = {
  id: string;
  name: string | null;
  logoUrl?: string | null;
  verifiedAt?: string | null;
  region?: string | null;
  city?: string | null;
  state?: string | null;
  sector?: string | null;
  slug?: string | null;
};

export type CompanyStats = {
  totalComplaints: number;
  resolvedCases: number;
  unansweredCount: number;
  activeDialogsCount: number;
  avgResponseHours: number | null;
  resolutionRate: number;
  activeProjectsCount: number;
};
