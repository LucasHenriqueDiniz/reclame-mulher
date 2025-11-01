#!/usr/bin/env tsx
/**
 * Script para aplicar migrations SQL manuais
 * 
 * Uso:
 *   pnpm tsx scripts/apply-sql-migration.ts supabase/migrations/04_rls_policies_and_triggers.sql
 */

import { config } from "dotenv";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Carrega variáveis do .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL deve estar definido no .env");
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Erro: Especifique o arquivo de migration");
  console.log("Uso: pnpm tsx scripts/apply-sql-migration.ts <arquivo.sql>");
  process.exit(1);
}

const filePath = path.isAbsolute(migrationFile)
  ? migrationFile
  : path.join(process.cwd(), migrationFile);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, "utf-8");

const client = postgres(DATABASE_URL, {
  max: 1,
  ssl: "require",
  prepare: false,
});

async function applyMigration() {
  try {
    console.log(`📄 Aplicando migration: ${filePath}...\n`);
    
    await client.unsafe(sql);
    
    console.log("✅ Migration aplicada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao aplicar migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
