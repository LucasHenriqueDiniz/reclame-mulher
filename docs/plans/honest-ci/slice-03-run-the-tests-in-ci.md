---
status: done
tags:
  - area/ci
kanban: 1d1f6e63-beda-4ae2-a51e-bd36be82a28f
---

# Slice 03 — Run the tests in CI, and prove the job can go red

> **Done 2026-09-03, in the same commit as slice 02.** The `check` job now runs `Lint`,
> `Unit tests` (`pnpm test --run`) and `Manuals in sync`, and the separate `e2e` job runs
> the 20-test Playwright suite. Splitting the runner from its CI wiring across two slices
> would have left a green CI that runs no unit tests for as long as slice 03 sat in the
> backlog, which is exactly the gap this epic is about.

## Delivers

The `Tests` step comes back to `.github/workflows/ci.yml`, this time running the real runner. A pull
request with a failing test gets a red check instead of a green one.

## Needs

- Slice 02 done: `pnpm test` exists and one test can fail.
- Nothing else. The workflow already installs with `pnpm install --frozen-lockfile`, so the runner
  arrives with the lockfile.

## Tests

- The `Tests` step runs `pnpm test -- --run`, not the watch mode. A runner that watches in CI hangs
  until the job times out.
- The step is placed after `Lint`, so a lint failure is reported before a test run costs a minute.
- The job name `Lint & Tests` is now accurate and can stay.

## Done when

Push a branch whose only change is a deliberately broken assertion, then:

```bash
gh run list --branch ci-red-check --limit 1 --json conclusion,name --jq '.[0]'
```

prints `{"conclusion":"failure","name":"CI"}`. Fix the assertion, push, and the same command prints
`{"conclusion":"success","name":"CI"}`. Both runs are required — a green CI proves nothing on its own,
which is the whole reason this epic exists.

## If stuck

If the runner passes locally and fails only on the runner — the usual cause is a timezone or locale
difference, since this codebase formats with `toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })`
in `scripts/evidencias-demo-check.ts` — pin `TZ: America/Sao_Paulo` in the job `env:` rather than
loosening the assertion. If it still fails, keep the step and mark it required-on-master only; do not
delete it and do not add `continue-on-error`, which returns the job to exactly the state slice 01 fixed.
