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

/**
 * What a company with no answered complaint shows where its average response time goes.
 *
 * `CompaniesRepo.getStats` returns null — not zero — for that company, and every call site
 * used to fall back to a bare "-", which reads as a rendering failure rather than as an
 * absence. The two formatters below share this constant so the three places that display
 * the metric cannot drift apart on what "no data" is called.
 */
const NO_RESPONSE_HISTORY = "Sem histórico";

/**
 * The average response time for a slot that already carries its own label, such as a
 * metric tile reading "Tempo médio de resposta". Just the value, since the label supplies
 * the noun.
 *
 * Callers that need to restyle the empty case — a two-word placeholder does not fit type
 * sized for "43h" — should test `avgResponseHours == null` themselves rather than compare
 * against the returned string.
 */
export function responseTimeValue(avgResponseHours: number | null) {
  return avgResponseHours == null ? NO_RESPONSE_HISTORY : `${avgResponseHours}h`;
}

/**
 * The average response time as a standalone sentence, for a line that has no label of its
 * own — the icon row in the complaint detail sidebar, where the text has to say what the
 * number means.
 */
export function responseTimeLabel(avgResponseHours: number | null) {
  return avgResponseHours == null
    ? `${NO_RESPONSE_HISTORY} de resposta`
    : `Resposta em ${avgResponseHours}h`;
}
