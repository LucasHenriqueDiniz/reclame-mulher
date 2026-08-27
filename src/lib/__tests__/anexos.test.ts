import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ANEXO_MAX_ARQUIVOS,
  ANEXO_MAX_BYTES,
  ANEXO_MAX_MB,
  ANEXO_TAMANHO_MAXIMO,
  MENSAGEM_LIMITE_DE_ARQUIVOS,
  validarAnexo,
} from "@/lib/constants/anexos";

/**
 * O limite de anexo, dos dois lados.
 *
 * A task `62` corrigiu uma divergência: a tela aceitava 3 arquivos de 5 MB e a
 * rota do UploadThing aceitava 4 MB. O arquivo de 4,5 MB passava na validação
 * da tela e só era recusado no envio.
 *
 * Estes testes rodam em Node, sem navegador e sem chamar o UploadThing — que é
 * o que a própria task pediu, já que o teste de upload real consome cota e é
 * pulado por padrão.
 */

const RAIZ = join(__dirname, "..", "..", "..");
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), "utf8");

const semComentarios = (fonte: string) =>
  fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** Só o bloco `complaintAttachment: f({ ... })` do roteador. */
function blocoDoAnexo(fonte: string): string {
  const inicio = fonte.indexOf("complaintAttachment");
  expect(inicio, "a rota complaintAttachment sumiu do core.ts").toBeGreaterThan(-1);
  const fim = fonte.indexOf("})", inicio);
  return fonte.slice(inicio, fim);
}

describe("validarAnexo", () => {
  it("aceita um arquivo exatamente no limite", () => {
    expect(validarAnexo({ size: ANEXO_MAX_BYTES, type: "image/png" })).toBeNull();
  });

  it("recusa um byte acima do limite", () => {
    expect(validarAnexo({ size: ANEXO_MAX_BYTES + 1, type: "image/png" })).not.toBeNull();
  });

  it("recusa o arquivo de 4,5 MB que era o caso do defeito", () => {
    const mensagem = validarAnexo({ size: Math.round(4.5 * 1024 * 1024), type: "image/png" });
    expect(mensagem).toContain(`${ANEXO_MAX_MB} MB`);
  });

  it("a mensagem diz qual é o limite, não só que falhou", () => {
    const mensagem = validarAnexo({ size: ANEXO_MAX_BYTES * 2, type: "application/pdf" });
    expect(mensagem).toMatch(/\d+ MB/);
  });

  it("aceita os quatro formatos anunciados na tela", () => {
    for (const tipo of ["image/png", "image/jpg", "image/jpeg", "application/pdf"]) {
      expect(validarAnexo({ size: 1024, type: tipo }), tipo).toBeNull();
    }
  });

  it("recusa formato de fora da lista, e diz quais valem", () => {
    const mensagem = validarAnexo({ size: 1024, type: "image/gif" });
    expect(mensagem).toContain("PNG");
  });

  it("recusa arquivo sem tipo — o navegador nem sempre preenche", () => {
    expect(validarAnexo({ size: 1024, type: "" })).not.toBeNull();
    expect(validarAnexo({ size: 1024 })).not.toBeNull();
  });

  it("a mensagem de quantidade diz o número", () => {
    expect(MENSAGEM_LIMITE_DE_ARQUIVOS).toContain(String(ANEXO_MAX_ARQUIVOS));
  });
});

describe("os dois lados usam o mesmo número", () => {
  it("as duas formas do tamanho concordam", () => {
    // `"4MB"` é o que o UploadThing espera; os bytes são o que a tela compara.
    expect(ANEXO_TAMANHO_MAXIMO).toBe(`${ANEXO_MAX_MB}MB`);
    expect(ANEXO_MAX_BYTES).toBe(ANEXO_MAX_MB * 1024 * 1024);
  });

  it("nem a rota nem a tela escrevem o limite na mão", () => {
    // Esta é a trava. Sem ela, a próxima pessoa põe um "5MB" no componente e a
    // divergência volta calada — foi exatamente o que aconteceu antes da 62.
    const alvos: Array<{ arquivo: string; trecho?: (fonte: string) => string }> = [
      // Do `core.ts` interessa só o bloco do anexo de relato. A rota
      // `blogImage` é outra funcionalidade, com limite próprio e sem tela que
      // valide tamanho — não há divergência ali para travar.
      { arquivo: "src/app/api/uploadthing/core.ts", trecho: blocoDoAnexo },
      { arquivo: "src/app/app/complaints/new/_components/upload-dropzone.tsx" },
      { arquivo: "src/app/app/complaints/new/_components/steps/step-three.tsx" },
    ];

    for (const { arquivo, trecho } of alvos) {
      const fonte = semComentarios(ler(arquivo));
      const conteudo = trecho ? trecho(fonte) : fonte;

      expect(
        conteudo,
        `${arquivo} voltou a escrever um tamanho na mão em vez de importar de @/lib/constants/anexos`
      ).not.toMatch(/["'`]\d+MB["'`]|\d+\s*\*\s*1024\s*\*\s*1024/);
    }
  });

  it("a rota de anexo do UploadThing importa o módulo", () => {
    const core = ler("src/app/api/uploadthing/core.ts");
    expect(core).toContain("@/lib/constants/anexos");
    expect(core).toContain("ANEXO_TAMANHO_MAXIMO");
    expect(core).toContain("ANEXO_MAX_ARQUIVOS");
  });
});
