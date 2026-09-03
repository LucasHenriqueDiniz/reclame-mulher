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
set -o pipefail
if ! grep -q '"test":' package.json; then
  echo "tests: FAILED — no test script yet, so this slice has not landed"
else
  pnpm test --run 2>&1 | tail -5
  echo "vitest exit=$?"
fi
```

prints a summary line reading `Tests  5 passed (5)` followed by `vitest exit=0` — and after temporarily
making `company_id` optional in `src/server/dto/complaints.ts`, the same block prints
`Tests  1 failed | 4 passed (5)` and `vitest exit=1`. Revert the mutation before committing. Today it
prints only the `no test script yet` line, which is what this slice turns over.

Three details, because a pipe and a `--` each quietly break this gate:

- **`set -o pipefail`, or the exit code the criterion asks for is unreadable.** Without it `$?` after
  `| tail -5` is *tail's* status, which is 0 even when Vitest exits 1 — measured on a deliberately red
  suite, the bare pipe reported `0`. With `pipefail` the pipeline carries Vitest's own code, in both
  `zsh` and `bash`.
- **`--run`, not `-- --run`.** A `--` sends the flag to a bucket Vitest ignores, and Vitest 4 defaults
  to `watch: !isCI && process.stdin.isTTY && !isAgent`, so on a normal terminal `pnpm test -- --run`
  opens watch mode and waits for file changes rather than exiting.
- **`tail -5` is the right depth.** Vitest's green final block is Test Files / Tests / Start at /
  Duration plus a blank line, so `tail -3` would cut off the `Tests` line the criterion reads.

## If stuck

If Vitest fights the Next.js/TypeScript setup — the usual failure is `@/` not resolving, or
`SyntaxError` on an ESM-only dependency — stop configuring and use `node --test` with `tsx` instead:
`node --import tsx --test src/server/dto/complaints.test.ts`. It ships with Node, needs no config, and
the goal of this slice is one test that fails for the right reason, not a runner choice that lasts
forever. Record whichever was picked in `docs/architecture/ARCHITECTURE.md` under Decisions.
