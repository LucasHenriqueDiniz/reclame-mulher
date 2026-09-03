# End-to-end suite

Browser tests for the signed-in flows that `MANUAL_PLATAFORMA.md` describes.
Before this suite the repository's only tests were `test:demo` and
`evidencias:check` — both `tsx` scripts over logic, with no browser — so no
authenticated flow was exercised anywhere, and the manuals had nothing behind
them.

```bash
pnpm test:e2e            # everything: database, seed, sign-in, specs
pnpm test:e2e:ui         # the same, in Playwright's UI mode
pnpm test:e2e:db:down    # throw the database away
```

## How signing in works

`global-setup.ts` runs once per run and does three things:

1. brings up the throwaway Postgres from `docker-compose.e2e.yml`, applies the
   migrations and runs `scripts/seed.ts` against it;
2. POSTs to `/api/auth/login` once per role — the app's own endpoint, the same
   one the login form posts to;
3. saves each resulting cookie jar to `e2e/.auth/<role>.json`.

Specs then declare `test.use({ storageState: STORAGE_STATE.person })` and open
already signed in. Nothing drives the login form, so no spec pays for it and
none of them trip the login route's rate limit (five attempts per IP per
fifteen minutes — `src/lib/rate-limit.ts`).

**The password is never written down in this tree.** `seed-credentials.ts`
reads `defaultPassword` out of `scripts/seed.ts`, which is the one place it
lives. A copy here would be a second source of truth that goes stale in
silence. Importing the seed module is not an option either — it calls `main()`
at the top level, so importing it would wipe the database — hence reading the
file's text and failing loudly if the constant moves.

## Why there is a database container

`scripts/seed.ts` deletes every row before it inserts, so it may only ever
point at a database nobody cares about. `docker-compose.e2e.yml` provides one:
Postgres on 127.0.0.1:55432, data on a tmpfs, `trust` auth so there is no
password to invent or to keep out of the repository.

The app talks to Neon over HTTP everywhere it is deployed, and that driver
cannot reach a plain Postgres on TCP at all. `src/db/driver.ts` picks the
wire-protocol driver instead when `E2E_LOCAL_DB=1`, which only
`playwright.config.ts` sets — with the variable unset, every deployed
environment builds exactly the client it built before.

## Why the specs are numbered

One worker, one shared database, and two of these flows write to it: the
company reply changes a report's status, and filing a report adds a row. The
numbers make that order explicit instead of leaving it to how the files happen
to sort:

| file | writes | depends on |
|---|---|---|
| `01-auth-routing` | — | seeded state |
| `02-person-dashboard` | — | seeded state |
| `03-company-reply` | reply + status change | exactly one open report |
| `04-person-create-complaint` | a new report | nothing above it |
| `05-person-change-password` | the hash, then puts it back | nothing above it |

Read-only specs come first; each writing spec runs after everything that
depends on the state it changes.
