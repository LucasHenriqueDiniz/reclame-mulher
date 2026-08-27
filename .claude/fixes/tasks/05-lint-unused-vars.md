# [05] Remover código morto — 38 warnings de `no-unused-vars`

| Campo | Valor |
|---|---|
| **ID** | `05` |
| **Fase** | `2 — Qualidade de código` |
| **Risco** | baixo |
| **Depende de** | `04` |
| **Estimativa** | média |

## Objetivo

Warnings de variável/import não usado caem para perto de zero, e o ruído deixa
de esconder problema de verdade.

## Evidência

> **Corrigido pela task `01`.** O número original (235 de 277) estava inflado
> porque o ESLint varria as 5 worktrees em `.claude/worktrees/`, contando o
> mesmo arquivo várias vezes. Depois de ignorá-las, o número real é **38**,
> em `src/`. A task ficou muito menor do que parecia.

38 warnings `@typescript-eslint/no-unused-vars`. Exemplos reais:

```
src/app/company/[slug]/_components/company-profile-content.tsx:5   'Home' não usado
src/app/company/[slug]/_components/company-profile-content.tsx:7   'Info' não usado
src/app/company/[slug]/_components/company-profile-content.tsx:16  'S' não usado
src/components/app/FilterTabs.tsx:3     'ReactNode' não usado
src/components/app/PageTabs.tsx:1       'ReactNode' não usado
src/components/app/SubTabs.tsx:3        'ReactNode' não usado
src/components/company/CompanyProfileHero.tsx:18  'showMetrics' atribuído e nunca usado
src/components/share-modal.tsx:80       'encodedDesc' atribuído e nunca usado
src/server/repos/blog.ts:57,173         '_includeTags' nunca usado
src/server/repos/blog.ts:185            '_publicOnly' nunca usado
```

## Passos

1. Com 38 ocorrências, um lote só resolve. Ainda assim, separe o commit de
   remoção mecânica do commit de decisão sobre props (passo 3).
2. Para imports não usados: remova.
3. Para **props** não usadas (`showMetrics` em `CompanyProfileHero`): pare e
   pense. Prop declarada e ignorada geralmente é feature pela metade, não lixo.
   Ou implementa, ou remove da interface e de quem passa. Registre a escolha.
4. Para parâmetros com prefixo `_` (`_includeTags`, `_publicOnly`, `_e`): a
   convenção do ESLint é ignorar `^_`. Configure
   `argsIgnorePattern: "^_"` e `varsIgnorePattern: "^_"` no
   `eslint.config.mjs` em vez de apagar — esses prefixos são intencionais.
   Mas `_includeTags` e `_publicOnly` em `src/server/repos/blog.ts` parecem ser
   **parâmetros de filtro que nunca foram implementados**: verifique se a
   listagem do blog realmente filtra por tag e por publicado. Se não filtrar,
   isso é bug, não warning → crie task nova na faixa `50+`.

## Critérios de aceite

- [ ] `npx eslint .` reporta menos de 5 warnings de `no-unused-vars`.
- [ ] `npm run typecheck` continua limpo.
- [ ] Nenhuma prop foi removida sem checar quem a passa.
- [ ] O comportamento de `src/server/repos/blog.ts` foi verificado, não apenas
      silenciado.

## Verificação

```bash
npx eslint src 2>&1 | grep -c "no-unused-vars"
```

```bash
npm run check
```

## Riscos e armadilhas

Remover import que parece morto mas é usado por *side effect* (ex.: `import
'./styles.css'`) quebra silenciosamente. O typecheck não pega isso — confira o
preview das páginas do lote.
