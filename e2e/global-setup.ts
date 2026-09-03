import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { request, type FullConfig } from "@playwright/test";
import { SEED_ACCOUNTS, STORAGE_STATE, readSeedPassword, type SeedRole } from "./seed-credentials";
import { runClientIp } from "./rate-limit-bucket";

const REPO_ROOT = join(__dirname, "..");

// Record<string, string>, not NodeJS.ProcessEnv: next-env.d.ts makes NODE_ENV
// required on that type, and these are overrides merged over process.env.
function run(command: string, args: string[], env: Record<string, string>): void {
  execFileSync(command, args, {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    stdio: "inherit",
  });
}

/**
 * Brings up the throwaway Postgres, puts the schema on it and seeds it.
 *
 * The database is recreated from nothing on every run because `pnpm db:seed`
 * deletes every row before inserting — pointing it at a database anyone cares
 * about would destroy that data, so the suite owns its own.
 */
function provisionDatabase(databaseUrl: string): void {
  const dbEnv = {
    E2E_LOCAL_DB: "1",
    DATABASE_URL: databaseUrl,
    DIRECT_URL: databaseUrl,
  };

  run("docker", ["compose", "-f", "docker-compose.e2e.yml", "up", "-d", "--wait"], dbEnv);
  run("pnpm", ["exec", "drizzle-kit", "migrate"], dbEnv);
  run("pnpm", ["exec", "tsx", "scripts/seed.ts"], dbEnv);
}

/**
 * Signs one seeded account in through the app's own login endpoint and writes
 * the resulting cookie jar to disk.
 *
 * This is the whole point of the setup: the login form is exercised once, by
 * the API that backs it, instead of being re-driven through the browser at the
 * top of every spec. Specs then start already signed in, which keeps them
 * about the flow under test and keeps the suite under the login route's own
 * rate limit (5 attempts per IP per 15 minutes — see src/lib/rate-limit.ts).
 */
async function signIn(baseURL: string, role: SeedRole, password: string): Promise<void> {
  const context = await request.newContext({
    baseURL,
    // One rate-limit bucket per role per run. See rate-limit-bucket.ts.
    extraHTTPHeaders: { "x-forwarded-for": runClientIp(`login:${role}`) },
  });

  const response = await context.post("/api/auth/login", {
    data: { email: SEED_ACCOUNTS[role].email, password },
  });

  if (!response.ok()) {
    throw new Error(
      `Programmatic login failed for ${role} (${SEED_ACCOUNTS[role].email}): ` +
        `${response.status()} ${await response.text()}`
    );
  }

  const storagePath = STORAGE_STATE[role];
  mkdirSync(dirname(storagePath), { recursive: true });
  await context.storageState({ path: storagePath });
  await context.dispose();
}

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error("baseURL is not configured");

  const databaseUrl = process.env.DATABASE_URL_E2E ?? readDatabaseUrlFromWebServer(config);

  provisionDatabase(databaseUrl);

  // Read from scripts/seed.ts, never written down here. See seed-credentials.ts.
  const password = readSeedPassword();

  for (const role of Object.keys(SEED_ACCOUNTS) as SeedRole[]) {
    await signIn(baseURL, role, password);
  }

  console.log(`\nAuthenticated ${Object.keys(SEED_ACCOUNTS).length} seeded roles; storage state saved.\n`);
}

/**
 * The web server and the setup have to agree on one database. The config
 * already handed the URL to the server, so take it from there rather than
 * repeating the default in a second place.
 */
function readDatabaseUrlFromWebServer(config: FullConfig): string {
  const fromWebServer = config.webServer?.env?.DATABASE_URL;
  if (!fromWebServer) {
    throw new Error("webServer.env.DATABASE_URL is not set in playwright.config.ts");
  }
  return fromWebServer;
}

export default globalSetup;
