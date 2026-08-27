import { defineConfig } from "vitest/config";

/**
 * Testes de unidade e integração.
 *
 * Extensão `.mts` de propósito: o `package.json` não declara `type: module`,
 * então um `.ts` seria carregado como CommonJS e o Vite avisa sobre a sintaxe
 * ESM.
 *
 * Os testes de ponta a ponta ficam em `e2e/` e rodam pelo Playwright
 * (`playwright.config.ts`) — por isso a pasta está excluída aqui, senão o
 * Vitest tentaria executar os `.spec.ts` do Playwright e falharia.
 */
export default defineConfig({
  resolve: {
    // Resolve o alias "@/..." do tsconfig.json nativamente, sem plugin.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**", ".claude/**"],
    globals: false,
  },
});
