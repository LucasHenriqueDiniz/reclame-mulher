# Changelog

Notable changes, newest first. Format follows [Keep a Changelog](https://keepachangelog.com/), and
this project uses [semantic versioning](https://semver.org/).

## [Unreleased]

### Added

- End-user manuals served at `/manuais`, six documents rendered as pages plus the HTML build as a
  file, linked from `/ajuda`. `pnpm run manuais:check` fails the build if the served copies under
  `public/` drift from the sources at the repo root.
- A test runner. Vitest, wired into CI as `pnpm test --run`, covering `src/server/dto/complaints.ts`
  and `src/server/use-cases/create-complaint.ts` — 10 tests, each verified by relaxing the code it
  covers and confirming the test turns red.
- A Playwright end-to-end suite, 20 tests across six files, signing in once through the app's own
  login endpoint and reusing the storage state. It covers post-login routing for all three roles,
  the reporter's own list and detail pages, a company replying and moving a status, the four-step
  filing wizard, a password change, and the manuals being readable while signed out.
- `src/server/use-cases/create-complaint.ts`. The three rules `POST /api/complaints` used to decide
  inline are now callable without a request object; the handler is session, parse, call, map. Every
  import in it is `import type`, so the use case has no runtime dependency on the repository layer.
- `docs/product/legacy-docs-inventory.md`: one row per Portuguese document, with a line count and a
  disposition.

### Changed

- `pnpm run lint` is `eslint --max-warnings=0`. A warning now fails CI instead of scrolling past.
- The CI job runs four things that can each turn it red: lint, unit tests, the manuals sync check,
  and the end-to-end suite. It is named for what it runs.
- `/manuais` is public. The middleware had been sending readers to `/login`, which gated the
  documents that explain how to sign in.
- The seed password is no longer repeated across eleven documents. It lives in `scripts/seed.ts`,
  and the documents point at it. This repository is public.

### Removed

- The CI step named `Tests`, which ran `scripts/demo-tests.ts`: 87 lines, no assertion, exit 0
  always. The script still exists as `pnpm run demo:checklist` and nothing calls it.
- 14 point-in-time sprint reports, 3,954 lines, whose claims the code had outgrown. Three open
  items recorded only in them were moved into `docs/qa-gaps.md` first.

## [0.1.0] — 2026-07-07

First MVP. What shipped, as corroborated by `docs/project-status.md`:

### Added

- **Auth and session.** Person and company registration, login, logout, password change, and a
  temporary password for company members. The session is a `__session` cookie carrying a signed
  JWT; passwords are hashed with bcrypt. Role-based route guards for `USER`, `COMPANY` and `ADMIN`.
- **Complaints.** Filing, the reporter's own listing, the detail page, the message thread between
  reporter and company, the status lifecycle, attachments through UploadThing with type and size
  limits, and a public listing per company.
- **Companies and projects.** Public listing, public profile by slug, company dashboard, profile
  editing, project management with a status of its own, member management, and reporting a company.
- **Blog.** Admin CRUD, tags, a Markdown editor, image upload through UploadThing, public listing
  and detail pages, and SEO metadata.
- **Admin.** A layout gated on the `ADMIN` role, a starting panel, and the blog CRUD.
- **Stack.** Next.js App Router, TypeScript with `strict: true`, Tailwind with shadcn/ui, Drizzle
  ORM against Postgres on Neon, React Hook Form with Zod, next-intl behind a custom provider.

### Notes on this entry

This entry was rewritten on 2026-09-03. The original was a 508-line sprint report rather than a
changelog, and several of its claims are contradicted by the documents that recorded the same work:

- It reported an implemented end-to-end suite and three passing flows. `package.json` had no
  `"test"` script until 2026-09-03, and the first `e2e/*.spec.ts` file landed the same day. What
  existed was a manual walkthrough written up as a test run.
- It reported "Axe DevTools Audit ✅", "Screen Reader (NVDA) ✅" and viewport validation at 375px,
  768px and 1920px. The audit reports themselves list all three as never done — see
  `docs/qa-gaps.md`.
- It reported working audit logs, company verification and contact preferences. `docs/mvp-backlog.md`
  still lists all three as open, and `docs/project-status.md` calls the admin screens placeholders.
- It reported "RLS policies (quando aplicável)". RLS belonged to the Supabase setup, which was
  removed.

Also dropped: development statistics, a contributors list, a licence section and a "how to use this
changelog" section. None of them are changelog entries; the licence is `LICENSE`.
