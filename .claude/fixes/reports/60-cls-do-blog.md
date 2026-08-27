# Relatório — [60] O `/blog` desloca o conteúdo em 0,198

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 2

## Primeiro: o número da task não se reproduz mais

Antes de mexer em qualquer linha, medi. Build de produção limpo, servidor em
`:5001`, Slow 4G + 4× de CPU — o mesmo método da task `19`, rodado três vezes,
com resultado idêntico nas três:

| Rota | Viewport | Medido antes de corrigir | Task `19` |
|---|---|---|---|
| `/blog` | desktop | 0,0013 | **0,163** |
| `/blog` | celular | 0,0051 | **0,198** |
| `/blog/all` | desktop | 0,0005 | — |
| `/blog/all` | celular | 0,0378 | — |

Rodei também o `cls.mjs` da task `19` sem alterar uma vírgula, para descartar
diferença de script. Mesmos números.

**Por que caiu sozinho.** O CLS só conta deslocamento de elemento que está
**dentro da janela**. A task `19` capturou o rodapé saindo de `y=281`: a página
inteira cabia em menos de 300 px, o que é o estado de antes do CSS chegar.
Segui a altura da página e a posição do rodapé ao longo do carregamento, com a
mesma limitação de rede e CPU (`reports/60-perf/diagnostico.mjs`), e o traço
antes da correção era este:

```
=== desktop (janela de 800 px)
      0 ms  altura   405  rodapé em    281  <- DENTRO da janela  esqueleto:11
    800 ms  altura  2911  rodapé em   2629    esqueleto:11
   3600 ms  altura  1995  rodapé em   1713

=== celular (janela de 812 px)
      0 ms  altura   441  rodapé em    281  <- DENTRO da janela  esqueleto:11
    800 ms  altura  6198  rodapé em   5661    esqueleto:11
   3600 ms  altura  3396  rodapé em   2859
```

A troca do esqueleto pelo conteúdo continuava acontecendo, e continuava mudando
a altura da página de forma enorme — 6 198 px para 3 396 px no celular. Só que
aos 800 ms o rodapé já estava a 5 661 px do topo, muito abaixo da dobra. Fora da
janela, deslocamento vale zero.

Ou seja: **o sintoma sumiu, a causa não.** A distância entre 0,005 e 0,198 é uma
questão de geometria — menos posts publicados, um herói mais baixo, uma janela
mais alta — não de o defeito ter sido consertado. É o mesmo tipo de armadilha
que a própria task `60` documenta ao explicar por que a `19` só viu o problema
depois que a imagem ficou leve: **a medição depende de condições que mudam, o
defeito não.**

Por isso corrigi assim mesmo. O critério 2 da task não fala de número nenhum —
fala da causa: *"`MainHeader` e `Footer` não são desmontados na transição de
carregamento"*.

## O que foi feito

Não segui o passo 1 da task ("unificar os dois `return`, um só esqueleto"), e
vale dizer por quê: calibrar a altura do esqueleto para a altura do conteúdo só
funciona enquanto o número de posts for o de hoje. É um acerto que se
desregula sozinho na primeira publicação. **Tirei o carregamento do caminho.**

As duas telas eram `"use client"` inteiras, buscando de `/api/blog/posts` num
`useEffect`. Viraram componente de servidor:

| Arquivo | Papel |
|---|---|
| `src/app/blog/_lib/posts.ts` (novo) | Busca no servidor. Faz a mesma combinação que `GET /api/blog/posts`: `BlogRepo.findPublic` mais `getPostTagsBatch` num lote só. Datas viram texto na fronteira servidor → cliente |
| `src/app/blog/page.tsx` | Servidor: busca, monta `MainHeader` + conteúdo + `Footer` |
| `src/app/blog/_components/blog-content.tsx` (novo) | Cliente, só apresentação. Mantém `useIsAdmin` para o botão "Criar Post" |
| `src/app/blog/all/page.tsx` | Servidor: posts e tags em paralelo |
| `src/app/blog/all/_components/all-posts-content.tsx` (novo) | Cliente. Busca por título e filtro por tag continuam aqui — isso é interação, não carregamento |
| `src/components/blog/BlogPostCardSkeleton.tsx` | **Removido.** Existia só para o estado de carregamento que deixou de existir; nada mais no repositório o importava |

Não há mais um `if (loading)` com uma segunda árvore. Há uma árvore só, e o
`MainHeader` e o `Footer` estão nela uma vez — o critério 2 não depende de
medição, dá para ler no arquivo.

### As duas telas ficaram dinâmicas de propósito

`export const dynamic = "force-dynamic"` nas duas. Sem isso o Next resolveria a
consulta **uma vez, no build**, e a lista de posts congelaria até o próximo
deploy — exatamente o defeito que o achado `64` descreve para a home. A
correção de um problema não podia introduzir o outro. O `next build` confirma:
`/blog` e `/blog/all` agora aparecem como `ƒ (Dynamic)`.

### A degradação foi preservada

A versão de antes engolia erro de rede e mostrava "Nenhum post disponível". O
carregador novo faz o mesmo — mas agora a causa aparece no log do servidor, em
vez de sumir num `console.error` do navegador de quem visita.

## Medição depois

Mesmo script, mesmo servidor, mesma limitação, duas execuções:

| Rota | Viewport | Antes | Depois | Alvo |
|---|---|---|---|---|
| `/blog` | desktop | 0,0013 | **0,0003** | < 0,1 |
| `/blog` | celular | 0,0051 | **0,0000** | < 0,1 |
| `/blog/all` | desktop | 0,0005 | **0,0002** | < 0,1 |
| `/blog/all` | celular | 0,0378 | **0,0000** | < 0,1 |

O ganho visível é o `/blog/all` no celular: 0,0378 → 0. Os outros já estavam
baixos pelo motivo errado, e agora estão baixos pelo motivo certo.

O traço da altura conta melhor do que o número. Depois da correção:

```
=== celular (janela de 812 px)
      0 ms  altura   908  rodapé em   null
    400 ms  altura  1975  rodapé em   1815
    800 ms  altura  3396  rodapé em   2859
   5200 ms  altura  3396  rodapé em   2859
```

Nenhum `esqueleto:` em nenhuma linha — `.animate-pulse` desapareceu da página.
A altura sobe uma vez, enquanto o HTML chega, e para em 3 396 px: **o mesmo
valor final de antes**, alcançado sem passar por 6 198 px no meio do caminho.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo; `/blog` e `/blog/all` como `ƒ` |
| HTML do servidor | ✅ `curl http://localhost:5001/blog` já traz o título do post em destaque; `/blog/all` já traz "4 posts" — antes o HTML vinha com o esqueleto |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **477 passando, 3 pulados** em 25,3 min — o mesmo total de antes. A varredura de acessibilidade cobre `/blog` e `/blog/all` nos dois viewports e continuou limpa; a `responsive.spec.ts` também. Ver a ressalva abaixo |

### Uma falha na primeira execução da suíte, que não se reproduz

A primeira execução completa depois da correção deu **476 passando e 1
falhando**: `api-erros.spec.ts:152 › id inexistente devolve NOT_FOUND, e não
500`, em `chromium-mobile`.

Não se reproduz: 3 de 3 isolado com `--repeat-each=3`, e a suíte inteira rodada
de novo, sem tocar em nada, voltou aos 477. Não é regressão desta task — a
mudança foi em `/blog` e `/blog/all`, e a rota em questão é de API de empresa,
que nem foi tocada.

O que me incomoda mais não é a falha: é que **ela não deixou rastro**. Aquela
execução usava `--reporter=line`, que reescreve a mesma linha e não guardou nem
o status nem o corpo da resposta. Rodar 28 minutos e não saber o motivo da única
falha é caro. Virou a task `68`, junto com a recomendação de reporter.

## Uma medição inválida, e como apareceu

A primeira rodada depois da correção deu **0,0000 nas quatro combinações** — e
estava errada. O `TaskStop` do servidor de produção matou o processo que eu
tinha lançado, mas não o `next start` filho, que continuou escutando na 5001 com
o `.next` apagado debaixo dele. A rodada mediu um servidor zumbi.

O que denunciou não foi o CLS zerado — foi conferir o HTML: `curl` trazia
"Nenhum post disponível". Página vazia não desloca nada. Matei o processo pelo
PID, subi de novo e refiz.

Fica a regra, que vale para a próxima medição de produção: **conferir que a
página tem conteúdo antes de acreditar no número.** Um zero pode ser sucesso ou
pode ser tela em branco, e o CLS não distingue os dois.

## Critérios de aceite

- [x] **CLS de `/blog` e `/blog/all` abaixo de 0,1 nos dois viewports, em build
      de produção com rede e CPU limitadas** — máximo de 0,0003.
- [x] **`MainHeader` e `Footer` não são desmontados na transição de
      carregamento** — não há mais transição de carregamento: uma árvore só,
      renderizada no servidor.
- [x] **A medição entra no relatório com antes e depois** — com a ressalva
      registrada de que o "antes" de hoje já não era o "antes" da task `19`, e
      por quê.

## Pendências e achados fora de escopo

Task `68` aberta: a falha isolada acima, e a lição de reporter que veio com ela.

Vale também o registro de que estas duas telas passaram a ser o
segundo caso de `force-dynamic` por causa de dados que mudam sem deploy — o
primeiro é o achado `64`, ainda aberto para a home. Quando ele for resolvido, a
decisão vale para as três.
