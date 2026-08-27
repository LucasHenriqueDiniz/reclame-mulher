import { expect, test } from "@playwright/test";

import { CONTAS, SENHA, entrarPelaTela, entrarViaApi } from "./fixtures/auth";

/**
 * Autenticação, redirecionamento por papel e proteção de rota.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * O bloco "rotas públicas continuam abertas" existe por um motivo concreto: na
 * task 50, corrigir o middleware quase derrubou `/companies`, `/api/complaints`
 * e `/api/search`. A regressão perigosa aqui não é esquecer de proteger — é
 * proteger demais e fechar a parte pública do site.
 */

test.describe("login pela tela", () => {
  for (const papel of ["pessoa", "empresa", "admin"] as const) {
    test(`${papel} entra e cai no destino certo`, async ({ page }) => {
      await entrarPelaTela(page, CONTAS[papel].email, SENHA);
      await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
      await expect(page).toHaveURL(new RegExp(CONTAS[papel].destino));
    });
  }

  test("senha errada mostra erro e não redireciona", async ({ page }) => {
    // Conta dedicada: o limitador conta falhas por e-mail, e usar uma conta
    // dos outros testes esgotaria a cota dela.
    await entrarPelaTela(page, "ninguem@exemplo.com", "senha-errada");
    await expect(page.getByText(/inválid/i)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("rotas protegidas sem sessão", () => {
  const ROTAS_PROTEGIDAS = [
    "/app",
    "/app/complaints",
    "/app/complaints/new",
    "/app/company/dashboard",
    "/app/company/inbox",
    "/app/company/complaints",
    "/app/company/profile",
    "/app/company/projects",
    "/app/company/verification",
    "/app/admin",
    "/app/admin/audit",
    "/app/admin/blog",
    "/app/admin/companies",
    "/app/settings",
    "/app/settings/account",
    "/app/settings/security",
  ];

  for (const rota of ROTAS_PROTEGIDAS) {
    test(`${rota} manda para /login`, async ({ page }) => {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("rotas públicas continuam abertas", () => {
  const PAGINAS_PUBLICAS = [
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
  ];

  for (const rota of PAGINAS_PUBLICAS) {
    test(`${rota} abre sem sessão`, async ({ page }) => {
      const resposta = await page.goto(rota);
      expect(resposta?.status()).toBe(200);
      // Tem que continuar na rota pedida — sem sessão, nada aqui pode ser
      // desviado para o login. (E sim, `/login` continua em `/login`.)
      expect(new URL(page.url()).pathname).toBe(rota);
    });
  }

  const APIS_PUBLICAS = [
    "/api/complaints",
    "/api/search?q=obra",
    "/api/companies",
    "/api/companies/top",
    "/api/blog/featured",
    "/api/blog/tags",
  ];

  for (const rota of APIS_PUBLICAS) {
    test(`${rota} responde sem sessão`, async ({ request }) => {
      const resposta = await request.get(rota);
      expect(resposta.status()).toBe(200);
    });
  }
});

test.describe("acesso cruzado entre papéis", () => {
  test("pessoa não entra na área da empresa nem na administração", async ({ page }) => {
    await entrarViaApi(page.request, "pessoa");

    await page.goto("/app/company/dashboard");
    await expect(page).not.toHaveURL(/\/app\/company\/dashboard/);

    await page.goto("/app/admin");
    await expect(page).not.toHaveURL(/\/app\/admin$/);
  });

  test("empresa não entra na administração", async ({ page }) => {
    await entrarViaApi(page.request, "empresa");

    await page.goto("/app/admin");
    await expect(page).not.toHaveURL(/\/app\/admin$/);
  });

  test("empresa acessa a própria área", async ({ page }) => {
    await entrarViaApi(page.request, "empresa");

    await page.goto("/app/company/dashboard");
    await expect(page).toHaveURL(/\/app\/company\/dashboard/);
  });

  test("admin acessa a administração", async ({ page }) => {
    await entrarViaApi(page.request, "admin");

    await page.goto("/app/admin");
    await expect(page).toHaveURL(/\/app\/admin/);
  });
});

test.describe("APIs negam quem não tem permissão", () => {
  test("anônimo recebe 401 ou 403, nunca 200 nem 500", async ({ request }) => {
    const rotas = [
      // `/api/me` não entra aqui: desde a task `58` ela responde 200 com tudo
      // nulo para quem não tem sessão — "existe alguém logado?" é pergunta, não
      // operação protegida. O corpo dela é conferido em `ownership.spec.ts`.
      "/api/company/complaints",
      "/api/company/profile",
      "/api/company/users",
      "/api/company/projects",
      "/api/admin/audit",
      "/api/admin/companies",
    ];

    for (const rota of rotas) {
      const resposta = await request.get(rota);
      expect(
        [401, 403],
        `${rota} devolveu ${resposta.status()} para requisição anônima`
      ).toContain(resposta.status());
    }
  });

  test("pessoa logada não acessa API de empresa nem de admin", async ({ request }) => {
    // Aqui não há navegador: o fixture `request` avulso guarda a própria
    // sessão, e é ele mesmo que faz as chamadas seguintes.
    await entrarViaApi(request, "pessoa");

    for (const rota of ["/api/company/complaints", "/api/company/profile"]) {
      const resposta = await request.get(rota);
      expect([401, 403], `${rota} liberou para pessoa`).toContain(resposta.status());
    }

    for (const rota of ["/api/admin/audit", "/api/admin/companies"]) {
      const resposta = await request.get(rota);
      expect([401, 403], `${rota} liberou para pessoa`).toContain(resposta.status());
    }
  });
});

test.describe("sessão", () => {
  test("logout encerra a sessão e a rota protegida volta a bloquear", async ({ page }) => {
    await entrarViaApi(page.request, "pessoa");

    await page.goto("/app/complaints");
    await expect(page).toHaveURL(/\/app\/complaints/);

    const saida = await page.request.post("/api/auth/logout");
    expect(saida.ok()).toBeTruthy();

    await page.context().clearCookies();
    await page.goto("/app/complaints");
    await expect(page).toHaveURL(/\/login/);
  });

  test("quem já tem sessão não fica preso na tela de login", async ({ page }) => {
    await entrarViaApi(page.request, "pessoa");

    await page.goto("/login");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
