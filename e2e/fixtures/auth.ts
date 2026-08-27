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
 * Quantas vezes o login é tentado quando a **conexão** falha.
 *
 * Duas ocorrências em nove execuções da suíte terminaram com
 * `apiRequestContext.post: read ECONNRESET` neste `POST` — sempre no preparo da
 * sessão, sempre passando na execução seguinte. A task `68` tentou reproduzir
 * de propósito, com 664 logins dirigidos em três formatos diferentes
 * (conexão reaproveitada no limite do `keep-alive`, rajada de conexões novas, e
 * pelo navegador como a suíte faz), e **não conseguiu nenhuma vez**.
 *
 * Sem causa identificada, a escolha é: sobreviver a um tropeço de conexão, e
 * **avisar quando ele acontecer**. O `console.warn` abaixo é o que transforma
 * um intermitente invisível em evento contado — sem ele, a nova tentativa
 * esconderia justamente o dado que falta para achar a causa.
 */
const TENTATIVAS_DE_LOGIN = 2;

/** Primeira linha do erro: o resto é pilha, e polui o log da suíte. */
function primeiraLinha(erro: unknown): string {
  return String(erro instanceof Error ? erro.message : erro).split("\n")[0];
}

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
  let ultimoErroDeTransporte: unknown;

  for (let tentativa = 1; tentativa <= TENTATIVAS_DE_LOGIN; tentativa++) {
    let resposta;

    try {
      resposta = await request.post("/api/auth/login", {
        data: { email: CONTAS[papel].email, password: SENHA },
      });
    } catch (erro) {
      // Erro de **transporte**: a conexão morreu antes de virar resposta HTTP.
      // É outra categoria de falha, e por isso é a única que ganha nova
      // tentativa — resposta com status ruim continua estourando na hora.
      ultimoErroDeTransporte = erro;
      console.warn(
        `[e2e] login de ${papel}, tentativa ${tentativa} de ${TENTATIVAS_DE_LOGIN}: ` +
          `${primeiraLinha(erro)}`
      );
      await new Promise((f) => setTimeout(f, 250));
      continue;
    }

    if (!resposta.ok()) {
      throw new Error(
        `Login de ${papel} falhou com ${resposta.status()}. ` +
          `O banco foi populado? Rode: npm run db:seed`
      );
    }

    return resposta;
  }

  throw new Error(
    `Login de ${papel} não chegou a virar resposta HTTP em ${TENTATIVAS_DE_LOGIN} tentativas: ` +
      `${primeiraLinha(ultimoErroDeTransporte)}. O servidor de desenvolvimento caiu? Ver task 68.`
  );
}

/** Login pela interface — usado pelos testes do próprio fluxo de login. */
export async function entrarPelaTela(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(senha);
  await page.getByRole("button", { name: /entrar/i }).click();
}
