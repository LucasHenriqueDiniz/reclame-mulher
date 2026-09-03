import "server-only";
import { createDatabase } from "./driver";

const raw = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const connectionString =
  raw && !raw.includes("build") ? raw : "postgresql://build:build@localhost/build";

// Keep DATABASE_URL only in server env, never expose it to the client.
// createDatabase picks the Neon HTTP driver unless E2E_LOCAL_DB=1.
export const db = createDatabase(connectionString);
