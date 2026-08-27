/**
 * Tentativa de reproduzir o `ECONNRESET` do `POST /api/auth/login`.
 *
 * Duas hipóteses, dois experimentos, porque elas se distinguem pelo que
 * fazem com a conexão TCP:
 *
 * A. **Conexão reaproveitada fechada no meio.** O servidor do Node fecha
 *    conexão `keep-alive` ociosa depois de 5 s (padrão). Se o cliente mandar
 *    requisição no exato instante em que o servidor está fechando, ele vê
 *    `ECONNRESET`. Se for isso, o erro aparece concentrado nas esperas em
 *    volta de 5 000 ms e quase nunca fora delas.
 *
 * B. **Rajada de conexões novas.** A suíte abre um contexto por teste, e no
 *    Windows a faixa de portas efêmeras mais o `TIME_WAIT` podem estourar sob
 *    rajada. Se for isso, o erro aparece com muitas conexões novas seguidas,
 *    independente de espera.
 *
 * Uso, com o servidor de desenvolvimento de pé em :5000:
 *
 *   node --import tsx .claude/fixes/reports/68-perf/reproduzir.mts A
 *   node --import tsx .claude/fixes/reports/68-perf/reproduzir.mts B
 *   node --import tsx .claude/fixes/reports/68-perf/reproduzir.mts C
 *
 * C. **Pelo navegador, como a suíte faz de verdade.** `entrarViaApi` recebe
 *    `page.request`, que sai pela pilha de rede do Chromium, e não pela do
 *    Node — os experimentos A e B não passam por lá. Um contexto novo por
 *    iteração, com o login como primeira requisição, é o formato exato do
 *    caso que falhou.
 */
import { chromium, request } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:5000";
const CREDENCIAL = {
  email: "empresa@construtorax.com",
  password: process.env.E2E_SENHA ?? "senha123",
};

type Resultado = { ok: number; resets: number; outros: string[] };

async function tentarLogin(ctx: Awaited<ReturnType<typeof request.newContext>>, r: Resultado) {
  try {
    const resposta = await ctx.post("/api/auth/login", { data: CREDENCIAL });
    if (resposta.ok()) r.ok++;
    else r.outros.push(`HTTP ${resposta.status()}`);
  } catch (erro) {
    const texto = String(erro);
    if (texto.includes("ECONNRESET")) r.resets++;
    else r.outros.push(texto.split("\n")[0]);
  }
}

/** A — abre a conexão, espera, e manda de novo na mesma. */
async function experimentoA(repeticoes: number) {
  const ESPERAS = [0, 1_000, 3_000, 4_500, 4_900, 5_000, 5_100, 5_500, 7_000];
  console.log(`experimento A — conexão reaproveitada, ${repeticoes} tentativas por espera\n`);

  for (const espera of ESPERAS) {
    const r: Resultado = { ok: 0, resets: 0, outros: [] };
    for (let i = 0; i < repeticoes; i++) {
      const ctx = await request.newContext({ baseURL: BASE });
      await tentarLogin(ctx, r); // primeira: abre a conexão
      await new Promise((f) => setTimeout(f, espera));
      await tentarLogin(ctx, r); // segunda: reaproveita
      await ctx.dispose();
    }
    console.log(
      `  espera ${String(espera).padStart(5)} ms  ok ${String(r.ok).padStart(3)}  ` +
        `ECONNRESET ${r.resets}  outros ${r.outros.length ? r.outros.join(", ") : "0"}`
    );
  }
}

/** B — rajada de contextos novos, uma requisição em cada. */
async function experimentoB(rodadas: number, porRodada: number) {
  console.log(`experimento B — rajada de conexões novas, ${rodadas} rodadas de ${porRodada}\n`);

  for (let rodada = 1; rodada <= rodadas; rodada++) {
    const r: Resultado = { ok: 0, resets: 0, outros: [] };
    for (let i = 0; i < porRodada; i++) {
      const ctx = await request.newContext({ baseURL: BASE });
      await tentarLogin(ctx, r);
      await ctx.dispose();
    }
    console.log(
      `  rodada ${String(rodada).padStart(2)}  ok ${String(r.ok).padStart(3)}  ` +
        `ECONNRESET ${r.resets}  outros ${r.outros.length ? r.outros.join(", ") : "0"}`
    );
  }
}

/** C — pelo navegador, um contexto novo por iteração, como a suíte. */
async function experimentoC(rodadas: number, porRodada: number) {
  console.log(`experimento C — pelo navegador, ${rodadas} rodadas de ${porRodada}\n`);
  const navegador = await chromium.launch();

  for (let rodada = 1; rodada <= rodadas; rodada++) {
    const r: Resultado = { ok: 0, resets: 0, outros: [] };
    for (let i = 0; i < porRodada; i++) {
      const contexto = await navegador.newContext({ baseURL: BASE });
      const pagina = await contexto.newPage();
      await tentarLogin(pagina.request, r);
      await contexto.close();
    }
    console.log(
      `  rodada ${String(rodada).padStart(2)}  ok ${String(r.ok).padStart(3)}  ` +
        `ECONNRESET ${r.resets}  outros ${r.outros.length ? r.outros.join(", ") : "0"}`
    );
  }

  await navegador.close();
}

const qual = (process.argv[2] ?? "A").toUpperCase();
if (qual === "B") await experimentoB(Number(process.argv[3] ?? 8), Number(process.argv[4] ?? 40));
else if (qual === "C") await experimentoC(Number(process.argv[3] ?? 8), Number(process.argv[4] ?? 25));
else await experimentoA(Number(process.argv[3] ?? 8));
