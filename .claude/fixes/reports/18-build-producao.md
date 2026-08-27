# Relatório — [18] Build de produção limpo e reprodutível

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O build

```
▲ Next.js 15.5.9 (Turbopack)
✓ Compiled successfully in 9.2s
✓ Generating static pages (64/64)
```

| | |
|---|---|
| Tempo total, do `rm -rf .next` ao fim | **31 s** |
| Compilação | 9,2 s |
| Páginas estáticas geradas | 64 |
| Warnings | **0** |
| Erros | **0** |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | **não existem** |
| Middleware | 45,5 kB |
| JS compartilhado por todas as rotas | **177 kB** |

`next.config.ts` tem quatro coisas e nada mais: `serverActions.bodySizeLimit`,
`images.unoptimized`, três `remotePatterns` do UploadThing. Nenhuma escapatória.
O build passa por mérito.

### As rotas mais pesadas

| Rota | Bundle da rota | First Load JS |
|---|---|---|
| `/login` | **78,8 kB** | 237 kB |
| `/app/complaints/new` | 21 kB | **262 kB** |
| `/` | 12,6 kB | 269 kB |
| `/onboarding/person/step1` e `/company/step1` | 11 kB | 248 kB |
| `/blog/[slug]/edit` | 6,7 kB | **278 kB** |

`/login` chama atenção: **quinze vezes** o `/register` (5,32 kB) para uma tela
mais simples. A causa está nos imports — `react-hook-form`,
`@hookform/resolvers/zod` e `import * as z from "zod"`. É a primeira rota a
puxar esse trio para um chunk próprio.

Fica **registrado, não corrigido**: otimização de bundle é a task `19`. O que
esta task devia fazer era medir, e a medida está aqui.

## Estático versus dinâmico: conferido, e está certo

`/blog` e `/blog/all` aparecem como **estáticos** (`○`), o que à primeira vista
parece um problema — artigo publicado não apareceria até o próximo build.

Não é. As duas são `"use client"` e buscam em `useEffect`:

```tsx
const response = await fetch("/api/blog/posts?limit=10");
```

O que está pré-renderizado é a casca; o conteúdo chega em tempo de execução.
Fica registrado para ninguém "consertar" o que não está quebrado.

Todas as `/app/**` são dinâmicas, como têm de ser: dependem de sessão. As
públicas de texto (`/privacy`, `/terms`) são estáticas com 0 B de bundle
próprio.

## O que só aparece subindo a aplicação

Aqui está o valor real da task. Três achados, e **nenhum deles apareceria no
terminal do build**.

### 1. O nome da autora anônima estava impresso na tela — corrigido

O painel da empresa, no build de produção, mostrava:

```
#R-D814-CAAC  Respondida
Barulho fora do horário permitido
Ana Santos · 26 de ago. de 2026
```

`Ana Santos` é a autora de um relato marcado como **anônimo** no seed.

A causa: `company-dashboard.tsx` monta as props da lista com um `.map` que
**descartava `isAnonymous`**. O `CompanyComplaintList` tem a ramificação
`isAnonymous ? "Autora anônima" : author?.name`, mas recebia `undefined`.

Isto **corrige uma afirmação minha na task `16`**, onde escrevi que "nenhuma
tela mostrava o nome". Eu havia concluído isso de `grep` por `author?.name`, que
mostrou a ramificação certa em todos os renderizadores. O que o grep não mostra
é **quem esquece de passar a prop**.

A correção da `16` já tinha estancado o vazamento — por isso a tela exibia `—` e
não mais o nome quando subi a aplicação. Aqui o rótulo certo voltou. Verificado
no build de produção:

```
Autora anônima  →  1 ocorrência
Ana Santos      →  0 ocorrências
```

O relatório da `16` recebeu a nota de correção. A lição é a que a própria task
`18` prevê: **ler componente não substitui subir a aplicação e olhar.**

### 2. "Esqueceu a senha?" não leva a lugar nenhum

`src/app/(auth)/login/page.tsx:154` aponta para `/forgot-password`. **A rota não
existe** — não há diretório, e ela não está entre as 76 do build.

| Quem clica | O que acontece |
|---|---|
| **Sem sessão** — o único caso que importa | `307` → `/login`, sem mensagem |
| Com sessão | `404` |

Quem clica ali está trancada para fora da conta — e a conta guarda as denúncias
que ela fez. O botão não dá erro: **recarrega a mesma tela**, o que se lê como
"cliquei errado" e convida a tentar de novo.

Registrado como task [`59`](../tasks/59-esqueceu-a-senha-nao-existe.md).

E a pergunta seguinte — "haverá outros?" — foi respondida aqui, comparando todo
`href` interno do código com as rotas que existem:

```
42 rotas existentes, 24 destinos internos usados
QUEBRADOS: 1
  /forgot-password  <- src/app/(auth)/login/page.tsx
```

É o único. O que é bom e ruim ao mesmo tempo: a superfície está limpa, e mesmo
assim este link solitário passou meses sem ser notado.

### 3. O console anônimo tem um erro, e ele é normal

Toda página aberta sem sessão registra:

```
[error] Failed to load resource: 401 (Unauthorized)   ← GET /api/me
```

É o hook de sessão perguntando "tem alguém logado?". A pergunta é legítima; a
resposta 401 não é — "não há ninguém" deveria ser `200 { user: null }`. Erro
vermelho que é normal treina quem depura a ignorar erro vermelho.

Registrado como task [`58`](../tasks/58-api-me-401-em-toda-pagina.md). Não é
falha de segurança: `/api/me` é rota pública por design.

## Hidratação: nenhum erro

Verificado no build de produção (`next start`), não no dev, em quatro telas —
home anônima, `/app/complaints`, `/app/complaints/new` e o painel da empresa.
Busca explícita por `hydrat`, `Hydration`, `did not match`, `mismatch` e
`Warning` no console:

```
No console logs.
```

O único erro presente é o `/api/me` acima.

## Os três logins na aplicação de produção

| Conta | `POST /api/auth/login` | Destino | `/api/me` |
|---|---|---|---|
| `maria@exemplo.com` | 200 | `/app/complaints` 200 | sessão ok |
| `empresa@construtorax.com` | 200 | `/app/company/dashboard` 200 | sessão ok |
| `admin@comunicamulher.com.br` | 200 | `/app/admin` 200 | sessão ok |

O login da Maria foi feito **pela interface**, preenchendo o formulário no
navegador sobre o build de produção, e não pela API — é o caminho que exercita
hidratação, o `router.push` e o cookie de sessão juntos.

## Verificação

| Comando | Resultado |
|---|---|
| `rm -rf .next && npm run build` | ✅ exit 0, 31 s, 0 warnings |
| `npm run start` (porta 5001) | ✅ pronto em 1,1 s |
| `npm run test:e2e` | ✅ **359 passando, 3 pulados** (362), 15,1 min |
| `npm run test:a11y` | ✅ **78/78** |
| `npx vitest run` | ✅ 18/18 |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src --max-warnings 0` | ✅ exit 0 |

## Critérios de aceite

- [x] `npm run build` termina com sucesso, sem `ignoreBuildErrors` nem
      `ignoreDuringBuilds` — conferido lendo o `next.config.ts` inteiro.
- [x] A app sobe com `npm run start` e os 3 logins funcionam nela — um deles
      pela interface, no navegador.
- [x] Nenhum erro de hidratação no console em produção, em 4 telas.
- [x] `next.config.ts` está commitado e limpo.

## Uma observação para a task `19`

`images: { unoptimized: true }` continua no `next.config.ts`. Desliga o
otimizador de imagem do Next inteiro — toda imagem vai no tamanho original, sem
`webp`, sem `srcset`. Numa plataforma cujo público acessa por celular, isso pesa
mais do que os 78,8 kB do `/login`.

Não toquei porque é o escopo da `19`, que já tem o item. Fica aqui a medida:
ela é a decisão de performance mais cara do repositório, e está numa linha só.
