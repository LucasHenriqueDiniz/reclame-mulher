# Current state of the project

## Summary

This project does not run on Supabase. The architecture as it actually stands:

- Next.js App Router
- TypeScript
- Tailwind CSS with shadcn/ui components
- Drizzle ORM
- Postgres on Neon
- own authentication: HTTP-only cookie plus a signed JWT
- React Hook Form and Zod
- next-intl behind a custom provider

That is not necessarily worse than the original plan. Trading Supabase for Drizzle and hand-rolled
auth buys more control over the schema, the session and the domain rules. The problem was never the
trade itself — it was the old Supabase legacy sitting in the repository alongside it.

## Structure

The workspace is reasonably organised:

- `src/app` — App Router routes, layouts, pages and API handlers
- `src/components` — shared UI: layout, landing, blog, company
- `src/server/use-cases` — domain rules callable without a request object
- `src/server/repos` — data access
- `src/server/dto` — input validation and contracts
- `src/db` — Drizzle schema, client and migrations
- `src/lib` — auth, env, utilities, constants
- `src/messages` and `src/i18n` — internationalisation

The overall shape is coherent. The structural problem was two technical histories mixed together:
the real architecture in `src/db` and `src/lib/auth`, and the Supabase legacy that lived in
`supabase/`.

## Setup and technical base

What is in good shape:

- `tsconfig.json` has `strict: true`
- the `@/*` alias is configured
- the global provider is mounted in `src/app/layout.tsx` and `src/app/providers.tsx`
- `next-intl` works through `LocaleProvider`
- the production build passes

What is inconsistent:

- part of the UI uses Tailwind and shadcn the standard way, while the company screens lean heavily
  on inline styles

## Database and persistence

The schema covers the core domain well: `users`, `profiles`, `companies`, `company_users`,
`projects`, `complaints`, `complaint_messages`, `complaint_attachments`, `blog_posts`, `blog_tags`,
`blog_post_tags` and `reports`.

The migrations that count are the ones in `src/db/migrations`.

The repository used to carry an older set under `supabase/migrations` built on RLS, RPC and
`auth.uid()`, which no longer described the runtime. It was removed so the database has a single
source of truth.

## Auth and onboarding

The basics are implemented: person registration, company registration, login, logout, password
change, and a temporary password for company members. The session is a `__session` cookie holding
a signed JWT, in `src/lib/auth/session.ts`.

Onboarding is still the weakest part of the project:

- the schema has an `onboardingCompletedAt` column
- the onboarding server actions do not persist it consistently
- the redirect depends on heuristics inside `ProfilesRepo`

So auth exists and works; onboarding still needs to become an explicit state machine rather than a
set of inferences.

## The main domains

### Companies

Working: the public listing, the public profile by slug, the company dashboard, profile editing,
project management, member management, and reporting a company.

Actually open:

- harden the per-role permissions on the sensitive routes
- finish the administrative verification flow

### Complaints

Working: creation, the reporter's own listing, the detail page, messages, status, and the public
listing per company.

Actually open:

- production-ready storage for attachments
- review authorisation for reading and downloading an attachment

### Blog

Working: admin CRUD, tags, the Markdown editor, image upload through UploadThing, and the public
listing and detail pages.

Actually open:

- apply one publishing rule to both the list and the detail page
- drop the featured-post mock endpoint and read real data

### Admin

Working: a layout gated on the `ADMIN` role, a starting panel, and the blog admin CRUD.

Not really there:

- real auditing
- real company moderation and verification

## Frontend

Screens with a real flow: login and registration, person and company onboarding, the user's own
area, complaints, the public company profile, the company dashboard, the blog, and settings.

Still partial or placeholders: `app/admin/companies` and `app/admin/audit`.

The project is visually advanced, with uneven maturity between areas.

## Security

What is good: the session is an HTTP-only cookie, admin is checked server-side, and the main API
handlers check for a session.

What needs work:

- the company-area routes still accept any member for operations that ought to require `OWNER` or
  `ADMIN`
- complaint attachment upload writes to local disk, which is fine in development and not in a real
  deployment

## Technical quality

What is good: the repo layer exists, the Zod DTOs exist, the build passes, and since 2026-09-03
there is a test runner — Vitest in CI, plus Playwright end-to-end and a check that keeps the
manuals in sync.

Debt worth naming:

- onboarding is still poorly defined as state
- part of the company UI follows a different technical pattern from the rest
- unit coverage is two files; see the gap list in `docs/architecture/ARCHITECTURE.md`

## Conclusion

This is closer to a navigable MVP than to an empty prototype. The base is there, and three things
still need closing:

1. consolidate onboarding
2. harden authorisation in the company area
3. build real admin for verification and auditing
