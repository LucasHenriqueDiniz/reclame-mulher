import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";

import { entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste } from "./fixtures/db";

/**
 * O contrato de erro da API.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * `docs/api-erros.md` descreve o formato; esta spec o torna verdadeiro. Sem
 * ela, "padronizamos os erros" vira uma frase no README que envelhece no
 * primeiro handler novo.
 *
 * O que se verifica aqui:
 *
 * 1. **forma** — todo erro é `{ error: { code, message, fields? } }`;
 * 2. **código** — o `code` combina com o status HTTP;
 * 3. **idioma** — a `message` vai para a tela, então está em português;
 * 4. **discrição** — nenhum 500 devolve stack, caminho de arquivo ou nome de
 *    tabela;
 * 5. **origem única** — o middleware barra antes do handler, e mesmo assim
 *    responde no mesmo envelope.
 */

const STATUS_DO_CODIGO: Record<string, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * Palavras que denunciam mensagem escrita para quem programa, e não para quem
 * usa. Todas estavam no repositório antes da task `17`, indo direto para a
 * tela de uma plataforma em português.
 */
const NAO_PODE_APARECER = [
  "Unauthorized",
  "Forbidden",
  "Internal server error",
  "Not found",
  "Validation error",
  "Failed to",
  "does not belong",
  "out of sync",
];

/** Sinais de que a resposta carregou tripa de servidor junto. */
const VAZAMENTO = [
  "at Object.",
  "at async",
  ".ts:",
  "node_modules",
  "E:\\\\",
  "/src/",
  "drizzle",
  "neon",
  "DATABASE_URL",
];

async function sessao(browser: Browser, papel: "pessoa" | "empresa" | "admin") {
  const contexto = await browser.newContext();
  await entrarViaApi(contexto.request, papel);
  return contexto.request;
}

function conferirEnvelope(corpo: unknown, status: number, rotulo: string) {
  const erro = (corpo as { error?: { code?: unknown; message?: unknown; fields?: unknown } })?.error;

  expect(typeof erro, `${rotulo}: o corpo não tem \`error\` como objeto`).toBe("object");
  expect(typeof erro?.code, `${rotulo}: \`error.code\` precisa ser string`).toBe("string");
  expect(typeof erro?.message, `${rotulo}: \`error.message\` precisa ser string`).toBe("string");

  const code = erro?.code as string;
  expect(
    STATUS_DO_CODIGO[code],
    `${rotulo}: código \`${code}\` não é um dos previstos em docs/api-erros.md`
  ).toBeDefined();
  expect(
    status,
    `${rotulo}: código \`${code}\` deveria vir com status ${STATUS_DO_CODIGO[code]}`
  ).toBe(STATUS_DO_CODIGO[code]);

  const message = erro?.message as string;
  expect(message.length, `${rotulo}: mensagem vazia não ajuda ninguém`).toBeGreaterThan(10);

  for (const palavra of NAO_PODE_APARECER) {
    expect(
      message.includes(palavra),
      `${rotulo}: a mensagem mostrada para a usuária contém "${palavra}"`
    ).toBe(false);
  }

  for (const marca of VAZAMENTO) {
    expect(
      JSON.stringify(corpo).includes(marca),
      `${rotulo}: a resposta de erro carrega "${marca}" — detalhe interno não sai daqui`
    ).toBe(false);
  }
}

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

test("o middleware barra sem sessão no mesmo envelope do handler", async ({ browser }) => {
  const semSessao = await browser.newContext();
  const resposta = await semSessao.request.get("/api/company/complaints", { maxRedirects: 0 });
  const corpo = await resposta.json();
  await semSessao.close();

  conferirEnvelope(corpo, resposta.status(), "middleware sem sessão");
  expect(corpo.error.code, "sem sessão o código é UNAUTHENTICATED").toBe("UNAUTHENTICATED");
});

test("papel errado devolve FORBIDDEN, não UNAUTHENTICATED", async ({ browser }) => {
  // A diferença entre "não sei quem é você" e "sei, e você não pode". Um
  // cliente que trate as duas igual manda a usuária logada de volta ao login.
  const pessoa = await sessao(browser, "pessoa");
  const resposta = await pessoa.get("/api/company/complaints");
  const corpo = await resposta.json();

  conferirEnvelope(corpo, resposta.status(), "pessoa em rota de empresa");
  expect(corpo.error.code).toBe("FORBIDDEN");
});

test("validação devolve o campo que reprovou", async ({ browser }) => {
  const pessoa = await sessao(browser, "pessoa");
  const resposta = await pessoa.post("/api/complaints", {
    data: { title: "x", description: "" },
  });
  const corpo = await resposta.json();

  conferirEnvelope(corpo, resposta.status(), "POST /api/complaints com corpo ruim");
  expect(corpo.error.code).toBe("VALIDATION_ERROR");
  expect(
    Object.keys(corpo.error.fields ?? {}).length,
    "erro de validação sem `fields` deixa o formulário sem saber o que marcar"
  ).toBeGreaterThan(0);

  // O `issues` cru do Zod não pode vazar: ele descreve a forma do schema.
  expect(
    JSON.stringify(corpo).includes('"expected"') || JSON.stringify(corpo).includes('"received"'),
    "o `issues` cru do Zod vazou na resposta"
  ).toBe(false);
});

test("id inexistente devolve NOT_FOUND, e não 500", async ({ browser }) => {
  const empresa = await sessao(browser, "empresa");
  const inexistente = "00000000-0000-4000-8000-000000000000";
  const resposta = await empresa.get(`/api/company/complaints/${inexistente}`);
  const corpo = await resposta.json();

  conferirEnvelope(corpo, resposta.status(), "relato inexistente");
  expect(corpo.error.code).toBe("NOT_FOUND");
});

test("id malformado não estoura o handler", async ({ browser }) => {
  // Um uuid inválido chega no `where` do Drizzle e o Postgres reclama. O
  // handler tem que traduzir isso, e nunca devolver a reclamação do banco.
  const empresa = await sessao(browser, "empresa");
  const resposta = await empresa.get("/api/company/complaints/nao-e-um-uuid");
  const corpo = await resposta.json().catch(() => null);

  expect(
    resposta.status(),
    `id malformado devolveu ${resposta.status()} — 5xx aqui é handler estourando`
  ).toBeLessThan(500);
  conferirEnvelope(corpo, resposta.status(), "id malformado");
});

test.describe("uma amostra larga de erros, toda no mesmo formato", () => {
  const CASOS: Array<{
    rotulo: string;
    papel: "pessoa" | "empresa" | "admin" | null;
    metodo: "GET" | "POST" | "PATCH" | "DELETE";
    caminho: string;
    corpo?: unknown;
  }> = [
    { rotulo: "auditoria sem ser admin", papel: "pessoa", metodo: "GET", caminho: "/api/admin/audit" },
    { rotulo: "empresas do admin sem ser admin", papel: "empresa", metodo: "GET", caminho: "/api/admin/companies" },
    { rotulo: "criar empresa sem ser admin", papel: "pessoa", metodo: "POST", caminho: "/api/companies", corpo: {} },
    { rotulo: "perfil da empresa como pessoa", papel: "pessoa", metodo: "GET", caminho: "/api/company/profile" },
    { rotulo: "projetos da empresa como pessoa", papel: "pessoa", metodo: "POST", caminho: "/api/company/projects", corpo: {} },
    { rotulo: "equipe da empresa como pessoa", papel: "pessoa", metodo: "GET", caminho: "/api/company/users" },
    { rotulo: "post de blog sem ser admin", papel: "pessoa", metodo: "POST", caminho: "/api/blog/posts", corpo: {} },
    { rotulo: "blog com escopo admin sem sessão", papel: null, metodo: "GET", caminho: "/api/blog/posts?scope=admin" },
    { rotulo: "perfil próprio com corpo ruim", papel: "pessoa", metodo: "PATCH", caminho: "/api/user/profile", corpo: { name: 1 } },
    { rotulo: "trocar senha com corpo ruim", papel: "pessoa", metodo: "POST", caminho: "/api/auth/change-password", corpo: {} },
    { rotulo: "login com corpo ruim", papel: null, metodo: "POST", caminho: "/api/auth/login", corpo: {} },
    { rotulo: "denunciar sem sessão", papel: null, metodo: "POST", caminho: "/api/company/report", corpo: {} },
  ];

  for (const caso of CASOS) {
    test(caso.rotulo, async ({ browser }) => {
      let request: APIRequestContext;
      if (caso.papel) {
        request = await sessao(browser, caso.papel);
      } else {
        request = (await browser.newContext()).request;
      }

      const opcoes = caso.corpo !== undefined ? { data: caso.corpo } : undefined;
      const resposta =
        caso.metodo === "GET"
          ? await request.get(caso.caminho, { maxRedirects: 0 })
          : caso.metodo === "POST"
            ? await request.post(caso.caminho, opcoes)
            : caso.metodo === "PATCH"
              ? await request.patch(caso.caminho, opcoes)
              : await request.delete(caso.caminho, opcoes);

      expect(
        resposta.status(),
        `${caso.rotulo} devolveu ${resposta.status()} — este caso deveria falhar`
      ).toBeGreaterThanOrEqual(400);

      conferirEnvelope(await resposta.json(), resposta.status(), caso.rotulo);
    });
  }
});
