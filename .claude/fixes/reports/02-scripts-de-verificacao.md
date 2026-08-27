# Relatório — [02] Scripts de verificação

- **Data:** 2026-08-26
- **Status:** done
- **Commit:** ver `STATE.json`
- **Iterações de debug:** 0

## O que foi encontrado

Confirmado que o problema ainda existia antes de mexer:

```
typecheck: NAO EXISTE
check:     NAO EXISTE
lint:fix:  NAO EXISTE
lint:      eslint
```

Ou seja, `tsc --noEmit` só rodava se alguém lembrasse de digitar à mão. Regressão
de tipo passaria despercebida entre um commit e outro.

## O que foi feito

| Arquivo | Mudança |
|---|---|
| `package.json` | três scripts novos, inseridos logo após `lint` para manter o agrupamento |

```json
"lint:fix":   "eslint --fix",
"typecheck":  "tsc --noEmit",
"check":      "npm run typecheck && npm run lint"
```

Os scripts foram posicionados no meio do objeto, junto de `lint`, em vez de
anexados no fim — os blocos `db:*`, `email:*` e `evidencias:*` continuam
agrupados.

## Verificação

| Comando | Resultado |
|---|---|
| `npm run typecheck` | ✅ exit 0, nenhum erro |
| `npm run check` | ✅ exit 0 — roda typecheck e depois lint, 45 warnings, 0 erros |

O encadeamento com `&&` dentro do npm script **funciona no Windows** — o npm
executa via shell próprio, então não caiu no problema do PowerShell 5.1. Não foi
preciso `npm-run-all`.

## Critérios de aceite

- [x] `npm run typecheck` existe e sai com código 0 — verificado.
- [x] `npm run check` existe e roda typecheck + lint em sequência — verificado.

## Sobre o risco previsto na task

A task alertava para possível divergência entre o `tsconfig.json` (usado pelo
`tsc`) e o build com `--turbopack`. Não se materializou: `npm run typecheck` e
`npm run build` passam os dois, sobre a mesma configuração. Nada a alinhar.

## Pendências

`npm run check` **ainda não roda testes**, porque não existem. A task `07` deve
atualizar o script para `npm run typecheck && npm run lint && npm run test`
quando a infraestrutura de testes existir. Isso está registrado nos passos da
própria task `07`.
