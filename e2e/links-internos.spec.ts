import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

/**
 * Nenhum destino interno aponta para rota que não existe.
 *
 * Nasceu da task `59`. A tela de login tinha um "Esqueceu a senha?" apontando
 * para `/forgot-password` — rota que nunca existiu. Sem sessão o middleware
 * devolvia 307 para o próprio `/login`, então o link **parecia funcionar**:
 * recarregava a mesma página, sem erro e sem mensagem. Passou meses assim.
 *
 * A varredura da task `18` mostrou que era o único, o que é bom e é ruim: bom
 * porque a superfície está limpa, ruim porque um link solitário e quebrado não
 * chamou a atenção de ninguém. Este arquivo é a varredura virada trava.
 *
 * ## Como funciona
 *
 * Não abre navegador. Lê o sistema de arquivos:
 *
 * 1. **As rotas que existem** saem de `src/app/**\/page.tsx`, com os grupos
 *    `(auth)` descartados — eles organizam pastas, não endereços — e os
 *    segmentos `[id]` guardados como coringa.
 * 2. **Os destinos usados** saem de todo literal de `src/**` que começa com
 *    `/`. É de propósito mais largo do que só `href=`: assim `router.push`,
 *    `redirect()` e `notFound()` entram na conta pelo mesmo preço.
 * 3. Cada destino é comparado segmento a segmento com as rotas.
 *
 * Rota nova quebra este teste até ser usada? Não — o teste é de mão única. O
 * que ele proíbe é **destino sem rota**, não rota sem destino.
 */

const RAIZ = path.join(__dirname, "..", "src");
const APP = path.join(RAIZ, "app");

/** Coringa de segmento dinâmico: `[id]`, `[slug]`, `[...tudo]`. */
const DINAMICO = /^\[.+\]$/;

function arquivos(diretorio: string, filtro: (nome: string) => boolean): string[] {
  return fs.readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const completo = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) return arquivos(completo, filtro);
    return filtro(entrada.name) ? [completo] : [];
  });
}

/** As rotas de página que o Next serve, em segmentos. */
function rotasExistentes(): string[][] {
  return arquivos(APP, (nome) => nome === "page.tsx").map((arquivo) =>
    path
      .relative(APP, path.dirname(arquivo))
      .split(path.sep)
      .filter(Boolean)
      // `(auth)` e `(marketing)` agrupam pastas sem virar segmento de URL.
      .filter((segmento) => !segmento.startsWith("("))
  );
}

/**
 * Destinos que não são página desta aplicação e por isso não são conferidos.
 *
 * Cada linha diz por que está aqui — lista de exceção sem motivo escrito vira
 * lugar para esconder link quebrado.
 */
function fora(destino: string): boolean {
  return (
    // Rotas de API têm a própria varredura, em `api-authorization.spec.ts`.
    destino.startsWith("/api/") ||
    // Arquivo em `public/`: imagem, fonte, manifesto.
    /\.[a-z0-9]{2,5}$/i.test(destino) ||
    // Pedaço de `data:` URI — o SVG embutido de `SearchInput` cai aqui.
    destino.includes("%") ||
    // Caminho de sistema de arquivos que por acaso começa com barra.
    destino.startsWith("//")
  );
}

/**
 * Arquivos cujos literais não são destinos de navegação.
 *
 * `src/middleware.ts` declara **prefixos** de rota pública — `/company/` cobre
 * `/company/[slug]`, `/onboarding` cobre `/onboarding/role` — e mais a expressão
 * do `matcher`. Nenhum deles é lugar para onde alguém vai; conferi-los como
 * destino acusaria falso positivo em toda linha da lista.
 */
const NAO_SAO_DESTINOS = ["middleware.ts"];

/**
 * Tira comentário antes de procurar literal.
 *
 * Sem isto, um comentário que cite `` `/forgot-password` `` — como o que a task
 * `59` deixou na tela de login, explicando por que o link saiu — seria contado
 * como uso e o teste falharia por causa da própria explicação.
 *
 * O `[^:]` antes de `//` protege `https://`.
 */
function semComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Todo literal de string ou template que começa com `/`, em `src/`.
 *
 * O `${...}` de um template vira coringa: `/company/${slug}` casa com
 * `/company/[slug]`.
 */
function destinosUsados(): Map<string, Set<string>> {
  const encontrados = new Map<string, Set<string>>();
  const literais = /["'`](\/[^"'`\s]*)["'`]/g;

  for (const arquivo of arquivos(RAIZ, (nome) => /\.tsx?$/.test(nome))) {
    if (NAO_SAO_DESTINOS.includes(path.basename(arquivo))) continue;
    const codigo = semComentarios(fs.readFileSync(arquivo, "utf8"));
    for (const [, bruto] of codigo.matchAll(literais)) {
      // Sem query nem âncora: `/x?a=1#b` é a página `/x`.
      const destino = bruto.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
      if (fora(destino)) continue;
      if (!encontrados.has(destino)) encontrados.set(destino, new Set());
      encontrados.get(destino)!.add(path.relative(RAIZ, arquivo));
    }
  }
  return encontrados;
}

function casa(destino: string, rota: string[]): boolean {
  const segmentos = destino === "/" ? [] : destino.slice(1).split("/");
  if (segmentos.length !== rota.length) return false;
  return rota.every((segmentoDaRota, i) => {
    if (DINAMICO.test(segmentoDaRota)) return true;
    // `${...}` no destino: qualquer coisa serve, inclusive um segmento fixo.
    if (segmentos[i].includes("${")) return true;
    return segmentos[i] === segmentoDaRota;
  });
}

test("todo destino interno usado no código existe como rota", () => {
  const rotas = rotasExistentes();
  expect(rotas.length, "não achei rota nenhuma — a varredura está olhando o lugar errado").toBeGreaterThan(
    30
  );

  const usados = destinosUsados();
  expect(usados.size, "não achei destino nenhum — a varredura está olhando o lugar errado").toBeGreaterThan(
    10
  );

  const quebrados = [...usados.entries()]
    .filter(([destino]) => !rotas.some((rota) => casa(destino, rota)))
    .map(([destino, onde]) => `${destino}  <- ${[...onde].join(", ")}`);

  expect(
    quebrados,
    "destino interno que não corresponde a nenhuma rota de `src/app`. " +
      "Sem sessão o middleware manda para /login, então o link parece funcionar e não vai a lugar nenhum"
  ).toEqual([]);
});
