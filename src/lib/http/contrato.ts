/**
 * O contrato de erro da API, sem nenhuma dependência.
 *
 * Fica aqui, e não em `src/server/http/respond.ts`, porque o **middleware**
 * também devolve erro — ele é o primeiro a responder 401 para rota protegida — e
 * roda no runtime Edge, onde `server-only` e imports de servidor não cabem.
 *
 * Com o contrato num arquivo neutro, os dois lados escrevem o mesmo envelope a
 * partir da mesma fonte. Antes da task `17` o middleware devolvia
 * `{ error: "Unauthorized" }` e os handlers devolviam outra coisa — a resposta
 * mudava de forma dependendo de **quem** tinha barrado a chamada.
 *
 * Ver `docs/api-erros.md`.
 */

export type CodigoDeErro =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface CorpoDeErro {
  error: {
    code: CodigoDeErro;
    message: string;
    fields?: Record<string, string>;
  };
}

export const STATUS_HTTP: Record<CodigoDeErro, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * Mensagens padrão, em português.
 *
 * Elas vão para a tela: o front mostra `error.message` direto. Por isso são
 * escritas para quem está do outro lado, e não para quem programa — "Você
 * precisa entrar na sua conta" em vez de "Unauthorized".
 */
export const MENSAGEM_PADRAO: Record<CodigoDeErro, string> = {
  VALIDATION_ERROR: "Alguns dados não foram aceitos. Confira os campos e tente de novo.",
  UNAUTHENTICATED: "Você precisa entrar na sua conta para continuar.",
  FORBIDDEN: "Você não tem permissão para fazer isso.",
  NOT_FOUND: "Não encontramos o que você procura.",
  CONFLICT: "Esses dados já estão em uso.",
  RATE_LIMITED: "Muitas tentativas. Espere um pouco e tente de novo.",
  INTERNAL_ERROR: "Algo deu errado do nosso lado. Tente de novo em instantes.",
};

export function corpoDeErro(
  code: CodigoDeErro,
  message?: string,
  fields?: Record<string, string>
): CorpoDeErro {
  return {
    error: {
      code,
      message: message ?? MENSAGEM_PADRAO[code],
      ...(fields ? { fields } : {}),
    },
  };
}
