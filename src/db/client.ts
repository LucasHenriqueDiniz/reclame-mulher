import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const raw = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const connectionString =
  raw && !raw.includes("build") ? raw : "postgresql://build:build@localhost/build";

// Neon serverless driver (HTTP) — keep DATABASE_URL only in server env, never expose to client
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
