---
tags:
  - architecture
  - status/active
---

# Architecture — reclame-mulher

> **This file records what already holds in the code, so nobody re-decides it per feature.**
>
> It is not a rules file and it is not aspirational. The house style lives in the `hexagram`
> plugin and in <https://imgabriel.dev/architecture/>. What goes here is this project: the shape
> that is actually built, when each piece was decided, where it diverges from the house style and
> why, and what is still wrong.

## How to keep this file

Four habits, and they are the whole point of the format:

- **Record, do not prescribe.** Present tense, about the code as it stands. "Driven adapters group by
  resource" beats "driven adapters should group by resource."
- **Date every decision.** `Decided YYYY-MM-DD.` A reader needs to know whether a line predates the
  thing they are looking at.
- **Declare divergence from the house style, with the reason.** A divergence stated is a decision. A
  divergence unstated is a bug somebody will helpfully fix.
- **End with your own gaps.** A file that lists its own violations gets trusted. One that does not gets
  read once.

---

## The shape

*What the tree looks like and what each directory is for. Only what exists.*

This is a single Next.js App Router application deployed on Vercel. It is **not** laid out as a
hexagon, and the layers below are the ones that actually exist, not the four the house style names.

```
src/
  app/              App Router. Pages and route handlers in one tree.
    api/**/route.ts 32 route handlers — the HTTP entry points
    (auth)/ app/ blog/ company/ companies/ onboarding/ search/ …
                    pages; `_components/` under a route holds components local to it
  components/       shared React components (ui/ is the shadcn primitives)
  server/
    dto/            Zod schemas for request payloads, plus the inferred input types
    repos/          data access: one module per aggregate, Drizzle queries inside
    auth/           authorization guards for admin and company scopes
  lib/              cross-cutting helpers: env parsing, session, password, rate limit,
                    masks, normalisation, uploadthing client, client-side stores
  db/
    schema.ts       Drizzle schema — the single source of truth for the data model
    client.ts       the Drizzle/Postgres connection
    migrations/     generated SQL, never hand-edited
  hooks/            React hooks
  i18n/ messages/   next-intl. `messages/pt-BR/` is the product language; `messages/en/` exists
middleware.ts       Next.js middleware (session/route gating)
scripts/            operational scripts: seed, reset, migration apply, template sync
email-templates/    HTML email bodies
```

**Where the logic lives.** Business logic sits inside the route handlers. A handler reads the session,
validates the body against a DTO, calls one or more repos, and serialises the response itself. There is
no use-case layer between the handler and the repo, and no domain layer under either.

**Where the boundary is.** `src/server/repos/*` is the closest thing to a driven adapter: each module is
a class of static methods that owns the Drizzle queries for one aggregate, and it is the only place
`@/db/schema` is meant to be touched from. `import "server-only"` at the top of each repo is what keeps
it off the client.

## Ports

*One line per port: the conversation it names, its adapters, and why it exists.*

**There are no ports.** Nothing in this codebase is defined as an interface with more than one
implementation. Every dependency is reached by importing the concrete module:

| dependency | reached as | port? |
|---|---|---|
| Postgres | `db` from `@/db/client`, via `src/server/repos/*` | no — concrete Drizzle |
| clock | `new Date()` inline | no |
| ids | database defaults / `crypto` at the edge | no |
| file storage | `uploadthing` imported directly in `src/app/api/uploadthing/core.ts` | no |
| email | HTML in `email-templates/`, sent from the route that needs it | no |
| session | `getSession()` from `@/lib/auth/session` | no |

This is the honest answer, and the table exists so that the first port added has somewhere to be
recorded.

## Decisions

*Context, decision, and what it rules out. Newest first. A superseded entry stays, marked.*

### D3 — the house style is adopted for tooling, not for layout

**Context.** The `hexagram` plugin was adopted for this repo: commit-msg hook, statusline, docs vault,
English-only rule. The architecture skill describes a four-layer hexagon that this app does not have.

**Decision.** Adopt the mechanical parts of the house style and record the architectural divergence here
instead of opening a refactor. Decided 2026-09-02.

**Rules out.** Treating the absence of `domain/`, `ports/`, `application/` and `adapters/` as a bug to be
fixed opportunistically. A move to the hexagon would be its own pitch, with its own plan.

### D2 — `master` stays the default branch

**Context.** The house style prefers `main`. This repo is served by Vercel, and the Vercel project is
pointed at `master`.

**Decision.** Keep `master`. Decided before this file existed; recorded 2026-09-02.

**Rules out.** A rename that would require repointing the deployment for no functional gain.

### D1 — pnpm is the only package manager

**Context.** `package-lock.json` was removed (commit `4af8238`) because `npm install` rebuilt a
dependency tree four months stale against a `pnpm-lock.yaml` that was current.

**Decision.** `packageManager: pnpm@11.24.0` in `package.json` is authoritative; CI installs with
`pnpm install --frozen-lockfile`; local tooling calls `pnpm`. Decided at `4af8238`; recorded 2026-09-02.

**Rules out.** Any second lockfile in the repo, and any tool config that calls `npm run`.

## Divergences from the house style

*Where this project does something the house style says not to, and the argument.*

| what | house style says | here | why |
|---|---|---|---|
| layering | four layers — `domain/`, `ports/`, `application/`, `adapters/` — plus a composition root | `app/` (pages + route handlers), `server/dto`, `server/repos`, `db/`, `lib/` | Next.js App Router owns file placement: a route handler *is* `app/api/**/route.ts` and cannot be moved into an adapters tree. The layers that remain were shaped by the framework, not chosen against the hexagon |
| ports | every driven dependency gets a port from its first use | no ports; repos import Drizzle directly | see D3. Recording the absence rather than abstracting seven dependencies in one pass |
| composition root | one place constructs adapters and injects them | no root; repos are static-method classes imported where needed | a serverless function per route has no long-lived root to build in. A `createRepos(db)` factory is the cheapest step toward one if this is ever revisited |
| product language | everything that lands in the repo is English | `src/messages/pt-BR/`, `email-templates/*.html`, user-visible JSX strings and the Zod error messages in `src/server/dto/*` are Portuguese | that text is read by a Brazilian user. The `language` skill classifies it as a literal — product content, not prose. Code, comments, docs, tests, commits and branch names are English |
| default branch | `main` | `master` | see D2 |

## Known gaps

*The violations that exist right now. Being honest here is what makes the rest of the file credible.*

- [ ] **14 route files reach past the repos into Drizzle.** `@/db/client` is imported directly in
      `api/auth/{login,register,register-company,change-password}`, `api/blog/posts` and
      `api/blog/posts/[id]`, `api/search`, `api/me`, `api/user/account`, `api/company/{users,report}`,
      `api/complaints/[id]/messages`, `api/company/complaints/[id]/messages` and
      `api/uploadthing/core.ts`. Whatever `src/server/repos` is meant to be the only door to, it is not.
- [ ] **There are no tests.** The `Tests` step in `.github/workflows/ci.yml` runs
      `pnpm run test:demo`, which is `scripts/demo-tests.ts` — not a test runner. No contract test, no
      unit test, nothing that would fail if a repo regressed.
- [ ] **`pnpm run lint` has no `--max-warnings=0`,** so the CI `Lint` step passes with warnings. It is
      clean as of 2026-09-02, which is the moment to add the flag.
- [ ] **Validation messages hardcoded in `src/server/dto/*` bypass next-intl.** `src/messages/pt-BR/`
      and `src/messages/en/` exist, and these strings sit outside them. This is an i18n gap, not a
      language-rule gap: translating them to English would not fix it.
- [ ] **Six unreferenced components, 434 lines, in `src/app/app/complaints/new/_components/`** —
      `complaint-auth-banner`, `complaint-progress`, `complaint-step-{one,two,three,four}-*`. Nothing
      under `src/` imports them; they are the previous generation of the wizard, superseded by
      `wizard/`, `steps/` and `fields/`.
- [ ] **Four files in `src/` are over the 500-line soft limit** and are split candidates.
- [ ] **Two route segments are in Portuguese:** `src/app/ajuda/` (a real page) and `src/app/empresas/`
      (a redirect to `/companies`). A route segment is a public URL, so changing either is a redirect
      question, not a rename.
- [ ] **Five orphaned gitlinks under `.claude/worktrees/agent-*` with no `.gitmodules`.** Four of the
      five commits are not in the local object database, so nothing can resolve them. The fix is
      `git rm --cached` on the five paths, plus ignoring the directory.
- [ ] **Two competing agent-context systems:** `AGENTS.md` (162 lines) and `.opencodeshare/`
      (9 files). Both duplicate the house playbook inside the repo and both are stale. There is no
      `CLAUDE.md`.
- [ ] **Test credentials are committed in clear text** in `AGENTS.md` and `.opencodeshare/README.md`,
      and this repository is public on GitHub.
- [ ] **28 documentation files are entirely in Portuguese** (~7,500 lines): 22 at the repo root, 6 in
      `docs/`. `INDICE_DOCUMENTACAO.md` indexes nine of them *by filename*, so a rename breaks the index
      silently. These need a file-by-file delete-or-translate decision, not a bulk pass.
- [ ] **`scripts/post-merge.sh` runs `pnpm db:push --force`.** It is inert today because nothing wires
      it. Moving it into `.githooks/` would make every merge drop and recreate the schema against the
      local `DATABASE_URL`. Do not move it there.
