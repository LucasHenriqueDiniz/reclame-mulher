# Relatório — [20] Ambiente, variáveis e prontidão para deploy

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## A hipótese da task estava certa, e o motivo era pior do que parecia

A evidência dizia: *"o `.env.example` sendo **maior** que o `.env` sugere
divergência"*. Sugeria mesmo. As chaves de cada um:

| `.env` (local, ignorado pelo git) | `.env.example` |
|---|---|
| — | **`DATABASE_URL`** |
| `DIRECT_URL` | `DIRECT_URL` |
| `SESSION_SECRET` | `SESSION_SECRET` |
| `UPLOADTHING_TOKEN` | `UPLOADTHING_TOKEN` |
| — | `NEXT_PUBLIC_APP_URL` |

**Falta a `DATABASE_URL`.** O código a lê em 11 lugares, e em todos com a mesma
forma:

```ts
process.env.DATABASE_URL ?? process.env.DIRECT_URL
```

Então tudo funciona — pela conexão **direta** do Neon, sem passar pelo pooler.
Em desenvolvimento não faz diferença. Em produção faz: cada função serverless
abre a própria conexão, e sem o pooler um pico de acessos esgota o limite do
banco. O sintoma aparece **sob carga**, que é exatamente quando ninguém tem
tempo de investigar.

Não editei o `.env` — é regra do `LOOP.md`, e é a regra certa. Em vez disso, a
aplicação agora **avisa no log** toda vez que sobe assim:

```
[env] DATABASE_URL não está definida; usando DIRECT_URL. Funciona, mas a
conexão direta não passa pelo pooler do Neon — em produção isso esgota
conexões sob carga. Ver README.
```

## O validador que existia e nunca rodava

`src/lib/env.server.ts` já estava lá, com dois `if` checando `SESSION_SECRET` e
a URL do banco. **Nenhum arquivo o importava.** `db/client.ts` e
`auth/session.ts` liam `process.env` direto.

E o `db/client.ts` tinha um atalho que transformava configuração faltando em
falha silenciosa:

```ts
const raw = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const connectionString =
  raw && !raw.includes("build") ? raw : "postgresql://build:build@localhost/build";
```

Sem variável, ele conectava numa string falsa. **A aplicação subia normalmente**
e só falhava a cada requisição, com erro de conexão. Um deploy mal configurado
parecia saudável.

Agora `env.server.ts` valida com Zod, é importado por quem de fato usa os
valores, e falha com o nome da variável e o que fazer. Medido, com
`SESSION_SECRET` curta de propósito:

```
Error: Configuração de ambiente inválida.
  - SESSION_SECRET: precisa ter pelo menos 32 caracteres (use: openssl rand -base64 32)

Copie `.env.example` para `.env` e preencha os valores.
O README tem o passo a passo, incluindo onde obter cada um.
```

**Uma ressalva honesta:** o Next avalia módulos sob demanda, então a falha
aparece na primeira requisição, não no instante do `next start`. A resposta HTTP
é 500 — mas o log diz exatamente o que está errado, que é o que o critério pede.
Não consegui fazer o processo morrer na subida sem gambiarra, e preferi
registrar o limite a fingir que não existe.

O `next build` continua funcionando sem banco: `NEXT_PHASE` identifica a fase e
a validação afrouxa ali, porque coleta de páginas não consulta o banco.

## Os dois lockfiles

| Arquivo | Última alteração | Tem `@axe-core/playwright`? |
|---|---|---|
| `pnpm-lock.yaml` | **2026-08-27** | sim (3 referências) |
| `package-lock.json` | 2026-04-28 | **não** |

E `node_modules/.pnpm/` existe — a instalação real é pnpm.

Ou seja: o `package-lock.json` estava **quatro meses atrasado** e não conhecia
uma dependência que a suíte de acessibilidade usa. Quem clonasse o repositório e
seguisse o README (`npm install`) partiria da árvore errada; um `npm ci` partiria
da árvore de abril.

Resolvido de três formas ao mesmo tempo, para não voltar:

1. `package-lock.json` removido do git e do disco;
2. `"packageManager": "pnpm@10.33.0"` no `package.json` — o corepack passa a
   recusar o gerenciador errado;
3. `package-lock.json` e `yarn.lock` no `.gitignore`, com o motivo escrito ali.

Conferido depois: `pnpm install --frozen-lockfile` passa, o que prova que o
lockfile continua coerente com o `package.json` alterado.

## O `.env.example` reescrito

De 8 linhas de comentário para um arquivo que responde três perguntas por
variável: **para que serve, se é obrigatória, onde obter o valor**. Sem nenhum
valor real — conferido, só placeholders.

Duas coisas que só apareceram ao escrever:

- **`UPLOADTHING_TOKEN` não aparece em nenhum `process.env` do código.** Quem a
  lê é o SDK, internamente. Ou seja, `grep process.env` — o comando que a
  própria task sugere no passo 1 — **não a encontra**, e a validação de ambiente
  não tem como avisar se faltar. Está documentado com esse aviso explícito.
- As três variáveis de teste (`E2E_SENHA`, `E2E_UPLOAD`, `A11Y_BASELINE`)
  existiam sem estar em lugar nenhum. Entraram, comentadas, com o que fazem.

## `NEXT_PUBLIC_*`: uma só, e inofensiva

Só existe `NEXT_PUBLIC_APP_URL`. Nada sensível vai para o bundle do cliente.
O `.env.example` traz o aviso do que o prefixo significa, para a próxima pessoa
que for acrescentar uma.

## Nenhum segredo no histórico

```
git log --all -- .env   →  vazio
git ls-files | grep ^\.env  →  só .env.example
```

O `.env` nunca foi commitado. Não há credencial a rotacionar — que era o cenário
em que a task mandava parar e chamar o usuário.

## O README

Reescrito como passo a passo verificado: pré-requisitos → `pnpm install` →
`.env` → `db:push` → `db:seed` → `dev` → contas de teste. Cada comando citado
foi conferido contra o `package.json` por script, não a olho:

```
pnpm build        ok      pnpm db:studio    ok
pnpm check        ok      pnpm dev          ok
pnpm db:push      ok      pnpm start        ok
pnpm db:seed      ok      pnpm test:a11y    ok
pnpm test         ok      pnpm test:e2e     ok
```

E ganhou uma seção que não existia: **"Antes de colocar em produção"**, com os
quatro itens que dependem de decisão e não de código — região do banco,
`images.unoptimized`, ACL dos anexos, e a `DATABASE_URL` com pooler. Cada um
apontando para onde a medição foi feita.

O README também deixou de afirmar coisas que não são verdade. A anterior listava
"envio de e-mail" implicitamente entre os serviços; a nova diz, com todas as
letras, que **o projeto não envia e-mail**.

## O achado: quatro modelos de e-mail e nenhum envio

Procurando a variável do provedor de e-mail — que a evidência da task listava
como dependência externa —, não encontrei nenhuma. Nem provedor, nem variável,
nem chamada de envio.

O que existe:

| Existe | O que é |
|---|---|
| `email-templates/*.html` | 4 modelos: boas-vindas, verificação, recuperação de senha, nova mensagem |
| `scripts/sync-email-templates.ts` | **lista e valida** os arquivos. O cabeçalho do próprio script diz que não envia |
| `/auth/verify` | `useEffect` que faz `router.push(next)`. Redirecionamento vazio — não verifica nada |
| `/auth/verify/check-email` | tela pedindo para conferir um e-mail que não é enviado |

Isso liga o achado `59` (o link "Esqueceu a senha?" que não leva a lugar nenhum)
a uma causa maior: a metade do fluxo que depende de e-mail foi desenhada, os
modelos foram escritos, e o envio nunca chegou.

Registrado como task [`61`](../tasks/61-email-nao-existe.md), com a observação de
que **assumir e documentar** é a parte que não pode ser pulada, seja qual for a
decisão sobre implementar.

## Verificação

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ lockfile coerente |
| `npm run test:e2e` | ✅ **359 passando, 3 pulados** (362), 14,9 min |
| `npx vitest run` | ✅ 18/18 |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src --max-warnings 0` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 9.7s` |
| `SESSION_SECRET=curta npx next start` | ✅ falha com mensagem nomeando a variável |
| `npx next start` com o `.env` atual | ✅ sobe, e avisa sobre a `DATABASE_URL` |

## Critérios de aceite

- [x] Toda `process.env.*` usada no código consta do `.env.example` — incluindo
      as três de teste, que faltavam, e a `UPLOADTHING_TOKEN`, que o `grep` não
      acha porque quem a lê é o SDK.
- [x] `.env.example` não tem nenhum segredo real.
- [x] O README descreve o setup do zero, e cada comando foi conferido contra o
      `package.json`.
- [x] Falta de variável obrigatória produz erro claro, com o nome da variável e
      o que fazer — com a ressalva, registrada acima, de que ele aparece na
      primeira requisição e não no instante da subida.

## O que precisa de você

1. **Acrescentar `DATABASE_URL` ao `.env`**, com a *pooled connection* do Neon.
   Não mexi no arquivo de propósito. Enquanto não for feito, o log avisa a cada
   subida.
2. **Decidir onde hospedar**, porque três coisas dependem disso: a região do
   banco (139 ms por consulta a partir daqui), se `images.unoptimized` pode ser
   desligado, e se `sharp` precisa ser instalado.
3. **Decidir sobre e-mail** (task `61`) — implementar ou assumir que não há.
