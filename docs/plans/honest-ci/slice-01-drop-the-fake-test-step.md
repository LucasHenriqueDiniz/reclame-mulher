---
status: todo
tags:
  - area/ci
kanban: d69445bf-4af5-4afc-bc2e-bb8eab1f24e2
---

# Slice 01 — Drop the fake test step from CI

## Delivers

CI no longer claims to run tests. The `Tests` step is gone from `.github/workflows/ci.yml`, and the
script it called is renamed so that nothing in `package.json` uses the word `test` for something that
asserts nothing.

The workflow is left with one real step (`Lint`) instead of one real step and one theatrical one.
Nothing in the repo starts passing that was failing — the point is that nothing keeps *passing* that
was never checked.

## Needs

- Nothing. This slice removes; it adds no dependency.
- 5 minutes reading `scripts/demo-tests.ts` (87 lines) to confirm it is only wired by the `test:demo`
  script and the CI step. The three references in the repo today are `.github/workflows/ci.yml:34`,
  `AGENTS.md:94` and `docs/architecture/ARCHITECTURE.md:146`.

## Tests

There is no runner yet, so the checks here are greps and a workflow run.

- `test:demo` appears nowhere in `package.json` or `.github/workflows/ci.yml`.
- The script still exists and still runs, under the name `demo:checklist`, next to its sibling
  `evidencias:check`.
- `AGENTS.md` line 94 names the new script, not the old one.
- The CI workflow still parses and still runs the `Lint` step.

## Done when

```bash
grep -c 'test:demo' package.json .github/workflows/ci.yml AGENTS.md
```

prints `0` for all three files, and

```bash
pnpm run demo:checklist
```

exits 0 and prints the 24-line checklist it printed before.

## If stuck

If the owner wants the demo output to keep running in CI as a build artifact rather than as a check,
put it back as a step named `Demo checklist (not a test)` with `continue-on-error: true`. That is
still honest — the name says what it is and it cannot gate a merge. Do not restore the `Tests` name
under any circumstance.
