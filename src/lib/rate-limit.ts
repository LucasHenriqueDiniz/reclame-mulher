import { NextRequest, NextResponse } from "next/server";

/**
 * Limite de tentativas para as rotas de autenticação.
 *
 * Três decisões que valem registro, porque a versão anterior errava nas três:
 *
 * 1. **A chave é a identidade tentada, não só o IP.** Antes, requisição sem
 *    header de proxy caía numa chave literal `"unknown"`, e todas dividiam a
 *    mesma cota de 5 por 15 minutos — bastavam cinco logins legítimos para
 *    trancar todo mundo. Hoje a chave principal é o e-mail; o IP é uma camada
 *    adicional, e só entra quando existe de verdade.
 *
 * 2. **Só falha conta.** Login que dá certo zera o contador daquela chave.
 *    Numa rede compartilhada — casa, trabalho, centro comunitário, casa de
 *    acolhimento — várias usuárias saem pelo mesmo IP, e nada disso é ataque.
 *
 * 3. **Sem identidade e sem IP, deixa passar.** É preferível a alternativa
 *    anterior, que era juntar todo mundo num balde só. As rotas protegidas
 *    continuam exigindo credencial válida de qualquer forma.
 *
 * ## Persistência
 *
 * O estado vive num `Map` em memória. Isso significa que ele **se perde a cada
 * restart** e **não é compartilhado entre instâncias**. Em deploy serverless,
 * cada instância teria o próprio mapa e o limite real seria (N instâncias × a
 * cota), o que enfraquece bastante a proteção.
 *
 * É aceitável enquanto o deploy for de instância única. **Se algum dia migrar
 * para serverless, isto precisa ir para o Postgres ou para um KV** — está
 * registrado em `docs/autorizacao.md`.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const WINDOW_MS = 15 * 60 * 1000;

/** Tentativas erradas por e-mail antes de travar. */
const MAX_PER_IDENTIFIER = 5;
/** Teto por IP, para conter quem varre vários e-mails da mesma origem. */
const MAX_PER_IP = 20;

export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return null;
}

function peek(key: string): Entry | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.resetAt) {
    store.delete(key);
    return null;
  }
  return entry;
}

function tooManyResponse(retryAfterSeconds: number): NextResponse {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return NextResponse.json(
    {
      error: `Muitas tentativas. Tente novamente em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`,
      retryAfterSeconds,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export interface RateLimitScope {
  /** Nome da rota, para não misturar contadores de login e de cadastro. */
  scope: string;
  /** Identidade tentada — normalmente o e-mail, já normalizado. */
  identifier?: string | null;
  ip?: string | null;
}

function keysFor({ scope, identifier, ip }: RateLimitScope): { key: string; max: number }[] {
  const keys: { key: string; max: number }[] = [];
  if (identifier) {
    keys.push({ key: `${scope}:id:${identifier.trim().toLowerCase()}`, max: MAX_PER_IDENTIFIER });
  }
  if (ip) {
    keys.push({ key: `${scope}:ip:${ip}`, max: MAX_PER_IP });
  }
  return keys;
}

/**
 * Devolve uma resposta 429 se a cota já estourou, ou `null` para seguir.
 * Não incrementa nada — quem incrementa é `registerFailure`.
 */
export function enforceRateLimit(target: RateLimitScope): NextResponse | null {
  for (const { key, max } of keysFor(target)) {
    const entry = peek(key);
    if (entry && entry.count >= max) {
      return tooManyResponse(Math.ceil((entry.resetAt - Date.now()) / 1000));
    }
  }
  return null;
}

/** Chame só quando a tentativa falhar de verdade. */
export function registerFailure(target: RateLimitScope): void {
  const now = Date.now();
  for (const { key } of keysFor(target)) {
    const entry = peek(key);
    if (entry) {
      entry.count += 1;
      store.set(key, entry);
    } else {
      store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    }
  }
}

/** Chame quando a tentativa der certo — a usuária provou quem é. */
export function clearFailures(target: RateLimitScope): void {
  for (const { key } of keysFor(target)) {
    store.delete(key);
  }
}

/** Só para teste: zera todo o estado. */
export function __resetRateLimitStore(): void {
  store.clear();
}

// Limpeza periódica das entradas vencidas, para o mapa não crescer sem fim.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  },
  10 * 60 * 1000
).unref?.();
