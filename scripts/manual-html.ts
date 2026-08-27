/**
 * Gera a versão distribuível do Manual de Uso: um único arquivo HTML.
 *
 *   node --import tsx scripts/manual-html.ts
 *
 * Lê `docs/manual/MANUAL_DE_USO.md` e escreve `docs/manual/MANUAL_DE_USO.html`
 * com as imagens embutidas em base64. Um arquivo só, que se abre em qualquer
 * navegador e se manda por e-mail sem pasta junto.
 *
 * O conversor de Markdown é caseiro e cobre só o que o manual usa: títulos,
 * parágrafos, tabelas, imagens com legenda, citações, listas, ênfase, código,
 * links e linha horizontal. Isso é de propósito — acrescentar uma dependência
 * de Markdown ao projeto para gerar um documento seria caro demais pelo que
 * entrega.
 */
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const ENTRADA = "docs/manual/MANUAL_DE_USO.md";
const SAIDA = "docs/manual/MANUAL_DE_USO.html";

const TIPO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Mesma regra de âncora do GitHub, que é a que os links do manual usam.
 *
 * Duas armadilhas, as duas encontradas conferindo o HTML gerado:
 *
 * - **Acento fica.** O GitHub não remove diacrítico — `#glossário` é a âncora
 *   de "Glossário", com acento. Tirar o acento aqui quebrava seis links.
 * - **`\w` não serve.** Sem a flag `u`, `\w` não casa com `á`, então
 *   `[^\w\s-]` apagava justamente as letras acentuadas. Daí `\p{L}\p{N}`.
 */
function ancora(titulo: string) {
  return titulo
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Ênfase, código, links. Aplicado só dentro de texto, nunca sobre HTML pronto. */
function inline(texto: string) {
  let saida = escapar(texto);
  saida = saida.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  saida = saida.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  saida = saida.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  saida = saida.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, rotulo, destino) => {
    // Link para arquivo do repositório não faz sentido num HTML distribuído
    // sozinho: vira texto simples em vez de link quebrado.
    if (/^https?:|^#/.test(destino)) return `<a href="${destino}">${rotulo}</a>`;
    return rotulo;
  });
  return saida;
}

async function comoDataUri(caminho: string) {
  const extensao = caminho.split(".").pop()?.toLowerCase() ?? "png";
  const bytes = await readFile(caminho);
  return `data:${TIPO_MIME[extensao] ?? "application/octet-stream"};base64,${bytes.toString("base64")}`;
}

async function converter(markdown: string, baseDeImagens: string) {
  const linhas = markdown.split("\n");
  const saida: string[] = [];
  let i = 0;
  let listaAberta: "ul" | "ol" | null = null;

  const fecharLista = () => {
    if (listaAberta) {
      saida.push(`</${listaAberta}>`);
      listaAberta = null;
    }
  };

  while (i < linhas.length) {
    const linha = linhas[i];

    // Imagem sozinha na linha, com a legenda em itálico logo abaixo.
    const imagem = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/.exec(linha);
    if (imagem) {
      fecharLista();
      const [, alternativo, origem] = imagem;
      const uri = await comoDataUri(join(baseDeImagens, origem));
      let legenda = "";
      let salto = 1;
      // A legenda é o próximo parágrafo em itálico. Ele pode ocupar mais de
      // uma linha, então junta até a linha em branco.
      let j = i + 1;
      while (j < linhas.length && linhas[j].trim() === "") j += 1;
      if (j < linhas.length && linhas[j].startsWith("*") && !linhas[j].startsWith("**")) {
        const pedacos: string[] = [];
        while (j < linhas.length && linhas[j].trim() !== "") {
          pedacos.push(linhas[j]);
          j += 1;
        }
        legenda = inline(pedacos.join(" ").replace(/^\*/, "").replace(/\*$/, ""));
        salto = j - i;
      }
      saida.push(
        `<figure><img src="${uri}" alt="${escapar(alternativo)}">` +
          (legenda ? `<figcaption>${legenda}</figcaption>` : "") +
          `</figure>`
      );
      i += salto;
      continue;
    }

    // Tabela: linha de cabeçalho, linha de separação, corpo.
    if (linha.startsWith("|") && linhas[i + 1]?.startsWith("|") && /^\|[\s:|-]+\|$/.test(linhas[i + 1])) {
      fecharLista();
      const celulas = (l: string) =>
        l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const cabecalho = celulas(linha);
      i += 2;
      const corpo: string[][] = [];
      while (i < linhas.length && linhas[i].startsWith("|")) {
        corpo.push(celulas(linhas[i]));
        i += 1;
      }
      saida.push(
        "<table><thead><tr>" +
          cabecalho.map((c) => `<th>${inline(c)}</th>`).join("") +
          "</tr></thead><tbody>" +
          corpo
            .map((linhaDoCorpo) => "<tr>" + linhaDoCorpo.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>")
            .join("") +
          "</tbody></table>"
      );
      continue;
    }

    // Citação, possivelmente de várias linhas.
    if (linha.startsWith(">")) {
      fecharLista();
      const pedacos: string[] = [];
      while (i < linhas.length && linhas[i].startsWith(">")) {
        pedacos.push(linhas[i].replace(/^>\s?/, ""));
        i += 1;
      }
      saida.push(`<blockquote>${inline(pedacos.join(" ").trim())}</blockquote>`);
      continue;
    }

    const titulo = /^(#{1,4})\s+(.*)$/.exec(linha);
    if (titulo) {
      fecharLista();
      const nivel = titulo[1].length;
      const texto = titulo[2];
      saida.push(`<h${nivel} id="${ancora(texto)}">${inline(texto)}</h${nivel}>`);
      i += 1;
      continue;
    }

    if (/^---+\s*$/.test(linha)) {
      fecharLista();
      saida.push("<hr>");
      i += 1;
      continue;
    }

    const itemOrdenado = /^(\d+)\.\s+(.*)$/.exec(linha);
    const itemSimples = /^[-*]\s+(.*)$/.exec(linha);
    if (itemOrdenado || itemSimples) {
      const tipo = itemOrdenado ? "ol" : "ul";
      if (listaAberta !== tipo) {
        fecharLista();
        saida.push(`<${tipo}>`);
        listaAberta = tipo;
      }
      saida.push(`<li>${inline((itemOrdenado ?? itemSimples)![itemOrdenado ? 2 : 1])}</li>`);
      i += 1;
      continue;
    }

    if (linha.trim() === "") {
      fecharLista();
      i += 1;
      continue;
    }

    // Parágrafo: junta até a linha em branco.
    const pedacos: string[] = [];
    while (
      i < linhas.length &&
      linhas[i].trim() !== "" &&
      !/^([#>|-]|\d+\.\s|!\[)/.test(linhas[i])
    ) {
      pedacos.push(linhas[i]);
      i += 1;
    }
    if (pedacos.length) {
      fecharLista();
      saida.push(`<p>${inline(pedacos.join(" "))}</p>`);
    } else {
      i += 1;
    }
  }

  fecharLista();
  return saida.join("\n");
}

const ESTILO = `
:root {
  --tinta: #1F2A37;
  --tinta-suave: #546E7A;
  --azul: #1565C0;
  --azul-escuro: #0D47A1;
  --borda: #DFE5EC;
  --fundo-suave: #F4F7FB;
}
* { box-sizing: border-box; }
body {
  margin: 0 auto;
  max-width: 46rem;
  padding: 3rem 1.25rem 5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--tinta);
  background: #fff;
}
h1 { font-size: 2.1rem; line-height: 1.2; margin: 0 0 .5rem; }
h2 {
  font-size: 1.55rem;
  margin: 3.5rem 0 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--borda);
}
h3 { font-size: 1.2rem; margin: 2.25rem 0 .75rem; }
h4 { font-size: 1.05rem; margin: 1.75rem 0 .5rem; color: var(--tinta-suave); }
p { margin: 0 0 1.1rem; }
a { color: var(--azul); }
a:hover { color: var(--azul-escuro); }
code {
  background: var(--fundo-suave);
  border: 1px solid var(--borda);
  border-radius: 4px;
  padding: .1em .35em;
  font-size: .9em;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
hr { border: 0; border-top: 1px solid var(--borda); margin: 2.5rem 0; }
blockquote {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  background: var(--fundo-suave);
  border-left: 4px solid var(--azul);
  border-radius: 0 8px 8px 0;
}
blockquote p:last-child { margin-bottom: 0; }
ul, ol { margin: 0 0 1.1rem; padding-left: 1.4rem; }
li { margin-bottom: .4rem; }
figure { margin: 2rem 0; }
figure img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--borda);
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(31, 42, 55, .09);
}
figcaption {
  margin-top: .65rem;
  font-size: .93rem;
  color: var(--tinta-suave);
  text-align: center;
}
.rolagem { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: .97rem;
}
th, td {
  border: 1px solid var(--borda);
  padding: .6rem .8rem;
  text-align: left;
  vertical-align: top;
}
th { background: var(--fundo-suave); font-weight: 600; }

@media (max-width: 620px) {
  body { padding: 1.5rem 1rem 3rem; font-size: 1rem; }
  h1 { font-size: 1.7rem; }
  h2 { font-size: 1.35rem; }
}

@media print {
  body { max-width: none; padding: 0; font-size: 11pt; }
  h2 { page-break-before: always; border-top: 0; }
  h2:first-of-type { page-break-before: avoid; }
  figure, table, blockquote { page-break-inside: avoid; }
  figure img { box-shadow: none; }
  a { color: inherit; text-decoration: none; }
}
`;

async function main() {
  const markdown = await readFile(ENTRADA, "utf8");
  const corpo = await converter(markdown, dirname(ENTRADA));

  // Tabela larga precisa rolar sozinha, sem empurrar a página para o lado —
  // é a mesma regra que a plataforma segue em 375 px.
  const corpoComRolagem = corpo.replace(
    /<table>/g,
    '<div class="rolagem"><table>'
  ).replace(/<\/table>/g, "</table></div>");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Manual de Uso — ComunicaMulher</title>
<style>${ESTILO}</style>
</head>
<body>
${corpoComRolagem}
</body>
</html>
`;

  await writeFile(SAIDA, html, "utf8");
  const tamanho = (Buffer.byteLength(html) / 1024 / 1024).toFixed(1);
  console.log(`${basename(SAIDA)} gerado — ${tamanho} MB, com as imagens embutidas.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
