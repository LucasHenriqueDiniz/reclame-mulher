import "server-only";

import { NextResponse } from "next/server";

import {
  corpoDeErro,
  STATUS_HTTP,
  type CodigoDeErro,
  type CorpoDeErro,
} from "@/lib/http/contrato";

/**
 * Formato único de erro da API.
 *
 * Antes da task `17` cada handler inventava o seu: `"Unauthorized"`,
 * `"Dados inválidos"`, `"Erro interno"`, `"Failed to fetch blog posts"` — 26
 * variações no total, metade em inglês. E a interface mostra esse texto **para
 * a usuária**: todo `data.error` do front vai direto para a tela. Ou seja, uma
 * falha de sessão numa plataforma em português exibia a palavra
 * "Unauthorized".
 *
 * O envelope separa as duas audiências que estavam misturadas:
 *
 * - `code` é para código: estável, em inglês, seguro de comparar num `if`;
 * - `message` é para gente: em português, já pronta para a tela;
 * - `fields` é para formulário: qual campo reprovou e por quê.
 *
 * ```json
 * { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {} } }
 * ```
 *
 * Ver `docs/api-erros.md` para o contrato completo e a tabela de códigos.
 */

export function erro(
  code: CodigoDeErro,
  message?: string,
  fields?: Record<string, string>
): NextResponse<CorpoDeErro> {
  return NextResponse.json(corpoDeErro(code, message, fields), { status: STATUS_HTTP[code] });
}

/** Sem sessão. Quem recebe isto deve ser mandada para o login. */
export const naoAutenticada = (message?: string) => erro("UNAUTHENTICATED", message);

/**
 * Com sessão, sem direito. Quem recebe isto **não** deve ser mandada para o
 * login — mandar seria devolver a usuária para uma tela que ela já passou.
 * Essa confusão era o achado da task `11`.
 */
export const semPermissao = (message?: string) => erro("FORBIDDEN", message);

export const naoEncontrado = (message?: string) => erro("NOT_FOUND", message);

export const conflito = (message?: string) => erro("CONFLICT", message);

/**
 * Erro de validação.
 *
 * Aceita o `error.issues` do Zod e o transforma em `fields`, no formato que um
 * formulário consegue usar direto. O `issues` cru **não** vai na resposta: ele
 * carrega a forma interna do schema, e isso é informação de dentro de casa.
 */
export function invalido(erroDoZod?: unknown, message?: string): NextResponse<CorpoDeErro> {
  const fields: Record<string, string> = {};

  const issues =
    erroDoZod && typeof erroDoZod === "object" && "issues" in erroDoZod
      ? (erroDoZod as { issues: Array<{ path?: unknown[]; message?: string }> }).issues
      : [];

  for (const issue of issues ?? []) {
    const campo = Array.isArray(issue.path) ? issue.path.join(".") : "";
    if (campo && !fields[campo]) fields[campo] = issue.message ?? "Valor inválido.";
  }

  return erro("VALIDATION_ERROR", message, Object.keys(fields).length ? fields : undefined);
}

/**
 * Erro não previsto.
 *
 * O detalhe vai para o log do servidor; a resposta leva só o genérico. Stack
 * trace em corpo de resposta entrega a estrutura interna para quem estiver
 * sondando, e não ajuda em nada quem está do outro lado da tela.
 */
export function erroInterno(causa: unknown, contexto: string): NextResponse<CorpoDeErro> {
  console.error(`[${contexto}]`, causa);
  return erro("INTERNAL_ERROR");
}

/** `true` quando o erro veio de um `schema.parse` do Zod. */
export function ehErroDoZod(causa: unknown): boolean {
  return causa instanceof Error && "issues" in causa;
}

export type { CodigoDeErro, CorpoDeErro };

/**
 * Um id de rota que não é UUID nunca vai achar nada.
 *
 * Todas as chaves primárias do schema são `uuid`. Passar `"nao-e-um-uuid"` num
 * `[id]` fazia a string chegar até o Postgres, que rejeitava com erro de tipo —
 * e o handler devolvia **500**, com a query inteira no log. Um id inventado na
 * barra de endereço não é falha do servidor.
 *
 * A resposta certa é 404: um id que não pode existir não existe. Distinguir
 * "malformado" de "inexistente" só daria a quem estivesse sondando uma forma
 * barata de descobrir qual dos dois é.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ehUuid(valor: string | null | undefined): boolean {
  return typeof valor === "string" && UUID.test(valor);
}
