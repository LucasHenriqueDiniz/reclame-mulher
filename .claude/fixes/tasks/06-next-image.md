# [06] Migrar `<img>` para `next/image` (7 ocorrências)

| Campo | Valor |
|---|---|
| **ID** | `06` |
| **Fase** | `2 — Qualidade de código` |
| **Risco** | médio (mexe em layout) |
| **Depende de** | `05` |
| **Estimativa** | média |

## Objetivo

Imagens passam a ser otimizadas pelo Next, melhorando LCP e reduzindo CLS — que
são exatamente as métricas cobradas na task `19`.

## Evidência

> **Corrigido pela task `01`.** O número original (42) contava as worktrees
> em `.claude/worktrees/`. O real é **7**, em `src/`.

7 warnings `@next/next/no-img-element`, em páginas de alto tráfego:

```
src/app/blog/page.tsx:116
src/app/blog/[slug]/page.tsx:163, 205
src/app/blog/[slug]/edit/page.tsx:562
src/app/company/[slug]/_components/company-profile-content.tsx:107
src/components/app/ProfileHero.tsx:53
src/components/company/CompanyProfileHero.tsx:74
```

## Passos

1. Com 7 ocorrências, faça em um lote só, mas verifique cada página no
   navegador antes de fechar.
2. Para cada `<img>`:
   - imagem de dimensão conhecida → `<Image width={} height={} alt="" />`;
   - imagem que preenche container → `<Image fill />` com o pai em
     `position: relative` e dimensão definida;
   - **sempre** preencha `alt` de verdade (ou `alt=""` se for decorativa) —
     isso conta para a task `13`.
3. Imagens de domínio externo (avatar de empresa, upload do UploadThing) exigem
   `images.remotePatterns` em `next.config.ts`. Cheque o `next.config.ts` atual
   antes — ele está entre os arquivos modificados não commitados.
4. **Exceção legítima:** conteúdo de blog renderizado a partir de markdown/HTML
   dinâmico não consegue usar `next/image`. Aí sim, `eslint-disable-next-line`
   com comentário explicando.

## Critérios de aceite

- [ ] Warnings de `no-img-element` reduzidos a apenas os casos justificados por
      comentário.
- [ ] Nenhuma imagem quebrou visualmente — comprovado com screenshot no preview
      de: `/blog`, um `/blog/[slug]`, um `/company/[slug]`, e a home.
- [ ] `npm run build` passa (erro de `remotePatterns` só aparece em runtime/build).

## Verificação

```bash
npx eslint src 2>&1 | grep -c "no-img-element"
```

```bash
npm run build
```

## Riscos e armadilhas

`<Image fill>` sem pai posicionado colapsa o layout, e o erro só aparece no
navegador — o typecheck e o lint passam. Verificação visual aqui não é opcional.
