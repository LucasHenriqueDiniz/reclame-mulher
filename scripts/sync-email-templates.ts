#!/usr/bin/env tsx
/**
 * Validates and lists the email templates in email-templates/
 *
 * Usage:
 *   pnpm email:sync
 *   or: pnpm tsx scripts/sync-email-templates.ts
 *
 * The templates live only in the repository (email-templates/*.html).
 * To send mail, read the files from this directory on the server.
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
    console.error(`❌ Directory ${templatesDir} not found`);
    process.exit(1);
  }

  const files = fs.readdirSync(templatesDir).filter(
    (file) => file.endsWith(".html") || file.endsWith(".txt")
  );

  if (files.length === 0) {
    console.log("⚠️  No .html or .txt template found in email-templates/");
    return;
  }

  console.log(`📄 Templates in email-templates/ (${files.length}):\n`);
  for (const file of files) {
    const filePath = path.join(templatesDir, file);
    const stat = fs.statSync(filePath);
    const size = (stat.size / 1024).toFixed(2);
    console.log(`   ${file} (${size} KB)`);
  }
  console.log("\n✨ Local templates OK. Read this directory on the server to send mail.");
}

main();
