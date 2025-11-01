import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env.server";

const connectionString = env.databaseUrl;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

const client = postgres(connectionString, {
  max: 1, // Pool pequeno para SSR / Server Actions
  ssl: "require", // Supabase exige SSL
  prepare: false, // evita incompatibilidades com pgbouncer
});

export const db = drizzle(client);
