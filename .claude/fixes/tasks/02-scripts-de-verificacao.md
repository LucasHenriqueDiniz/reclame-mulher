# [02] Criar scripts de verificação (typecheck, lint:fix, check)

| Campo | Valor |
|---|---|
| **ID** | `02` |
| **Fase** | `1 — Base` |
| **Risco** | baixo |
| **Depende de** | `01` |
| **Estimativa** | curta |

## Objetivo

Existe um comando único que prova que o projeto está saudável. Todas as tasks
seguintes passam a usá-lo.

## Evidência

`package.json > scripts` hoje tem `dev`, `build`, `start`, os `db:*`, os
`email:*`, `evidencias:*` e `test:demo`. **Não existe `typecheck`.** O
`tsc --noEmit` só roda se alguém lembrar de digitar à mão, então regressão de
tipo passa despercebida.

## Escopo

**Toca:** `package.json`
**Não toca:** `tsconfig.json`, código de aplicação

## Passos

1. Adicione em `scripts`:
   ```json
   "typecheck": "tsc --noEmit",
   "lint:fix": "eslint --fix",
   "check": "npm run typecheck && npm run lint"
   ```
2. Confirme que `npm run check` roda ponta a ponta no Windows (sem `&&`
   problemático — o npm resolve isso via shell padrão; se der problema, use
   `npm-run-all` ou separe os comandos).

## Critérios de aceite

- [ ] `npm run typecheck` existe e sai com código 0.
- [ ] `npm run check` existe e roda typecheck + lint em sequência.

## Verificação

```bash
npm run typecheck
```

```bash
npm run check
```

## Riscos e armadilhas

`npm run build` usa `--turbopack`; o `tsc --noEmit` usa o `tsconfig.json` do
repo. Se divergirem em `paths`/`jsx`, o typecheck pode acusar erro que o build
não vê. Se acontecer, alinhe o `tsconfig` em vez de afrouxar o typecheck.
