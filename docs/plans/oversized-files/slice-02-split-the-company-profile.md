---
status: done
tags:
  - area/clean-code
kanban: 5c863774-abfd-4981-92f1-304c12728b42
---

# Slice 02 — Split the public company profile

## Delivers

`src/app/company/[slug]/_components/company-profile-content.tsx` drops from 574 lines to under 500,
and the public company page renders the same four tabs.

This one is the cheapest of the four, because the author already drew the seams as comment banners and
each section is a top-level function in the same file:

| line | function | becomes |
|---|---|---|
| 35 | `InfoRow` | `_components/info-row.tsx` |
| 56 | `CompanyHero` | `_components/company-hero.tsx` |
| 181 | `MetricsBar` | `_components/metrics-bar.tsx` |
| 240 | `OverviewTab` | `_components/overview-tab.tsx` |
| 298 | `InformacoesTab` | `_components/information-tab.tsx` |
| 334 | `ProjetosTab` | `_components/projects-tab.tsx` |
| 407 | `ReclamacoesTab` | `_components/complaints-tab.tsx` |
| 477 | `CompanyProfileContent` | stays |

Moving a whole function to its own file is a `git mv`-shaped change with an export added: no hooks
cross a boundary they did not already cross, because each of these already owns its own state
(`ProjetosTab` has `search` and `statusFilter`, `ReclamacoesTab` has `filter`).

**Three of those names are Portuguese**, and this slice creates the files they live in, so they get
English names on the way out rather than a second pass later.

## Needs

- **Slice 02 of `honest-ci`.** Less critical here than in slice 01 — nothing is being restructured —
  but a build and a test run are what turn "it looked fine" into evidence.
- 20 minutes reading the file to list what each extracted function closes over. Anything read from the
  parent scope rather than from props becomes a prop, and that is the only real work in this slice.

## Tests

- The public profile renders all four tabs, walked by hand: overview, information, projects,
  complaints.
- The projects tab's search box and status filter still filter.
- The complaints tab's filter still filters.
- The report dialog (`reportOpen`, line 504) still opens; it stays in the parent.
- No extracted file exports a Portuguese identifier.

## Done when

```bash
wc -l 'src/app/company/[slug]/_components/'*.tsx
grep -rlE 'function (Informacoes|Projetos|Reclamacoes)Tab' src/app/company/; echo "grep exit=$?"
pnpm run build >/dev/null 2>&1 && echo "build: ok" || echo "build: FAILED"
```

prints every file in that directory under 500 lines, then `grep exit=1` with no filename above it,
then `build: ok`. Today it prints `574 .../company-profile-content.tsx`, that same path from the grep
followed by `grep exit=0`, and `build: ok`.

The directory is quoted and only `*.tsx` is left to the shell, because `[slug]` is a glob character
class: unquoted, `wc -l src/app/company/[slug]/_components/*.tsx` matches nothing and dies with
`no matches found` in zsh and `No such file or directory` in bash — a gate that fails before it has
looked at anything.

The build is checked by its exit code because `next build` prints `✓ Compiled successfully` on line 8
of 108 and only afterwards runs `Linting and checking validity of types` — so that string is already in
the log before the build can fail, and `| tail -3` never reaches it anyway (the last three lines are the
`○ (Static)` / `ƒ (Dynamic)` legend). The `echo "grep exit=$?"` reports the grep and nothing else: an
exit of 1 is the wanted outcome here, which is exactly why it cannot be chained with `&&`.

## If stuck

If a tab turns out to read half a dozen values from the parent scope and the prop list gets absurd,
pass the `company` object itself rather than destructuring it into eight props. It is already the
shape the parent holds. If even that does not fit, leave that one tab in place and extract the other
six — the target is under 500, not zero functions in the file.

## Outcome

574 → **112 lines**, all seven extractions taken, and the gate prints eight files with 132 as the
largest, then `grep exit=1` with nothing above it, then `build: ok`. `pnpm run lint`,
`pnpm test --run`, `npx tsc --noEmit` and `pnpm run build` each exited 0; all four also exited 0 on
the branch point, so none of them is reporting on something this slice repaired.

### The 20 minutes of closure reading found nothing to do

This document budgeted that reading as "the only real work in this slice", on the premise that a
section might turn out to read from the parent scope rather than from props. None does. All seven
were already top-level functions with complete parameter lists, so the closure list is entirely
module scope — imports and three local types — and **not one new prop was added**. What each one
reads:

| file | module-scope reads |
|---|---|
| `info-row.tsx` | nothing at all; no import but the directive |
| `company-hero.tsx` | `BarChart3` `MapPin` `FileText` `Shield`, `Badge`, `Button`, `Link`, `CompanyStats`, `Company` |
| `metrics-bar.tsx` | `MessageCircle` `Clock` `Check`, `Card`/`CardContent`, `CompanyStats` |
| `overview-tab.tsx` | six `Company*Card`s, `CompanyStats`, `Company`, `Complaint` |
| `information-tab.tsx` | `Card`/`CardContent`, `formatDate`, **`InfoRow`**, `Company` |
| `projects-tab.tsx` | `useState`/`useMemo`, `SearchInput`, `CompanyProjectList`, `CompanyComplaintCtaCard`, `Project` |
| `complaints-tab.tsx` | `useState`, `MessageCircle`, `Link`, `Button`, `CompanyComplaintList`, `CompanyPerformanceCard`, `CompanyStats`, `Complaint` |

`InfoRow` is the one dependency that crosses between two of the new files: `information-tab.tsx` is
its only caller and now imports it from `./info-row`. Every other new file depends only on things
outside the directory. The *If stuck* clause — pass `company` whole rather than destructure it into
eight props — was already how the author had written it, so it never came up.

Each of the seven function bodies was diffed against its line range in the pre-split file and is
**byte-identical**, renames aside; so is the orchestrator that stayed. The only hand-written lines
in this change are import blocks.

### One file this document does not list

The three types the sections share — `Company`, `Complaint`, `Project` — were declared in
`company-profile-content.tsx` and exported by nothing, and the table says where seven *functions*
go without saying where those go. They are now `_components/types.ts`, an eighth file, because
`Company` is read by four of the split files and `Complaint` by three. The alternative was to export
them from the orchestrator and have each child import from its own parent; type-only, so it would
erase at build time and work, but it points every arrow backwards. Re-declaring `Company` in four
files was the third option and is worse than either.

`types.ts` is invisible to the gate, which globs `*.tsx`. It is 32 lines.

### Smaller notes

- The line numbers in this document's table are exact, all eight of them.
- `reportOpen` stayed in the parent as specified, and is still the only piece of state there beyond
  `tab`.
- The `// ─── SECTION ───` banners left with the code they introduced. The last one, `// ─── MAIN
  ───`, was dropped rather than carried: with one function left in the file it labels nothing.
- Confirmed as described: `✓ Compiled successfully` really does land on line 8 of the build log, so
  checking the build by that string rather than by its exit code would have passed a failing build.
- `next build` dirtied no tracked file here — `git status` after it showed only the nine paths of
  this change.

### What was not verified

The Tests section asks for the four tabs to be **walked by hand**, and they were not: this ran in a
worktree with no browser and no database, so nothing rendered. Four of the five test items are
therefore covered only by (a) the byte-identical bodies above, (b) `tsc` agreeing every prop still
type-checks at every call site, and (c) a production build:

- the four tabs rendering,
- the projects tab's search box and status filter,
- the complaints tab's filter,
- the report dialog opening.

That is a strong argument that behaviour is unchanged — the code is the same code, wired the same
way — and it is not the same thing as having seen it. Whoever runs the E2E suite after the merge is
the first to actually look. The fifth item, no extracted file exporting a Portuguese identifier, is
the one this environment can and did check: `grep exit=1`.
