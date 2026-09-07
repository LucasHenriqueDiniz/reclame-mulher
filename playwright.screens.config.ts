import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/**
 * Screenshot capture, kept out of `playwright.config.ts` on purpose.
 *
 * The E2E suite proves the app works; this run produces the figures for the
 * end-user manual and the report. They share the database, the seed and the
 * programmatic login — everything in `base` — but a capture is not a test, and
 * `pnpm test:e2e` must not start writing PNGs into `assets/` as a side effect.
 *
 * Run with: pnpm run telas
 */
export default defineConfig({
  ...base,
  testDir: "./screens",
  outputDir: "./screens/.results",
  reporter: [["list"]],
  // A figure that captures a spinner is worse than no figure, and a page here
  // may fetch several times before it settles.
  timeout: 120_000,
});
