import { expect, test, type Page } from "@playwright/test";

import { entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste, tituloDeTeste } from "./fixtures/db";

/**
 * Wizard de criação de relato — o fluxo central da plataforma.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * Duas coisas do componente mudam como o teste precisa ser escrito:
 *
 * 1. **As quatro etapas ficam no DOM ao mesmo tempo.** O wizard é um carrossel
 *    com `translateX`; as etapas fora de tela são apenas recortadas por
 *    `overflow-hidden`. Então `toBeVisible()` não distingue etapa — e o campo
 *    da etapa 2 é preenchível já na etapa 1. Quem sabe a etapa atual é o
 *    deslocamento do trilho, e é o que `etapaAtual` lê.
 *
 * 2. **Os selects da etapa 4 não têm rótulo associado.** O `htmlFor` do campo
 *    aponta para um id que o Radix não aplica em lugar nenhum, então
 *    `getByLabel` não acha. Aqui a busca é pela adjacência real no DOM.
 *
 * Os dois pontos são defeitos de acessibilidade e estão registrados em
 * `.claude/fixes/tasks/52-etapas-fora-de-tela-focaveis.md` e
 * `.claude/fixes/tasks/53-selects-sem-rotulo-associado.md`. Este arquivo
 * descreve o que existe hoje, não o que deveria existir.
 */

test.beforeAll(async () => {
  // Se a execução anterior morreu no meio, o lixo dela sai agora.
  await limparRelatosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

const continuar = (page: Page) =>
  page.getByRole("button", { name: "Continuar", exact: true });
const continuarSemFoto = (page: Page) =>
  page.getByRole("button", { name: "Continuar sem foto" });
const enviarRelato = (page: Page) =>
  page.getByRole("button", { name: "Enviar relato" });
const voltar = (page: Page) => page.getByRole("button", { name: "Voltar", exact: true });

/** PNG 1x1 válido — menor arquivo que passa pela checagem de tipo. */
const PNG_MINIMO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const DESCRICAO_VALIDA =
  "A obra começou há duas semanas e o barulho vai até as duas da manhã.";

/** Lê a etapa mostrada a partir do deslocamento do carrossel. */
async function etapaAtual(page: Page): Promise<number> {
  const estilo = await page.locator('[style*="translateX"]').first().getAttribute("style");
  const deslocamento = /translateX\(-(\d+(?:\.\d+)?)%\)/.exec(estilo ?? "");
  return deslocamento ? Math.round(Number(deslocamento[1]) / 100) + 1 : 1;
}

async function esperarEtapa(page: Page, etapa: number) {
  await expect
    .poll(() => etapaAtual(page), { message: `esperando chegar na etapa ${etapa}` })
    .toBe(etapa);
}

/**
 * Abre o wizard já autenticada e já com empresa escolhida.
 *
 * A empresa vem por query string de propósito: é o caminho real de quem clica
 * "Fazer relato" no perfil de uma empresa, e evita depender do modal de busca,
 * que é outro fluxo e merece teste próprio.
 */
async function abrirWizard(page: Page) {
  await entrarViaApi(page.request, "pessoa");

  const resposta = await page.request.get("/api/companies");
  expect(resposta.ok(), "GET /api/companies falhou").toBeTruthy();
  const empresas = (await resposta.json()) as Array<{ id: string; name: string }>;
  const empresa = empresas[0];
  if (!empresa?.id) {
    throw new Error("Nenhuma empresa no banco. Rode: npm run db:seed");
  }

  await page.goto(`/app/complaints/new?company=${empresa.id}`);
  await expect(continuar(page)).toBeVisible();
  await esperarEtapa(page, 1);
  return empresa;
}

/** Escolhe uma opção num select da etapa 4, achando o gatilho pelo rótulo vizinho. */
async function escolher(page: Page, rotulo: string, opcao: RegExp) {
  const gatilho = page.locator(`label:has-text("${rotulo}") + button`);
  await gatilho.click();
  await page.getByRole("option", { name: opcao }).click();
  await expect(gatilho).toContainText(opcao);
}

async function preencherEtapaDois(page: Page, titulo: string) {
  await page.locator("#complaint-title").fill(titulo);
  await page.locator("#complaint-description").fill(DESCRICAO_VALIDA);
  await page.locator("#complaint-location").fill("Rua das Flores, 123");
}

async function irAteEtapaTres(page: Page, titulo: string) {
  await continuar(page).click();
  await esperarEtapa(page, 2);
  await preencherEtapaDois(page, titulo);
  await continuar(page).click();
  await esperarEtapa(page, 3);
}

test.describe("caminho feliz", () => {
  test("cria o relato e ele aparece na listagem da usuária", async ({ page }) => {
    await abrirWizard(page);
    const titulo = tituloDeTeste("caminho feliz");

    // Etapa 1 — a resposta padrão é "não", e é a que interessa aqui.
    await expect(page.getByRole("radio", { name: "Não, é a primeira vez" })).toBeChecked();

    await irAteEtapaTres(page, titulo);

    // Etapa 3 — anexo é opcional, e o rótulo do botão diz isso.
    await continuarSemFoto(page).click();
    await esperarEtapa(page, 4);

    await escolher(page, "Qual tipo de problema?", /Infraestrutura/);
    await escolher(page, "Quão urgente é?", /Média/);
    await escolher(page, "Quem mais está sendo afetado?", /Só eu/);

    await enviarRelato(page).click();

    await expect(
      page.getByRole("heading", { name: /relato foi criado com sucesso/i })
    ).toBeVisible();
    await expect(page.getByText("Identificador do relato")).toBeVisible();
    await expect(page.getByText(titulo)).toBeVisible();

    await page.goto("/app/complaints");
    await expect(page.getByText(titulo)).toBeVisible();
  });
});

test.describe("validação", () => {
  test("etapa 2 não avança sem título e descrição no tamanho mínimo", async ({ page }) => {
    await abrirWizard(page);
    await continuar(page).click();
    await esperarEtapa(page, 2);

    await expect(continuar(page), "vazia deveria bloquear").toBeDisabled();

    await page.locator("#complaint-title").fill("ab"); // mínimo é 3
    await expect(continuar(page), "título curto deveria bloquear").toBeDisabled();

    await page.locator("#complaint-title").fill("Barulho de obra à noite");
    await expect(continuar(page), "descrição vazia deveria bloquear").toBeDisabled();

    await page.locator("#complaint-description").fill("curta"); // mínimo é 10
    await expect(continuar(page), "descrição curta deveria bloquear").toBeDisabled();

    await page.locator("#complaint-description").fill(DESCRICAO_VALIDA);
    await expect(continuar(page)).toBeEnabled();

    // Nada disso pode ter deslizado o wizard adiante.
    await esperarEtapa(page, 2);
  });

  test("etapa 4 não envia sem categoria, urgência e alcance", async ({ page }) => {
    await abrirWizard(page);
    await irAteEtapaTres(page, tituloDeTeste("classificação obrigatória"));
    await continuarSemFoto(page).click();
    await esperarEtapa(page, 4);

    await expect(enviarRelato(page), "sem classificação deveria bloquear").toBeDisabled();

    await escolher(page, "Qual tipo de problema?", /Saúde/);
    await expect(enviarRelato(page), "só categoria deveria bloquear").toBeDisabled();

    await escolher(page, "Quão urgente é?", /Alta/);
    await expect(enviarRelato(page), "faltando alcance deveria bloquear").toBeDisabled();

    await escolher(page, "Quem mais está sendo afetado?", /Vizinhos e comunidade/);
    await expect(enviarRelato(page)).toBeEnabled();

    // Sai sem enviar: este teste é sobre o bloqueio, não sobre criar relato.
  });

  test("etapa 1 pergunta onde a pessoa reclamou quando ela responde que sim", async ({
    page,
  }) => {
    await abrirWizard(page);

    const ondeReclamou = page.getByPlaceholder(/Procon/);
    await expect(ondeReclamou).toBeHidden();

    await page.getByRole("radio", { name: "Sim, já reclamei" }).click();
    await expect(ondeReclamou).toBeVisible();

    await page.getByRole("radio", { name: "Não, é a primeira vez" }).click();
    await expect(ondeReclamou).toBeHidden();
  });
});

test.describe("navegação", () => {
  test("voltar da etapa 3 para a 2 preserva o que foi digitado", async ({ page }) => {
    await abrirWizard(page);
    const titulo = tituloDeTeste("navegação");

    await irAteEtapaTres(page, titulo);

    await voltar(page).click();
    await esperarEtapa(page, 2);

    await expect(page.locator("#complaint-title")).toHaveValue(titulo);
    await expect(page.locator("#complaint-description")).toHaveValue(DESCRICAO_VALIDA);
    await expect(page.locator("#complaint-location")).toHaveValue("Rua das Flores, 123");
  });

  test("a etapa 1 não mostra botão voltar", async ({ page }) => {
    await abrirWizard(page);
    await expect(voltar(page)).toBeHidden();

    await continuar(page).click();
    await esperarEtapa(page, 2);
    await expect(voltar(page)).toBeVisible();
  });
});

test.describe("anexos", () => {
  /**
   * Estes dois casos rodam sem rede: a validação acontece antes do upload, e
   * arquivo recusado nunca chega no UploadThing.
   */
  test("arquivo acima de 5 MB é recusado com mensagem clara", async ({ page }) => {
    await abrirWizard(page);
    await irAteEtapaTres(page, tituloDeTeste("anexo grande"));

    await page.locator('input[type="file"]').setInputFiles({
      name: "foto-grande.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(6 * 1024 * 1024),
    });

    await expect(page.getByText(/Arquivo muito grande/i)).toBeVisible();
    // O rótulo do botão é o que prova que nada entrou na lista de anexos.
    await expect(continuarSemFoto(page)).toBeVisible();
  });

  test("formato fora de PNG, JPG e PDF é recusado", async ({ page }) => {
    await abrirWizard(page);
    await irAteEtapaTres(page, tituloDeTeste("anexo formato"));

    await page.locator('input[type="file"]').setInputFiles({
      name: "anotacoes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("texto qualquer"),
    });

    await expect(page.getByText(/Formato não permitido/i)).toBeVisible();
    await expect(continuarSemFoto(page)).toBeVisible();
  });

  /**
   * O upload de verdade sobe para o UploadThing, que é serviço externo. Fora da
   * suíte principal de propósito: teste que depende de rede de terceiro vira
   * falha intermitente, e suíte intermitente deixa de ser levada a sério.
   *
   *   E2E_UPLOAD=1 npx playwright test e2e/complaint-create.spec.ts
   */
  test("anexo válido aparece na lista depois de subir", async ({ page }) => {
    test.skip(
      !process.env.E2E_UPLOAD,
      "Depende do UploadThing (rede externa). Rode com E2E_UPLOAD=1."
    );

    await abrirWizard(page);
    await irAteEtapaTres(page, tituloDeTeste("anexo válido"));

    await page.locator('input[type="file"]').setInputFiles({
      name: "evidencia.png",
      mimeType: "image/png",
      buffer: PNG_MINIMO,
    });

    await expect(page.getByText("evidencia.png")).toBeVisible({ timeout: 30_000 });
    await expect(continuar(page)).toBeVisible();
  });
});
