# [58] `/api/me` devolve 401 e suja o console de toda página anônima

| Campo | Valor |
|---|---|
| **ID** | `58` |
| **Fase** | `6 — Segurança e dados` |
| **Risco** | baixo |
| **Depende de** | `17` |
| **Achado em** | task `18` (build de produção) |
| **Estimativa** | pequena |

## O que foi encontrado

No build de produção, o console de **qualquer página aberta sem sessão** mostra:

```
[error] Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

A requisição é `GET /api/me`, disparada pelo hook `use-auth-state` em toda
página, para descobrir se há alguém logado.

## Por que é errado

"Existe alguém logado?" é uma **pergunta**, não uma operação protegida. A
resposta certa para "não há ninguém" é `200 { "user": null }` — que é
exatamente o que o cliente já trata.

Devolver 401 tem três efeitos ruins, todos pequenos e todos reais:

1. **Ruído no console em produção.** Todo carregamento anônimo gera um erro
   vermelho, e erro vermelho que é normal treina quem depura a ignorar erro
   vermelho.
2. **Contradiz o contrato.** `docs/api-erros.md` diz que 401 significa "você
   precisa entrar na sua conta para continuar". Em `/api/me` não precisa: a
   home funciona deslogada.
3. **Mede errado.** Qualquer monitoramento que conte 401 vai contar uma
   requisição por visita anônima.

## O que fazer

1. `GET /api/me` sem sessão passa a responder `200 { user: null }`.
2. Conferir `src/hooks/use-auth-state.ts`: ele já lida com "não logada"; a
   mudança deve simplificá-lo, não complicá-lo.
3. Atualizar `docs/autorizacao.md` (linha da matriz) e `docs/api-erros.md`
   (`/api/me` vira exceção documentada: não usa `UNAUTHENTICATED`).
4. `e2e/ownership.spec.ts` tem `/api/me` na lista que espera 401 — o valor
   esperado muda para 200 junto com o código.

## Critérios de aceite

- [ ] `GET /api/me` sem sessão devolve 200 com `{ user: null }`.
- [ ] O console da home anônima, no build de produção, fica **sem nenhum erro**.
- [ ] Os documentos e os testes acompanham a mudança.

## Nota

Não é falha de segurança: `/api/me` já é rota pública por design e nunca
devolveu dado de terceiros. É contrato e higiene de console.
