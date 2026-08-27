import "server-only";

import { z } from "zod";

/**
 * Validação das variáveis de ambiente do servidor, na inicialização.
 *
 * Antes da task `20` este arquivo existia, checava duas variáveis com `if` —
 * e **ninguém o importava**. `db/client.ts` e `auth/session.ts` liam
 * `process.env` direto, então a validação nunca rodava.
 *
 * Pior: o `db/client.ts` tinha um atalho silencioso. Sem `DATABASE_URL`, ele
 * caía numa string falsa (`postgresql://build:build@localhost/build`) e a
 * aplicação **subia normalmente**, para depois falhar a cada requisição com
 * erro de conexão. Um deploy mal configurado parecia saudável.
 *
 * A regra aqui é: **falhar no boot, com o nome da variável e o que fazer.**
 * Um erro claro na subida custa minutos; um 500 opaco em produção custa uma
 * tarde.
 *
 * Ver `README.md` para o passo a passo de configuração.
 */

/** O `next build` roda sem banco de propósito — coleta de páginas não consulta. */
const durantOBuild = process.env.NEXT_PHASE === "phase-production-build";

const schema = z.object({
  DATABASE_URL: z
    .string()
    .url("precisa ser uma URL de conexão do Postgres")
    .optional(),
  DIRECT_URL: z
    .string()
    .url("precisa ser uma URL de conexão do Postgres")
    .optional(),
  SESSION_SECRET: z
    .string()
    .min(32, "precisa ter pelo menos 32 caracteres (use: openssl rand -base64 32)"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function explicar(erro: z.ZodError): string {
  const linhas = erro.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
  return (
    "Configuração de ambiente inválida.\n" +
    linhas.join("\n") +
    "\n\nCopie `.env.example` para `.env` e preencha os valores.\n" +
    "O README tem o passo a passo, incluindo onde obter cada um."
  );
}

function carregar() {
  const analisado = schema.safeParse(process.env);

  if (!analisado.success) {
    if (durantOBuild) {
      // No build a ausência não é erro: o que falta só é usado em runtime.
      return { databaseUrl: "postgresql://build:build@localhost/build", sessionSecret: "build", pooled: false };
    }
    throw new Error(explicar(analisado.error));
  }

  const { DATABASE_URL, DIRECT_URL } = analisado.data;
  const databaseUrl = DATABASE_URL ?? DIRECT_URL;

  if (!databaseUrl) {
    if (durantOBuild) {
      return { databaseUrl: "postgresql://build:build@localhost/build", sessionSecret: analisado.data.SESSION_SECRET, pooled: false };
    }
    throw new Error(
      "Configuração de ambiente inválida.\n" +
        "  - DATABASE_URL: obrigatória (ou DIRECT_URL, como alternativa)\n\n" +
        "No Neon: Console → Connect → 'Pooled connection'."
    );
  }

  // Aviso, não erro: funciona, mas não é o que se quer em produção.
  //
  // A conexão *pooled* do Neon (`-pooler` no host) existe porque cada função
  // serverless abre a sua. Sem o pooler, um pico de acessos esgota o limite de
  // conexões do banco e a aplicação passa a recusar requisições — sob carga, que
  // é justamente quando ninguém quer investigar isso.
  //
  // Foi assim que o `.env` deste projeto estava: só com `DIRECT_URL`.
  if (!DATABASE_URL && DIRECT_URL && !durantOBuild) {
    console.warn(
      "[env] DATABASE_URL não está definida; usando DIRECT_URL. " +
        "Funciona, mas a conexão direta não passa pelo pooler do Neon — " +
        "em produção isso esgota conexões sob carga. Ver README."
    );
  }

  return {
    databaseUrl,
    sessionSecret: analisado.data.SESSION_SECRET,
    /** `true` quando a conexão passa pelo pooler do Neon. */
    pooled: databaseUrl.includes("-pooler."),
  };
}

export const env = carregar();
