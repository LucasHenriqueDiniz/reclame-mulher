/**
 * Prova que a nova tentativa de `entrarViaApi` faz o que promete.
 *
 * Não dá para provar isto derrubando a conexão de verdade — a task `68` tentou
 * 664 vezes e não conseguiu reproduzir uma. Então o erro é injetado: um
 * `APIRequestContext` de mentira que estoura `ECONNRESET` na primeira chamada e
 * responde na segunda.
 *
 * Três casos, que são exatamente as três decisões que a função toma:
 *
 *   1. erro de transporte na primeira → tenta de novo e devolve a resposta
 *   2. erro de transporte nas duas → estoura, dizendo o que aconteceu
 *   3. resposta com status ruim → estoura **na hora**, sem nova tentativa
 *
 * O terceiro é o que impede a correção de virar "repete até dar certo": status
 * ruim é resposta da aplicação, e esconder isso seria trocar um defeito por
 * outro pior.
 *
 *   node --import tsx .claude/fixes/reports/68-perf/nova-tentativa.mts
 */
import type { APIRequestContext } from "@playwright/test";

// Import dinâmico de propósito: o estático não resolve daqui, porque este
// arquivo mora fora do projeto TypeScript e o carregador trata o módulo de
// outro jeito. O dinâmico funciona e é o que interessa.
const { entrarViaApi } = await import("../../../../e2e/fixtures/auth.ts");

function contextoFalso(comportamentos: Array<"reset" | "ok" | "403">): {
  ctx: APIRequestContext;
  chamadas: () => number;
} {
  let chamada = 0;
  const ctx = {
    async post() {
      const agora = comportamentos[chamada] ?? "ok";
      chamada++;
      if (agora === "reset") throw new Error("apiRequestContext.post: read ECONNRESET\n  at ...");
      return { ok: () => agora === "ok", status: () => (agora === "ok" ? 200 : 403) };
    },
  } as unknown as APIRequestContext;
  return { ctx, chamadas: () => chamada };
}

let falhas = 0;
function conferir(rotulo: string, condicao: boolean, detalhe = "") {
  console.log(`  ${condicao ? "ok  " : "FALHA"} ${rotulo}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!condicao) falhas++;
}

console.log("\n1. reset na primeira, resposta na segunda");
{
  const { ctx, chamadas } = contextoFalso(["reset", "ok"]);
  let deuCerto = false;
  try {
    await entrarViaApi(ctx, "empresa");
    deuCerto = true;
  } catch (erro) {
    console.log("    estourou:", String(erro).split("\n")[0]);
  }
  conferir("a sessão foi obtida", deuCerto);
  conferir("tentou duas vezes", chamadas() === 2, `${chamadas()} chamada(s)`);
}

console.log("\n2. reset nas duas");
{
  const { ctx, chamadas } = contextoFalso(["reset", "reset"]);
  let mensagem = "";
  try {
    await entrarViaApi(ctx, "empresa");
  } catch (erro) {
    mensagem = String(erro instanceof Error ? erro.message : erro);
  }
  conferir("estourou", mensagem.length > 0);
  conferir("a mensagem cita ECONNRESET", mensagem.includes("ECONNRESET"), mensagem);
  conferir("a mensagem aponta a task 68", mensagem.includes("68"));
  conferir("parou nas duas tentativas", chamadas() === 2, `${chamadas()} chamada(s)`);
}

console.log("\n3. status ruim — não pode ganhar nova tentativa");
{
  const { ctx, chamadas } = contextoFalso(["403", "ok"]);
  let mensagem = "";
  try {
    await entrarViaApi(ctx, "empresa");
  } catch (erro) {
    mensagem = String(erro instanceof Error ? erro.message : erro);
  }
  conferir("estourou", mensagem.length > 0);
  conferir("a mensagem cita o status", mensagem.includes("403"), mensagem);
  conferir("tentou UMA vez só", chamadas() === 1, `${chamadas()} chamada(s)`);
}

console.log(falhas === 0 ? "\ntudo certo\n" : `\n${falhas} conferência(s) falharam\n`);
process.exit(falhas === 0 ? 0 : 1);
