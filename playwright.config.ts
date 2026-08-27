import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta.
 *
 * Pré-requisito: banco populado (`npm run db:seed`). Os testes usam as contas
 * do seed e contam com as empresas e reclamações que ele cria.
 *
 * `workers: 1` é proposital. Os testes compartilham o mesmo banco, então rodar
 * em paralelo produz falha intermitente — uma spec apagando o que a outra
 * acabou de criar. Enquanto não houver banco por worker, serial é o correto.
 */
/**
 * Endereço do servidor de teste. Exportado porque `e2e/api-authorization.spec.ts`
 * cria contextos de API próprios (uma jarra de cookie por papel) e precisa da
 * mesma base que os testes de navegador — sem duplicar a constante.
 */
export const BASE_URL = "http://localhost:5000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      // 375x812 é o alvo das tasks 14 e 15 — a tela de celular mais comum
      // entre as usuárias da plataforma.
      name: "chromium-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // O dev server usa Turbopack e a primeira compilação é lenta no Windows.
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
