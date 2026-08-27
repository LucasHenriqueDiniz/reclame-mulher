/**
 * Leitura do erro da API no lado do cliente.
 *
 * O contrato é `{ error: { code, message, fields? } }` — ver
 * `docs/api-erros.md` e `src/server/http/respond.ts`. Antes da task `17` cada
 * tela fazia `data.error ?? "algo deu errado"`, o que funcionava por acidente:
 * `error` era uma string, e a string ia direto para a tela. Como metade delas
 * estava em inglês, a usuária lia "Unauthorized".
 *
 * Esta função é o único lugar que sabe o formato. Se ele mudar de novo, muda
 * aqui.
 */

export interface ErroDaApi {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

interface CorpoComErro {
  error?: unknown;
}

/** O objeto de erro, se o corpo tiver um no formato esperado. */
export function erroDaApi(corpo: unknown): ErroDaApi | null {
  if (!corpo || typeof corpo !== "object") return null;
  const { error } = corpo as CorpoComErro;
  if (!error || typeof error !== "object") return null;
  const candidato = error as Partial<ErroDaApi>;
  if (typeof candidato.message !== "string" || typeof candidato.code !== "string") return null;
  return {
    code: candidato.code,
    message: candidato.message,
    ...(candidato.fields ? { fields: candidato.fields } : {}),
  };
}

/**
 * A mensagem para mostrar na tela.
 *
 * `padrao` é o que aparece quando a resposta não veio no formato — rede caiu,
 * proxy devolveu HTML, a rota morreu antes de responder. Escreva um `padrao`
 * específico da ação: "Não foi possível salvar o perfil." diz mais do que
 * "Erro".
 */
export function mensagemDeErro(corpo: unknown, padrao: string): string {
  return erroDaApi(corpo)?.message ?? padrao;
}

/** Erros por campo, para marcar o formulário. Vazio quando não houver. */
export function camposComErro(corpo: unknown): Record<string, string> {
  return erroDaApi(corpo)?.fields ?? {};
}

/** `true` se a resposta disse "entre na sua conta" — e não "você não pode". */
export function precisaEntrar(corpo: unknown): boolean {
  return erroDaApi(corpo)?.code === "UNAUTHENTICATED";
}
