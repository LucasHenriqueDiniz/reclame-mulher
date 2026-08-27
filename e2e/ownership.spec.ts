import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";

import { CONTAS, entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste, tituloDeTeste } from "./fixtures/db";

/**
 * Posse do recurso, e não papel.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * A `api-authorization.spec.ts` prova que um papel não entra na área de outro:
 * pessoa não abre a área da empresa, empresa não abre a do admin. O que ela
 * **não** prova é o caso mais perigoso de todos, porque não parece perigoso: a
 * chamada vem de alguém com o papel certo, no endpoint certo, com o id errado.
 *
 * Sem RLS, nada no banco impede isso. Só o `if` dentro do handler impede. Esta
 * spec existe para que apagar esse `if` quebre a suíte.
 *
 * A segunda metade cobre anonimato, que é posse de outro tipo — posse do
 * próprio nome. A task `16` mediu que ele estava viajando no payload da página
 * mesmo quando a tela mostrava "Anônima".
 */

/** Sessão isolada, em contexto próprio, para não brigar por cookie. */
async function sessao(browser: Browser, papel: keyof typeof CONTAS): Promise<APIRequestContext> {
  const contexto = await browser.newContext();
  await entrarViaApi(contexto.request, papel);
  return contexto.request;
}

/** Id de uma empresa que **não** é a da conta `empresa`. */
async function outraEmpresaQueNaoADaConta(
  requestPessoa: APIRequestContext,
  requestEmpresa: APIRequestContext
): Promise<string> {
  const { company } = await (await requestEmpresa.get("/api/company/profile")).json();
  const empresas: Array<{ id: string; name: string }> = await (
    await requestPessoa.get("/api/companies")
  ).json();
  const outra = empresas.find((e) => e.id !== company.id);
  expect(
    outra,
    "o seed precisa de pelo menos duas empresas para testar posse entre empresas"
  ).toBeTruthy();
  return outra!.id;
}

async function criar(
  request: APIRequestContext,
  opcoes: { empresaId: string; assunto: string; publico?: boolean; anonimo?: boolean }
) {
  const titulo = tituloDeTeste(opcoes.assunto);
  const resposta = await request.post("/api/complaints", {
    data: {
      company_id: opcoes.empresaId,
      title: titulo,
      description: "Relato criado para o teste de posse e anonimato.",
      is_public: opcoes.publico ?? true,
      is_anonymous: opcoes.anonimo ?? false,
    },
  });
  expect(resposta.status(), await resposta.text()).toBe(201);
  const { id } = await resposta.json();
  return { id, titulo };
}

test.beforeAll(async () => {
  await limparRelatosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

test.describe("uma empresa não alcança o relato de outra", () => {
  test("os três endpoints de /api/company/complaints/[id] respondem 403", async ({ browser }) => {
    const pessoa = await sessao(browser, "pessoa");
    const empresa = await sessao(browser, "empresa");

    const alheia = await outraEmpresaQueNaoADaConta(pessoa, empresa);
    const { id } = await criar(pessoa, { empresaId: alheia, assunto: "posse entre empresas" });

    // Mesmo papel, mesmo endpoint, id de outra empresa.
    const leitura = await empresa.get(`/api/company/complaints/${id}`);
    expect(leitura.status(), "ler o relato de outra empresa").toBe(403);

    const status = await empresa.patch(`/api/company/complaints/${id}/status`, {
      data: { status: "RESOLVED" },
    });
    expect(status.status(), "mudar o status do relato de outra empresa").toBe(403);

    const mensagem = await empresa.post(`/api/company/complaints/${id}/messages`, {
      data: { content: "Resposta que não deveria ser possível." },
    });
    expect(mensagem.status(), "responder o relato de outra empresa").toBe(403);

    // E o relato continua intacto: a negação não pode ter efeito colateral.
    const dona = await sessao(browser, "pessoa");
    const meus = await (await dona.get("/api/complaints?mine=1")).json();
    const meu = meus.find((c: { id: string }) => c.id === id);
    expect(meu?.status, "o status não pode ter mudado apesar do 403").toBe("OPEN");
  });
});

test.describe("uma terceira pessoa não escreve no relato alheio", () => {
  test("POST /api/complaints/[id]/messages responde 403", async ({ browser }) => {
    const pessoa = await sessao(browser, "pessoa");
    const empresa = await sessao(browser, "empresa");
    const { company } = await (await empresa.get("/api/company/profile")).json();
    const { id } = await criar(pessoa, { empresaId: company.id, assunto: "terceira pessoa" });

    const terceira = await sessao(browser, "pessoa2");
    const resposta = await terceira.post(`/api/complaints/${id}/messages`, {
      data: { content: "Mensagem de quem não é a autora nem a empresa." },
    });
    expect(
      resposta.status(),
      "quem não é autora nem membro da empresa não pode escrever na conversa"
    ).toBe(403);
  });
});

test.describe("relato privado não vaza para terceiros", () => {
  test("a página responde sem o conteúdo para quem não é a autora", async ({ browser }) => {
    const pessoa = await sessao(browser, "pessoa");
    const empresa = await sessao(browser, "empresa");
    const { company } = await (await empresa.get("/api/company/profile")).json();
    const { id, titulo } = await criar(pessoa, {
      empresaId: company.id,
      assunto: "relato privado",
      publico: false,
    });

    const terceira = await sessao(browser, "pessoa2");
    const html = await (await terceira.get(`/app/complaints/${id}`)).text();
    expect(html.includes(titulo), "o título do relato privado apareceu para terceira pessoa").toBe(
      false
    );

    // E não aparece na lista pública da API.
    const lista = await (await terceira.get("/api/complaints")).json();
    expect(
      lista.some((c: { id: string }) => c.id === id),
      "relato privado apareceu na lista pública"
    ).toBe(false);
  });
});

test.describe("anonimato é do dado, não da tela", () => {
  test("o nome da autora não sai do servidor em relato anônimo", async ({ browser }) => {
    const pessoa = await sessao(browser, "pessoa");
    const empresa = await sessao(browser, "empresa");
    const { company } = await (await empresa.get("/api/company/profile")).json();
    const { id, titulo } = await criar(pessoa, {
      empresaId: company.id,
      assunto: "anonimato",
      anonimo: true,
    });

    const nomeReal = "Maria Silva";

    // 1) A página, vista por uma terceira pessoa logada. Antes da task 16 o
    //    nome vinha aqui dentro, em `"author":{"name":"..."}`, apesar de a tela
    //    escrever "Autor (anônimo)".
    const terceira = await sessao(browser, "pessoa2");
    const pagina = await (await terceira.get(`/app/complaints/${id}`)).text();
    expect(pagina.includes(titulo), "a terceira pessoa precisa ver o relato público").toBe(true);
    expect(
      pagina.includes(nomeReal),
      "o nome real da autora anônima veio no HTML da página pública"
    ).toBe(false);

    // 2) A lista pública da API, sem sessão nenhuma.
    const semSessao = await browser.newContext();
    const lista = await (await semSessao.request.get("/api/complaints")).json();
    const naLista = lista.find((c: { id: string }) => c.id === id);
    expect(naLista?.author, "a lista pública trouxe autora em relato anônimo").toBeNull();
    await semSessao.close();

    // 3) A própria empresa reclamada. As telas dela já escrevem "Anônima" — o
    //    dado agora acompanha.
    const detalhe = await (await empresa.get(`/api/company/complaints/${id}`)).json();
    expect(
      detalhe.complaint.author,
      "a empresa recebeu o nome de quem escolheu o anonimato"
    ).toBeNull();
  });

  test("relato identificado continua mostrando o nome", async ({ browser }) => {
    // O contrário do teste acima. Sem ele, nulificar tudo passaria.
    const pessoa = await sessao(browser, "pessoa");
    const empresa = await sessao(browser, "empresa");
    const { company } = await (await empresa.get("/api/company/profile")).json();
    const { id } = await criar(pessoa, {
      empresaId: company.id,
      assunto: "identificado",
      anonimo: false,
    });

    const detalhe = await (await empresa.get(`/api/company/complaints/${id}`)).json();
    expect(
      detalhe.complaint.author?.name,
      "quem não pediu anonimato precisa continuar identificada para a empresa"
    ).toBe("Maria Silva");
  });
});

test.describe("o portão sem sessão", () => {
  const SEM_SESSAO = [
    "/api/complaints?mine=1",
    "/api/company/complaints",
    "/api/company/profile",
    "/api/user/profile",
    "/api/me",
    "/api/admin/audit",
  ];

  test("toda rota de dado pessoal responde 401, e nenhuma responde 200", async ({ browser }) => {
    // Guarda contra alguém "simplificar" o middleware ou a lista de rotas
    // públicas. O número exato importa: 200 com corpo vazio já seria vazamento
    // de existência, e 500 seria checagem que nem chegou a rodar.
    const semSessao = await browser.newContext();
    const medido: Record<string, number> = {};
    for (const caminho of SEM_SESSAO) {
      medido[caminho] = (await semSessao.request.get(caminho, { maxRedirects: 0 })).status();
    }
    await semSessao.close();

    expect(medido, "alguma rota de dado pessoal deixou de exigir sessão").toEqual(
      Object.fromEntries(SEM_SESSAO.map((caminho) => [caminho, 401]))
    );
  });
});
