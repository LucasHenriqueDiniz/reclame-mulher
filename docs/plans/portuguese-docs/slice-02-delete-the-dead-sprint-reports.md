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
  and in a checklist. Any deleted file named there is edited out in the same commit.

## Tests

- Every file marked `delete` is gone from the working tree.
- No file marked `translate` or `ask-owner` was touched.
- No surviving `.md` or `.txt` mentions a deleted filename.
- `git log --diff-filter=D --name-only -1` shows only files from the `delete` list.

## Done when

```bash
ls RELATORIO_*.md AUDITORIA_*.md STATUS_FINAL_PRODUCAO.md GITHUB_PUSH_SUMMARY.md \
   MAPEAMENTO_TELAS_COMPLETO.md PLANO_IMPLEMENTACAO_SPRINT.md VALIDACAO_APP_FUNCIONANDO.md 2>&1
```

prints `No such file or directory` for each, and the dangling-reference sweep is silent:

```bash
for f in $(git log --diff-filter=D --name-only --pretty=format: -1); do
  grep -rln "$(basename "$f")" --include='*.md' --include='*.txt' . --exclude-dir=node_modules
done
```

prints nothing.

## If stuck

If a report turns out to be the only record of a decision — an accessibility fix rationale in
`RELATORIO_CORRECOES_ACESSIBILIDADE.md` is the plausible case — do not keep the report to save the
paragraph. Move the paragraph: a decision belongs in `docs/architecture/ARCHITECTURE.md` under
Decisions, a finished piece of work belongs in `docs/postmortem/`. Then delete the report. Both
destinations already exist with READMEs.
