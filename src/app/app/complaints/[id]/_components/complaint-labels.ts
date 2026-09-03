/**
 * Display labels for the complaint detail view, lifted out of
 * `complaint-detail-content.tsx` so they can be tested without rendering a client
 * component — the Vitest environment is `node`, so a pure module is the only part of
 * that file a unit test can reach.
 *
 * The strings are Portuguese on purpose. `docs/architecture/ARCHITECTURE.md` records
 * user-visible JSX text as a product literal rather than prose, so it is exempt from
 * the English-only rule that governs the code and comments around it.
 *
 * These are deliberately local to this route and not shared with
 * `src/app/app/company/complaints/[id]/_components/company-complaint-detail-content.tsx`,
 * which keeps its own maps: that one renders `RESOLVED` as "Resolvida" where this one
 * renders "Concluído", so merging the two would change what a page displays.
 */

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Em aberto",
  RESPONDED: "Respondida",
  RESOLVED: "Concluído",
  CANCELLED: "Cancelada",
};

/**
 * One map for three columns — `impactCategory`, `urgencyLevel` and `impactScope`. All
 * three are plain `text` in the schema, not enums, and their value sets do not overlap,
 * so a single lookup table serves all three without a key colliding.
 */
const CATEGORY_LABELS: Record<string, string> = {
  meio_ambiente: "Meio Ambiente",
  seguranca: "Segurança",
  infraestrutura: "Infraestrutura",
  social: "Social",
  economico: "Econômico",
  outro: "Outro",
  poluicao_sonora: "Poluição Sonora",
  horario_obras: "Horário de obras",
  individual: "Individual",
  comunitario: "Comunitário",
  regional: "Regional",
  nacional: "Nacional",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  emergencial: "Emergencial",
};

/**
 * The complaint status, as a label. Falls back to the raw status rather than to
 * `undefined`, because the result is rendered straight into the banner: a status the map
 * has not caught up with has to show as itself instead of vanishing from the page.
 */
export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

/**
 * A category, urgency or scope value, as a label. Same fallback as `statusLabel`, and it
 * is not hypothetical here: `impactCategory` is a free-text column, and the new-complaint
 * form already writes two values this map has no entry for (`saude` and `familiar`), so
 * the fallback is the path those two take today.
 */
export function categoryLabel(value: string) {
  return CATEGORY_LABELS[value] ?? value;
}
