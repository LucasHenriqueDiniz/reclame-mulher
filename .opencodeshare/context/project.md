# Reclame Mulher — Contexto do Projeto

## O que é
Plataforma que conecta mulheres impactadas por obras de infraestrutura com empresas e órgãos responsáveis. Permite registrar reclamações, acompanhar respostas e acessar recursos educativos.

## Stack
- **Framework:** Next.js 15.5.9 (App Router)
- **UI:** React 19, Tailwind CSS 3.4, shadcn/ui
- **Banco:** Neon Postgres (serverless) via Drizzle ORM 0.44
- **Auth:** JWT sessions (custom), bcrypt passwords
- **Upload:** UploadThing (blog images + complaint attachments)
- **Query:** TanStack Query (client), Drizzle (server)
- **State:** Zustand
- **i18n:** next-intl 4.3
- **Deploy:** Vercel

## Estrutura de pastas importante
```
src/
  app/                    # Rotas Next.js (App Router)
    (auth)/               # Grupo: login, register
    api/                  # API routes
    app/                  # Área logada (user + company + admin)
    blog/                 # Blog público
    company/[slug]/       # Perfil público de empresa
    companies/            # Listagem de empresas
    search/               # Busca
    ajuda/                # Página de ajuda com logins de teste
  components/
    app/                  # Componentes compartilhados da área logada
      AppPageShell.tsx
      CompanyPageShell.tsx
      ProfileHero.tsx
      PageTabs.tsx
      ContentCard.tsx
    company/              # Componentes específicos de empresa
    landing/              # Componentes da landing page
    layout/               # Header, Footer
  lib/
    auth/                 # Session, password hashing
    constants/            # Status configs, etc.
  server/repos/           # Repositories (pattern: BlogRepo, ComplaintsRepo)
  db/
    schema.ts             # Drizzle schema
    client.ts             # DB client
```

## Decisiones arquiteturais
- **Server Components por padrão** — só "use client" quando necessário
- **Repositories** para acesso a dados (não chama db direto do componente)
- **Rate limiting** em memória (Map) para auth endpoints
- **UploadThing** para uploads (Vercel não permite disco local)
- **Password hashing** com crypto.scrypt (async)

## URLs importantes
- `/` — Landing page
- `/login` — Login
- `/onboarding/role` — Escolher perfil (pessoa/empresa)
- `/app/complaints` — Minhas reclamações (user)
- `/app/company/dashboard` — Dashboard empresa
- `/company/[slug]` — Perfil público empresa
- `/blog` — Blog
- `/ajuda` — Logins de teste e links

## Logins de teste (senha: <seed password: see `defaultPassword` in scripts/seed.ts>)
- `maria@exemplo.com` — Pessoa
- `empresa@construtorax.com` — Empresa
- `admin@comunicamulher.com.br` — Admin

## Variáveis de ambiente
- `DATABASE_URL` — Neon pooled
- `DIRECT_URL` — Neon direct (migrations)
- `SESSION_SECRET` — JWT signing
- `NEXT_PUBLIC_APP_URL`
- `UPLOADTHING_TOKEN`
