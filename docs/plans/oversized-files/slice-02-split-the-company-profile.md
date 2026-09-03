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
wc -l src/app/company/[slug]/_components/*.tsx && \
  grep -rlE 'function (Informacoes|Projetos|Reclamacoes)Tab' src/app/company/ ; \
  pnpm run build 2>&1 | tail -3
```

prints every file in that directory under 500 lines, prints nothing for the grep, and ends in
`Compiled successfully`.

## If stuck

If a tab turns out to read half a dozen values from the parent scope and the prop list gets absurd,
pass the `company` object itself rather than destructuring it into eight props. It is already the
shape the parent holds. If even that does not fit, leave that one tab in place and extract the other
six — the target is under 500, not zero functions in the file.
