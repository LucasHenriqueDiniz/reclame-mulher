---
status: todo
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
