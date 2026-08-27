import { expect, test, type Page } from "@playwright/test";

import { entrarViaApi, type Papel } from "./fixtures/auth";

/**
 * Nenhuma página pode rolar para o lado.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * Scroll horizontal em celular é o defeito de responsividade mais comum e o
 * mais fácil de medir com objetividade: ou a página cabe na largura da tela, ou
 * não cabe. Esta spec roda nos dois viewports da suíte — 1280×800 e 375×812 —
 * porque consertar mobile quebrando desktop é o erro clássico da correção de
 * responsividade.
 *
 * Quando falha, a mensagem traz **quais elementos** estouraram a largura, com
 * tag, classes e quanto passaram. Sem isso, "a página rola para o lado" manda
 * quem for corrigir procurar agulha no palheiro.
 */

const PUBLICAS = [
  "/",
  "/companies",
  "/blog",
  "/blog/all",
  "/search",
  "/ajuda",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/register/success",
  "/onboarding/role",
  "/onboarding/person/step1",
  "/onboarding/person/step2",
  "/onboarding/company/step1",
  "/onboarding/company/step2",
  "/auth/verify",
  "/auth/verify/check-email",
];

const AUTENTICADAS: Array<{ caminho: string; papel: Papel }> = [
  { caminho: "/app/complaints", papel: "pessoa" },
  { caminho: "/app/complaints/new", papel: "pessoa" },
  { caminho: "/app/settings", papel: "pessoa" },
  { caminho: "/app/settings/account", papel: "pessoa" },
  { caminho: "/app/settings/security", papel: "pessoa" },
  { caminho: "/app/company/dashboard", papel: "empresa" },
  { caminho: "/app/company/inbox", papel: "empresa" },
  { caminho: "/app/company/complaints", papel: "empresa" },
  { caminho: "/app/company/profile", papel: "empresa" },
  { caminho: "/app/company/projects", papel: "empresa" },
  { caminho: "/app/company/verification", papel: "empresa" },
  { caminho: "/app/admin", papel: "admin" },
  { caminho: "/app/admin/audit", papel: "admin" },
  { caminho: "/app/admin/blog", papel: "admin" },
  { caminho: "/app/admin/companies", papel: "admin" },
];

type Estouro = {
  tag: string;
  classes: string;
  passouEm: number;
  texto: string;
};

/**
 * Elementos que passam da largura da viewport.
 *
 * Ignora quem está dentro de um contêiner com rolagem horizontal declarada —
 * uma tabela larga dentro de `overflow-x: auto` é solução, não defeito — e
 * ignora quem está escondido ou posicionado fora da tela de propósito
 * (`aria-hidden`, `inert`, menu fechado).
 */
async function estouros(page: Page): Promise<Estouro[]> {
  return page.evaluate(() => {
    const limite = document.documentElement.clientWidth;
    const encontrados: Array<{ tag: string; classes: string; passouEm: number; texto: string }> = [];

    function temAncestralComRolagem(elemento: Element): boolean {
      let atual: Element | null = elemento.parentElement;
      while (atual && atual !== document.documentElement) {
        const estilo = getComputedStyle(atual);
        if (["auto", "scroll", "hidden"].includes(estilo.overflowX)) return true;
        atual = atual.parentElement;
      }
      return false;
    }

    function estaEscondido(elemento: Element): boolean {
      if (elemento.closest("[aria-hidden='true'], [inert], [hidden]")) return true;
      const estilo = getComputedStyle(elemento);
      return (
        estilo.display === "none" ||
        estilo.visibility === "hidden" ||
        Number(estilo.opacity) === 0
      );
    }

    for (const elemento of Array.from(document.body.querySelectorAll("*"))) {
      const caixa = elemento.getBoundingClientRect();
      if (caixa.width === 0 || caixa.height === 0) continue;
      // 1px de folga: arredondamento de layout não é defeito.
      const excesso = Math.round(caixa.right - limite);
      if (excesso <= 1) continue;
      if (estaEscondido(elemento) || temAncestralComRolagem(elemento)) continue;

      encontrados.push({
        tag: elemento.tagName.toLowerCase(),
        classes: (elemento.getAttribute("class") ?? "").slice(0, 90),
        passouEm: excesso,
        texto: (elemento.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 50),
      });
    }

    // Só os mais externos interessam: se um contêiner estoura, os filhos dele
    // estouram junto e a lista vira ruído.
    return encontrados
      .sort((a, b) => b.passouEm - a.passouEm)
      .slice(0, 8);
  });
}

async function conferir(page: Page, rota: string) {
  const medida = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  if (medida.scrollWidth <= medida.clientWidth + 1) return;

  const culpados = await estouros(page);
  const detalhe = culpados
    .map((c) => `  ${c.tag}.${c.classes} passa ${c.passouEm}px — "${c.texto}"`)
    .join("\n");

  expect(
    medida.scrollWidth,
    `${rota} rola para o lado: ${medida.scrollWidth}px de conteúdo em ` +
      `${medida.clientWidth}px de tela.\n${detalhe || "  (nenhum elemento isolado; provável margem ou largura no contêiner raiz)"}`
  ).toBeLessThanOrEqual(medida.clientWidth + 1);
}

test.describe("páginas públicas cabem na tela", () => {
  for (const rota of PUBLICAS) {
    test(`${rota} não rola para o lado`, async ({ page }) => {
      const resposta = await page.goto(rota);
      expect(resposta?.status(), `${rota} não carregou`).toBeLessThan(400);
      await page.waitForLoadState("networkidle").catch(() => {});
      await conferir(page, rota);
    });
  }
});

test.describe("páginas autenticadas cabem na tela", () => {
  for (const { caminho, papel } of AUTENTICADAS) {
    test(`${caminho} não rola para o lado`, async ({ page }) => {
      await entrarViaApi(page.request, papel);
      const resposta = await page.goto(caminho);
      expect(resposta?.status(), `${caminho} não carregou`).toBeLessThan(400);
      await page.waitForLoadState("networkidle").catch(() => {});
      await conferir(page, caminho);
    });
  }
});
