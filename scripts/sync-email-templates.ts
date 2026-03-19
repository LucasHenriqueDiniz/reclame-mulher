#!/usr/bin/env tsx
/**
 * Valida e lista templates de e-mail em email-templates/
 *
 * Uso:
 *   pnpm email:sync
 *   ou: pnpm tsx scripts/sync-email-templates.ts
 *
 * Os templates ficam apenas no repositório (email-templates/*.html).
 * Para envio de e-mail, leia os arquivos deste diretório no servidor.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUCKET_NAME = "email-templates";

function main() {
  const templatesDir = path.join(__dirname, "..", BUCKET_NAME);

  if (!fs.existsSync(templatesDir)) {
    console.error(`❌ Diretório ${templatesDir} não encontrado`);
    process.exit(1);
  }

  const files = fs.readdirSync(templatesDir).filter(
    (file) => file.endsWith(".html") || file.endsWith(".txt")
  );

  if (files.length === 0) {
    console.log("⚠️  Nenhum template .html ou .txt encontrado em email-templates/");
    return;
  }

  console.log(`📄 Templates em email-templates/ (${files.length}):\n`);
  for (const file of files) {
    const filePath = path.join(templatesDir, file);
    const stat = fs.statSync(filePath);
    const size = (stat.size / 1024).toFixed(2);
    console.log(`   ${file} (${size} KB)`);
  }
  console.log("\n✨ Templates locais OK. Use este diretório para envio de e-mail no servidor.");
}

main();
