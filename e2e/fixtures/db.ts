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
