#!/usr/bin/env tsx
/**
 * Applies hand-written SQL migrations.
 * 
 * Usage:
 *   pnpm tsx scripts/apply-sql-migration.ts src/db/migrations/0000_xxx.sql
 */

import { config } from "dotenv";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load variables from .env
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL or DIRECT_URL must be set in .env");
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Error: name the migration file to apply");
  console.log("Usage: pnpm tsx scripts/apply-sql-migration.ts <file.sql>");
  process.exit(1);
}

const filePath = path.isAbsolute(migrationFile)
  ? migrationFile
  : path.join(process.cwd(), migrationFile);

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
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
    console.log(`📄 Applying migration: ${filePath}...\n`);
    
    await client.unsafe(sql);
    
    console.log("✅ Migration applied.");
  } catch (error) {
    console.error("❌ Applying the migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
