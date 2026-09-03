/**
 * Copies the six end-user manuals from the repository root into `public/manuais/`,
 * where Next serves them at the site root.
 *
 * The root copies are the source. This exists because the delivery gate asks for the
 * bytes under `public/`, and two copies of a 4,362-line family drift silently — so
 * `--check` fails when they diverge, and CI runs it.
 *
 * These are product content in Portuguese and their text is never transformed here:
 * the copy is byte-for-byte, and `--check` compares bytes rather than a normalised form.
 */
import { copyFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MANUALS = [
  "MANUAL_PLATAFORMA.html",
  "MANUAL_PLATAFORMA.md",
  "FLUXOS_VISUAIS.md",
  "INDICE_DOCUMENTACAO.md",
  "GUIA_RAPIDO.md",
  "LEIA_ME_PRIMEIRO.md",
] as const;

const DEST = join("public", "manuais");
const check = process.argv.includes("--check");

mkdirSync(DEST, { recursive: true });

const problems: string[] = [];

for (const name of MANUALS) {
  const from = name;
  const to = join(DEST, name);

  if (!existsSync(from)) {
    problems.push(`missing at repo root: ${from}`);
    continue;
  }

  if (check) {
    if (!existsSync(to)) {
      problems.push(`not served: ${to} (run \`pnpm run manuais:sync\`)`);
      continue;
    }
    if (!readFileSync(from).equals(readFileSync(to))) {
      problems.push(`diverged from its source: ${to} (run \`pnpm run manuais:sync\`)`);
    }
    continue;
  }

  copyFileSync(from, to);
  console.log(`  ${from} -> ${to}`);
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ✘ ${p}`);
  process.exit(1);
}

console.log(check ? `✓ ${MANUALS.length} manuals served and identical to their source` : `✓ ${MANUALS.length} manuals copied`);
