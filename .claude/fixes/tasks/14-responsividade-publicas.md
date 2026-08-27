# [14] Responsividade — páginas públicas em 375px

| Campo | Valor |
|---|---|
| **ID** | `14` |
| **Fase** | `5 — Responsividade` |
| **Risco** | médio |
| **Depende de** | `12` |
| **Estimativa** | longa |

## Objetivo

Todas as páginas públicas funcionam em tela de celular, sem scroll horizontal e
com navegação utilizável.

## Evidência — contradição a resolver

| Fonte | Afirmação |
|---|---|
| `STATUS_FINAL_PRODUCAO.md` | Responsividade **5%** — "não validada" |
| `RELATORIO_AUDITORIA_FINAL.md` | "2.3 Responsividade não validada" |
| `TODO.md`, UX Padrões | "UX mobile: revisar telas críticas em viewport pequeno — **VALIDADO EM FASE 3**" |

A task `00` deve ter dado o veredito. Se o veredito foi "já está ok", esta task
vira `skipped`.

Contexto que torna isso crítico: é uma plataforma de denúncia para mulheres.
A maior parte do público vai acessar pelo celular. Se a demonstração da defesa
em novembro for feita no celular, isso aparece.

## Escopo

**Toca:** `/`, `/companies`, `/empresas`, `/company/[slug]`, `/blog`,
`/blog/[slug]`, `/blog/all`, `/search`, `/ajuda`, `/privacy`, `/terms`,
`/(auth)/login`, `/(auth)/register`, `/onboarding/*`
**Não toca:** rotas sob `/app/` — isso é a task `15`

## Passos

1. Com `resize_window` em 375x812, abra cada rota do escopo. Para cada uma
   registre: scroll horizontal? texto cortado? botão inalcançável? menu abre e
   fecha?

2. Detecção objetiva de overflow, via `javascript_tool`:

   ```js
   document.documentElement.scrollWidth > document.documentElement.clientWidth
   ```

   Para achar o culpado, liste os elementos cuja largura ultrapassa a viewport.

3. Corrija com as utilidades do Tailwind já usadas no projeto — mobile-first,
   `sm:`/`md:`/`lg:` para cima. Não introduza breakpoint novo nem CSS custom se
   o padrão do projeto resolve.

4. Suspeitos prováveis, pelos componentes que existem: `ImpactStats`,
   `PartnersSection`, `ProcessCarousel`, `CompanyProfileHero`, `ProfileHero`,
   e qualquer `<table>` sem wrapper de scroll.

5. Adicione um teste em `e2e/responsive.spec.ts` que percorre as rotas públicas
   no projeto `chromium-mobile` e falha se houver overflow horizontal. Isso
   trava a regressão.

## Critérios de aceite

- [ ] Nenhuma rota pública tem scroll horizontal em 375px.
- [ ] Menu/navegação abre, fecha e navega em mobile.
- [ ] Formulários de login e cadastro são preenchíveis em 375px.
- [ ] `e2e/responsive.spec.ts` passa e falharia se houvesse overflow.
- [ ] Screenshots de antes/depois da home e de uma página de empresa anexados
      ao relatório.

## Verificação

```bash
npx playwright test e2e/responsive.spec.ts --project=chromium-mobile
```

## Riscos e armadilhas

Consertar mobile quebrando desktop é o erro clássico. Depois de cada lote,
confira as mesmas páginas em 1280px. O teste responsivo deve rodar nos dois
projetos.
