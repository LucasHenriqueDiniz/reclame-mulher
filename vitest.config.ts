import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Unit tests only. The end-to-end suite is Playwright's, configured separately in
 * `playwright.config.ts`, and it needs a Postgres container and a browser — so the two
 * runners are kept apart rather than sharing a config that has to satisfy both.
 *
 * `vite-tsconfig-paths` is here because everything in this repo imports through `@/`.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // The Playwright specs live in e2e/ and are not Vitest's to run: they would fail
    // immediately, since `test` from @playwright/test is a different global.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
});
