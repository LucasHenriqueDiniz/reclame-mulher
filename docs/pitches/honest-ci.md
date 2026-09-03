---
status: active
epic: ci
tags:
  - area/ci
  - status/active
---

# Honest CI

## Problem

The `Lint & Tests` job is green on every push, and neither half of that name means what it says.

**The `Tests` step runs no tests.** `.github/workflows/ci.yml` line 34 is `run: pnpm run test:demo`,
which `package.json` maps to `node --import tsx scripts/demo-tests.ts`. That file is 87 lines with a
hardcoded array of 24 test names, and its whole body is:

```ts
process.stdout.write(`  ${colors.dim}○${colors.reset} ${test.name}`);
await sleep(test.duration);
process.stdout.write('\r');
console.log(`  ${colors.green}✓${colors.reset} ${test.name} …`);
```

No assertion, no exit code other than zero — `runDemo().catch(console.error)` swallows even a thrown
error, so the process exits 0 whatever happens. A step that cannot fail is not a check.

**The `Lint` step passes with warnings.** `package.json` line 10 is `"lint": "eslint"`, with no
`--max-warnings=0`, so ESLint exits 0 while printing warnings and CI goes green.

This one is now cheap. Measured on `643e3fb`:

```
$ pnpm exec eslint --format json | … errorCount/warningCount
files linted: 262
errors: 0
warnings: 0
```

The nine warnings that commit `36bd20d` left behind (*"Cut the lint warnings from 45 to 9, and leave
the two that point at bugs"*) are gone. The flag can go in without turning CI red — and that window
closes the moment somebody adds a warning.

`docs/architecture/ARCHITECTURE.md` already records both as known gaps, and says *"It is clean as of
2026-09-02, which is the moment to add the flag."*

## Solution

Stop the green light lying first, then earn it back.

1. Take `test:demo` out of CI, and stop the script's name claiming to be tests.
2. Install a real runner and write the first test that can fail.
3. Put the runner in CI, and prove the job goes red when the test does.
4. Add `--max-warnings=0` to `lint`.

## Surface

- `.github/workflows/ci.yml`
- `package.json` scripts
- `scripts/demo-tests.ts`
- a new `vitest.config.ts` and the first `*.test.ts`

## Scope

**In.** The CI workflow, the lint flag, one test runner, and one test that proves the wiring.

**Out — the demo script is not deleted.** It belongs to the same family as
`scripts/evidencias-demo-check.ts`, whose header reads *"Formatted output for 'evidências técnicas'
screenshots (thesis / advisor)"*. This is an academic project and that output is a deliverable, so the
script keeps existing under a name that does not say "test". Deleting it is the owner's call, not a
side effect of fixing CI.

**Out.** Broad test coverage. One test proves the runner runs; what to cover next is its own plan.

## Open questions

None blocking. Whether `demo-tests.ts` is still wanted for the thesis evidence is an owner decision,
and slice 01 is written so the answer does not change the CI fix.

## Done

`gh run list --limit 1 --json conclusion` reads `success` on a good commit and `failure` on a commit
with a broken test or a lint warning. Both directions are proved, because only the failing direction
shows the check is real.
