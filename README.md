# ComunicaMulher

Plataforma que conecta mulheres impactadas por obras de infraestrutura às
empresas responsáveis: registro de relatos, resposta da empresa, perfil público
das empresas, blog e administração.

> O repositório se chama `reclame-mulher` e a marca na interface é
> **ComunicaMulher**. Os dois nomes convivem no projeto; a interface é a que a
> usuária vê.

## Subir o projeto do zero

Passo a passo verificado — seguido literalmente na task `20`.

### 1. Pré-requisitos

| O quê | Versão | Por quê |
|---|---|---|
| **Node.js** | 22 ou mais | Testado em 22.14 |
| **pnpm** | 10.33 | É o gerenciador do projeto, fixado em `packageManager`. `corepack enable` já resolve |
| **Conta no [Neon](https://neon.tech)** | — | Postgres. O plano gratuito basta |
| **Conta no [UploadThing](https://uploadthing.com)** | — | Guarda anexos de relato e imagens do blog. Só necessária para exercitar upload |

Não há dependência de serviço de e-mail: **o projeto não envia e-mail hoje.**
Existem modelos em `email-templates/`, mas nenhum código os envia.

### 2. Instalar

```bash
pnpm install
```

Use **pnpm**, não npm. O `package.json` fixa isso em `packageManager`, e um
`package-lock.json` paralelo é ignorado pelo git de propósito — dois lockfiles
divergentes foi um problema real deste repositório.

### 3. Configurar o ambiente

```bash
cp .env.example .env
```

Abra o `.env` e preencha. Cada variável tem, no próprio arquivo, o que ela faz e
onde obter o valor. As obrigatórias:

| Variável | Onde obter |
|---|---|
| `DATABASE_URL` | Neon Console → Connect → **Pooled connection** |
| `DIRECT_URL` | Neon Console → Connect → **Direct connection** |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `UPLOADTHING_TOKEN` | uploadthing.com → sua app → API Keys |

Se faltar uma obrigatória, a aplicação **falha na subida** dizendo qual e o que
fazer — não com um 500 opaco depois. A validação está em
`src/lib/env.server.ts`.

### 4. Criar as tabelas

```bash
pnpm db:push
```

Usa a `DIRECT_URL`: migração através de pooler não funciona bem.

### 5. Popular com dados de demonstração

```bash
pnpm db:seed
```

Cria empresas, projetos, relatos, artigos e as contas de teste listadas no fim
deste arquivo. **Os testes automatizados dependem deste comando.**

### 6. Rodar

```bash
pnpm dev
```

Sobe em `http://localhost:5000`.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Desenvolvimento, porta 5000 |
| `pnpm build` | Build de produção |
| `pnpm start` | Sobe o build de produção, porta 5000 |
| `pnpm check` | Typecheck + lint + testes de unidade |
| `pnpm test` | Testes de unidade (Vitest) |
| `pnpm test:e2e` | Suíte E2E (Playwright), ~15 min |
| `pnpm test:a11y` | Varredura de acessibilidade em 39 páginas, ~6 min |
| `pnpm db:push` | Aplica o schema no banco |
| `pnpm db:seed` | Popula dados de demonstração |
| `pnpm db:studio` | Interface do Drizzle para inspecionar o banco |

> `npx playwright test` **sem `--project`** roda tudo, E2E e acessibilidade
> juntos, e leva mais de 20 minutos. Prefira os scripts acima.

## Testes

A suíte é a documentação executável do comportamento:

| Arquivo | O que trava |
|---|---|
| `e2e/api-authorization.spec.ts` | quem pode chamar cada rota de API, por papel |
| `e2e/ownership.spec.ts` | posse: papel certo, id errado. E anonimato |
| `e2e/api-erros.spec.ts` | o contrato de erro (`docs/api-erros.md`) |
| `e2e/a11y.spec.ts` | zero violações WCAG A/AA em 39 páginas |
| `e2e/keyboard.spec.ts` | os 3 fluxos principais só com teclado |
| `e2e/responsive.spec.ts` | nenhuma página rola para o lado em 375px |

Todos precisam de `pnpm db:seed` antes.

## Banco

A fonte de verdade é:

- `src/db/schema.ts`
- `src/db/migrations`
- `drizzle.config.ts`

O legado baseado em Supabase foi removido para evitar ambiguidade
arquitetural. **Não há RLS** — toda a autorização é código de aplicação, o que
está documentado em [`docs/autorizacao.md`](docs/autorizacao.md).

## Antes de colocar em produção

Itens que dependem de decisão e não de código:

1. **Região do banco.** O TTFB medido é dominado por latência até o Neon —
   139 ms por ida e volta a partir do Brasil. Hospede a aplicação na mesma
   região do banco. Ver [`19-performance`](.claude/fixes/reports/19-performance.md).
2. **`images.unoptimized`.** Está `true` em `next.config.ts`, o que desliga o
   otimizador do Next. Ligar exige `sharp` instalado (se auto-hospedado) ou
   nada (na Vercel, que otimiza sozinha). A escolha depende de onde vai rodar.
3. **Anexos.** Os arquivos vão para o UploadThing por URL, sem ACL. Confira se
   a URL é pública antes de aceitar anexo com dado pessoal — ver a seção
   "Visibilidade de anexos" em [`docs/autorizacao.md`](docs/autorizacao.md).
4. **`DATABASE_URL` de verdade.** Rodar só com `DIRECT_URL` funciona e a
   aplicação avisa no log, mas sem o pooler um pico de acessos esgota as
   conexões do banco.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/arquitetura.md`](docs/arquitetura.md) | stack, estrutura de pastas, banco, domínios |
| [`docs/autorizacao.md`](docs/autorizacao.md) | quem pode o quê, regra de posse, anonimato |
| [`docs/api-erros.md`](docs/api-erros.md) | contrato de erro da API |
| [`docs/testes.md`](docs/testes.md) | as três suítes, o que cada uma trava, como rodar |
| [`docs/acessibilidade.md`](docs/acessibilidade.md) | conformidade WCAG: o que foi medido e o que se mantém |
| [`docs/acessibilidade-inclusiva.md`](docs/acessibilidade-inclusiva.md) | diretrizes para baixa alfabetização e baixa familiaridade digital |
| [`TODO.md`](TODO.md) | o único backlog vivo |
| [`docs/historico/`](docs/historico/README.md) | documentos datados, congelados. Não são o estado atual |
| [`.claude/fixes/`](.claude/fixes/INDEX.md) | plano de correção, relatórios e medições |

> Um assunto, um documento. Até agosto de 2026 havia 21 arquivos `.md` na raiz
> que se contradiziam — três respostas diferentes para "quanto está pronto",
> testes E2E descritos sem existir um arquivo de teste. A task `21` desfez isso;
> o que era registro datado está em `docs/historico/`, sem edição.

## Contas de teste

Criadas por `pnpm db:seed`. Senha de todas: `senha123`.

| E-mail | Papel |
|---|---|
| `maria@exemplo.com` | pessoa |
| `ana@exemplo.com` | pessoa (segunda, para testar acesso de terceiros) |
| `empresa@construtorax.com` | empresa |
| `admin@comunicamulher.com.br` | administração da plataforma |
