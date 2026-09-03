import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzleNeonHttp<typeof schema>>;

/**
 * Builds the Drizzle client the whole app shares.
 *
 * Every deployed environment uses the Neon driver, which speaks SQL over
 * HTTPS. That protocol is the reason this function exists: the Neon driver
 * cannot reach a plain Postgres on TCP at all — it resolves the connection
 * string's host into an `https://<host>/sql` endpoint and the fetch simply
 * fails. The E2E suite runs against a throwaway Postgres container, so it
 * needs the wire-protocol driver instead.
 *
 * `E2E_LOCAL_DB=1` is the only input that switches drivers, and nothing sets
 * it except `playwright.config.ts`. With the variable unset this returns
 * exactly what `src/db/client.ts` built before, so no deployed environment
 * changes behaviour.
 */
export function createDatabase(connectionString: string): Database {
  if (process.env.E2E_LOCAL_DB === "1") {
    // idle_timeout is what lets `pnpm db:seed` exit. The Neon HTTP driver holds
    // no socket, so the seed script never had to close anything and does not
    // call process.exit on success; a pooled connection left open would keep
    // the event loop alive and hang the E2E setup instead of finishing it.
    const client = postgres(connectionString, { max: 4, idle_timeout: 1 });
    return drizzlePostgresJs(client, { schema }) as unknown as Database;
  }

  return drizzleNeonHttp(neon(connectionString), { schema });
}
