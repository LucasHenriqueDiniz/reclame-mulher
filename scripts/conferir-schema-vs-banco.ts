#!/usr/bin/env tsx
/**
 * Confere, coluna por coluna, se o `src/db/schema.ts` concorda com o banco.
 *
 * Existe por causa da task `69`: `companies.cnpj` era `NOT NULL` no banco e
 * opcional no schema, e essa divergência não aparecia em lugar nenhum — nem no
 * `tsc`, nem no build, nem nos testes. Só aparecia em produção, como **500**,
 * no dia em que alguém mandasse `null` naquele campo.
 *
 * A pergunta que este script responde é: *existe outra igual?* Conferir a olho
 * as 20 tabelas não vale como resposta — o que vale é comparar as duas fontes.
 *
 * De um lado o `information_schema` do banco. Do outro, os metadados que o
 * próprio Drizzle expõe com `getTableConfig`, que são exatamente o que o
 * TypeScript e as consultas enxergam. Três divergências são checadas:
 *
 *   1. coluna obrigatória no banco e opcional no schema — **a da task `69`**,
 *      e a mais perigosa: o código acha que pode escrever `null`, e o banco
 *      recusa em tempo de execução;
 *   2. coluna opcional no banco e obrigatória no schema — o inverso, mais
 *      brando: a leitura pode trazer `null` onde o tipo promete valor;
 *   3. coluna declarada no schema que não existe no banco, ou o contrário.
 *
 * Uso: pnpm tsx scripts/conferir-schema-vs-banco.ts
 * Sai com código 1 se achar divergência, para poder rodar em verificação.
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { getTableConfig } from "drizzle-orm/pg-core";
import { PgTable } from "drizzle-orm/pg-core";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString || connectionString.includes("build")) {
  console.error("❌ Defina DATABASE_URL ou DIRECT_URL no .env (URL real do Neon/Postgres).");
  process.exit(1);
}

const sql = neon(connectionString);

// Envolto em `main()` porque `tsx` compila `scripts/*.ts` como CommonJS,
// onde `await` de topo não existe.
async function main() {

  type ColunaDoBanco = {
    table_name: string;
    column_name: string;
    is_nullable: "YES" | "NO";
    column_default: string | null;
  };

  const colunasDoBanco = (await sql`
    SELECT table_name, column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `) as ColunaDoBanco[];

  /** `{ tabela -> { coluna -> obrigatória? } }`, do lado do banco. */
  const banco = new Map<string, Map<string, ColunaDoBanco>>();
  for (const coluna of colunasDoBanco) {
    if (!banco.has(coluna.table_name)) banco.set(coluna.table_name, new Map());
    banco.get(coluna.table_name)!.set(coluna.column_name, coluna);
  }

  /** O mesmo, do lado do Drizzle. */
  const drizzle = new Map<string, Map<string, { notNull: boolean; temPadrao: boolean }>>();
  for (const exportado of Object.values(schema)) {
    if (!(exportado instanceof PgTable)) continue;
    const config = getTableConfig(exportado);
    const colunas = new Map<string, { notNull: boolean; temPadrao: boolean }>();
    for (const coluna of config.columns) {
      colunas.set(coluna.name, {
        notNull: coluna.notNull,
        temPadrao: coluna.hasDefault,
      });
    }
    drizzle.set(config.name, colunas);
  }

  const divergencias: string[] = [];
  const avisos: string[] = [];

  for (const [tabela, colunasDrizzle] of [...drizzle].sort()) {
    const colunasBanco = banco.get(tabela);
    if (!colunasBanco) {
      divergencias.push(`${tabela} — declarada no schema, ausente no banco`);
      continue;
    }

    for (const [nome, noDrizzle] of colunasDrizzle) {
      const noBanco = colunasBanco.get(nome);
      if (!noBanco) {
        divergencias.push(`${tabela}.${nome} — declarada no schema, ausente no banco`);
        continue;
      }

      const obrigatoriaNoBanco = noBanco.is_nullable === "NO";

      if (obrigatoriaNoBanco && !noDrizzle.notNull) {
        // O caso da task `69`. Só é grave quando o banco também não tem valor
        // padrão: com padrão, uma inserção que omite a coluna funciona.
        const gravidade = noBanco.column_default ? "com padrão no banco" : "SEM padrão no banco";
        divergencias.push(
          `${tabela}.${nome} — NOT NULL no banco, opcional no schema (${gravidade})`
        );
      }

      if (!obrigatoriaNoBanco && noDrizzle.notNull) {
        avisos.push(`${tabela}.${nome} — opcional no banco, NOT NULL no schema`);
      }
    }

    for (const nome of colunasBanco.keys()) {
      if (!colunasDrizzle.has(nome)) {
        avisos.push(`${tabela}.${nome} — existe no banco, não está no schema`);
      }
    }
  }

  const tabelasSoNoBanco = [...banco.keys()].filter(
    (tabela) => !drizzle.has(tabela) && tabela !== "__drizzle_migrations"
  );

  console.log(
    `\nConferidas ${drizzle.size} tabelas do schema contra ${banco.size} do banco ` +
      `(${colunasDoBanco.length} colunas).\n`
  );

  if (tabelasSoNoBanco.length) {
    console.log("Tabelas que existem no banco e não no schema:");
    for (const tabela of tabelasSoNoBanco) console.log(`  · ${tabela}`);
    console.log();
  }

  if (avisos.length) {
    console.log(`Avisos (${avisos.length}) — não quebram escrita, mas mentem no tipo:`);
    for (const aviso of avisos) console.log(`  · ${aviso}`);
    console.log();
  }

  if (divergencias.length) {
    console.log(`❌ Divergências que podem virar 500 (${divergencias.length}):`);
    for (const divergencia of divergencias) console.log(`  · ${divergencia}`);
    console.log();
    process.exit(1);
  }

  console.log("✅ Nenhuma coluna obrigatória no banco está opcional no schema.\n");
}

main();
