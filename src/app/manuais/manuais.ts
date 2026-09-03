/**
 * The end-user manual family. Portuguese on purpose: these are read by the people
 * using the platform, so they are product content, not repository prose — the
 * divergence `docs/architecture/ARCHITECTURE.md` records under `product language`.
 *
 * `MANUAL_PLATAFORMA.html` is not listed as a rendered page. It is a complete
 * standalone document that a browser renders as-is, so it is linked straight at its
 * static URL instead of being parsed and re-rendered.
 */
export interface Manual {
  slug: string;
  file: string;
  title: string;
  audience: string;
  summary: string;
}

/** The five Markdown manuals, rendered as pages under `/manuais/<slug>`. */
export const MANUAIS: Manual[] = [
  {
    slug: "leia-me-primeiro",
    file: "LEIA_ME_PRIMEIRO.md",
    title: "Leia-me primeiro",
    audience: "Qualquer pessoa",
    summary: "Por onde começar, e para onde ir depois. É a porta de entrada da documentação.",
  },
  {
    slug: "guia-rapido",
    file: "GUIA_RAPIDO.md",
    title: "Guia rápido",
    audience: "Suporte e primeiro uso",
    summary: "O caminho curto: as tarefas mais comuns, sem contexto extra.",
  },
  {
    slug: "indice",
    file: "INDICE_DOCUMENTACAO.md",
    title: "Índice da documentação",
    audience: "Quem procura um documento específico",
    summary: "Roteia o leitor por público — pessoa, empresa, moderação e gestão.",
  },
  {
    slug: "fluxos-visuais",
    file: "FLUXOS_VISUAIS.md",
    title: "Fluxos visuais",
    audience: "Quem quer ver o caminho inteiro",
    summary: "Os fluxos da plataforma desenhados passo a passo.",
  },
  {
    slug: "manual-da-plataforma",
    file: "MANUAL_PLATAFORMA.md",
    title: "Manual da plataforma",
    audience: "Referência completa",
    summary: "O manual inteiro. Mesmo conteúdo da versão HTML, em página navegável.",
  },
];

/** The HTML manual, served as a static file rather than re-rendered. */
export const MANUAL_HTML = {
  file: "MANUAL_PLATAFORMA.html",
  href: "/manuais/MANUAL_PLATAFORMA.html",
  title: "Manual da plataforma (HTML)",
  summary: "Documento completo, abre direto no navegador e pode ser salvo ou impresso.",
};

export function findManual(slug: string): Manual | undefined {
  return MANUAIS.find((m) => m.slug === slug);
}
