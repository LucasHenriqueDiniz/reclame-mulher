# [07] Montar infraestrutura de testes automatizados

| Campo | Valor |
|---|---|
| **ID** | `07` |
| **Fase** | `3 — Testes` |
| **Risco** | médio |
| **Depende de** | `03` |
| **Estimativa** | longa |

## Objetivo

O projeto passa a ter testes automatizados executáveis por um comando. Hoje não
tem nenhum.

## Evidência

```bash
find . -path ./node_modules -prune -o -name "*.spec.ts" -print -o -name "*.test.ts" -print
```

→ **saída vazia.** Não existem `e2e/`, `tests/` nem `__tests__/`.

Ao mesmo tempo, `RELATORIO_TESTES_E2E_COMPLETO.md`, `TODO.md` e
`STATUS_FINAL_PRODUCAO.md` afirmam repetidamente "PASSOU EM TESTES" e
"E2E validado". O que existe de fato é `scripts/demo-tests.ts`
(`npm run test:demo`), um script manual — não uma suíte.

**Esta é a maior lacuna real do projeto.** Sem isso, nenhuma das tasks
seguintes tem como provar que não quebrou nada.

## Escopo

**Toca:** `package.json`, `vitest.config.ts`, `playwright.config.ts`,
`e2e/`, `src/**/__tests__/`, `.gitignore`
**Não toca:** código de aplicação

## Passos

1. **Vitest** para unidade/integração:

   ```bash
   npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths
   ```

   Crie `vitest.config.ts` resolvendo os `paths` do `tsconfig.json`
   (o projeto usa alias `@/`).

2. **Playwright** para E2E:

   ```bash
   npm i -D @playwright/test
   ```

   ```bash
   npx playwright install chromium
   ```

   Em `playwright.config.ts`:
   - `baseURL` = `http://localhost:5000` (a porta do `npm run dev`);
   - `webServer` apontando para `npm run dev`, com `reuseExistingServer: true`;
   - dois projetos: `chromium-desktop` (1280x800) **e** `chromium-mobile`
     (375x812) — o mobile alimenta as tasks `14` e `15`.

3. Scripts no `package.json`:

   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:e2e": "playwright test",
   "test:e2e:ui": "playwright test --ui"
   ```

   Atualize `check` para `npm run typecheck && npm run lint && npm run test`.

4. Um teste-canário de cada tipo, só para provar que a infra roda:
   - `src/lib/__tests__/smoke.test.ts` — teste real de alguma função pura de
     `src/lib`, não um `expect(true).toBe(true)`;
   - `e2e/smoke.spec.ts` — abre `/` e verifica que existe um `h1`.

5. `.gitignore`: adicione `/test-results`, `/playwright-report`,
   `/.playwright`, `/coverage`.

## Critérios de aceite

- [ ] `npm run test` executa e passa.
- [ ] `npm run test:e2e` sobe o dev server, roda o smoke e passa.
- [ ] `npm run check` inclui os testes.
- [ ] Artefatos de teste estão no `.gitignore`.

## Verificação

```bash
npm run test
```

```bash
npm run test:e2e
```

## Riscos e armadilhas

- O dev server usa `--turbopack` na porta 5000 com `-H 0.0.0.0`. No Windows, o
  `webServer` do Playwright às vezes não detecta o "ready" — use
  `url: 'http://localhost:5000'` e `timeout: 120000`.
- Os E2E precisam de banco populado. Documente que `npm run db:seed` é
  pré-requisito.

## Se ficar bloqueado

Se o Playwright não conseguir instalar o browser (rede/proxy), entregue ao menos
o Vitest funcionando, marque a parte E2E como `blocked` e ajuste `depends_on`
das tasks `08`–`10`.
