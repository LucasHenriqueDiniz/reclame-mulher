#!/usr/bin/env tsx
/**
 * Formatted output for "evidências técnicas" screenshots (thesis / advisor).
 * It does not replace automated tests — it is a checklist visible in the terminal.
 *
 * Usage: pnpm run evidencias:check
 * Requires: DATABASE_URL or DIRECT_URL in .env for the database check to pass.
 */

import "dotenv/config";
import { existsSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";

const root = join(__dirname, "..");

function line(ch = "═", w = 56) {
  return ch.repeat(w);
}

async function main() {
  const started = new Date();
  console.log("");
  console.log(line("═"));
  console.log("  Reclame Mulher — checklist de evidências (demo)");
  console.log(`  ${started.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);
  console.log(line("═"));
  console.log("");

  const marks: { ok: boolean; label: string; detail?: string }[] = [];

  // Repository / files
  const schemaPath = join(root, "src", "db", "schema.ts");
  const hasSchema = existsSync(schemaPath);
  marks.push({
    ok: hasSchema,
    label: "Schema Drizzle presente (src/db/schema.ts)",
    detail: hasSchema ? undefined : "arquivo não encontrado",
  });

  // Env
  const hasDbUrl = Boolean(
    process.env.DATABASE_URL?.trim() &&
      !process.env.DATABASE_URL.includes("build"),
  );
  const hasDirect = Boolean(
    process.env.DIRECT_URL?.trim() &&
      !process.env.DIRECT_URL.includes("build"),
  );
  marks.push({
    ok: hasDbUrl || hasDirect,
    label: "Variável DATABASE_URL ou DIRECT_URL definida",
    detail:
      hasDbUrl || hasDirect
        ? undefined
        : "copie .env.example para .env e configure o Neon",
  });

  // Database (one minimal query)
  const connectionString =
    process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  if (connectionString && !connectionString.includes("build")) {
    try {
      const sql = neon(connectionString);
      const rows = await sql`SELECT 1 AS ok`;
      const ok = Array.isArray(rows) && rows.length > 0;
      marks.push({
        ok,
        label: "Conexão Postgres (Neon) — SELECT 1",
        detail: ok ? "consulta HTTP ao servidorless OK" : "resposta inesperada",
      });
    } catch (e) {
      marks.push({
        ok: false,
        label: "Conexão Postgres (Neon) — SELECT 1",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  } else {
    marks.push({
      ok: false,
      label: "Conexão Postgres (Neon) — SELECT 1",
      detail: "pulado (sem URL válida no .env)",
    });
  }

  // Stack (informational — always OK when package.json exists)
  marks.push({
    ok: existsSync(join(root, "package.json")),
    label: "Projeto Next.js (package.json)",
  });

  for (const m of marks) {
    const icon = m.ok ? "[OK] " : "[--] ";
    console.log(`${icon}${m.label}`);
    if (m.detail) {
      console.log(`      ${m.detail}`);
    }
  }

  console.log("");
  console.log(line("─"));
  console.log("  Próximos passos para o PDF:");
  console.log("  • Rodar o app: npm run dev → http://localhost:5000");
  console.log("  • Logins de teste: ver README.md (senha: senha123)");
  console.log("  • Preencher assets/evidencias-desenvolvimento-tcc.md");
  console.log(line("─"));
  console.log("");

  const allOk = marks.every((m) => m.ok);
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
