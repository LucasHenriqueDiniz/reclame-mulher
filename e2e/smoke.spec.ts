import { expect, test } from "@playwright/test";

/**
 * Canário da infraestrutura de E2E.
 *
 * Não cobre regra de negócio — isso é das tasks 08 a 11. O que este arquivo
 * prova é que o Playwright sobe o dev server, carrega a aplicação e enxerga o
 * DOM já hidratado. Se ele falhar, o problema é de infraestrutura, não de
 * produto.
 */

/**
 * Ruído esperado no console de quem não está logado.
 *
 * `use-auth-state.tsx` chama `GET /api/me` no carregamento para descobrir se
 * existe sessão. O cookie é `httpOnly`, então o cliente não tem como saber a
 * resposta sem perguntar. Para visitante anônimo a rota devolve 401 — correto
 * do ponto de vista da API — e o navegador registra o fetch falho como erro de
 * console.
 *
 * Não é erro de aplicação, então fica na lista de exceções. Mas é ruído
 * permanente no console de toda visita anônima, e ruído esconde erro de
 * verdade: está anotado na task 17, junto do contrato de erro da API.
 */
const RUIDO_ESPERADO = [/Failed to load resource.*401/i];

test("a home carrega e tem um h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("a home não acusa erro de servidor", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

test("o console da home não tem erro inesperado", async ({ page }) => {
  const erros: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const texto = msg.text();
    if (RUIDO_ESPERADO.some((padrao) => padrao.test(texto))) return;
    erros.push(texto);
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(erros).toEqual([]);
});
