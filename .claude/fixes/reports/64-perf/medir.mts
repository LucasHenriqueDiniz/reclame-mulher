/**
 * Os números da home, dos dois lados: o que o servidor entrega e o que o banco
 * diz agora.
 *
 * A task `64` mediu que a rota `/` sai estática do build e serve os números
 * congelados no momento em que o build rodou. Este script mostra a divergência
 * acontecendo — e, depois da correção, mostra ela se fechando.
 *
 * Uso, com o servidor de PRODUÇÃO de pé:
 *
 *   node --import tsx .claude/fixes/reports/64-perf/medir.mts            # uma leitura
 *   node --import tsx .claude/fixes/reports/64-perf/medir.mts vigiar 420 # acompanha por 420 s
 *   node --import tsx .claude/fixes/reports/64-perf/medir.mts mexer      # cria um relato [e2e]
 *   node --import tsx .claude/fixes/reports/64-perf/medir.mts limpar     # apaga os [e2e]
 *
 * O relato de mexida usa a marca `[e2e]`, a mesma da suíte, então
 * `limparRelatosDeTeste()` também o alcança se algo aqui morrer no meio.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!url) throw new Error("DATABASE_URL/DIRECT_URL não definida — confira o .env");

const sql = neon(url);
const BASE = process.env.BASE ?? "http://localhost:5000";
const MARCA = "[e2e] medicao-64";

type Numeros = { mulheres: number; taxa: number; empresas: number };

/** A mesma conta de `ComplaintsRepo.getPlatformStats`, em SQL puro. */
async function noBanco(): Promise<Numeros> {
  const [linha] = (await sql`
    SELECT count(id)::int AS total,
           coalesce(sum(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END), 0)::int AS resolvidos,
           count(DISTINCT author_id)::int AS mulheres,
           count(DISTINCT company_id)::int AS empresas
    FROM complaints
  `) as Array<{ total: number; resolvidos: number; mulheres: number; empresas: number }>;

  const total = Number(linha.total);
  return {
    mulheres: Number(linha.mulheres),
    taxa: total > 0 ? Math.round((Number(linha.resolvidos) / total) * 100) : 0,
    empresas: Number(linha.empresas),
  };
}

/**
 * Os números que o servidor entrega, lidos da carga do React no HTML.
 *
 * Mesma extração do ensaio da task `23`: as aspas vêm escapadas
 * (`womenHeard\":11`), e a contrabarra é opcional caso a serialização mude.
 */
async function servido(): Promise<Numeros | null> {
  const html = await (await fetch(BASE + "/", { cache: "no-store" })).text();
  const pegar = (chave: string) => {
    const achado = new RegExp(`${chave}\\\\?":(\\d+)`).exec(html);
    return achado ? Number(achado[1]) : null;
  };
  const n = {
    mulheres: pegar("womenHeard"),
    taxa: pegar("resolutionRate"),
    empresas: pegar("companiesEngaged"),
  };
  if (n.mulheres === null || n.taxa === null || n.empresas === null) return null;
  return n as Numeros;
}

function linha(rotulo: string, n: Numeros | null) {
  if (!n) return `${rotulo.padEnd(10)} (não achei os números no HTML)`;
  return `${rotulo.padEnd(10)} mulheres ${String(n.mulheres).padStart(3)}   taxa ${String(n.taxa).padStart(3)}%   empresas ${String(n.empresas).padStart(3)}`;
}

const iguais = (a: Numeros | null, b: Numeros | null) =>
  !!a && !!b && a.mulheres === b.mulheres && a.taxa === b.taxa && a.empresas === b.empresas;

async function umaLeitura() {
  const [banco, tela] = await Promise.all([noBanco(), servido()]);
  console.log(linha("banco:", banco));
  console.log(linha("servido:", tela));
  console.log(iguais(banco, tela) ? "  => batem" : "  => DIVERGEM");
  return { banco, tela };
}

/** Cria um relato que muda a taxa de resolução: total sobe, resolvidos não. */
async function mexer() {
  const [autora] = (await sql`
    SELECT author_id FROM complaints WHERE author_id IS NOT NULL LIMIT 1
  `) as Array<{ author_id: string }>;
  const [empresa] = (await sql`SELECT id FROM companies LIMIT 1`) as Array<{ id: string }>;

  await sql`
    INSERT INTO complaints (title, description, status, author_id, company_id, is_public, is_anonymous)
    VALUES (
      ${`${MARCA} ${Date.now().toString(36)}`},
      'Relato criado só para medir a revalidação da home. Some no passo de limpeza.',
      'OPEN', ${autora.author_id}, ${empresa.id}, false, false
    )
  `;
  console.log("relato de medição criado — a taxa de resolução do banco deve ter caído");
}

async function limpar() {
  const apagados = await sql`DELETE FROM complaints WHERE title LIKE ${`${MARCA}%`} RETURNING id`;
  console.log(`${apagados.length} relato(s) de medição apagado(s)`);
}

/** Acompanha os dois lados até baterem, ou até o tempo acabar. */
async function vigiar(segundos: number) {
  const fim = Date.now() + segundos * 1000;
  const inicio = Date.now();
  let bateram = false;

  while (Date.now() < fim) {
    const decorrido = Math.round((Date.now() - inicio) / 1000);
    const [banco, tela] = await Promise.all([noBanco(), servido()]);
    const casam = iguais(banco, tela);
    console.log(
      `${String(decorrido).padStart(4)}s  banco taxa ${banco.taxa}%  servido taxa ${tela?.taxa ?? "?"}%  ${casam ? "<- bateram" : "divergem"}`
    );
    if (casam && !bateram) {
      bateram = true;
      console.log(`\n>>> alcançaram o mesmo valor depois de ${decorrido}s\n`);
      return;
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }

  console.log("\n>>> o tempo acabou e os dois lados nunca bateram");
}

const comando = process.argv[2] ?? "ler";
if (comando === "mexer") await mexer();
else if (comando === "limpar") await limpar();
else if (comando === "vigiar") await vigiar(Number(process.argv[3] ?? 420));
else await umaLeitura();
