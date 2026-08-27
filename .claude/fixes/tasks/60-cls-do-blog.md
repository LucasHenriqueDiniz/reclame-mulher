# [60] O `/blog` desloca o conteúdo em 0,198 — o dobro do limite

| Campo | Valor |
|---|---|
| **ID** | `60` |
| **Fase** | `7 — Build e produção` |
| **Risco** | médio |
| **Depende de** | `19` |
| **Achado em** | task `19` (performance) |
| **Estimativa** | média |

## O que foi medido

Build de produção, Slow 4G + 4× de CPU, `/blog`:

| Viewport | CLS | Alvo |
|---|---|---|
| desktop | **0,163** | < 0,1 |
| mobile | **0,198** | < 0,1 |

Todas as outras rotas medidas ficam entre 0,000 e 0,021. O `/blog` é o único
fora do alvo, e está no dobro dele.

## A causa

Um único deslocamento, capturado com `PerformanceObserver` sobre
`layout-shift` com as `sources`:

```
0.1981 em 3781 ms
   FOOTER.flex flex-col w-full items-start gap-[35px] px-6  y/h [281,168] -> [0,0]
```

O rodapé estava em `y=281` — ou seja, a página inteira ocupava menos de 300px —
e então some daquela posição. É a troca da árvore de carregamento pela árvore
final: `src/app/blog/page.tsx` tem dois `return` completos, um para
`if (loading)` e outro para o conteúdo, cada um com o seu `MainHeader` e o seu
`Footer`. Quando `loading` vira `false`, o React desmonta uma árvore inteira e
monta outra.

O esqueleto até imita a altura do post em destaque, mas não a da lista de
recentes — e no celular a diferença é grande o bastante para o rodapé pular.

## Por que não foi corrigido na task `19`

Duas razões, ambas registradas lá:

1. O escopo da `19` priorizava **home e página de empresa**, e as duas ficaram
   dentro dos alvos.
2. A correção é uma remodelagem do estado de carregamento, não um ajuste. Vale
   ser feita com atenção e testada, não espremida no fim de outra task.

## Um detalhe importante da medição

Este CLS **não é regressão**: ele já existia. Só não aparecia nas medições
porque a imagem que dispara o deslocamento (`hero.webp`, usada como capa de um
post, 900 kB antes da task `19`) **não terminava de baixar** dentro da janela de
medição em rede lenta. Depois de a imagem cair para 89 kB, ela passou a chegar a
tempo — e o deslocamento que sempre esteve lá passou a ser contado.

Vale como lição de medição: um recurso lento demais pode **esconder** o defeito
que ele mesmo causa.

## O que fazer

1. Unificar os dois `return` de `src/app/blog/page.tsx`: um só esqueleto, dentro
   da mesma árvore, trocando apenas os blocos internos. `MainHeader` e `Footer`
   não podem ser desmontados e remontados.
2. O esqueleto da lista de recentes precisa reservar a altura de um número fixo
   de cartões — o mesmo que a página vai mostrar.
3. Conferir `/blog/all`, que tem a mesma estrutura de dois `return`.

## Critérios de aceite

- [ ] CLS de `/blog` e `/blog/all` abaixo de 0,1 nos dois viewports, medido em
      build de produção com rede e CPU limitadas.
- [ ] `MainHeader` e `Footer` não são desmontados na transição de carregamento.
- [ ] A medição entra no relatório com antes e depois.

## Nota

O script de medição da task `19` está em
[`reports/19-perf/`](../reports/19-perf) e serve para o antes/depois — é o mesmo
método, então os números são comparáveis.
