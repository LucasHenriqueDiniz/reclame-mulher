import { expect, test, type Page } from "@playwright/test";

import { CONTAS, SENHA, entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste, tituloDeTeste } from "./fixtures/db";

/**
 * Os três fluxos principais, **só com teclado**.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * A task `13` pedia teste manual de teclado. Isto não substitui alguém sentado
 * na frente da tela com um leitor de tela ligado — nada substitui —, mas prova
 * de forma repetível o que o teste manual verificaria: dá para chegar em cada
 * controle com Tab, acionar com Enter ou Espaço, e concluir o fluxo sem tocar
 * no mouse.
 *
 * Nenhum `click()` aparece aqui de propósito. Se um controle só funcionar com
 * mouse, o teste trava no Tab e falha.
 */

test.beforeAll(async () => {
  await limparRelatosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

/** Aperta Tab até o elemento pedido receber foco, ou falha dizendo onde parou. */
async function tabAte(page: Page, seletor: string, limite = 40) {
  const alvo = page.locator(seletor);
  for (let passo = 0; passo < limite; passo++) {
    if (await alvo.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return;
    }
    await page.keyboard.press("Tab");
  }

  const onde = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return "nenhum";
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} "${(
      el.textContent ?? ""
    ).trim().slice(0, 40)}"`;
  });
  throw new Error(
    `Não cheguei em ${seletor} com ${limite} Tabs. O foco parou em: ${onde}`
  );
}

/** O foco precisa ser visível — foco que não se vê é o mesmo que foco perdido. */
async function focoVisivel(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    if (!el.matches(":focus-visible")) return false;
    const estilo = getComputedStyle(el);
    const temContorno = estilo.outlineStyle !== "none" && parseFloat(estilo.outlineWidth) > 0;
    const temSombra = estilo.boxShadow !== "none";
    const temBorda = estilo.borderColor !== "rgba(0, 0, 0, 0)";
    return temContorno || temSombra || temBorda;
  });
}

test("fluxo 1: entrar na plataforma só com teclado", async ({ page }) => {
  await page.goto("/login");

  await tabAte(page, 'input[type="email"]');
  expect(await focoVisivel(page), "o campo de e-mail precisa mostrar o foco").toBeTruthy();
  await page.keyboard.type(CONTAS.pessoa.email);

  await tabAte(page, 'input[type="password"]');
  await page.keyboard.type(SENHA);

  // O botão de mostrar/ocultar senha fica entre o campo e o de entrar. Ele
  // ganhou nome acessível na task 13; aqui o que importa é passar por ele.
  await tabAte(page, 'button[type="submit"]');
  expect(await focoVisivel(page), "o botão de entrar precisa mostrar o foco").toBeTruthy();
  await page.keyboard.press("Enter");

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
  await expect(page).toHaveURL(new RegExp(CONTAS.pessoa.destino));
});

test("fluxo 2: criar um relato só com teclado", async ({ page }) => {
  await entrarViaApi(page.request, "pessoa");
  const empresas = await (await page.request.get("/api/companies")).json();
  await page.goto(`/app/complaints/new?company=${empresas[0].id}`);

  const titulo = tituloDeTeste("só com teclado");
  const continuar = 'button:has-text("Continuar")';

  // Etapa 1 — a resposta padrão serve; basta chegar no botão.
  await tabAte(page, continuar);
  expect(await focoVisivel(page)).toBeTruthy();
  await page.keyboard.press("Enter");

  // Etapa 2 — os campos das outras etapas estão `inert` desde a task 13, então
  // o Tab não pode cair neles. Se caísse, este `tabAte` estouraria o limite.
  await tabAte(page, "#complaint-title");
  await page.keyboard.type(titulo);
  await tabAte(page, "#complaint-description");
  await page.keyboard.type("Relato preenchido inteiramente pelo teclado, com texto suficiente.");

  await tabAte(page, continuar);
  await page.keyboard.press("Enter");

  // Etapa 3 — anexo é opcional.
  await tabAte(page, 'button:has-text("Continuar sem foto")');
  await page.keyboard.press("Enter");

  // Etapa 4 — os três selects do Radix abrem com Enter e escolhem com setas.
  for (const id of ["#impact-category", "#urgency-level", "#impact-scope"]) {
    await tabAte(page, id);
    expect(await focoVisivel(page), `${id} precisa mostrar o foco`).toBeTruthy();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator(id)).not.toContainText("Escolha uma opção");
  }

  await tabAte(page, 'button:has-text("Enviar relato")');
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("heading", { name: /relato foi criado com sucesso/i })
  ).toBeVisible();
});

test("fluxo 3: a empresa responder só com teclado", async ({ page, request }) => {
  await entrarViaApi(request, "pessoa");
  await entrarViaApi(page.request, "empresa");

  const { company } = await (await page.request.get("/api/company/profile")).json();
  const criado = await request.post("/api/complaints", {
    data: {
      company_id: company.id,
      title: tituloDeTeste("resposta pelo teclado"),
      description: "Relato criado para o teste de navegação por teclado da empresa.",
      is_public: true,
    },
  });
  expect(criado.status()).toBe(201);
  const { id } = await criado.json();

  await page.goto(`/app/company/complaints/${id}`);

  await tabAte(page, 'textarea[placeholder="Escrever sua resposta..."]', 60);
  expect(await focoVisivel(page), "a caixa de resposta precisa mostrar o foco").toBeTruthy();
  await page.keyboard.type("Resposta enviada usando apenas o teclado.");

  await tabAte(page, 'button:has-text("Enviar resposta")');
  await page.keyboard.press("Enter");

  await expect(page.getByText("Resposta enviada com sucesso!")).toBeVisible();
});
