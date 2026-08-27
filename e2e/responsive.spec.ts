import { expect, test, type Page } from "@playwright/test";

import { entrarViaApi, type Papel } from "./fixtures/auth";
import { criarRelato, empresaDaConta } from "./fixtures/complaints";
import { limparRelatosDeTeste } from "./fixtures/db";

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
  "/onboarding/role",
  "/onboarding/person/step1",
  "/onboarding/person/step2",
  "/onboarding/company/step1",
  "/onboarding/company/step2",
  // /register/success e /auth/verify saíram na task 61 — ver a11y.spec.ts.
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

/**
 * Alvos de toque pequenos demais.
 *
 * O mínimo do WCAG 2.5.8 (AA na 2.2) é 24×24 CSS px. Não é o ideal — as guias
 * de plataforma pedem 44×44 —, mas é o piso normativo, e é o que dá para exigir
 * sem redesenhar a interface inteira.
 *
 * As exceções do critério estão implementadas, porque sem elas a medição vira
 * ruído:
 *
 * - **espaçamento** — alvo pequeno passa se um círculo de 24px centrado nele
 *   não encostar no círculo de nenhum outro alvo. É a exceção mais usada, e é
 *   ela que absolve o "Esqueceu a senha?" solto embaixo do formulário;
 * - **inline** — link dentro de uma frase;
 * - **escondido** — `aria-hidden`, `inert`, `display:none`, e o link de pular
 *   para o conteúdo, que só existe em 1×1 até receber foco.
 */
async function alvosPequenos(page: Page) {
  return page.evaluate(() => {
    const MINIMO = 24;
    const seletor =
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="switch"]';

    type Alvo = { el: Element; cx: number; cy: number; w: number; h: number };
    const alvos: Alvo[] = [];

    for (const el of Array.from(document.querySelectorAll(seletor))) {
      const caixa = el.getBoundingClientRect();
      if (caixa.width === 0 || caixa.height === 0) continue;
      if (el.closest("[aria-hidden='true'], [inert], [hidden]")) continue;
      const estilo = getComputedStyle(el);
      if (estilo.display === "none" || estilo.visibility === "hidden") continue;
      // Padrão sr-only: o elemento é recortado para 1px e só aparece no foco.
      // Não é alvo de toque, é âncora de teclado.
      if (caixa.width <= 2 && caixa.height <= 2) continue;
      alvos.push({ el, cx: caixa.x + caixa.width / 2, cy: caixa.y + caixa.height / 2, w: caixa.width, h: caixa.height });
    }

    const pequenos: Array<{ tag: string; nome: string; largura: number; altura: number; vizinho: string }> = [];

    for (const alvo of alvos) {
      if (alvo.w >= MINIMO && alvo.h >= MINIMO) continue;

      // Exceção "inline": link no meio de um bloco de texto.
      if (alvo.el.tagName === "A" && getComputedStyle(alvo.el).display === "inline") {
        const pai = alvo.el.parentElement;
        const soOLink = (pai?.textContent ?? "").trim() === (alvo.el.textContent ?? "").trim();
        if (pai && !soOLink) continue;
      }

      // Exceção "espaçamento": nenhum outro alvo com centro a menos de 24px.
      const encostou = alvos.find(
        (outro) =>
          outro !== alvo &&
          !outro.el.contains(alvo.el) &&
          !alvo.el.contains(outro.el) &&
          Math.hypot(outro.cx - alvo.cx, outro.cy - alvo.cy) < MINIMO
      );
      if (!encostou) continue;

      const nomear = (el: Element) =>
        (el.getAttribute("aria-label") || (el.textContent ?? "").trim() || el.tagName.toLowerCase()).slice(0, 30);

      pequenos.push({
        tag: alvo.el.tagName.toLowerCase(),
        nome: nomear(alvo.el),
        largura: Math.round(alvo.w),
        altura: Math.round(alvo.h),
        vizinho: nomear(encostou.el),
      });
    }
    return pequenos;
  });
}

test.describe("alvos de toque", () => {
  const AMOSTRA: Array<{ caminho: string; papel: Papel | null }> = [
    { caminho: "/", papel: null },
    { caminho: "/companies", papel: null },
    { caminho: "/login", papel: null },
    { caminho: "/register", papel: null },
    { caminho: "/ajuda", papel: null },
    { caminho: "/search", papel: null },
    { caminho: "/app/complaints", papel: "pessoa" },
    { caminho: "/app/complaints/new", papel: "pessoa" },
    { caminho: "/app/settings", papel: "pessoa" },
    { caminho: "/app/company/dashboard", papel: "empresa" },
    { caminho: "/app/company/inbox", papel: "empresa" },
    { caminho: "/app/admin", papel: "admin" },
  ];

  for (const { caminho, papel } of AMOSTRA) {
    test(`${caminho} não tem alvo pequeno e apertado`, async ({ page }) => {
      if (papel) await entrarViaApi(page.request, papel);
      await page.goto(caminho);
      await page.waitForLoadState("networkidle").catch(() => {});

      const pequenos = await alvosPequenos(page);
      expect(
        pequenos.map(
          (p) => `${p.tag} "${p.nome}" mede ${p.largura}x${p.altura} e encosta em "${p.vizinho}"`
        ),
        `${caminho} tem alvo abaixo de 24x24 sem o espaçamento que o WCAG 2.5.8 exigiria em troca`
      ).toEqual([]);
    });
  }
});
test.describe("menu de celular", () => {
  test("abre, navega e fecha", async ({ page }, info) => {
    test.skip(
      !info.project.name.includes("mobile"),
      "O menu de hambúrguer só existe no viewport pequeno."
    );

    await page.goto("/");

    const abrir = page.getByRole("button", { name: "Menu" });
    await expect(abrir, "o botão de menu precisa aparecer em 375px").toBeVisible();
    await abrir.click();

    const painel = page.getByRole("dialog");
    await expect(painel).toBeVisible();

    // Navegar por dentro do menu leva para a página e fecha o painel.
    await painel.getByRole("link", { name: "Empresas" }).first().click();
    await expect(page).toHaveURL(/\/companies/);
    await expect(painel).toBeHidden();

    // E abre de novo na página nova — sem isso, o menu vira armadilha de ida só.
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

/**
 * A conversa do relato em 375px.
 *
 * As duas telas de detalhe não entram nas listas acima porque precisam de um
 * relato existindo. São, ao mesmo tempo, as telas onde a plataforma acontece: é
 * ali que a pessoa escreve e a empresa responde. Se a caixa de texto ficar
 * inutilizável no celular, o produto não funciona no aparelho em que ele será
 * usado.
 *
 * Limitação registrada: o Chromium headless **não** abre teclado virtual. Um
 * teclado real come cerca de 40% da altura da tela e pode esconder o botão de
 * enviar. Isso exige conferência num aparelho de verdade — este teste não
 * cobre, e não adianta fingir que cobre.
 */
test.describe("a conversa do relato cabe no celular", () => {
  test("detalhe da autora e da empresa, com o campo de resposta utilizável", async ({
    page,
    request,
  }) => {
    await entrarViaApi(request, "empresa");
    const empresaId = await empresaDaConta(request);

    await entrarViaApi(page.request, "pessoa");
    const { id } = await criarRelato(page.request, {
      empresaId,
      assunto: "conversa no celular",
    });

    // Lado da autora.
    await page.goto(`/app/complaints/${id}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await conferir(page, `/app/complaints/${id}`);

    // Lado da empresa, onde fica o campo de resposta.
    await entrarViaApi(page.request, "empresa");
    await page.goto(`/app/company/complaints/${id}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await conferir(page, `/app/company/complaints/${id}`);

    const campo = page.locator('textarea[placeholder="Escrever sua resposta..."]');
    await expect(campo).toBeVisible();

    const larguraUtil = await campo.evaluate((el) => {
      const caixa = el.getBoundingClientRect();
      return {
        largura: Math.round(caixa.width),
        altura: Math.round(caixa.height),
        tela: document.documentElement.clientWidth,
      };
    });

    // Um campo de texto multilinha espremido em menos de metade da tela é
    // sintoma de layout de duas colunas que não desmontou no celular.
    expect(
      larguraUtil.largura,
      `o campo de resposta ocupa ${larguraUtil.largura}px de ${larguraUtil.tela}px de tela`
    ).toBeGreaterThan(larguraUtil.tela * 0.5);
    expect(larguraUtil.altura, "o campo de resposta está baixo demais para escrever").toBeGreaterThanOrEqual(60);

    // E o botão de enviar precisa estar dentro da tela, não cortado na direita.
    const enviar = page.getByRole("button", { name: /Enviar resposta/i });
    await expect(enviar).toBeVisible();
    const dentro = await enviar.evaluate(
      (el) => el.getBoundingClientRect().right <= document.documentElement.clientWidth + 1
    );
    expect(dentro, "o botão de enviar resposta está cortado na lateral").toBeTruthy();

    await limparRelatosDeTeste();
  });
});
