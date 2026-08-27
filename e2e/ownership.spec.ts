import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";

import { CONTAS, entrarViaApi } from "./fixtures/auth";
import { limparProjetosDeTeste, limparRelatosDeTeste, tituloDeTeste } from "./fixtures/db";

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
  await limparProjetosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
  await limparProjetosDeTeste();
});

/**
 * Papel dentro da empresa: OWNER administra, MEMBER não.
 *
 * Este bloco nasceu da task `56`. Até ela, a única conta de empresa do seed era
 * MEMBER, e `canManageCompany` exige OWNER ou ADMIN — então **toda** rota de
 * administração respondia 403 para a única conta que existia. O efeito colateral
 * é o que interessa aqui: a checagem de **posse** de
 * `/api/company/projects/[id]`, a que compara o `companyId` do projeto com o da
 * sessão, era inalcançável por teste, porque a checagem de papel barrava antes.
 * Havia código de autorização sem cobertura possível.
 *
 * Com `empresaDona` (OWNER da Construtora X) e `empresaOutra` (OWNER da
 * Transportes Sul), os dois lados passam a ser exercíveis.
 */
test.describe("papel e posse dentro da empresa", () => {
  test("OWNER administra a empresa; MEMBER da mesma empresa não", async ({ browser }) => {
    const dona = await sessao(browser, "empresaDona");
    const membro = await sessao(browser, "empresa");

    // Mesma empresa para as duas contas — senão isto não estaria comparando papel.
    const daDona = await (await dona.get("/api/company/profile")).json();
    const doMembro = await (await membro.get("/api/company/profile")).json();
    expect(
      daDona.company.id,
      "as duas contas precisam ser da mesma empresa para o teste comparar papel, e não posse"
    ).toBe(doMembro.company.id);

    // Corpo vazio: o DTO é todo opcional, então a chamada permitida responde
    // 200 sem alterar a empresa da demonstração.
    expect(
      (await dona.patch("/api/company/profile", { data: {} })).status(),
      "OWNER precisa conseguir editar o perfil da própria empresa"
    ).toBe(200);
    expect(
      (await membro.patch("/api/company/profile", { data: {} })).status(),
      "MEMBER não administra a empresa"
    ).toBe(403);

    const corpoDoProjeto = {
      name: tituloDeTeste("projeto de papel"),
      description: "Projeto criado pelo teste de papel. É apagado no fim.",
      location: "São Paulo",
    };

    expect(
      (await membro.post("/api/company/projects", { data: corpoDoProjeto })).status(),
      "MEMBER não cria projeto"
    ).toBe(403);

    const criado = await dona.post("/api/company/projects", { data: corpoDoProjeto });
    expect(criado.status(), "OWNER precisa conseguir criar projeto").toBe(201);
    const { project } = await criado.json();

    expect(
      (await membro.patch(`/api/company/projects/${project.id}`, { data: { name: "não" } })).status(),
      "MEMBER não edita projeto"
    ).toBe(403);
    expect(
      (
        await dona.patch(`/api/company/projects/${project.id}`, {
          data: { status: "IN_PROGRESS" },
        })
      ).status(),
      "OWNER precisa conseguir editar o próprio projeto"
    ).toBe(200);

    expect(
      (await membro.delete(`/api/company/projects/${project.id}`)).status(),
      "MEMBER não apaga projeto"
    ).toBe(403);
    expect(
      (await dona.delete(`/api/company/projects/${project.id}`)).status(),
      "OWNER precisa conseguir apagar o próprio projeto"
    ).toBe(200);
  });

  test("OWNER de uma empresa não toca no projeto de outra", async ({ browser }) => {
    // O caso que a task 11 apontou como inalcançável: papel certo, endpoint
    // certo, id de outra empresa. Sem RLS, só o `if` do handler impede.
    const dona = await sessao(browser, "empresaDona");
    const outra = await sessao(browser, "empresaOutra");

    const criado = await dona.post("/api/company/projects", {
      data: { name: tituloDeTeste("projeto alheio"), location: "São Paulo" },
    });
    expect(criado.status(), await criado.text()).toBe(201);
    const { project } = await criado.json();

    expect(
      (await outra.patch(`/api/company/projects/${project.id}`, { data: { name: "invadido" } })).status(),
      "OWNER de outra empresa editou projeto que não é dela"
    ).toBe(403);
    expect(
      (await outra.delete(`/api/company/projects/${project.id}`)).status(),
      "OWNER de outra empresa apagou projeto que não é dela"
    ).toBe(403);

    // E o projeto continua lá, intacto: a negação não pode ter efeito colateral.
    const { projects } = await (await dona.get("/api/company/projects")).json();
    const ainda = projects.find((p: { id: string }) => p.id === project.id);
    expect(ainda?.name, "o nome mudou apesar do 403").toBe(project.name);

    await dona.delete(`/api/company/projects/${project.id}`);
  });

  test("o company_id do corpo é ignorado: o projeto nasce na empresa da sessão", async ({
    browser,
  }) => {
    // A rota sobrescreve o `company_id` do corpo com o da sessão. Se algum dia
    // alguém "simplificar" isso confiando no corpo, uma empresa passa a criar
    // projeto dentro de outra — e este teste falha antes.
    const dona = await sessao(browser, "empresaDona");
    const outra = await sessao(browser, "empresaOutra");
    const alheia = await (await outra.get("/api/company/profile")).json();

    const criado = await dona.post("/api/company/projects", {
      data: { name: tituloDeTeste("company_id forjado"), company_id: alheia.company.id },
    });
    expect(criado.status(), await criado.text()).toBe(201);
    const { project } = await criado.json();

    const naOutra = await (await outra.get("/api/company/projects")).json();
    expect(
      naOutra.projects.some((p: { id: string }) => p.id === project.id),
      "o projeto foi parar na empresa cujo id veio no corpo"
    ).toBe(false);

    await dona.delete(`/api/company/projects/${project.id}`);
  });
});

test.describe("atualizar o perfil da empresa é atualização parcial", () => {
  test("mandar um campo não apaga os outros", async ({ browser }) => {
    // Este teste existe por causa de um defeito que a task `56` desenterrou ao
    // criar a primeira conta OWNER do seed: `UpdateCompanyProfileDto.parse({})`
    // devolvia os dezoito campos como `null`, porque o `transform` do Zod roda
    // também para chave ausente e o código escrevia `value == null`. Resultado:
    // mandar só a descrição apagava nome, CNPJ, telefone e o resto — e um corpo
    // vazio devolvia 500, porque `name` é `NOT NULL`.
    //
    // Ninguém tinha visto porque a rota exige OWNER e a única conta de empresa
    // do seed era MEMBER. Era rota que conta nenhuma alcançava.
    const dona = await sessao(browser, "empresaDona");
    const antes = (await (await dona.get("/api/company/profile")).json()).company;

    const resposta = await dona.patch("/api/company/profile", {
      data: { description: `${antes.description ?? ""} ` },
    });
    expect(resposta.status(), await resposta.text()).toBe(200);

    const depois = (await (await dona.get("/api/company/profile")).json()).company;
    expect(depois.name, "o nome da empresa foi apagado por uma atualização parcial").toBe(
      antes.name
    );
    expect(depois.cnpj, "o CNPJ foi apagado por uma atualização parcial").toBe(antes.cnpj);
    expect(depois.phone, "o telefone foi apagado por uma atualização parcial").toBe(antes.phone);
    expect(depois.city, "a cidade foi apagada por uma atualização parcial").toBe(antes.city);

    // `null` explícito continua sendo "limpe este campo" — a distinção que o
    // conserto precisava preservar, e não só "nunca apague nada".
    const limpando = await dona.patch("/api/company/profile", { data: { description: null } });
    expect(limpando.status()).toBe(200);
    const limpo = (await (await dona.get("/api/company/profile")).json()).company;
    expect(limpo.description, "null explícito precisa continuar limpando o campo").toBeNull();
    expect(limpo.name, "e sem levar o resto junto").toBe(antes.name);

    // Devolve a descrição do seed: este é o banco da demonstração.
    await dona.patch("/api/company/profile", { data: { description: antes.description } });
    const restaurado = (await (await dona.get("/api/company/profile")).json()).company;
    expect(restaurado.description, "a descrição do seed não voltou").toBe(antes.description);
  });
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
