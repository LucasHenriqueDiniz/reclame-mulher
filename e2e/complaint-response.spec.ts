import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import { entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste } from "./fixtures/db";
import {
  criarRelato,
  empresaDaConta,
  outraEmpresa,
  statusPelaAutora,
  statusPelaEmpresa,
} from "./fixtures/complaints";

/**
 * Diálogo entre usuária e empresa, e transições de status.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * **Os status reais são `OPEN`, `RESPONDED`, `RESOLVED` e `CANCELLED`.** O
 * `TODO.md` fala em `IN_PROGRESS`, que não existe em lugar nenhum do código.
 *
 * A máquina de estados, lida nos handlers e confirmada aqui:
 *
 *   empresa responde   →  RESPONDED   (a menos que já esteja RESOLVED/CANCELLED)
 *   usuária responde   →  OPEN        (só se estiver em RESPONDED)
 *   usuária responde   →  sem efeito  (em qualquer outro status, RESOLVED incluso)
 *
 * O último caso contraria o que o `TODO.md` afirma sobre reabertura e está
 * registrado como achado em `.claude/fixes/tasks/55-resolvido-nao-reabre.md`.
 * O teste asserta o que o código faz — não o que a documentação promete.
 *
 * Duas sessões por teste: uma no navegador (`page`) e outra na API (`request`),
 * que são jarras de cookie separadas. Onde um teste precisa de três papéis, o
 * contexto de API troca de papel refazendo o login — o cookie novo substitui o
 * anterior.
 */

test.beforeAll(async () => {
  await limparRelatosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

const RESPOSTA_EMPRESA = "Recebemos seu relato e a equipe já foi acionada.";
const TREPLICA_USUARIA = "Obrigada, mas o problema continua acontecendo.";

const caixaDeResposta = "Escrever sua resposta...";

test.describe("empresa recebe e responde", () => {
  test("o relato novo aparece na caixa de entrada da empresa", async ({ page, request }) => {
    await entrarViaApi(request, "pessoa");
    await entrarViaApi(page.request, "empresa");
    const empresaId = await empresaDaConta(page.request);

    const { titulo } = await criarRelato(request, {
      empresaId,
      assunto: "chega no inbox",
    });

    await page.goto("/app/company/complaints");
    await expect(page.getByText(titulo)).toBeVisible();
  });

  test("responder pela tela leva o status para RESPONDED", async ({ page, request }) => {
    await entrarViaApi(request, "pessoa");
    await entrarViaApi(page.request, "empresa");
    const empresaId = await empresaDaConta(page.request);

    const { id } = await criarRelato(request, { empresaId, assunto: "empresa responde" });
    expect(await statusPelaAutora(request, id)).toBe("OPEN");

    await page.goto(`/app/company/complaints/${id}`);
    await page.getByPlaceholder(caixaDeResposta).fill(RESPOSTA_EMPRESA);
    await page.getByRole("button", { name: "Enviar resposta" }).click();

    await expect(page.getByText("Resposta enviada com sucesso!")).toBeVisible();
    await expect(page.getByText(RESPOSTA_EMPRESA)).toBeVisible();

    expect(await statusPelaEmpresa(page.request, id)).toBe("RESPONDED");
  });

  test("mudar o status pela tela grava RESOLVED", async ({ page, request }) => {
    await entrarViaApi(request, "pessoa");
    await entrarViaApi(page.request, "empresa");
    const empresaId = await empresaDaConta(page.request);

    const { id } = await criarRelato(request, { empresaId, assunto: "empresa resolve" });

    await page.goto(`/app/company/complaints/${id}`);
    await page.locator('label:has-text("Mudar status") + div select').selectOption("RESOLVED");
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Status atualizado com sucesso.")).toBeVisible();
    expect(await statusPelaEmpresa(page.request, id)).toBe("RESOLVED");
  });
});

test.describe("usuária vê e responde", () => {
  test("a usuária lê a resposta da empresa no detalhe do relato", async ({ page, request }) => {
    await entrarViaApi(page.request, "pessoa");
    const { id } = await criarRelato(page.request, {
      empresaId: await empresaComSessao(request),
      assunto: "usuária lê",
    });

    await responderComoEmpresa(request, id);

    await page.goto(`/app/complaints/${id}`);
    await expect(page.getByText(RESPOSTA_EMPRESA)).toBeVisible();
  });

  test("responder em RESPONDED reabre o relato: volta para OPEN", async ({ page, request }) => {
    await entrarViaApi(page.request, "pessoa");
    const { id } = await criarRelato(page.request, {
      empresaId: await empresaComSessao(request),
      assunto: "reabertura",
    });

    await responderComoEmpresa(request, id);
    expect(await statusPelaAutora(page.request, id)).toBe("RESPONDED");

    await page.goto(`/app/complaints/${id}`);
    await page.getByPlaceholder(caixaDeResposta).fill(TREPLICA_USUARIA);
    await page.getByRole("button", { name: "Enviar resposta" }).click();

    await expect(page.getByText("Resposta enviada com sucesso.")).toBeVisible();
    expect(await statusPelaAutora(page.request, id)).toBe("OPEN");
  });

  /**
   * Comportamento real, contrário ao `TODO.md`: depois de RESOLVED, a resposta
   * da usuária é gravada mas o status não muda. Ninguém é avisado de que ela
   * discorda do encerramento. Achado `55`.
   */
  test("depois de RESOLVED, a resposta da usuária não reabre nada", async ({ page, request }) => {
    await entrarViaApi(page.request, "pessoa");
    const { id } = await criarRelato(page.request, {
      empresaId: await empresaComSessao(request),
      assunto: "resolvido não reabre",
    });

    await responderComoEmpresa(request, id);
    await marcarStatusComoEmpresa(request, id, "RESOLVED");
    expect(await statusPelaAutora(page.request, id)).toBe("RESOLVED");

    await page.goto(`/app/complaints/${id}`);
    await page.getByPlaceholder(caixaDeResposta).fill(TREPLICA_USUARIA);
    await page.getByRole("button", { name: "Enviar resposta" }).click();
    await expect(page.getByText("Resposta enviada com sucesso.")).toBeVisible();

    // A mensagem entrou na conversa...
    await page.reload();
    await expect(page.getByText(TREPLICA_USUARIA)).toBeVisible();
    // ...mas o relato continua fechado.
    expect(await statusPelaAutora(page.request, id)).toBe("RESOLVED");
  });
});

test.describe("privacidade da conversa", () => {
  test("relato privado de outra pessoa devolve 404 e nega mensagem", async ({ page, request }) => {
    await entrarViaApi(request, "pessoa");
    const empresaId = await empresaComSessao(page.request);
    const { id } = await criarRelato(request, {
      empresaId,
      assunto: "privado",
      publico: false,
    });

    // Agora o navegador é de outra usuária.
    await entrarViaApi(page.request, "pessoa2");

    const resposta = await page.goto(`/app/complaints/${id}`);
    expect(resposta?.status(), "relato privado de outra pessoa não pode abrir").toBe(404);

    const envio = await page.request.post(`/api/complaints/${id}/messages`, {
      data: { content: "não deveria conseguir escrever aqui" },
    });
    expect(envio.status()).toBe(403);
  });

  test("relato público abre para terceiros, mas a conversa não", async ({ page, request }) => {
    await entrarViaApi(request, "pessoa");
    const empresaId = await empresaComSessao(page.request);
    const { id, titulo } = await criarRelato(request, { empresaId, assunto: "público" });

    await responderComoEmpresa(request, id);

    await entrarViaApi(page.request, "pessoa2");
    await page.goto(`/app/complaints/${id}`);

    await expect(page.getByText(titulo)).toBeVisible();
    await expect(
      page.getByText(RESPOSTA_EMPRESA),
      "a conversa entre autora e empresa não pode vazar para terceiros"
    ).toBeHidden();
    await expect(page.getByPlaceholder(caixaDeResposta)).toBeHidden();
  });

  test("empresa não alcança relato dirigido a outra empresa", async ({ page, request }) => {
    await entrarViaApi(page.request, "empresa");
    const minhaEmpresa = await empresaDaConta(page.request);

    await entrarViaApi(request, "pessoa");
    const { id } = await criarRelato(request, {
      empresaId: await outraEmpresa(request, minhaEmpresa),
      assunto: "outra empresa",
    });

    const pelaApi = await page.request.get(`/api/company/complaints/${id}`);
    expect(pelaApi.status()).toBe(403);

    const mensagem = await page.request.post(`/api/company/complaints/${id}/messages`, {
      data: { content: "não é da minha conta" },
    });
    expect(mensagem.status()).toBe(403);

    const pelaTela = await page.goto(`/app/company/complaints/${id}`);
    expect(pelaTela?.status()).toBe(404);
  });
});

/**
 * Vocabulário de status.
 *
 * Nasceu da task `54`. Antes dela o mesmo relato era "Em réplica" na lista e
 * "Respondida" no detalhe; quando a empresa encerrava, a usuária lia
 * "Concluído" e a empresa lia "Resolvida". Havia quatro mapas de rótulo
 * discordando entre si.
 *
 * O teste percorre os quatro status e confere os três lugares onde o status
 * aparece. Ele também exige que as palavras aposentadas não voltem por
 * nenhuma porta — é o que pega um mapa novo nascendo em algum componente.
 */
const ROTULO: Record<string, string> = {
  OPEN: "Aberta",
  RESPONDED: "Respondida",
  RESOLVED: "Resolvida",
  CANCELLED: "Cancelada",
};

/** Palavras que a task `54` tirou do produto. Nenhuma tela pode trazê-las de volta. */
const APOSENTADOS = ["Em aberto", "Em réplica", "Concluído", "Chamado"];

test.describe("o status tem um nome só", () => {
  test("lista, detalhe e painel da empresa leem igual nos quatro status", async ({
    page,
    request,
  }) => {
    const empresaId = await empresaComSessao(request);
    await entrarViaApi(request, "pessoa");
    const { id } = await criarRelato(request, { empresaId, assunto: "rotulo de status" });

    for (const status of ["OPEN", "RESPONDED", "RESOLVED", "CANCELLED"]) {
      if (status !== "OPEN") {
        await marcarStatusComoEmpresa(request, id, status);
      }
      const esperado = ROTULO[status];

      // 1. A lista da autora. O cartão é recortado pelo href, senão o texto de
      // outro relato da mesma conta entraria na conta.
      await entrarViaApi(page.request, "pessoa");
      await page.goto("/app/complaints");
      const cartao = page.locator(`a[href="/app/complaints/${id}"]`);
      await expect(cartao, `o relato sumiu da lista em ${status}`).toBeVisible();
      expect(
        await cartao.innerText(),
        `na lista, ${status} deveria ler "${esperado}"`
      ).toContain(esperado);

      // 2. O detalhe da autora.
      await page.goto(`/app/complaints/${id}`);
      await expect(
        page.getByRole("status"),
        `no detalhe da autora, ${status} deveria ler "${esperado}"`
      ).toHaveText(esperado);
      await conferirAposentados(page, `detalhe da autora em ${status}`);

      // 3. O painel da empresa.
      await entrarViaApi(page.request, "empresa");
      await page.goto(`/app/company/complaints/${id}`);
      await expect(
        page.getByRole("status"),
        `no painel da empresa, ${status} deveria ler "${esperado}"`
      ).toHaveText(esperado);
      await conferirAposentados(page, `painel da empresa em ${status}`);
    }
  });
});

/**
 * Nenhuma palavra aposentada em lugar nenhum da tela.
 *
 * Página inteira, e não só o selo: "Chamado Concluído" era o título da faixa de
 * encerramento, longe do selo, e é justamente o tipo de sobra que passa
 * despercebida numa conferência pontual. A lista de mudança de status do painel
 * da empresa entra no `innerText` junto com as opções, mas as opções são os
 * rótulos unificados — nenhuma palavra desta lista aparece lá.
 */
async function conferirAposentados(page: Page, onde: string) {
  const texto = await page.locator("body").innerText();
  for (const palavra of APOSENTADOS) {
    expect(texto, `${onde}: a palavra "${palavra}" voltou à tela`).not.toContain(palavra);
  }
}

/** Loga o contexto como empresa e devolve o id da empresa dela. */
async function empresaComSessao(request: APIRequestContext) {
  await entrarViaApi(request, "empresa");
  return empresaDaConta(request);
}

/** Resposta da empresa pela API. O contexto vira sessão de empresa. */
async function responderComoEmpresa(
  request: APIRequestContext,
  id: string
) {
  await entrarViaApi(request, "empresa");
  const resposta = await request.post(`/api/company/complaints/${id}/messages`, {
    data: { content: RESPOSTA_EMPRESA },
  });
  expect(
    resposta.status(),
    `resposta da empresa devolveu ${resposta.status()}`
  ).toBe(201);
}

/** Troca de status pela API, como empresa. */
async function marcarStatusComoEmpresa(
  request: APIRequestContext,
  id: string,
  status: string
) {
  await entrarViaApi(request, "empresa");
  const resposta = await request.patch(`/api/company/complaints/${id}/status`, {
    data: { status },
  });
  expect(resposta.ok(), `PATCH de status devolveu ${resposta.status()}`).toBeTruthy();
}
