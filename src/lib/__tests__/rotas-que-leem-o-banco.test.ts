import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Quais páginas de servidor leem do banco — e quais precisam dizer com que
 * frequência.
 *
 * A task `64` achou o defeito: `src/app/page.tsx` consultava o banco sem
 * declarar `revalidate` nem `dynamic`, então o Next a pré-renderizava no build
 * e servia os números da home congelados no dia do deploy. Parecia dado vivo e
 * não era.
 *
 * O que decide se uma rota sai estática é o Next, no build — não dá para saber
 * lendo arquivo. O que dá para travar é o **conjunto**: se alguém criar uma
 * página de servidor nova que lê do banco, este teste falha e obriga a
 * classificar. A verificação de verdade continua sendo a coluna `Revalidate`
 * do `next build`.
 */

const RAIZ = join(__dirname, "..", "..", "..");
const APP = join(RAIZ, "src", "app");

/**
 * As páginas de servidor que consultam o banco, e por que cada uma pode.
 *
 * Todas as de `/app/**` são dinâmicas porque leem a sessão pelos cookies — o
 * Next não tem como pré-renderizar isso. `/companies` e `/company/[slug]`
 * saem dinâmicas pelo mesmo motivo de rota, e o `next build` confirma: as onze
 * aparecem com `ƒ`, menos a home.
 */
const CONHECIDAS = [
  "src/app/app/company/complaints/page.tsx",
  "src/app/app/company/complaints/[id]/page.tsx",
  "src/app/app/company/dashboard/page.tsx",
  "src/app/app/complaints/new/page.tsx",
  "src/app/app/complaints/page.tsx",
  "src/app/app/complaints/[id]/page.tsx",
  "src/app/app/page.tsx",
  "src/app/app/settings/page.tsx",
  "src/app/companies/page.tsx",
  "src/app/company/[slug]/page.tsx",
  // A única que o Next conseguia pré-renderizar, e por isso a única que precisa
  // declarar de quanto em quanto tempo se refaz.
  "src/app/page.tsx",
];

function paginas(diretorio: string, encontradas: string[] = []): string[] {
  for (const nome of readdirSync(diretorio)) {
    const caminho = join(diretorio, nome);
    if (statSync(caminho).isDirectory()) paginas(caminho, encontradas);
    else if (nome === "page.tsx") encontradas.push(caminho);
  }
  return encontradas;
}

function leemOBanco(): string[] {
  return paginas(APP)
    .filter((caminho) => {
      const fonte = readFileSync(caminho, "utf8");
      if (fonte.startsWith('"use client"')) return false;
      return /from "@\/server\/repos|from "@\/db/.test(fonte);
    })
    .map((caminho) => relative(RAIZ, caminho).split(sep).join("/"))
    .sort();
}

describe("páginas de servidor que leem do banco", () => {
  it("o conjunto não cresceu sem classificação", () => {
    expect(
      leemOBanco(),
      "uma página de servidor nova está lendo do banco. Confira no `next build` se ela sai " +
        "com `ƒ`: se sair com `○`, ela precisa de `revalidate` ou `dynamic`, senão a consulta " +
        "roda uma vez no build e o dado congela. Depois some o caminho a CONHECIDAS."
    ).toEqual([...CONHECIDAS].sort());
  });

  it("a home declara de quanto em quanto tempo se refaz", () => {
    // Este é o defeito da task 64, travado. Sem a declaração a rota volta a sair
    // estática e os números do impacto param no dia do build.
    const home = readFileSync(join(RAIZ, "src", "app", "page.tsx"), "utf8");
    expect(home).toMatch(/^export const (revalidate|dynamic)\s*=/m);
  });
});
