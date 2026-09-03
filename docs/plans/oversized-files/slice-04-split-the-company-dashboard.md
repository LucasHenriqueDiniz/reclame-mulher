---
status: todo
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
