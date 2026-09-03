---
status: todo
tags:
  - area/docs
kanban: ff0c8a39-1508-4d74-8b87-ca2de59e3369
---

# Slice 02 — Delete the dead sprint reports

## Delivers

The repo root loses the point-in-time reports that describe a state the code no longer has. Git keeps
them; the root stops advertising them.

The candidate set, from the inventory (11 files, 2,530 lines on `643e3fb`):

| file | lines |
|---|---|
| `RELATORIO_FINAL_SPRINT_COMPLETO.md` | 452 |
| `RELATORIO_AUDITORIA_FINAL.md` | 270 |
| `MAPEAMENTO_TELAS_COMPLETO.md` | 267 |
| `STATUS_FINAL_PRODUCAO.md` | 261 |
| `GITHUB_PUSH_SUMMARY.md` | 254 |
| `RELATORIO_CORRECOES_ACESSIBILIDADE.md` | 225 |
| `RELATORIO_TESTES_REAIS.md` | 212 |
| `RELATORIO_TESTES_E2E_COMPLETO.md` | 190 |
| `AUDITORIA_COMPLETA_PROBLEMAS.md` | 142 |
| `PLANO_IMPLEMENTACAO_SPRINT.md` | 134 |
| `VALIDACAO_APP_FUNCIONANDO.md` | 123 |

Whichever of these the inventory marked `delete` is what goes. The table is the starting point, not
the decision.

## Needs

- Slice 01 done. Deleting without the inventory is deleting without a written reason.
- The link sweep: `INDICE_DOCUMENTACAO.md` names files by filename in headings, in an audience table
  and in a checklist. Any deleted file named there is edited out in the same commit. Measured on
  `693a79c`: the nine existing files it names are the three manual-family docs plus `README.md`,
  `GUIA_RAPIDO.md`, `LEIA_ME_PRIMEIRO.md`, `docs/acessibilidade-inclusiva.md`,
  `docs/mvp-backlog.md` and `docs/project-status.md` — **none of the eleven candidates above**. So this
  is a check to run, not work to plan for; it is slice 03's renames that will actually touch that file.

## Tests

- Every file marked `delete` is gone from the working tree.
- No file marked `translate` or `ask-owner` was touched.
- No surviving `.md` or `.txt` mentions a deleted filename.
- `git log --diff-filter=D --name-only -1` shows only files from the `delete` list.

## Done when

The list to check is read out of the inventory, not written here — the table above is a candidate set
and slice 01 is what decides:

```bash
inv=docs/product/legacy-docs-inventory.md
test -f "$inv" || echo "FAIL: no inventory at $inv — slice 01 is not done"
del=$(grep -E '\| *delete *\|' "$inv" 2>/dev/null | grep -oE '[A-Za-z0-9_./-]+\.(md|txt|html)' | sort -u)
test -n "$del" && printf '%s\n' "$del" | wc -l || echo "FAIL: the inventory marks nothing delete"
printf '%s\n' "$del" | while read -r f; do
  [ -n "$f" ] && [ -e "$f" ] && echo "STILL PRESENT: $f"
done
```

prints the count of `delete` rows and then nothing else. Today it prints the two `FAIL:` lines, because
the inventory does not exist yet. Against a stub inventory carrying the eleven candidates above as
`delete`, it prints `11` and then eleven `STILL PRESENT:` lines — so the gate turns over on the
deletions themselves, and the `test -n "$del"` guard is what stops an absent inventory from yielding an
empty list and a silent pass.

Then the dangling-reference sweep, over the same derived list:

```bash
printf '%s\n' "$del" | while read -r f; do
  [ -n "$f" ] && git grep -lF "$f" -- '*.md' '*.txt' ':!docs/plans' ':!docs/pitches' ':!docs/product'
done | sort -u
```

prints nothing. Against the same stub it prints two paths today, `GITHUB_PUSH_SUMMARY.md` and
`RELATORIO_FINAL_SPRINT_COMPLETO.md` — both on the `delete` list themselves, so the sweep goes quiet
once the deletions land.

Two corrections are baked into those blocks:

- **The `ls` form fixed all eleven filenames**, which contradicted this slice's own sentence that the
  table is a starting point, and left no room for slice 01's `ask-owner` disposition. Reading the
  `delete` rows keeps the inventory in charge.
- **The old sweep could never be silent.** It grepped the whole tree for the deleted basenames, and
  this file's candidate table together with `docs/pitches/portuguese-docs.md` name all eleven — so
  every deletion guaranteed itself two hits. Measured: grepping the eleven names returns
  `docs/plans/portuguese-docs/slice-02-delete-the-dead-sprint-reports.md` eleven times and
  `docs/pitches/portuguese-docs.md` eleven times. The pathspec exclusions drop the three directories
  whose job is to *name* the files being removed (`docs/product` holds the inventory, which lists all
  26 by design), and `git grep` searches tracked files only, which also keeps `node_modules` and
  `.opencodeshare/` out without an `--exclude-dir` list. It no longer keys off
  `git log --diff-filter=D -1` either: that read whatever the last commit happened to delete, which on
  `693a79c` is five agent worktrees and seven `.tsx` files, and reported `docs/e2e-test-report.md` four
  times for reasons having nothing to do with this slice.

## If stuck

If a report turns out to be the only record of a decision — an accessibility fix rationale in
`RELATORIO_CORRECOES_ACESSIBILIDADE.md` is the plausible case — do not keep the report to save the
paragraph. Move the paragraph: a decision belongs in `docs/architecture/ARCHITECTURE.md` under
Decisions, a finished piece of work belongs in `docs/postmortem/`. Then delete the report. Both
destinations already exist with READMEs.
