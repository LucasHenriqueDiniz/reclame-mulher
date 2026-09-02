#!/usr/bin/env tsx
/**
 * Full reset of the current database.
 *
 * Usage:
 *   pnpm db:reset
 *
 * Warning: drops the `drizzle` and `public` schemas of the database pointed at
 * by DATABASE_URL or DIRECT_URL, then recreates `public` empty.
 */

import { config } from "dotenv";
import postgres from "postgres";
import * as path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL ou DIRECT_URL deve estar definido no .env");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: "require",
  prepare: false,
});

async function resetDatabase() {
  try {
    console.log("⚠️  Limpando schemas drizzle e public...");
    await sql.begin(async (tx) => {
      await tx`drop schema if exists drizzle cascade`;
      await tx`drop schema if exists public cascade`;
      await tx`create schema public`;
    });

    console.log("✅ Banco limpo com sucesso.");
    console.log("Agora rode:");
    console.log("  pnpm db:migrate");
    console.log("  pnpm db:seed");
  } catch (error) {
    console.error("❌ Erro ao resetar banco:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

resetDatabase();
