# Relatório — [19] Performance — Core Web Vitals das rotas principais

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1
- **Medições e scripts:** [`19-perf/`](19-perf)

## Como foi medido, e por que isso importa mais que os números

O único número que existia no repositório — "0,73 s de média" — foi medido em
dev server. Não diz nada: em dev não há minificação, o Turbopack compila sob
demanda e o React roda em modo de desenvolvimento.

Medir em `npm run start` corrige isso, mas **não basta**. Localhost com CPU de
desktop é o melhor cenário possível, e o público desta plataforma acessa de
celular mediano em rede móvel. Uma medição sem limitação diria "tudo ótimo" e
estaria errada.

Todas as tabelas abaixo são com **Slow 4G (1,6 Mbps, 150 ms de latência) e CPU
4× mais lenta**, os presets do DevTools, aplicados por CDP. O script está em
[`19-perf/medir.mjs`](19-perf/medir.mjs); os números sem limitação estão em
[`antes.txt`](19-perf/antes.txt) e [`depois.txt`](19-perf/depois.txt), para
comparação.

A diferença entre os dois modos é a razão de existir desta seção:

| Rota | LCP sem limitação | LCP com Slow 4G + CPU 4× |
|---|---|---|
| `/` | 164 ms | **7 220 ms** |
| `/blog` | 860 ms | **3 708 ms** |

Quarenta e quatro vezes. Quem mede em localhost e declara "performance boa"
está medindo a própria máquina.

## O antes

| viewport | rota | LCP | CLS | TTFB | total |
|---|---|---|---|---|---|
| desktop | `/` | **7 220 ms** | 0,000 | 6 ms | 1 365 kB |
| desktop | `/companies` | 640 ms | 0,000 | 436 ms | 28 kB |
| desktop | `/blog` | **3 708 ms** | 0,001 | 4 ms | 403 kB |
| desktop | `/company/construtora-x` | 1 404 ms | 0,000 | **1 123 ms** | 112 kB |
| desktop | `/app/complaints` | 1 504 ms | 0,001 | 434 ms | 479 kB |
| desktop | `/app/company/dashboard` | 1 968 ms | 0,002 | **837 ms** | 491 kB |
| mobile | `/` | **7 124 ms** | 0,000 | 6 ms | 1 354 kB |
| mobile | `/blog` | **3 652 ms** | 0,005 | 4 ms | 390 kB |
| mobile | `/company/construtora-x` | 1 504 ms | 0,000 | **1 241 ms** | 108 kB |
| mobile | `/app/company/dashboard` | 1 964 ms | 0,000 | **845 ms** | 478 kB |

## O culpado: 900 kB numa linha de CSS

A home transferia 1 365 kB, e as imagens eram só 30 kB disso. A quebra por tipo
apontou o responsável:

```
POR TIPO:
  css            1 req  900 kB      ← 66% da página
  script        18 req  268 kB
  link          10 req  145 kB
  img            2 req   30 kB

MAIORES:
    900 kB  css   /hero.webp
```

`hero.webp`: **2000×1334, 900 kB**, carregada por
`bg-[url('/hero.webp')]` em `Hero.tsx`. Sozinha, em Slow 4G, leva ~4,5 s — o que
explica o LCP de 7,2 s com FCP de 1,37 s.

Duas coisas erradas ao mesmo tempo, e a segunda é a menos óbvia:

1. **O arquivo é grande demais.** 900 kB para um WebP de 2000×1334 é qualidade
   perto de 95 — para uma foto atrás de um véu preto a 60% de opacidade.
2. **É `background-image` de CSS.** O navegador só descobre a imagem depois de
   baixar e interpretar a folha de estilo. Sendo ela o elemento de LCP, o
   caminho crítico ficou o mais longo possível — e nenhuma otimização de
   `next/image` alcança um `background-image`.

Isso também explica por que a task `06`, que migrou imagens para `next/image`,
não pegou este caso: **não é uma tag `<img>`.**

## As duas correções, medidas separadamente

### 1. Recomprimir as imagens de `public/`

Sem dependência nova. `sharp` não está instalado, e acrescentá-lo mexeria no
lockfile — que já é assunto da task `20`. Em vez disso, o encoder de WebP do
próprio Chromium, via canvas ([`reencode.mjs`](19-perf/reencode.mjs)):

| Arquivo | Antes | Depois | |
|---|---|---|---|
| `hero.webp` | 2000×1334, 900 kB | 1600×1067, **88 kB** | **−90%** |
| `blog-image.webp` | 720×480, 122 kB | 720×480, **29 kB** | −76% |
| `blog-image-2.webp` | 720×480, 137 kB | 720×480, **38 kB** | −73% |
| `blog-image-3.webp` | 720×480, 106 kB | 720×480, **28 kB** | −74% |
| `logo.webp` | 500×500, 26 kB | 256×256, **9 kB** | −67% |
| **Total** | **1 291 kB** | **192 kB** | **−85%** |

O logo aparece no cabeçalho a 48×48 e no menu a 40×40; 256 px cobre 3× de
densidade com folga.

**Efeito medido:**

| Rota | LCP antes | LCP depois |
|---|---|---|
| `/` desktop | 7 220 ms | 2 988 ms |
| `/` mobile | 7 124 ms | 2 920 ms |
| `/blog` desktop | 3 708 ms | **2 360 ms** ✅ |
| `/blog` mobile | 3 652 ms | **2 284 ms** ✅ |

A home melhorou 4,2 s e ainda assim ficava fora do alvo, em 2,9 s.

### 2. O herói deixou de ser fundo de CSS

```tsx
<Image src="/hero.webp" alt="" fill priority sizes="100vw"
       className="object-cover object-center" />
```

Com `priority`, o Next emite `<link rel="preload" as="image" fetchpriority="high">`
no HTML. A imagem passa a ser descoberta na primeira leitura do documento, e não
depois do CSS.

**Efeito medido, isolado da correção anterior:**

| Rota | LCP antes | depois de recomprimir | depois do `priority` |
|---|---|---|---|
| `/` desktop | 7 220 ms | 2 988 ms | **848 ms** ✅ |
| `/` mobile | 7 124 ms | 2 920 ms | **684 ms** ✅ |

Ou seja: a recompressão valeu 4,2 s e a mudança de descoberta valeu outros
2,1 s. Duas causas, duas correções, dois números.

## O depois

| viewport | rota | LCP | CLS | TTFB | total | alvo |
|---|---|---|---|---|---|---|
| desktop | `/` | **848 ms** | 0,000 | 4 ms | 393 kB | ✅ |
| desktop | `/companies` | 836 ms | 0,000 | 497 ms | 36 kB | ✅ |
| desktop | `/blog` | 448 ms | **0,163** | 4 ms | 307 kB | ⚠️ CLS |
| desktop | `/company/construtora-x` | 1 564 ms | 0,000 | **1 130 ms** | 34 kB | ⚠️ TTFB |
| desktop | `/app/complaints` | 1 128 ms | 0,014 | 427 ms | 433 kB | ✅ |
| desktop | `/app/company/dashboard` | 1 728 ms | 0,014 | **1 037 ms** | 445 kB | ⚠️ TTFB |
| mobile | `/` | **684 ms** | 0,000 | 6 ms | 393 kB | ✅ |
| mobile | `/companies` | 764 ms | 0,000 | 433 ms | 36 kB | ✅ |
| mobile | `/blog` | 1 964 ms | **0,198** | 6 ms | 307 kB | ⚠️ CLS |
| mobile | `/company/construtora-x` | 1 564 ms | 0,000 | **1 126 ms** | 34 kB | ⚠️ TTFB |
| mobile | `/app/complaints` | 1 124 ms | 0,021 | 428 ms | 433 kB | ✅ |
| mobile | `/app/company/dashboard` | 1 520 ms | 0,021 | 823 ms | 444 kB | ⚠️ TTFB |

**LCP: 12 de 12 dentro do alvo de 2,5 s.** A pior é 1 964 ms.
**CLS: 10 de 12 dentro de 0,1.** As duas fora são o `/blog`.

## O CLS do `/blog`, e uma lição de medição

`/blog` marca 0,163 no desktop e 0,198 no celular — o dobro do limite. Um único
deslocamento, capturado com as `sources` do `layout-shift`:

```
0.1981 em 3781 ms
   FOOTER.flex flex-col w-full items-start...  y/h [281,168] -> [0,0]
```

`src/app/blog/page.tsx` tem **dois `return` completos** — um para `if (loading)`
e outro para o conteúdo —, cada um com o seu `MainHeader` e o seu `Footer`.
Quando `loading` vira `false`, o React desmonta uma árvore inteira e monta
outra, e o rodapé salta.

**Este CLS não é regressão da task `19`. Ele sempre existiu.** Só não aparecia
nas medições porque a imagem que dispara o deslocamento — `hero.webp`, usada
como capa de um post — pesava 900 kB e **não terminava de baixar** dentro da
janela de medição em rede lenta. Depois de cair para 89 kB, passou a chegar a
tempo, e o defeito passou a ser contado.

Vale registrar como método: **um recurso lento demais pode esconder o defeito
que ele mesmo causa.** A tabela do "antes" mostra `/blog` com CLS 0,001 — e esse
número era falso, não por erro de instrumento, mas porque a página nunca
terminava de montar.

Registrado como task [`60`](../tasks/60-cls-do-blog.md). Não foi corrigido aqui
porque o escopo da `19` priorizava home e página de empresa — ambas em 0,000 — e
porque a correção é uma remodelagem do estado de carregamento, não um ajuste.

## O TTFB, e uma otimização que não funcionou

`/company/[slug]` e `/app/company/dashboard` passam dos 800 ms de TTFB. A causa
está medida:

```
round trip trivial ao Neon (ms): 138, 138, 139, 139, 418 | mediana: 139
```

**139 ms por ida e volta ao banco**, desta máquina. `/company/[slug]` faz
`findBySlug` e depois três consultas em `Promise.all` — no mínimo dois turnos,
e `getStats` fazia duas consultas **em série** dentro do terceiro.

Paralelizei as duas de `getStats` e as duas de `getStatsBatch`. No nível do
driver, o ganho é real e medido:

```
serie   : 278 ms
paralelo: 138 ms
```

**No nível da página, o ganho foi zero.** A/B controlado — com a mudança, sem a
mudança (via `git stash`), com a mudança de novo, oito amostras cada, mediana:

| Rota | com `Promise.all` | sem | com (confirmação) |
|---|---|---|---|
| `/companies` | 147 ms | 147 ms | 147 ms |
| `/company/construtora-x` | 426 ms | 424 ms | 425 ms |

Não é cache: o `Cache-Control` é `no-store`, e chamadas com parâmetro aleatório
dão o mesmo tempo.

**Não sei explicar a diferença entre o modelo e a medida.** Pela aritmética,
`findBySlug` (139) + o turno paralelo (278 → 139) deveria levar a página de
417 ms para 278 ms. Ficou em 425 ms nos dois casos. Há um custo de ~139 ms que
não localizei.

Mantive a mudança: duas consultas independentes não devem ser serializadas, ela
é meio round trip mais barata de fato, e não custa nada. Mas **não a conto como
melhoria de página**, porque medi e não melhorou.

O que se pode afirmar sobre o TTFB: ele é dominado por latência de rede até um
banco remoto, medido a partir de uma máquina local no Brasil. A correção real é
de topologia de deploy — aproximar aplicação e banco de região —, e isso é a
task `20`.

## Duas suspeitas da task que não se confirmaram

| Suspeita | Medição |
|---|---|
| "fonte Playfair Display sem `next/font` → FOUT e CLS" | **Já estava certo.** As três fontes usam `next/font/google` com `display: "swap"`. CLS de 0,000 na home confirma |
| "imagens não otimizadas (deve estar resolvido pela task `06`)" | Resolvido **para as tags `<img>`** — 13 arquivos usam `next/image`, e sobra um `<img>` cru no renderizador de markdown do blog. O que a `06` não pegou foi o `background-image` do herói, que não é tag |

## O que continua na mesa

`images: { unoptimized: true }` continua ligado. Desliga o otimizador do Next
inteiro: nada de `avif`, nada de `srcset`, toda imagem servida no tamanho
original para todo mundo.

**Não mexi, e por um motivo concreto:** `sharp` não está nas dependências, e o
Next 15 precisa dele para otimizar em produção. Ligar a otimização sem `sharp`
quebra o servidor. Instalar `sharp` significa mexer no lockfile — e o
repositório tem **dois** lockfiles, que é exatamente o problema aberto da task
`20`.

Com as imagens recomprimidas à mão, o custo de manter `unoptimized` caiu de
1 291 kB para 192 kB. Ligar a otimização ainda valeria — daria `avif` e
`srcset` — mas deixou de ser urgente, e a decisão pertence à task que resolve o
ambiente.

## Verificação

| Comando | Resultado |
|---|---|
| `npm run test:e2e` | ✅ **359 passando, 3 pulados** (362), 15,0 min |
| `npm run test:a11y` | ✅ **78/78** — as imagens novas não regrediram nada |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src --max-warnings 0` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 9.6s` |

## Critérios de aceite

- [x] Tabela de métricas por rota e por viewport, medida em produção — e com
      rede e CPU limitadas, que é o que torna a tabela útil.
- [x] Home e página de empresa dentro dos alvos de LCP e CLS. A home foi de
      7 220 ms para 848 ms; o CLS das duas é 0,000. O TTFB da página de empresa
      fica fora, com a causa medida e atribuída à `20`.
- [x] Toda otimização aplicada tem antes/depois medido — inclusive a que **não**
      melhorou, que está reportada como não tendo melhorado.

## Sobre INP

Não medido, e não dá para medir aqui: INP depende de interação real e só faz
sentido com dado de campo ou com um roteiro de interações representativo. O que
se pode dizer com base no que foi medido: o JS compartilhado é de 177 kB e o
maior bundle de rota é o `/login` com 78,8 kB — números que não sugerem
travamento de interação, mas isso é inferência, não medida.
