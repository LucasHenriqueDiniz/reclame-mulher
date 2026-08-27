# [04] Zerar os erros de ESLint em `src/`

| Campo | Valor |
|---|---|
| **ID** | `04` |
| **Fase** | `2 — Qualidade de código` |
| **Risco** | baixo |
| **Depende de** | `03` |
| **Estimativa** | curta |

## Objetivo

`npx eslint src` sai com **0 erros**, e a partir daqui erro de lint vira sinal
confiável de regressão.

## Evidência

Medição de 2026-08-26: `281 problems (4 errors, 277 warnings)`. Os 4 erros são:

```
react/no-unescaped-entities           ×2   ajuda/recursos/page.tsx:135
@next/next/no-html-link-for-pages     ×2   ajuda/recursos/page.tsx:170,176
```

Todos os 4 estão em `.claude/worktrees/agent-aacf5215958daeba6/`, não em `src/`.
**Mas** o arquivo `src/app/ajuda/recursos/page.tsx` pode ter os mesmos problemas
— a worktree é uma cópia do projeto. Confirme antes de concluir que não há nada
a fazer.

## Passos

1. Depois da task `01`, rode `npx eslint src` e veja quantos erros sobraram.
2. Se restar zero → `skipped`, com o motivo registrado.
3. Se houver erros em `src/`:
   - `react/no-unescaped-entities`: troque `"` literal em JSX por `&quot;` (ou
     mova o texto para uma expressão `{'"..."'}`).
   - `@next/next/no-html-link-for-pages`: troque `<a href="/rota">` por
     `<Link href="/rota">` de `next/link`. Atenção: só para rotas internas —
     links externos devem continuar `<a>`.
4. Não use `eslint-disable` para calar regra. Se uma regra for realmente
   inadequada ao projeto, desative no `eslint.config.mjs` com justificativa em
   comentário.

## Critérios de aceite

- [ ] `npx eslint src` → 0 erros.
- [ ] Nenhum `// eslint-disable` novo foi adicionado.
- [ ] As páginas afetadas continuam renderizando (verificação no preview).

## Verificação

```bash
npx eslint src 2>&1 | tail -3
```

```bash
npm run typecheck
```
