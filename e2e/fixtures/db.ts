import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

/**
 * Acesso direto ao banco, só para limpeza de teste.
 *
 * Não dá para reaproveitar `src/db/client.ts` aqui: ele começa com
 * `import "server-only"`, que estoura fora do runtime do Next. E é bom que
 * estoure — este arquivo roda no Node do Playwright, não no servidor.
 *
 * Existe porque a plataforma **não tem rota de exclusão de relato**. Sem isso,
 * cada execução da suíte deixaria relatos permanentes no banco de demonstração
 * — inclusive públicos, aparecendo na home e no perfil da empresa. O seed é o
 * que vai ser mostrado na defesa; teste não pode sujá-lo.
 */

config();

const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

/**
 * Prefixo de todo relato criado por teste. É o que a limpeza procura, então
 * todo título de teste precisa passar por `tituloDeTeste`.
 */
export const MARCA_E2E = "[e2e]";

/** Título único por execução e por projeto (desktop e mobile rodam a mesma spec). */
export function tituloDeTeste(assunto: string): string {
  const carimbo = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${MARCA_E2E} ${assunto} ${carimbo}`;
}

/**
 * Apaga os projetos deixados por testes.
 *
 * Existe pela mesma razão que a limpeza de relatos: os testes de papel da task
 * `56` criam projeto de verdade — é a única forma de exercer `POST` com corpo
 * válido — e o seed é o banco da demonstração. O nome passa por
 * `tituloDeTeste`, então a marca `[e2e]` é o que a busca procura.
 */
export async function limparProjetosDeTeste(): Promise<number> {
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida — a limpeza dos projetos de teste não pode rodar. " +
        "Confira o .env antes de rodar a suíte."
    );
  }

  const sql = neon(url);
  const apagados = await sql`
    DELETE FROM projects
    WHERE name LIKE ${`${MARCA_E2E}%`}
    RETURNING id
  `;
  return apagados.length;
}

/**
 * Apaga os relatos deixados por testes. Anexos e mensagens somem junto, por
 * `ON DELETE CASCADE`.
 *
 * Roda no início **e** no fim da suíte: se uma execução anterior morreu no
 * meio, o lixo dela sai na próxima em vez de ficar para sempre.
 */
export async function limparRelatosDeTeste(): Promise<number> {
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida — a limpeza dos relatos de teste não pode rodar. " +
        "Confira o .env antes de rodar a suíte."
    );
  }

  const sql = neon(url);
  const apagados = await sql`
    DELETE FROM complaints
    WHERE title LIKE ${`${MARCA_E2E}%`}
    RETURNING id
  `;
  return apagados.length;
}

/**
 * Cria uma empresa com nome, razão social e setor **longos**, para o teste de
 * responsividade da task `65`.
 *
 * Existe porque o defeito era invisível para a suíte: a `/companies` estourava
 * 375 px por causa do conteúdo mais largo da grade, e o seed base só tem duas
 * empresas de nome curto. Enquanto o teste dependesse do que estava no banco,
 * ele passava com a página quebrada — e foi o que aconteceu entre a task `14` e
 * a `23`. Com a empresa criada aqui, o teste protege com qualquer seed.
 *
 * Devolve o `id`, e a marca `[e2e]` no nome é o que a limpeza procura.
 */
export async function criarEmpresaDeNomeLongo(): Promise<string> {
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida — a empresa de teste não pode ser criada. " +
        "Confira o .env antes de rodar a suíte."
    );
  }

  const sql = neon(url);
  const carimbo = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  // `cnpj` vai preenchido porque a coluna é `NOT NULL` no banco — ainda que o
  // `src/db/schema.ts` a declare opcional. A divergência virou a task `69`.
  const cnpj = String(Date.now()).slice(-14).padStart(14, "9");
  const [criada] = await sql`
    INSERT INTO companies (name, cnpj, corporate_name, sector, region, city, state, slug)
    VALUES (
      ${`${MARCA_E2E} Engenharia e Infraestrutura Metropolitana ${carimbo}`},
      ${cnpj},
      'Concessionária de Saneamento e Infraestrutura Metropolitana Sociedade Anônima',
      'Concessão rodoviária e saneamento básico',
      'Centro-Oeste', 'Goiânia', 'GO',
      ${`e2e-nome-longo-${carimbo}`}
    )
    RETURNING id
  `;
  return (criada as { id: string }).id;
}

/**
 * Apaga as empresas criadas por teste.
 *
 * Só alcança as que não têm relato nenhum apontando para elas — que é o caso
 * das criadas por `criarEmpresaDeNomeLongo`. Se um dia um teste criar relato
 * contra uma empresa de teste, a limpeza de relatos precisa rodar antes desta.
 */
export async function limparEmpresasDeTeste(): Promise<number> {
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida — a limpeza das empresas de teste não pode rodar. " +
        "Confira o .env antes de rodar a suíte."
    );
  }

  const sql = neon(url);
  const apagadas = await sql`
    DELETE FROM companies
    WHERE name LIKE ${`${MARCA_E2E}%`}
    RETURNING id
  `;
  return apagadas.length;
}
