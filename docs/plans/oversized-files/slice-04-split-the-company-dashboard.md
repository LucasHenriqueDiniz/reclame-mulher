---
status: done
tags:
  - area/clean-code
kanban: 1882590f-655f-414e-9859-3f2e6816f8ca
---

# Slice 04 — Split the company dashboard

## Delivers

`src/app/app/company/dashboard/_components/company-dashboard.tsx` drops from 524 lines to under 500,
and the three dashboard tabs keep working.

Like slice 02, the seams are already drawn as top-level functions with comment banners:

| line | function | becomes |
|---|---|---|
| 51 | `ReclamacoesTab` | `_components/complaints-tab.tsx` |
| 130 | `ProjetosTab` | `_components/projects-tab.tsx` |
| 265 | `ConfiguracoesTab` | `_components/settings-tab.tsx` |
| 421 | `CompanyDashboard` | stays |

It is last because it is the smallest overrun — 24 lines over — so it is the one where stopping early
costs least if the epic runs out of appetite.

`ProjetosTab` is the one to watch. It holds five `useState` calls including `projects` seeded from an
`initial` prop (line 131) plus modal state for create, edit and delete. That is a component with a
local cache of server data, and moving it into its own file does not change that — it just makes it
visible.

**All three names are Portuguese** and become English as they move, same as slice 02.

## Needs

- **Slice 02 of `honest-ci`.**
- Slice 02 of this epic done first, if convenient. It has the same shape against an easier file, and
  the naming convention chosen there (`complaints-tab.tsx` and so on) should be the one used here —
  two directories will end up holding files with the same names, which is fine because they are
  colocated under different routes.

## Tests

- All three tabs render, walked by hand.
- The complaints tab's `filter` and `search` still filter.
- The projects tab: create a project, edit it, delete it, and search the list. All four paths go
  through state this slice is moving, so all four are walked.
- The settings tab's sub-tabs still switch, and the delete-company modal still opens.
- No extracted file exports a Portuguese identifier.

## Done when

```bash
wc -l src/app/app/company/dashboard/_components/*.tsx
grep -rlE 'function (Reclamacoes|Projetos|Configuracoes)Tab' src/app/app/company/; echo "grep exit=$?"
pnpm run build >/dev/null 2>&1 && echo "build: ok" || echo "build: FAILED"
```

prints every file in that directory under 500 lines, then `grep exit=1` with no filename above it,
then `build: ok`. Today it prints `524 .../company-dashboard.tsx`, that same path from the grep
followed by `grep exit=0`, and `build: ok`.

The build is asserted by exit code, not by `| tail -3` looking for `Compiled successfully`: that string
lands on line 8 of a 108-line log, *before* `Linting and checking validity of types`, so it is present
even when the build then fails — and the last three lines are the `○ (Static)` / `ƒ (Dynamic)` legend,
so the tail never contained it. The grep keeps its own `echo` because exit 1 is its passing outcome and
`&&` would swallow it.

## If stuck

If `ProjetosTab`'s local `projects` state gets out of sync with the server once it lives in its own
file, that is not a splitting bug — it is a cache that was already there and is now easier to see. Do
not fix it in this slice. Note it, finish the split, and let it be its own card: `@tanstack/react-query`
is already a dependency and replacing a hand-rolled cache with it is a change that deserves its own
proof.

## Outcome

Done. `company-dashboard.tsx` went from 524 lines to 126, and the directory now holds four files:

| file | lines |
|---|---|
| `company-dashboard.tsx` | 126 |
| `complaints-tab.tsx` | 104 |
| `projects-tab.tsx` | 165 |
| `settings-tab.tsx` | 177 |

The gate in **Done when** prints all four under 500, then `grep exit=1` with no filename above it,
then `build: ok`. Four checks, each exit 0: `pnpm run lint`, `pnpm test --run` (18 tests, 3 files),
`npx tsc --noEmit`, `pnpm run build`.

### The plan was wrong about where the work was

The plan budgeted the closure analysis as "the only real work here" and singled out `ProjetosTab`'s
five `useState` calls as the thing to watch. Listing what each function read from the parent scope
turned that up empty: **all three were already pure functions of their props.** Not one parent local
became a prop. The five `useState` calls never crossed the new boundary — they were always internal to
`ProjetosTab`, and the `initial` prop was already the seam. The extraction was a move, not a
refactor: the diff on the parent is 6 insertions (3 imports, 3 renamed call sites) against 404
deletions, and the moved bodies were verified byte-identical to the originals, rename aside.

The real work was the three shared types — `Company`, `Project`, `Complaint` — which the parent needs
for its own props and each tab needs for its own. They now live in the tab file that owns them and are
re-exported to the parent (`import { ProjectsTab, type Project } from "./projects-tab"`), matching the
`import { StepOne, type StepOneData } from "./steps/step-one"` convention already in
`src/app/app/complaints/new/_components/`. `Stats` stayed in the parent, which is its only reader.
This avoids a cycle: had the types stayed in `company-dashboard.tsx`, the children would have imported
back from the parent that imports them.

Everything else the plan asserted about the code checked out exactly — the line numbers (51, 130, 265,
421), the 524-line start, and the seams being clean top-level functions with comment banners. The
per-section banners went away with the sections; the lone `// ─── Main Dashboard ───` banner was
dropped too, since it no longer separates the file's one remaining function from anything.

Naming: `ReclamacoesTab` → `ComplaintsTab`, `ProjetosTab` → `ProjectsTab`, `ConfiguracoesTab` →
`SettingsTab`. No extracted file exports a Portuguese identifier. The two surviving `Projetos` strings
in the parent are the tab label and a metric label — display copy users read, which stays Portuguese
per the recorded divergence in `docs/architecture/ARCHITECTURE.md`.

Slice 02 was still `todo` when this ran, so its naming convention could not be copied from landed
code; the filenames this slice already specifies were used, which is the same set slice 02 names.

### What was NOT verified

**The hand-walking this slice asks for did not happen.** No tab was rendered, no project was created,
edited, deleted or searched, no sub-tab was clicked, and no modal was opened. There was no browser and
no database available in this environment, and `pnpm run test:e2e` was deliberately not run because
its Docker Postgres binds a fixed port shared with two other agents working in sibling worktrees.
Every behavioural claim in **Tests** is therefore still unproven by execution.

What stands in its place is weaker and worth naming as weaker: a successful production build and a
clean typecheck (so every prop, type and import across the new boundary is consistent), a lint run at
`--max-warnings=0` (so no import was orphaned by the extraction), and a byte-level diff proving the
moved code is unchanged. That establishes the split did not alter behaviour; it does not establish
that the behaviour was correct beforehand. The four project paths and the settings sub-tabs need a
real E2E pass.

### Noted, not fixed

- `ProjectsTab`'s local cache of server data is still a local cache: `projects` is seeded from
  `initial` and then hand-mutated on save and delete, so it can drift from the database until reload.
  Per **If stuck**, this was left alone and documented in a doc comment on the component. It wants its
  own card — `@tanstack/react-query` is already a dependency.
- `ProjectsTab` passes `companyId=""` to `CompanyProjectList`, whose props declare `companyId?: string`
  and never read it. A dead prop with a misleading empty-string value. Pre-existing, moved verbatim.
