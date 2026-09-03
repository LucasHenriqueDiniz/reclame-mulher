---
status: todo
tags:
  - area/clean-code
kanban: ded6d116-5374-4eea-9e42-003842b18aa6
---

# Slice 03 — Split the complaint detail view

## Delivers

`src/app/app/complaints/[id]/_components/complaint-detail-content.tsx` drops from 538 lines to under
500.

This is the hardest of the four and it is third for that reason. Unlike the other two component files,
it has **no internal function boundaries at all**: one exported component at line 96, two `useState`
calls and a `useTransition`, and everything else inline JSX. There is nothing to `git mv`; every seam
has to be cut.

Two things are extractable without touching the component's state:

- **The label maps**, `STATUS_LABELS` (line 26) and `CATEGORY_LABELS` (line 33), to
  `_components/complaint-labels.ts`. They are module-level constants, they are read in JSX, and moving
  them is mechanical. They are also Portuguese display strings — product literals under the divergence
  `docs/architecture/ARCHITECTURE.md` records, so they are translated to nothing and stay as they are.
- **The reply form**, which owns `reply` and `feedback` (lines 102–103), to
  `_components/complaint-reply-form.tsx`. That is the one piece with its own state, so it is the one
  piece that is genuinely a component.

## Needs

- **Slice 02 of `honest-ci`.** More than any other slice here: `useTransition` at line 3 means an
  action's pending state is read somewhere in that JSX, and moving the submit into a child moves the
  transition with it. Getting that wrong makes a button stop disabling during submit — invisible until
  somebody double-submits a reply.
- 45 minutes reading the file. It is the one with no map to follow.

## Tests

- The label maps get a unit test: every status the API can return has an entry, and an unknown status
  falls back rather than rendering `undefined`.
- Manual walkthrough: open a complaint, read the thread, post a reply, see it appear, see the button
  disabled while pending, and force an error to see the `feedback` path render.
- The `useTransition` pending state still disables the submit control. This is the assertion most
  likely to be lost, so it is walked explicitly rather than assumed from the code reading correctly.

## Done when

```bash
wc -l 'src/app/app/complaints/[id]/_components/complaint-detail-content.tsx'
grep -q '"test":' package.json || echo "FAIL: no test script — honest-ci slice 02 is not done"
pnpm test -- --run >/dev/null 2>&1 && echo "tests: ok" || echo "tests: FAILED"
pnpm run build  >/dev/null 2>&1 && echo "build: ok" || echo "build: FAILED"
```

prints a line count below 500, then `tests: ok`, then `build: ok`. Today it prints `538`, the
`FAIL: no test script` line, `tests: FAILED` and `build: ok`.

Both runs are asserted by exit code rather than by a string in their output, for the reasons slice 01
records in full: `next build` prints `✓ Compiled successfully` before it type-checks, so that string
survives a broken build; `pnpm test --run` exits **0** and prints nothing when no `test` script exists,
so a missing runner reads as a pass unless existence is asserted first; and no runner in play prints
`0 failed` on success — Vitest prints `Tests  5 passed (5)` and omits the failed count entirely, while
`node --test` prints `# fail 0`.

## If stuck

If pulling the reply form out means threading `useTransition` through props and the result reads worse
than the 538 lines it replaced, stop and take only the label maps. That is roughly 60 lines and leaves
the file around 480 — under the limit, with the risky half untouched. Record in the PR that the reply
form was left in place and why. The soft limit is a prompt to look, and "looked, and the split makes
it worse" is a valid outcome; the `clean-code` skill blocks at 1,500, not at 500.
