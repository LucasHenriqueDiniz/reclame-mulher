---
status: todo
tags:
  - area/ci
  - area/testing
kanban: 88103fd4-29ad-40e4-8aa6-a57256e48b2d
---

# Slice 02 — Vitest, and the first test that can fail

## Delivers

`pnpm test` runs a real test runner against real assertions, locally. One test exists and it kills a
mutant: change the code it covers and it goes red.

The unit under test is `src/server/dto/complaints.ts` — the `CreateComplaintDto` Zod schema. It is
chosen because it is pure: no database, no session, no Next.js request. A first test that needs a
Postgres container is a first test that never gets written.

## Needs

- Slice 01 done, so `test` is a free name in `package.json`.
- Vitest as a devDependency. It reads `tsconfig.json` paths through `vite-tsconfig-paths`, which
  matters here because everything imports through `@/`.
- 15 minutes reading `src/server/dto/complaints.ts` to pick assertions that are about behaviour, not
  about the shape of Zod.

## Tests

The list is the definition of done. All against `CreateComplaintDto`:

- a payload with `company_id`, `title` and `description` parses, and the parsed object carries those
  three fields
- a payload missing `company_id` throws, and the thrown issue names `company_id`
- a payload whose `title` is an empty string throws
- an unknown extra key does not appear on the parsed result
- **the mutation check**: relax one required field in the schema to `.optional()` and the missing-field
  test must fail. If it still passes, the test asserts nothing and does not count.

## Done when

```bash
pnpm test -- --run 2>&1 | tail -5
```

prints a summary line reading `Tests  5 passed (5)` and the process exits 0 — and after temporarily
making `company_id` optional in `src/server/dto/complaints.ts`, the same command prints
`Tests  1 failed | 4 passed (5)` and exits non-zero. Revert the mutation before committing.

## If stuck

If Vitest fights the Next.js/TypeScript setup — the usual failure is `@/` not resolving, or
`SyntaxError` on an ESM-only dependency — stop configuring and use `node --test` with `tsx` instead:
`node --import tsx --test src/server/dto/complaints.test.ts`. It ships with Node, needs no config, and
the goal of this slice is one test that fails for the right reason, not a runner choice that lasts
forever. Record whichever was picked in `docs/architecture/ARCHITECTURE.md` under Decisions.
