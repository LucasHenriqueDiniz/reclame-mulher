# AGENTS.md — Reclame Mulher

Contexto global para agentes OpenCode trabalhando neste repositório.

## Sobre o projeto

**Reclame Mulher** é uma plataforma para conectar mulheres impactadas por obras de infraestrutura com empresas responsáveis. Permite registro de reclamações, respostas, perfil público de empresas, blog e administração.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **Database:** Postgres (Neon) + Drizzle ORM
- **Auth:** Própria com cookie HTTP-only + JWT (jose)
- **Forms:** React Hook Form + Zod
- **i18n:** next-intl (pt-BR default)
- **State:** Zustand + TanStack Query
- **Upload:** UploadThing
- **Email:** Templates em `email-templates/`

## Ambiente

- **SO:** Windows 11
- **Shell:** PowerShell (preferir comandos PowerShell/cmd; evitar bash-only)
- **Node:** via gerenciador de pacotes do projeto (package-lock.json presente)
- **Porta dev:** 5000
- **Host dev:** 0.0.0.0

## Estrutura de pastas

```
src/
  app/           # Next.js App Router (rotas, layouts, page.tsx, layout.tsx)
    (auth)/      # Grupo de rotas de autenticação
    api/         # API routes + Server Actions
    app/         # Área logada do app
    auth/        # Páginas de login/registro
    blog/        # Blog público
    companies/   # Listagem de empresas
    company/     # Perfil público de empresa
    empresas/    # Área logada da empresa
    onboarding/  # Fluxo de onboarding
    ...
  components/    # React components (shadcn em components/ui/)
  db/            # Drizzle schema + migrations + client
    schema.ts    # Fonte da verdade do banco
    client.ts    # Conexão Neon/Drizzle
    migrations/  # Migrations geradas pelo drizzle-kit
  server/        # Lógica server-side (Server Actions, repos, DTOs)
    auth/        # Helpers de autenticação server-side
    dto/         # Data Transfer Objects
    repos/       # Repositories / acesso a dados server-side
  lib/           # Utilitários, validações, constants, env
    auth/        # Helpers de auth client-side
    validations/ # Schemas Zod reutilizáveis
    env.ts       # Variáveis de ambiente (client)
    env.server.ts# Variáveis de ambiente (server-only)
  hooks/         # Custom React hooks
  stores/        # Zustand stores
  i18n/          # Configuração next-intl
  messages/      # Arquivos de tradução (pt.json, en.json...)
```

## Comandos essenciais

```bash
# Desenvolvimento
npm run dev          # Next.js dev com Turbopack na porta 5000
npm run dev:clean    # Limpa .next e reinicia dev

# Build
npm run build        # Build de produção
npm run lint         # ESLint

# Banco de dados
npm run db:generate  # Gera migrations do Drizzle
npm run db:migrate   # Aplica migrations
npm run db:push      # Push do schema (dev)
npm run db:studio    # Drizzle Studio
npm run db:seed      # Seed do banco
npm run db:reset     # Reset completo do banco

# Scripts utilitários
npm run email:sync           # Sincroniza templates de email
npm run evidencias:check     # Check de evidências demo
npm run evidencias:docx      # Gera DOCX de evidências
npm run test:demo            # Testes/demo scripts
```

## Convenções de código

### TypeScript / React
- Usar `function` para componentes (não arrow functions) quando possível
- Server Actions ficam em `src/server/` ou próximas ao uso em `app/`, com `'use server'`
- Client Components devem ter `'use client'` no topo
- Preferir Server Components por padrão; só usar `'use client'` quando necessário (interatividade, hooks, browser APIs)

### Drizzle / DB
- Toda mudança de schema requer: editar `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate`
- Nunca editar migrations já aplicadas em produção
- Usar `db.transaction()` para operações multi-tabela que precisam de atomicidade

### shadcn/ui
- Novos componentes: `npx shadcn add <component>`
- Customizações vão no `tailwind.config.ts` e `src/app/globals.css`
- Componentes customizados baseados em shadcn ficam em `src/components/ui/`

### i18n
- Strings visíveis ao usuário DEVEM vir de `messages/pt.json`
- Não hardcode texto em português diretamente nos components

### Auth
- Cookie HTTP-only `auth-token` contém JWT
- Server Actions e API routes devem validar o token via helpers em `src/server/auth/`
- Middleware em `middleware.ts` protege rotas por role

### Clean Code (adaptado)
- **Limite de função:** 80 linhas (soft), 200 linhas (hard)
- **Limite de arquivo:** 500 linhas (soft), 1500 linhas (hard)
- **Erros:** usar Zod para validação; retornar objetos tipados `{ success: false, error: string }` em Server Actions
- **Nomenclatura:** `verb_noun` para ações (`create_user`), `is_`/`has_` para booleanos

## Regras de workflow

Desenvolvimento de features segue: **pitch → research → plan → implement → postmortem**

1. **Pitch:** criar doc em `docs/pitches/<feature>.md` descrevendo problema, solução, escopo
2. **Research:** se necessário, pesquisar e salvar em `docs/research/`
3. **Plan:** criar plano de implementação detalhado; aprovar antes de codar
4. **Implement:** seguir o plano; escrever testes junto com o código
5. **Postmortem:** após entregar, criar `docs/postmortem/<feature>.md`

Exceção: mudanças triviais (typos, pequenos bugfixes) podem pular o pitch.

## Contexto histórico / legado

- O projeto **não usa mais Supabase**. Foi removido para evitar ambiguidade arquitetural.
- A fonte de verdade do banco é `src/db/schema.ts` (Drizzle).
- Alguns arquivos em `src/lib/supabase/` podem ser remanescentes — verificar se ainda são usados antes de modificar.

## Documentação interna existente

- `docs/project-status.md` — estado técnico atual
- `docs/mvp-backlog.md` — backlog técnico priorizado
- `docs/acessibilidade-inclusiva.md` — diretrizes para baixa alfabetização e baixa familiaridade digital

## Logins de teste

Senha para todos: `senha123`
- `maria@exemplo.com` (pessoa)
- `empresa@construtorax.com` (empresa)
- `ana@exemplo.com` (pessoa)
- `admin@comunicamulher.com.br` (admin)

## Notas para o agente

- **Windows:** prefira comandos PowerShell. Se precisar usar bash, avise o usuário.
- **Git:** não fazer commits, pushes ou resets sem confirmação explícita do usuário.
- **DB:** nunca rodar `db:reset` ou `db:push` em produção sem confirmação.
- **Env:** variáveis sensíveis estão em `.env`. Nunca exponha secrets no chat.
- **shadcn:** se o usuário pedir um componente novo, verifique se já existe em `src/components/ui/` antes de criar do zero.

## Commit hook

`.githooks/commit-msg` strips AI attribution trailers from commit messages. Git does not version
`.git/hooks`, so what makes the hook run is one line of local config — and a fresh clone does not
have it. The root `prepare` script sets it on `pnpm install`, and only when nothing else claims it:

```
git config --get core.hooksPath >/dev/null 2>&1 || git config core.hooksPath .githooks
```

If you already point `core.hooksPath` somewhere else, the script leaves your value alone and this
repo's hook stays inert — wire it by hand, or move the file into whatever directory you do use.
