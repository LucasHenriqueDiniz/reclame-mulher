import fs from "node:fs";
import path from "node:path";

import {
  expect,
  request as criarContexto,
  test,
  type APIRequestContext,
} from "@playwright/test";

import { BASE_URL } from "../playwright.config";
import { CONTAS, SENHA, type Papel as PapelDeConta } from "./fixtures/auth";
import { limparRelatosDeTeste, tituloDeTeste } from "./fixtures/db";

/**
 * Matriz de autorização de todas as rotas de API.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * O projeto usa autenticação própria **sem RLS** — decisão registrada no
 * `TODO.md`. Isso significa que toda a proteção é código de aplicação: uma rota
 * que esqueça de checar o papel fica aberta, sem rede de segurança no banco.
 * Esta spec é essa rede.
 *
 * ## O que é testado, e o que não é
 *
 * Cada endpoint declara quem é **negado** e, quando a chamada é segura, quem é
 * **permitido**. Papel que não aparece em nenhuma das duas listas não é
 * chamado, e o motivo fica no campo `nota` — sempre um destes:
 *
 * - **destrutivo**: chamar com o papel autorizado apagaria ou alteraria dado do
 *   seed, que é o banco da demonstração. Nesses casos só o lado da negação é
 *   exercido.
 * - **coberto em outra spec**: o caminho feliz já tem teste em
 *   `complaint-create` ou `complaint-response`; repetir aqui só deixaria a
 *   suíte lenta.
 *
 * Onde a negação é testada num verbo que escreve, o corpo enviado é
 * propositalmente vazio ou inválido: se a checagem de autorização falhasse, a
 * validação ainda barraria antes de tocar no banco. O teste falha alto de
 * qualquer jeito, mas sem estrago.
 *
 * ## Negado é 401 para anônima e 403 para logada
 *
 * Até a task `17` a asserção aceitava qualquer um dos dois, porque o código
 * misturava: `getCurrentCompanyContext` e `getCurrentAdminContext` devolviam
 * `null` tanto para "sem sessão" quanto para "papel errado", e o handler não
 * tinha como distinguir.
 *
 * Agora tem, e a asserção é exata. 401 quer dizer "não sei quem é você —
 * autentique-se"; 403 quer dizer "sei quem é você e você não pode". Um cliente
 * que trate 401 mandando para o login precisa que a diferença seja verdadeira,
 * senão manda a usuária logada de volta para uma tela que ela já passou.
 */

type Papel = "anonimo" | "pessoa" | "pessoa2" | "empresa" | "empresaDona" | "admin";

const PAPEIS: Papel[] = ["anonimo", "pessoa", "pessoa2", "empresa", "empresaDona", "admin"];

const TODOS: Papel[] = PAPEIS;
const LOGADOS: Papel[] = ["pessoa", "pessoa2", "empresa", "empresaDona", "admin"];

type Ids = {
  empresa: string;
  outraEmpresa: string;
  relato: string;
  projeto: string;
  post: string;
  membro: string;
};

type Endpoint = {
  metodo: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  caminho: (ids: Ids) => string;
  rotulo: string;
  corpo?: unknown;
  permite?: Papel[];
  nega?: Papel[];
  nota?: string;
};

const ENDPOINTS: Endpoint[] = [
  // ---------------------------------------------------------------- públicas
  { rotulo: "GET /api/blog/featured", metodo: "GET", caminho: () => "/api/blog/featured", permite: TODOS },
  { rotulo: "GET /api/blog/tags", metodo: "GET", caminho: () => "/api/blog/tags", permite: TODOS },
  { rotulo: "GET /api/blog/posts", metodo: "GET", caminho: () => "/api/blog/posts", permite: TODOS },
  { rotulo: "GET /api/blog/posts/[id]", metodo: "GET", caminho: (ids) => `/api/blog/posts/${ids.post}`, permite: TODOS },
  { rotulo: "GET /api/companies", metodo: "GET", caminho: () => "/api/companies", permite: TODOS },
  { rotulo: "GET /api/companies/top", metodo: "GET", caminho: () => "/api/companies/top", permite: TODOS },
  {
    rotulo: "GET /api/companies/[id]/projects",
    metodo: "GET",
    caminho: (ids) => `/api/companies/${ids.empresa}/projects`,
    permite: TODOS,
  },
  { rotulo: "GET /api/complaints", metodo: "GET", caminho: () => "/api/complaints", permite: TODOS },
  { rotulo: "GET /api/search", metodo: "GET", caminho: () => "/api/search?q=obra", permite: TODOS },

  // -------------------------------------------------- exige sessão, sem papel
  {
    // Sem sessão esta rota responde 200 com tudo nulo, e não 401: "existe
    // alguém logado?" é pergunta, não operação protegida. Ver task `58`. O
    // corpo devolvido a quem não entrou é conferido em `ownership.spec.ts`.
    rotulo: "GET /api/me",
    metodo: "GET",
    caminho: () => "/api/me",
    permite: TODOS,
  },
  {
    rotulo: "GET /api/complaints?mine=1",
    metodo: "GET",
    caminho: () => "/api/complaints?mine=1",
    permite: LOGADOS,
    nega: ["anonimo"],
  },
  {
    rotulo: "POST /api/complaints",
    metodo: "POST",
    caminho: () => "/api/complaints",
    corpo: {},
    nega: ["anonimo"],
    nota: "criação com papel válido é coberta em complaint-create.spec.ts",
  },
  {
    rotulo: "POST /api/complaints/[id]/messages",
    metodo: "POST",
    caminho: (ids) => `/api/complaints/${ids.relato}/messages`,
    corpo: {},
    nega: ["anonimo", "pessoa2"],
    nota: "autora e empresa são cobertas em complaint-response.spec.ts",
  },
  {
    rotulo: "POST /api/company/report",
    metodo: "POST",
    caminho: () => "/api/company/report",
    corpo: {},
    nega: ["anonimo"],
    nota: "denúncia com sessão cria registro no banco — só o lado negado é exercido",
  },
  {
    rotulo: "PATCH /api/user/profile",
    metodo: "PATCH",
    caminho: () => "/api/user/profile",
    corpo: {},
    nega: ["anonimo"],
    nota: "destrutivo: alteraria o perfil das contas de demonstração",
  },
  {
    rotulo: "DELETE /api/user/account",
    metodo: "DELETE",
    caminho: () => "/api/user/account",
    nega: ["anonimo"],
    nota: "destrutivo: apagaria a conta de demonstração",
  },
  {
    rotulo: "POST /api/auth/change-password",
    metodo: "POST",
    caminho: () => "/api/auth/change-password",
    corpo: {},
    nega: ["anonimo"],
    nota: "destrutivo: trocaria a senha das contas do seed, quebrando toda a suíte",
  },

  // ------------------------------------------------------------- área da empresa
  {
    rotulo: "GET /api/company/complaints",
    metodo: "GET",
    caminho: () => "/api/company/complaints",
    permite: ["empresa"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
  },
  {
    rotulo: "GET /api/company/complaints/[id]",
    metodo: "GET",
    caminho: (ids) => `/api/company/complaints/${ids.relato}`,
    permite: ["empresa"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
  },
  {
    rotulo: "POST /api/company/complaints/[id]/messages",
    metodo: "POST",
    caminho: (ids) => `/api/company/complaints/${ids.relato}/messages`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
    nota: "empresa é coberta em complaint-response.spec.ts",
  },
  {
    rotulo: "PATCH /api/company/complaints/[id]/status",
    metodo: "PATCH",
    caminho: (ids) => `/api/company/complaints/${ids.relato}/status`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
    nota: "empresa é coberta em complaint-response.spec.ts",
  },
  {
    rotulo: "GET /api/company/profile",
    metodo: "GET",
    caminho: () => "/api/company/profile",
    permite: ["empresa"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
  },
  {
    rotulo: "PATCH /api/company/profile",
    metodo: "PATCH",
    caminho: () => "/api/company/profile",
    corpo: {},
    // Os dois lados da mesma empresa: `empresa` é MEMBER e `empresaDona` é
    // OWNER. `canManageCompany` exige OWNER ou ADMIN, então a mesma rota
    // responde 403 para uma e 200 para a outra. Até a task `56` o seed só tinha
    // a MEMBER, e esta linha só sabia negar.
    //
    // O corpo vazio é de propósito: o DTO tem todos os campos opcionais, então
    // a chamada permitida responde 200 sem alterar nada da empresa do seed.
    permite: ["empresaDona"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin", "empresa"],
  },
  {
    rotulo: "DELETE /api/company/profile",
    metodo: "DELETE",
    caminho: () => "/api/company/profile",
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
    nota: "destrutivo: se a checagem falhasse, apagaria a empresa da demonstração",
  },
  {
    rotulo: "GET /api/company/projects",
    metodo: "GET",
    caminho: () => "/api/company/projects",
    permite: ["empresa"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
  },
  {
    rotulo: "POST /api/company/projects",
    metodo: "POST",
    caminho: () => "/api/company/projects",
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin", "empresa"],
    nota: "OWNER é coberta em ownership.spec.ts, com corpo válido e limpeza depois",
  },
  {
    rotulo: "PATCH /api/company/projects/[id]",
    metodo: "PATCH",
    caminho: (ids) => `/api/company/projects/${ids.projeto}`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin", "empresa"],
    nota: "OWNER é coberta em ownership.spec.ts, inclusive contra projeto de outra empresa",
  },
  {
    rotulo: "DELETE /api/company/projects/[id]",
    metodo: "DELETE",
    caminho: (ids) => `/api/company/projects/${ids.projeto}`,
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
    nota: "destrutivo: apagaria um projeto do seed",
  },
  {
    rotulo: "GET /api/company/users",
    metodo: "GET",
    caminho: () => "/api/company/users",
    permite: ["empresa"],
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
  },
  {
    rotulo: "POST /api/company/users",
    metodo: "POST",
    caminho: () => "/api/company/users",
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin", "empresa"],
    nota: "destrutivo para OWNER: convidar cria conta, e o seed é o banco da demonstração",
  },
  {
    rotulo: "PATCH /api/company/users/[userId]",
    metodo: "PATCH",
    caminho: (ids) => `/api/company/users/${ids.membro}`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "admin", "empresa"],
    nota: "destrutivo para OWNER: mudaria o papel da conta MEMBER da demonstração",
  },
  {
    rotulo: "DELETE /api/company/users/[userId]",
    metodo: "DELETE",
    caminho: (ids) => `/api/company/users/${ids.membro}`,
    nega: ["anonimo", "pessoa", "pessoa2", "admin"],
    nota: "destrutivo: removeria a própria conta de empresa da demonstração",
  },

  // -------------------------------------------------------------- administração
  {
    rotulo: "GET /api/admin/audit",
    metodo: "GET",
    caminho: () => "/api/admin/audit",
    permite: ["admin"],
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
  },
  {
    rotulo: "GET /api/admin/companies",
    metodo: "GET",
    caminho: () => "/api/admin/companies",
    permite: ["admin"],
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
  },
  {
    rotulo: "GET /api/blog/posts?scope=admin",
    metodo: "GET",
    caminho: () => "/api/blog/posts?scope=admin",
    permite: ["admin"],
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
  },
  {
    rotulo: "PATCH /api/admin/companies/[id]/verification",
    metodo: "PATCH",
    caminho: (ids) => `/api/admin/companies/${ids.outraEmpresa}/verification`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
    nota: "destrutivo: mudaria a verificação de uma empresa do seed",
  },
  {
    rotulo: "POST /api/companies",
    metodo: "POST",
    caminho: () => "/api/companies",
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
    nota: "criaria empresa no banco de demonstração",
  },
  {
    rotulo: "POST /api/blog/posts",
    metodo: "POST",
    caminho: () => "/api/blog/posts",
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
    nota: "criaria post no banco de demonstração",
  },
  {
    rotulo: "PUT /api/blog/posts/[id]",
    metodo: "PUT",
    caminho: (ids) => `/api/blog/posts/${ids.post}`,
    corpo: {},
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
    nota: "destrutivo: alteraria um post do seed",
  },
  {
    rotulo: "DELETE /api/blog/posts/[id]",
    metodo: "DELETE",
    caminho: (ids) => `/api/blog/posts/${ids.post}`,
    nega: ["anonimo", "pessoa", "pessoa2", "empresa"],
    nota: "destrutivo: apagaria um post do seed",
  },
];

/**
 * Rotas conscientemente fora da matriz executável, com o motivo. Todas aparecem
 * na matriz documental em `docs/autorizacao.md`.
 */
const FORA_DA_MATRIZ: Record<string, string> = {
  "/api/auth/login": "pública; o caminho feliz e a senha errada são cobertos em auth.spec.ts",
  "/api/auth/logout": "pública; coberta em auth.spec.ts",
  "/api/auth/register": "pública; chamar aqui criaria conta nova a cada execução",
  "/api/auth/register-company":
    "pública; chamar aqui criaria conta e empresa a cada execução",
  "/api/uploadthing":
    "a autorização vive no middleware do UploadThing (core.ts), não no route handler",
};

const contextos = new Map<Papel, APIRequestContext>();
let ids: Ids;

test.beforeAll(async () => {
  await limparRelatosDeTeste();

  for (const papel of PAPEIS) {
    const contexto = await criarContexto.newContext({ baseURL: BASE_URL });
    contextos.set(papel, contexto);
    if (papel === "anonimo") continue;

    const conta = CONTAS[papel as PapelDeConta];
    const login = await contexto.post("/api/auth/login", {
      data: { email: conta.email, password: SENHA },
    });
    if (!login.ok()) {
      throw new Error(
        `Login de ${papel} falhou com ${login.status()}. O banco foi populado? Rode: npm run db:seed`
      );
    }
  }

  ids = await coletarIds();
});

test.afterAll(async () => {
  for (const contexto of contextos.values()) {
    await contexto.dispose();
  }
  contextos.clear();
  await limparRelatosDeTeste();
});

async function coletarIds(): Promise<Ids> {
  const empresa = contextos.get("empresa")!;
  const pessoa = contextos.get("pessoa")!;
  const anonimo = contextos.get("anonimo")!;

  const { company } = await (await empresa.get("/api/company/profile")).json();
  const { user } = await (await empresa.get("/api/me")).json();

  const empresas = (await (await anonimo.get("/api/companies")).json()) as Array<{ id: string }>;
  const outra = empresas.find((item) => item.id !== company.id);
  if (!outra) {
    throw new Error("O seed precisa de pelo menos duas empresas para esta matriz.");
  }

  const projetos = (await (
    await anonimo.get(`/api/companies/${company.id}/projects`)
  ).json()) as Array<{ id: string }>;
  const { posts } = await (await anonimo.get("/api/blog/posts")).json();

  const criado = await pessoa.post("/api/complaints", {
    data: {
      company_id: company.id,
      title: tituloDeTeste("matriz de autorização"),
      description: "Relato usado apenas como alvo dos testes de autorização de API.",
      is_public: true,
    },
  });
  expect(criado.status(), "não consegui criar o relato-alvo da matriz").toBe(201);
  const relato = await criado.json();

  for (const [nome, valor] of [
    ["projeto", projetos[0]?.id],
    ["post do blog", posts?.[0]?.id],
  ] as const) {
    if (!valor) {
      throw new Error(`O seed não tem ${nome} — a matriz precisa de um id real.`);
    }
  }

  return {
    empresa: company.id,
    outraEmpresa: outra.id,
    relato: relato.id,
    projeto: projetos[0].id,
    post: posts[0].id,
    membro: user.id,
  };
}

async function chamar(papel: Papel, endpoint: Endpoint) {
  const contexto = contextos.get(papel)!;
  const url = endpoint.caminho(ids);
  const opcoes = endpoint.corpo !== undefined ? { data: endpoint.corpo } : undefined;

  switch (endpoint.metodo) {
    case "GET":
      return contexto.get(url);
    case "POST":
      return contexto.post(url, opcoes);
    case "PATCH":
      return contexto.patch(url, opcoes);
    case "PUT":
      return contexto.put(url, opcoes);
    case "DELETE":
      return contexto.delete(url, opcoes);
  }
}

for (const endpoint of ENDPOINTS) {
  test(endpoint.rotulo, async () => {
    for (const papel of endpoint.nega ?? []) {
      const resposta = await chamar(papel, endpoint);
      const esperado = papel === "anonimo" ? 401 : 403;
      expect
        .soft(
          resposta.status(),
          `${endpoint.rotulo} deveria negar ${papel} com ${esperado} ` +
            `(401 = sem sessão, 403 = sem permissão), mas devolveu ${resposta.status()}`
        )
        .toBe(esperado);

      // O corpo também faz parte do contrato — ver docs/api-erros.md.
      const corpo = await resposta.json().catch(() => null);
      expect
        .soft(
          typeof corpo?.error?.code === "string" && typeof corpo?.error?.message === "string",
          `${endpoint.rotulo} negou ${papel} fora do envelope { error: { code, message } }`
        )
        .toBe(true);
    }

    for (const papel of endpoint.permite ?? []) {
      const resposta = await chamar(papel, endpoint);
      expect
        .soft(
          resposta.status(),
          `${endpoint.rotulo} deveria permitir ${papel}, mas devolveu ${resposta.status()}`
        )
        .toBeLessThan(400);
    }
  });
}

test("nenhuma rota devolve 5xx para requisição anônima", async () => {
  for (const endpoint of ENDPOINTS) {
    // Só os verbos que leem: um 5xx num verbo de escrita exigiria mandar corpo
    // válido sem sessão, o que não acrescenta nada ao que já está acima.
    if (endpoint.metodo !== "GET") continue;
    const resposta = await chamar("anonimo", endpoint);
    expect
      .soft(
        resposta.status(),
        `${endpoint.rotulo} devolveu ${resposta.status()} — 5xx sem sessão costuma ser checagem de auth que nem existe`
      )
      .toBeLessThan(500);
  }
});

test("a matriz cobre todas as rotas de API do repositório", () => {
  // Guarda contra rota nova nascer sem entrada aqui. A lista não é digitada à
  // mão: sai do sistema de arquivos, então acrescentar um route.ts sem
  // classificar quem pode chamá-lo quebra este teste.
  const raiz = path.join(__dirname, "..", "src", "app", "api");

  function rotas(diretorio: string): string[] {
    return fs.readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
      const completo = path.join(diretorio, entrada.name);
      if (entrada.isDirectory()) return rotas(completo);
      if (entrada.name !== "route.ts") return [];
      const relativo = path
        .relative(raiz, diretorio)
        .split(path.sep)
        .filter(Boolean)
        .join("/");
      return [`/api/${relativo}`];
    });
  }

  const naMatriz = new Set(
    ENDPOINTS.map((endpoint) => endpoint.rotulo.replace(/^[A-Z]+ /, "").split("?")[0])
  );

  const semClassificacao = rotas(raiz).filter(
    (rota) => !naMatriz.has(rota) && !(rota in FORA_DA_MATRIZ)
  );

  expect(
    semClassificacao,
    "rota de API sem entrada na matriz de autorização nem motivo para ficar de fora"
  ).toEqual([]);
});
