# [65] `/companies` volta a rolar para o lado quando há mais empresas

| Campo | Valor |
|---|---|
| **ID** | `65` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | médio |
| **Depende de** | — |
| **Achado em** | task `23` (ensaio da demonstração) |
| **Estimativa** | pequena |

## O que foi medido

Suíte de responsividade rodando sobre o **cenário de demonstração** (5 empresas
no banco, em vez das 2 do seed base), build de produção, 375 px:

```
1 failed
  [chromium-mobile] › e2e/responsive.spec.ts:148:9 ›
  páginas públicas cabem na tela › /companies não rola para o lado
```

Medida no navegador:

| | |
|---|---|
| largura da tela | 375 px |
| largura do documento | **399 px** |
| largura de cada cartão | **383 px**, começando em `left: 16` |
| container da grade | ~343 px |

**Todos os cinco cartões estouram** — inclusive `Construtora X` e
`Transportes Sul`, que são do seed base e passavam antes. Nenhum elemento
ancestral estoura: quem sai da tela é a faixa da grade, não a página.

## O que isso quer dizer

`src/app/companies/page.tsx:138` monta a lista assim:

```tsx
<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
```

Em 375 px é uma coluna só. Item de grade nasce com `min-width: auto`, então a
faixa fica com `max(largura disponível, min-content do item mais largo)`. Um
conteúdo largo **empurra todos os cartões**, e não só o dele — que é exatamente
o sintoma: os dois cartões curtos do seed base estouram junto com os novos.

A task `14` corrigiu esta página e a travou com teste. O teste continua certo; o
que ele não cobria era conteúdo mais longo, porque o banco de teste só tinha
duas empresas com nome curto. **A correção estava certa para os dados que
existiam.**

## O que fazer

1. **Reproduzir**: `pnpm db:seed && pnpm db:seed:demo`, depois
   `npx playwright test responsive.spec.ts --project=chromium-mobile`.
2. **Isolar** qual conteúdo força a faixa. O caminho mais rápido é encurtar um
   campo por vez direto no banco e medir de novo — candidatos, do mais longo
   para o menos: `corporateName` (*"Norte Engenharia e Infraestrutura Ltda"*,
   *"ViaLitoral Concessões Rodoviárias S.A."*), `sector`
   (*"Concessão rodoviária"*) e a localidade montada
   (*"Centro-Oeste · Goiânia, GO"*).
3. **Corrigir na causa**, não no dado. O padrão para isto é `min-w-0` no item de
   grade — aqui, o `<Link className="group block">` — e nas linhas `flex` que
   envolvem `<span className="truncate">`. `truncate` aplica
   `white-space: nowrap`, e é ele que faz a contribuição de min-content ser o
   texto inteiro.
4. **Trocar o dado do teste**, não só a página: enquanto `responsive.spec.ts`
   rodar contra duas empresas de nome curto, ele não protege contra isto. A
   correção só está completa quando o teste falha antes e passa depois.

## Critérios de aceite

- [ ] `/companies` não rola para o lado em 375 px **com o cenário de
      demonstração carregado**.
- [ ] O teste de responsividade cobre um nome longo — seja pelo cenário de
      demonstração, seja por um registro criado dentro da própria spec.
- [ ] A causa está corrigida no CSS, e não encurtando o texto.
- [ ] As outras 32 páginas continuam passando.

## Por que não foi corrigido na task `23`

A `23` é um checklist de demonstração: escrever o roteiro, preparar o cenário e
ensaiar. Mexer no CSS de uma página pública é outro escopo — e é regra do
`LOOP.md` que achado fora de escopo vira task, não emenda.

Para a defesa, o impacto é pequeno: a apresentação é em projetor, e em 1280 px a
página passa. Está registrado nas limitações do roteiro assim mesmo.
