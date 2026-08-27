import { expect, test } from "@playwright/test";

/**
 * Canário da infraestrutura de E2E.
 *
 * Não cobre regra de negócio — isso é das tasks 08 a 11. O que este arquivo
 * prova é que o Playwright sobe o dev server, carrega a aplicação e enxerga o
 * DOM já hidratado. Se ele falhar, o problema é de infraestrutura, não de
 * produto.
 */

test("a home carrega e tem um h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("a home não acusa erro de servidor", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});

/**
 * Sem lista de exceções, de propósito.
 *
 * Este teste teve uma: `GET /api/me` devolvia 401 para visitante anônimo, e
 * como o `AuthStateProvider` pergunta em todo carregamento, o console de toda
 * visita deslogada tinha um erro vermelho permanente. A task `58` corrigiu a
 * rota em vez de manter a exceção — lista de ruído esperado cresce sozinha e
 * acaba escondendo erro de verdade.
 */
test("o console da home não tem erro nenhum", async ({ page }) => {
  const erros: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    erros.push(msg.text());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(erros).toEqual([]);
});
