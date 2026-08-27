import type { APIRequestContext, Page } from "@playwright/test";

/**
 * Contas criadas por `npm run db:seed`.
 *
 * A senha é a mesma para todas (`defaultPassword` em `scripts/seed.ts`) e pode
 * ser sobrescrita por variável de ambiente — nenhum segredo fica fixo no spec.
 */
export const SENHA = process.env.E2E_SENHA ?? "senha123";

export const CONTAS = {
  pessoa: { email: "maria@exemplo.com", destino: "/app/complaints" },
  pessoa2: { email: "ana@exemplo.com", destino: "/app/complaints" },
  empresa: { email: "empresa@construtorax.com", destino: "/app/company/dashboard" },
  // `empresa` é MEMBER da Construtora X e `empresaDona` é OWNER da mesma
  // empresa: é o par que deixa testar a diferença entre os dois papéis, que
  // até a task `56` não existia no seed. `empresaOutra` é OWNER de outra
  // empresa, e existe para exercer a checagem de posse — sem ela, a comparação
  // de `companyId` nas rotas de projeto é inalcançável, porque a checagem de
  // papel barra antes.
  empresaDona: { email: "dona@construtorax.com", destino: "/app/company/dashboard" },
  empresaOutra: { email: "dona@transportessul.com", destino: "/app/company/dashboard" },
  admin: { email: "admin@comunicamulher.com.br", destino: "/app/admin" },
} as const;

export type Papel = keyof typeof CONTAS;

/**
 * Login pela API, não pela interface.
 *
 * De propósito: o objetivo aqui é *ter* uma sessão para testar outra coisa. O
 * fluxo de login pela tela é testado explicitamente em `auth.spec.ts` — se ele
 * quebrar, quero uma falha só, apontando para o lugar certo, e não trinta
 * testes vermelhos ao mesmo tempo.
 *
 * Passe `page.request`, não o fixture `request` avulso: só o primeiro
 * compartilha os cookies com o contexto do navegador. Com o fixture avulso, a
 * sessão fica no lugar errado e a página continua deslogada.
 */
export async function entrarViaApi(request: APIRequestContext, papel: Papel) {
  const resposta = await request.post("/api/auth/login", {
    data: { email: CONTAS[papel].email, password: SENHA },
  });
  if (!resposta.ok()) {
    throw new Error(
      `Login de ${papel} falhou com ${resposta.status()}. ` +
        `O banco foi populado? Rode: npm run db:seed`
    );
  }
  return resposta;
}

/** Login pela interface — usado pelos testes do próprio fluxo de login. */
export async function entrarPelaTela(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(senha);
  await page.getByRole("button", { name: /entrar/i }).click();
}
