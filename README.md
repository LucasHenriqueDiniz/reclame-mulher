# Reclame Mulher

A platform that connects women affected by infrastructure works with the companies responsible for
them: sign-up, complaints, replies, a public company profile, a blog and an admin area.

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- Postgres/Neon
- own authentication, on an HTTP-only cookie
- React Hook Form + Zod
- next-intl

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

In development the project serves on port `5000`.

## Database

The current source of truth for the database is:

- `src/db/schema.ts`
- `src/db/migrations`
- `drizzle.config.ts`

The old Supabase-based layer was removed to keep the architecture unambiguous.

## Internal documentation

- `docs/project-status.md`: current technical state of the project
- `docs/mvp-backlog.md`: technical backlog, prioritised from that state
- `docs/acessibilidade-inclusiva.md`: guidelines for low literacy and low digital familiarity

## Test logins

Password for all of them: `senha123`

- `maria@exemplo.com` (person)
- `empresa@construtorax.com` (company)
- `ana@exemplo.com` (person)
- `admin@comunicamulher.com.br` (admin)
