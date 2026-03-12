# reclame-mulher (ComunicaMulher)

## Overview
A Next.js 15 platform connecting women with infrastructure project companies. Users can file complaints, companies can respond, and admins moderate the platform.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack, Server Actions)
- **Language**: TypeScript
- **Database**: Replit PostgreSQL via Drizzle ORM
- **Auth**: Custom JWT-based (jose + scrypt), HTTP-only cookies (`__session`, 30-day expiry)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package manager**: pnpm

## Architecture

### Authentication
- No Supabase — fully custom auth replacing it
- `src/lib/auth/password.ts` — scrypt hashing/verification
- `src/lib/auth/session.ts` — JWT sign/verify, `getSession()` helper
- Session cookie: `__session`, HTTP-only, 30-day expiry
- API routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/register-company`, `/api/auth/logout`

### Database
- `src/db/schema.ts` — full Drizzle schema (users, profiles, companies, complaints, etc.)
- `src/db/client.ts` — Drizzle client (no SSL, prepare=false, max=10)
- `DATABASE_URL` and `SESSION_SECRET` are the only required env vars

### Key Files
- `src/db/schema.ts` — database schema
- `src/lib/auth/session.ts` — session management
- `src/lib/auth/password.ts` — password hashing
- `middleware.ts` — route protection
- `src/server/repos/` — all data access (Drizzle ORM)
- `src/server/dto/` — Zod validation DTOs

### User Flows
1. **Person registration**: `/onboarding/person/step1` → POST `/api/auth/register` → `/onboarding/person/step2` (completes profile) → `/app`
2. **Company registration**: `/onboarding/company/step1` → POST `/api/auth/register-company` → `/onboarding/company/step2` (completes company) → `/app/company/verification`
3. **Login**: POST `/api/auth/login` → sets `__session` cookie → `/app`
4. **Logout**: POST `/api/auth/logout` → clears cookie → `/`

## Running
```
pnpm dev        # starts dev server on port 5000
pnpm db:push    # sync schema to DB (use --force to skip confirmation)
```

## Environment Variables
- `DATABASE_URL` — Replit PostgreSQL connection string (provided by Replit)
- `SESSION_SECRET` — secret for JWT signing (set in Replit secrets)
