---
status: active
epic: file-size
tags:
  - area/clean-code
  - status/active
---

# Files over the size limit

## Problem

Four files in `src/` are over the 500-line soft limit the `clean-code` skill sets. Measured on
`643e3fb` with `wc -l`:

| file | lines |
|---|---|
| `src/app/blog/[slug]/edit/page.tsx` | 664 |
| `src/app/company/[slug]/_components/company-profile-content.tsx` | 574 |
| `src/app/app/complaints/[id]/_components/complaint-detail-content.tsx` | 538 |
| `src/app/app/company/dashboard/_components/company-dashboard.tsx` | 524 |

None is near the 1,500-line hard limit that blocks a PR, and the next file down —
`src/app/app/settings/_components/settings-content.tsx` at 498 — is two lines under, so the boundary
here is a convention, not a cliff.

**So this is a queue, not an urgency, and it is a queue with a trap.** Splitting a large React
component moves hooks across a boundary, and hook order, `useEffect` dependencies and state that was
implicitly shared through closure all change behaviour without changing what the file says. There is
nothing in this repo today that would catch that: `docs/architecture/ARCHITECTURE.md` records
*"There are no tests"*, and the `Tests` CI step runs a script with no assertions.

Doing these splits before the `honest-ci` epic lands means doing them blind.

## Solution

One file per slice, smallest first, each behind a runner that can fail. Extract by responsibility —
a form, a list, a header — not by line count, and stop when the file is under the limit rather than
when it is beautiful.

## Surface

The four files above and the `_components/` directories beside them. No route paths, no props crossing
a page boundary, no API change.

## Scope

**In.** Splitting those four files.

**Out.** `settings-content.tsx` (498) and everything below it. A file two lines under the limit is
under the limit; adding it here is how a queue becomes a rewrite.

**Out.** Behaviour changes, prop renames, styling. A split whose diff shows a fixed bug is two
changes in one commit, and the bug fix is the one that will be hard to review.

**Out.** `src/db/schema.ts` (450). Under the limit, and a generated-shape file is the wrong thing to
split by hand anyway.

## Open questions

None. The four files are known and the limit is written down.

## Done

```bash
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l | sort -rn | sed -n '2,5p'
```

shows no file over 500 lines, and `pnpm test` and `pnpm run build` both pass at each step.
