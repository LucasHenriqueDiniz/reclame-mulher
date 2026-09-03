---
status: done
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
if ! grep -q '"test":' package.json; then
  echo "tests: FAILED — no test script; honest-ci slice 02 is not done"
elif pnpm test --run >/dev/null 2>&1; then
  echo "tests: ok"
else
  echo "tests: FAILED"
fi
pnpm run build >/dev/null 2>&1 && echo "build: ok" || echo "build: FAILED"
```

prints a line count below 500, then `tests: ok`, then `build: ok`. Today it prints `538`, the
`tests: FAILED — no test script; honest-ci slice 02 is not done` line, and `build: ok`.

Both runs are asserted by exit code rather than by a string in their output, for the reasons slice 01
records in full: `next build` prints `✓ Compiled successfully` before it type-checks, so that string
survives a broken build; `pnpm test --run` exits **0** and prints nothing when no `test` script exists,
so the existence check has to gate the run instead of merely warning next to it; and no runner in play
prints `0 failed` on success — Vitest prints `Tests  5 passed (5)` and omits the failed count entirely,
while `node --test` prints `# fail 0`.

The flag is `--run`, not `-- --run`: after a `--` Vitest never reads it, and Vitest 4 defaults to
`watch: !isCI && process.stdin.isTTY && !isAgent`, so on a real terminal the `-- --run` form drops into
watch mode and the gate hangs instead of reporting.

## If stuck

If pulling the reply form out means threading `useTransition` through props and the result reads worse
than the 538 lines it replaced, stop and take only the label maps. That is roughly 60 lines and leaves
the file around 480 — under the limit, with the risky half untouched. Record in the PR that the reply
form was left in place and why. The soft limit is a prompt to look, and "looked, and the split makes
it worse" is a valid outcome; the `clean-code` skill blocks at 1,500, not at 500.

## Outcome

Both extractions landed. 538 → **427 lines**, and the two new files are small enough that nothing
was traded for the reduction:

| file | lines |
|---|---|
| `_components/complaint-detail-content.tsx` | 427 |
| `_components/complaint-reply-form.tsx` | 109 |
| `_components/complaint-labels.ts` | 65 |
| `_components/complaint-labels.test.ts` | 61 |

`pnpm run lint` 0, `pnpm test --run` 0 (4 files, 23 tests), `npx tsc --noEmit` 0, `pnpm run build` 0.
The `Done when` block prints `427`, `tests: ok`, `build: ok`.

### The `useTransition` risk did not materialise, and here is why

The plan was right to flag it and wrong about where it landed. `pending` is read in exactly two
places — `disabled={pending}` on the textarea and `disabled={pending}` on the submit `Button` — and
both were already **inside** the `{isAuthor && (...)}` block being extracted. So the transition, the
two pieces of state it guards, `submitReply`, and the `router.refresh()` all moved to one side of the
boundary together. Nothing had to be threaded through props; the child takes a single
`complaintId: string`. The `If stuck` escape hatch (take only the label maps) was not needed.

Worth recording because the plan's warning implied a pending read somewhere in the outer JSX — the
header, the thread, the sidebar. There is none. The seam was cleaner than the plan expected, and the
45 minutes it budgeted for reading the file is what established that rather than what was spent
fighting it.

### The label maps became two functions, not two exported constants

`STATUS_LABELS` and `CATEGORY_LABELS` moved as planned, Portuguese untouched, but they are now
module-private behind `statusLabel(status)` and `categoryLabel(value)`. The reason is the test the
slice asked for: the fallback lived in the *call site* (`STATUS_LABELS[x] ?? x`, repeated four
times), so a test importing only the maps would have had to re-implement the `??` and would then
have been asserting its own expression rather than the shipped code. Moving the fallback into the
function makes the production path and the tested path the same one. Four call sites collapsed to
four calls, and the local `statusLabel` variable in the component was renamed `statusText` to leave
the name to the import.

### Mutation-tested, both halves

The slice named two assertions, so both were broken separately and confirmed red:

1. Removed `?? status` from `statusLabel` → `statusLabel > falls back to the raw status when the map
   has no entry` failed, `expected undefined to be 'PENDING_REVIEW'`. Exit 1.
2. Deleted the `CANCELLED` entry → `statusLabel > has a label for every status the schema enum
   allows` failed with `no label for status CANCELLED`, and `translates each known status` failed
   alongside it. Exit 1.

Reverted, `diff` clean against the pre-mutation copy, 23 tests pass again.

Mutation 1 is the one that matters, and it is the reason the test exists rather than being assumed:
`strict` is on but `noUncheckedIndexedAccess` is **not**, so TypeScript types `STATUS_LABELS[status]`
as `string`. Dropping the `??` compiles clean and passes `tsc --noEmit` — the page just renders the
literal text `undefined`. No other gate in the repo catches it.

The coverage test reads its status list from `complaintStatus.enumValues` in `src/db/schema.ts`
rather than retyping the four, so adding a value to the Postgres enum without adding a label turns it
red. Importing the Drizzle schema into a Vitest `node` environment works and costs nothing — the
schema module is `drizzle-orm/pg-core` definitions only, no connection.

### Not walked manually — no browser, no database

The slice asks for a walkthrough: post a reply, see the button disabled while pending, force an error
to see the `feedback` path. **That was not done.** This ran headless with no browser and no Postgres,
and `pnpm run test:e2e` was off limits because its Docker Postgres binds a port shared with the other
slices in flight. So the three behavioural assertions the slice wanted walked are **unverified by
observation**, including the one it singled out as most likely to be lost.

What was checked instead, and what it is worth:

- Every read of `pending`, `reply`, `feedback`, `submitReply` and `router` was grepped before the cut
  and again after. The post-cut grep over the parent returns only the import line and a comment — no
  dangling reference, and nothing that used to read the transition was left behind on the parent side.
- The extracted JSX is byte-identical to the original apart from indentation and `complaint.id` →
  `complaintId`, so `disabled={pending}` still sits on the same two controls it sat on before.
- `tsc --noEmit` and the production build both pass, which would have caught a prop or a name that
  failed to follow the code across the boundary.

That establishes the wiring is intact. It does not establish that the button visibly disables, which
needs the walkthrough. Left for the E2E pass after merge.

### Divergences found on the way, both left alone

- **A near-duplicate set of label maps exists** at
  `src/app/app/company/complaints/[id]/_components/company-complaint-detail-content.tsx` (496 lines,
  not a target of any slice here). They are *not* the same data and must not be merged blind: it
  renders `RESOLVED` as "Resolvida" where this route renders "Concluído", it has a `saude` entry this
  one lacks, and it lacks `poluicao_sonora` and `horario_obras`. Sharing one module between the two
  would change what a page displays. Recorded in `complaint-labels.ts` so the next person who reaches
  for the obvious DRY finds the reason first.
- **`CATEGORY_LABELS` is missing two values the product actually writes.** The new-complaint form
  (`src/app/app/complaints/new/_components/steps/step-four.tsx`) offers `saude` under impact category
  and `familiar` under impact scope; neither has an entry, so the detail page renders the raw snake
  case today. It also carries four keys the form never writes: `economico`, `poluicao_sonora`,
  `horario_obras`, `nacional`. Fixing either is a product decision about display text, not a
  refactor, so the maps moved unchanged — the fallback is what keeps it merely ugly instead of blank.
  The test's fallback case uses a synthetic value rather than `saude`, so closing this gap later
  won't turn a passing test red for the wrong reason.
