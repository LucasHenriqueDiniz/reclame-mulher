# Relatório — [06] Migrar `<img>` para `next/image`

- **Data:** 2026-08-26
- **Status:** done (com um critério de aceite pendente — ver ao final)
- **Iterações de debug:** 1

## Resultado

**`npx eslint .` reporta 0 problemas no repositório inteiro.**

| Momento | Erros | Warnings |
|---|---|---|
| Início da fila (task `00`) | 4 | 277 |
| Depois da task `01` (worktrees ignoradas) | 0 | 45 |
| Depois da task `05` | 0 | 7 |
| **Agora** | **0** | **0** |

## Descoberta que muda o valor desta task

`next.config.ts` tem:

```ts
images: {
  unoptimized: true,
  remotePatterns: [ /* ufs.sh, utfs.io */ ],
}
```

Com `unoptimized: true`, o `next/image` **não otimiza nada** — não converte
formato, não redimensiona, não economiza banda. A promessa da regra
`@next/next/no-img-element` ("slower LCP and higher bandwidth") não se cumpre
enquanto essa flag estiver ligada.

O que a migração **ainda** entrega, e por isso ela vale:

- `width`/`height` explícitos reservam espaço e **evitam CLS** — métrica que a
  task `19` vai medir;
- `loading="lazy"` e `decoding="async"` automáticos;
- se a flag for removida, a otimização passa a valer sem tocar em nenhum
  componente.

**Isto é decisão para as tasks `19` e `20`,** não para esta: remover
`unoptimized: true` exige um otimizador em runtime, e o alvo de deploy do
projeto ainda não está definido. Registrei nas duas.

## As 5 migrações

| Arquivo | Abordagem |
|---|---|
| `blog/page.tsx` | capa em destaque → `<Image fill sizes="100vw" priority>` — o container pai já era `relative w-full h-[600px]`, e essa é a imagem de LCP da página |
| `blog/[slug]/page.tsx` | capa do post → `<Image width={1200} height={400} priority>` |
| `company/[slug]/_components/company-profile-content.tsx` | logo → `<Image width={72} height={72}>` |
| `components/app/ProfileHero.tsx` | avatar → `<Image width={137} height={137}>` |
| `components/company/CompanyProfileHero.tsx` | logo → `<Image width={72} height={72}>` (estilos inline preservados) |

Usei `fill` só onde o pai já estava posicionado; nos demais, `width`/`height`
explícitos, que não dependem do posicionamento do container e não têm como
colapsar o layout.

## As 2 exceções, e por que são legítimas

**1. Imagem dentro do markdown do post** (`blog/[slug]/page.tsx`) — o conteúdo é
markdown livre. A URL pode ser de qualquer host e a dimensão é desconhecida em
tempo de build. `next/image` exigiria `remotePatterns` para cada domínio
possível e **lançaria erro em runtime** para os não listados.

**2. Preview da foto de capa no editor** (`blog/[slug]/edit/page.tsx`) — o
`featuredImage` vem de um `<Input>` livre: a autora cola qualquer URL. Migrar
quebraria o preview justamente enquanto ela digita.

Ambas com `eslint-disable-next-line` e comentário explicando o motivo — não um
disable mudo.

### Erro que a verificação pegou

Na primeira tentativa coloquei o `eslint-disable-next-line` antes da linha
`img: ({ src, alt }) => (`, que é a prop do ReactMarkdown — não a linha do
`<img>` de verdade, que vem a seguir. O ESLint acusou os dois lados do
problema ao mesmo tempo: `Unused eslint-disable directive` numa linha e o
warning original na outra. Comentário reposicionado para dentro do corpo da
arrow function.

## Verificação

| Comando | Resultado |
|---|---|
| `npx eslint .` | ✅ **0 problemas** |
| `npm run typecheck` | ✅ 0 erros |
| `npm run build` | ✅ `Compiled successfully in 25.0s` |
| `/blog`, `/blog/[slug]`, `/company/[slug]`, `/` | ✅ HTTP 200 |
| `/blog-image.webp`, `-2`, `-3`, `/hero.webp`, `/logo.webp` | ✅ todos 200 |

## Critério de aceite que NÃO foi cumprido

> - [ ] Nenhuma imagem quebrou visualmente — comprovado com screenshot no
>   preview de `/blog`, um `/blog/[slug]`, um `/company/[slug]`, e a home.

**Não consegui a prova visual.** Dois motivos somados:

1. O navegador embutido continua recusando navegação para `localhost:5000` — a
   mesma limitação registrada na task `00`.
2. Mesmo por HTTP, não daria: **4 dos 5 arquivos migrados são client
   components** (`blog/page.tsx`, `blog/[slug]/page.tsx`,
   `company-profile-content.tsx`, `CompanyProfileHero.tsx`). As imagens só
   aparecem depois da hidratação, então o HTML que o `curl` recebe não as
   contém. Confirmei: as páginas trazem apenas o logo do cabeçalho, que já era
   `next/image`.

Além disso, **as duas empresas do seed têm `logoUrl` nulo**, então os dois
componentes de logo caem no fallback da letra inicial e as `<Image>` que
escrevi ali nem chegam a ser exercitadas com dado real.

### O que reduz o risco enquanto isso

O modo de falha clássico desta migração é `<Image fill>` com pai não
posicionado, que colapsa o layout. Usei `fill` em **um único** lugar
(`blog/page.tsx`), cujo pai é `relative w-full h-[600px]` — verificado no
código-fonte. Os outros quatro usam `width`/`height` explícitos, que não
dependem do container.

### Quem fecha este critério

A task `14` abre exatamente `/blog`, `/blog/[slug]` e `/company/[slug]` no
Playwright, que executa JavaScript e enxerga o DOM hidratado. Anotei lá para
conferir estas imagens e tirar as capturas. A task `23` precisa de um seed com
`logoUrl` preenchido para que os componentes de logo sejam exercitados de
verdade.
