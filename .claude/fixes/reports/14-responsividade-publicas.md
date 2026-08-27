# Relatório — [14] Responsividade em 375px

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 3
- **Antes / depois:** [`14-antes/`](14-antes) e [`14-depois/`](14-depois)

## O veredito sobre a contradição

| Fonte | Afirmação | Verdade medida |
|---|---|---|
| `STATUS_FINAL_PRODUCAO.md` | responsividade **5%**, "não validada" | mais perto disto |
| `RELATORIO_AUDITORIA_FINAL.md` | "não validada" | correto |
| `TODO.md` | "UX mobile: **VALIDADO EM FASE 3**" | **falso** |

**8 de 33 páginas rolavam para o lado em 375px.** Não é 5% nem é "validado".

| | Antes | Depois |
|---|---|---|
| Páginas com scroll horizontal (mobile) | **8** | **0** |
| Páginas com scroll horizontal (desktop) | 0 | 0 |
| Testes de responsividade | 0 | **66** (33 rotas × 2 viewports) |

## O que estava largo

`/companies` media **645px de conteúdo em 375px de tela** — quase o dobro. O
efeito na tela está em [`14-antes/companies.png`](14-antes/companies.png): a
página inteira encolhida na metade esquerda, com uma faixa branca vazia do lado
direito do tamanho de outra tela.

Três causas, três componentes:

| Componente | Defeito | Páginas | Correção |
|---|---|---|---|
| `Footer` | `whitespace-nowrap` na linha de copyright dentro de `inline-flex`, e `nav` com `flex-1` que não quebra | 5 | empilha em `flex-col` no celular; a linha pode quebrar; a nav ganhou `flex-wrap` |
| `PageTabs` | barra de abas horizontal sem rolagem | 3 | `overflow-x-auto` + `shrink-0` + `whitespace-nowrap` nos itens |
| Grid do `/ajuda` | `min-width: auto` do grid deixava a faixa crescer até o min-content | 1 | `min-w-0` nas colunas |
| Filtros do `/search` | três botões lado a lado sem `flex-wrap` | 1 | `flex-wrap` |

O caso do `/ajuda` é o menos óbvio: em grid e flex, o `min-width` padrão dos
itens é `auto`, e não `0`. Um conteúdo indivisível — um e-mail longo, um bloco
de código — empurra a faixa inteira, e o contêiner cresce junto. `min-w-0` é o
conserto canônico, e nenhuma quantidade de `max-w` resolve sem ele.

Nas abas, a correção **não** é fazer caber: é rolagem horizontal, que é o padrão
de abas em celular. O que não pode é a barra empurrar a página inteira. A `nav`
ganhou `tabIndex={0}` e rótulo junto, pela mesma razão da task `13` — região
rolável precisa ser alcançável por teclado.

## A home escondia o defeito, não o resolvia

A home usa o mesmo `Footer` das 5 páginas que falhavam, mas **passava** no
teste. O motivo:

```tsx
<main id="main-content" className="overflow-hidden">
```

O `overflow-hidden` cortava o estouro em vez de corrigi-lo. A página não rolava
para o lado porque os 270px que sobravam eram simplesmente **cortados** — junto
com o que estivesse ali.

Removi. E aí a home passou a falhar por outro motivo, que estava escondido
debaixo do mesmo tapete: as setas do carrossel são posicionadas com
`translate-x-12` **para fora** do contêiner. Em desktop há margem para isso; em
375px a seta da direita ficava 22px fora da tela — ou seja, **metade do botão de
"próximo" ficava cortada e difícil de tocar**, exatamente no componente que
explica o passo a passo da plataforma para quem chega.

O deslocamento passou a valer só de `sm:` para cima.

Este é o padrão que vale registrar: `overflow-hidden` num contêiner de página
quase nunca é solução de layout. É um jeito de fazer o sintoma sumir e levar o
defeito junto.

## O teste que trava a regressão

`e2e/responsive.spec.ts` percorre 33 rotas — 18 públicas e 15 autenticadas — nos
dois viewports, e falha se `scrollWidth` passar de `clientWidth`.

O que o torna útil não é detectar, é **dizer quem foi**:

```
/companies rola para o lado: 645px de conteúdo em 375px de tela.
  div.inline-flex gap-4 items-center passa 270px — "ComunicaMulher© 2026 Comuni…"
  div.…whitespace-nowrap passa 270px — "© 2026 ComunicaMulher. Todos direitos reservados."
  nav.flex items-center justify-center gap-[35px] flex-1 passa 39px — "HomeBlogEmpresas…"
```

Sem essa lista, "a página rola para o lado" manda quem for corrigir procurar
agulha no palheiro. Com ela, as três causas apareceram na primeira execução.

O detector ignora, de propósito, quem está dentro de um contêiner com rolagem
horizontal declarada — tabela larga dentro de `overflow-x: auto` é solução, não
defeito — e quem está escondido ou `inert`.

## As páginas autenticadas vieram junto

O escopo da task era só o público, mas escrever o teste para 18 rotas e não para
as 15 seguintes seria desperdício. As 3 que falhavam (`/app/company/complaints`,
`/app/company/profile`, `/app/company/projects`) eram todas o mesmo `PageTabs`.

**Isso fecha a metade "overflow" da task `15`**, que continua pendente pelo
resto do escopo dela: alvos de toque, menu lateral em celular e formulários
longos.

## Um tropeço meu no meio do caminho

Para tirar as capturas de "antes", guardei cópias dos arquivos alterados num
diretório e restaurei as versões do `HEAD`. O laço usava **só o nome base** do
arquivo — e `src/app/page.tsx`, `src/app/ajuda/page.tsx` e
`src/app/search/page.tsx` têm todos o nome `page.tsx`. Os três se sobrescreveram
no diretório de backup, e as versões corrigidas de duas delas se perderam.

Nada de irrecuperável: os dois ajustes eram de uma linha cada e foram
reaplicados na hora, com verificação de que a paleta da task `13` não tinha
voltado junto. Fica registrado porque a lição é barata: backup por nome base é
armadilha em projeto de App Router, onde metade dos arquivos se chama `page.tsx`.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/responsive.spec.ts` | ✅ **66/66** (33 rotas × 2 viewports) |
| `npm run test:e2e` | ✅ **286 passando, 2 pulados**, 12,3 min |
| `npm run test:a11y` | ✅ **78/78**, 0 ocorrências — a mudança de layout não regrediu acessibilidade |
| `npm run check` | ✅ exit 0 |
| `npm run build` | ✅ passa |

Larguras medidas, em 375px de tela:

| Rota | Antes | Depois |
|---|---|---|
| `/` | 365 (cortado por `overflow-hidden`) | 365 |
| `/companies` | **645** | 365 |
| `/ajuda` | **645** | 365 |
| `/app/company/projects` | **464** | 365 |

## Critérios de aceite

- [x] Nenhuma rota pública tem scroll horizontal em 375px.
- [x] Formulários de login e cadastro são preenchíveis em 375px — `/login`,
      `/register` e os quatro passos de onboarding passam, e o fluxo 1 do
      `e2e/keyboard.spec.ts` completa o login no viewport móvel.
- [x] `e2e/responsive.spec.ts` passa e falharia se houvesse overflow — as 8
      falhas iniciais são a prova de que ele detecta.
- [x] Screenshots de antes/depois anexados.
- [ ] **Menu/navegação abre, fecha e navega em mobile** — não verificado aqui.
      Overflow é o que este teste mede. Comportamento do menu hambúrguer fica na
      task `15`, que já tem esse item no escopo.
