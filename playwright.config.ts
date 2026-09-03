import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

/**
 * Postgres from docker-compose.e2e.yml. `trust` auth, so there is no password
 * in this string and none to keep out of the repository.
 */
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgresql://rm_e2e@127.0.0.1:55432/reclame_mulher_e2e";

/**
 * A fresh signing key per run. Sessions are minted and consumed inside one
 * run, so nothing needs to survive it — and a generated key cannot be a secret
 * someone committed.
 */
const E2E_SESSION_SECRET = randomBytes(32).toString("base64");

const PORT = Number(process.env.E2E_PORT ?? 5001);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // One worker: every spec shares one seeded database, and the company-reply
  // flow writes to it. Parallel workers would race over the same rows.
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "./e2e/.report", open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  // Signs in once, for every role, before any spec runs.
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "pt-BR",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    // Dev mode, not a production build: the host builds on push, and a build
    // here would need a database at build time.
    command: `pnpm exec next dev --turbopack -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // E2E_LOCAL_DB is what makes src/db/driver.ts use the wire-protocol
      // driver instead of Neon's SQL-over-HTTPS one. Nothing else sets it.
      E2E_LOCAL_DB: "1",
      DATABASE_URL: E2E_DATABASE_URL,
      DIRECT_URL: E2E_DATABASE_URL,
      SESSION_SECRET: E2E_SESSION_SECRET,
      NEXT_PUBLIC_APP_URL: BASE_URL,
      NODE_ENV: "development",
    },
  },
});

export { BASE_URL, E2E_DATABASE_URL };
