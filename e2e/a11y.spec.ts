import fs from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { entrarViaApi, type Papel as PapelDeConta } from "./fixtures/auth";

/**
 * Varredura automatizada de acessibilidade, página por página.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * ## Esta spec não roda na suíte normal
 *
 * São 39 páginas × 2 viewports, cada uma carregada e analisada — vários minutos.
 * Por isso ela vive em projetos próprios do Playwright (`a11y-desktop` e
 * `a11y-mobile`), e os projetos da suíte rápida a ignoram.
 *
 * ```bash
 * npm run test:a11y      # varre e falha se alguma página piorar em relação ao baseline
 * ```
 *
 * Para **regravar** o baseline depois de uma correção (task `13`):
 *
 * ```bash
 * A11Y_BASELINE=1 npm run test:a11y     # bash
 * $env:A11Y_BASELINE=1; npm run test:a11y   # PowerShell
 * ```
 *
 * ## O que o axe não vê
 *
 * A varredura automática cobre algo entre **30% e 40%** dos critérios WCAG.
 * Ela não julga ordem de leitura, clareza de mensagem de erro, se o texto
 * alternativo *descreve* a imagem, contraste sobre gradiente ou imagem, nem
 * qualquer coisa que dependa de navegar de fato com leitor de tela.
 *
 * Zero violação aqui **não** é conformidade WCAG AA. É ausência de defeito
 * detectável por máquina — que é exatamente o erro que os documentos antigos
 * deste repositório cometeram ao declarar "WCAG AA compliant" a partir de uma
 * auditoria de 6 páginas.
 */

const ARQUIVO_BASELINE = path.join(
  __dirname,
  "..",
  ".claude",
  "fixes",
  "reports",
  "12-a11y-baseline.json"
);

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

type Papel = "publico" | PapelDeConta;

type Rota = {
  caminho: string | ((ids: Ids) => string);
  papel: Papel;
  nota?: string;
};

type Ids = {
  postSlug: string;
  empresaSlug: string;
  relatoDaPessoa: string;
  relatoDaEmpresa: string;
};

const ROTAS: Rota[] = [
  // ------------------------------------------------------------- públicas
  { caminho: "/", papel: "publico" },
  { caminho: "/ajuda", papel: "publico" },
  { caminho: "/blog", papel: "publico" },
  { caminho: "/blog/all", papel: "publico" },
  { caminho: (ids) => `/blog/${ids.postSlug}`, papel: "publico" },
  { caminho: "/companies", papel: "publico" },
  { caminho: (ids) => `/company/${ids.empresaSlug}`, papel: "publico" },
  { caminho: "/login", papel: "publico" },
  { caminho: "/register", papel: "publico" },
  { caminho: "/register/success", papel: "publico" },
  { caminho: "/search", papel: "publico" },
  { caminho: "/privacy", papel: "publico" },
  { caminho: "/terms", papel: "publico" },
  { caminho: "/onboarding/role", papel: "publico" },
  { caminho: "/onboarding/person/step1", papel: "publico" },
  { caminho: "/onboarding/person/step2", papel: "publico" },
  { caminho: "/onboarding/company/step1", papel: "publico" },
  { caminho: "/onboarding/company/step2", papel: "publico" },
  { caminho: "/auth/verify", papel: "publico" },
  { caminho: "/auth/verify/check-email", papel: "publico" },

  // ------------------------------------------------------ área da usuária
  { caminho: "/app/complaints", papel: "pessoa" },
  { caminho: (ids) => `/app/complaints/${ids.relatoDaPessoa}`, papel: "pessoa" },
  { caminho: "/app/complaints/new", papel: "pessoa" },
  { caminho: "/app/settings", papel: "pessoa" },
  { caminho: "/app/settings/account", papel: "pessoa" },
  { caminho: "/app/settings/security", papel: "pessoa" },

  // ------------------------------------------------------- área da empresa
  { caminho: "/app/company/dashboard", papel: "empresa" },
  { caminho: "/app/company/inbox", papel: "empresa" },
  { caminho: "/app/company/complaints", papel: "empresa" },
  { caminho: (ids) => `/app/company/complaints/${ids.relatoDaEmpresa}`, papel: "empresa" },
  { caminho: "/app/company/profile", papel: "empresa" },
  { caminho: "/app/company/projects", papel: "empresa" },
  { caminho: "/app/company/verification", papel: "empresa" },

  // ---------------------------------------------------------- administração
  { caminho: "/app/admin", papel: "admin" },
  { caminho: "/app/admin/audit", papel: "admin" },
  { caminho: "/app/admin/blog", papel: "admin" },
  { caminho: "/app/admin/blog/help", papel: "admin" },
  { caminho: "/app/admin/companies", papel: "admin" },
  { caminho: (ids) => `/blog/${ids.postSlug}/edit`, papel: "admin" },
];

/**
 * As três páginas do repositório que não são varridas, e por quê. Somadas às 39
 * de cima fecham as 42 `page.tsx` — a conta tem que fechar, senão "varremos
 * tudo" vira afirmação sem lastro.
 */
const NAO_VARRIDAS: Record<string, string> = {
  "/app": "só redireciona (para /login ou para a área do papel) — não tem conteúdo próprio",
  "/empresas": "só redireciona para /companies",
  "/auth/callback": "só redireciona para /app; o spinner some antes de qualquer análise",
};

type Violacao = {
  id: string;
  impacto: string;
  ocorrencias: number;
  descricao: string;
};

type Resultado = {
  rota: string;
  papel: Papel;
  viewport: string;
  violacoes: Violacao[];
};

const coletados: Resultado[] = [];

test.describe(() => {
  test.describe.configure({ timeout: 90_000 });

  let ids: Ids;

  test.beforeAll(async ({ browser }) => {
    const contexto = await browser.newContext();
    const pagina = await contexto.newPage();

    await entrarViaApi(pagina.request, "pessoa");
    const meus = await (await pagina.request.get("/api/complaints?mine=1")).json();

    const posts = (await (await pagina.request.get("/api/blog/posts")).json()).posts;
    const empresas = await (await pagina.request.get("/api/companies")).json();

    await entrarViaApi(pagina.request, "empresa");
    const daEmpresa = await (await pagina.request.get("/api/company/complaints")).json();

    ids = {
      postSlug: posts[0]?.slug ?? posts[0]?.id,
      empresaSlug: empresas[0]?.slug ?? empresas[0]?.id,
      relatoDaPessoa: meus[0]?.id,
      relatoDaEmpresa: daEmpresa[0]?.id,
    };

    for (const [nome, valor] of Object.entries(ids)) {
      if (!valor) throw new Error(`Faltou ${nome} no seed. Rode: npm run db:seed`);
    }

    await contexto.close();
  });

  for (const rota of ROTAS) {
    const rotulo = typeof rota.caminho === "string" ? rota.caminho : `${rota.caminho({
      postSlug: ":slug",
      empresaSlug: ":slug",
      relatoDaPessoa: ":id",
      relatoDaEmpresa: ":id",
    })}`;

    test(`${rotulo} (${rota.papel})`, async ({ page }, info) => {
      if (rota.papel !== "publico") {
        await entrarViaApi(page.request, rota.papel);
      }

      const caminho = typeof rota.caminho === "string" ? rota.caminho : rota.caminho(ids);
      const resposta = await page.goto(caminho);
      expect(
        resposta?.status(),
        `${caminho} não carregou — varredura de acessibilidade sem página é resultado falso`
      ).toBeLessThan(400);

      await esperarAssentar(page);

      const analise = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      const violacoes: Violacao[] = analise.violations.map((violacao) => ({
        id: violacao.id,
        impacto: violacao.impact ?? "desconhecido",
        ocorrencias: violacao.nodes.length,
        descricao: violacao.help,
      }));

      coletados.push({
        rota: rotulo,
        papel: rota.papel,
        viewport: viewportDe(info.project.name),
        violacoes,
      });

      if (process.env.A11Y_BASELINE) return;

      const piso = lerBaseline(viewportDe(info.project.name), rotulo);
      if (piso === null) return; // rota nova: entra no baseline na próxima gravação

      const agora = violacoes.reduce((total, v) => total + v.ocorrencias, 0);
      expect(
        agora,
        `${rotulo} piorou: ${agora} ocorrências contra ${piso} no baseline`
      ).toBeLessThanOrEqual(piso);
    });
  }

  test.afterAll(async () => {
    if (!process.env.A11Y_BASELINE) return;
    gravarBaseline();
  });
});

/** O baseline é indexado por viewport, não por nome de projeto do Playwright. */
function viewportDe(projeto: string): string {
  return projeto.includes("mobile") ? "mobile" : "desktop";
}

/**
 * Espera a página assentar antes de analisar.
 *
 * Sem isto o axe pode rodar sobre esqueleto de carregamento e devolver um
 * resultado bonito que não corresponde à página que a usuária vê.
 */
async function esperarAssentar(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {
    // Página com polling nunca fica ociosa; o timeout abaixo cobre esse caso.
  });
  await page.waitForTimeout(500);
}

function lerBaseline(projeto: string, rota: string): number | null {
  if (!fs.existsSync(ARQUIVO_BASELINE)) return null;
  const baseline = JSON.parse(fs.readFileSync(ARQUIVO_BASELINE, "utf8"));
  const entrada = baseline.paginas?.[`${projeto}|${rota}`];
  return entrada ? entrada.ocorrencias : null;
}

function gravarBaseline() {
  const anterior = fs.existsSync(ARQUIVO_BASELINE)
    ? JSON.parse(fs.readFileSync(ARQUIVO_BASELINE, "utf8"))
    : { paginas: {} };

  for (const resultado of coletados) {
    anterior.paginas[`${resultado.viewport}|${resultado.rota}`] = {
      papel: resultado.papel,
      ocorrencias: resultado.violacoes.reduce((total, v) => total + v.ocorrencias, 0),
      violacoes: resultado.violacoes,
    };
  }

  anterior.tags = TAGS;
  anterior.naoVarridas = NAO_VARRIDAS;
  anterior.aviso =
    "A varredura automática cobre entre 30% e 40% dos critérios WCAG. Zero violação aqui não é conformidade AA.";

  fs.mkdirSync(path.dirname(ARQUIVO_BASELINE), { recursive: true });
  fs.writeFileSync(ARQUIVO_BASELINE, `${JSON.stringify(anterior, null, 2)}\n`);
  coletados.length = 0;
}
