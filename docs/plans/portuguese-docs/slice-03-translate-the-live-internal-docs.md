---
status: todo
tags:
  - area/docs
kanban: 7733daaf-8234-4231-882a-56139fe83c03
---

# Slice 03 — Translate the internal docs that survive

## Delivers

Every file the inventory marked `translate` is in English. The likely set is the eight live internal
docs, 3,018 lines on `643e3fb`:

| file | lines |
|---|---|
| `docs/acessibilidade-inclusiva.md` → `docs/inclusive-accessibility.md` | 600 |
| `CHANGELOG.md` | 508 |
| `docs/FINAL_TEST_SUMMARY.md` | 461 |
| `TODO.md` | 440 |
| `docs/e2e-test-report.md` | 425 |
| `docs/DOCUMENTACAO_FASE3.md` → `docs/phase-3.md` | 321 |
| `docs/project-status.md` | 209 |
| `docs/mvp-backlog.md` | 54 |

Most of those already have English filenames and Portuguese bodies — the rename is only for the two
whose name is Portuguese too, since a filename lands in the repo like anything else.

`README_DOCUMENTACAO.txt` (359 lines) is deliberately not here. It indexes the manual family, so its
disposition follows slice 04's answer, not this slice's.

## Needs

- Slice 01 done, so the set is decided rather than guessed.
- Slice 02 done, so nothing here is translated and then deleted.
- ~2 hours. This is the slice that costs real time, which is why the deletions come first.

## Tests

- Every `translate` file scores zero on the prose-marker count in `Done when`.
- Renamed files were moved with `git mv`, so the history follows.
- Every reference to a renamed file points at the new name. Measured on `693a79c`, that is four files
  outside `docs/plans/` and `docs/pitches/`: `AGENTS.md:165`, `README.md:43`,
  `INDICE_DOCUMENTACAO.md:444` and `LEIA_ME_PRIMEIRO.md:290`. The last two are manual-family docs that
  slice 04 still owns — repointing a path inside them is not translating them, and does not wait on the
  owner.
- **Product literals quoted inside these docs stay Portuguese.** `docs/acessibilidade-inclusiva.md`
  quotes user-facing copy; the prose around a quote is translated, the quote is not. Translating a
  quoted UI string makes the doc wrong about the app.

## Done when

Slice 01's census, restricted to prose lines and with the manual family excluded:

```bash
for f in $(ls *.md *.txt *.html docs/*.md 2>/dev/null); do
  n=$(grep -vE '"' "$f" | grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao')
  [ "$n" -gt 0 ] && printf '%s\t%s\n' "$n" "$f"
done | grep -vE '(MANUAL_PLATAFORMA|GUIA_RAPIDO|FLUXOS_VISUAIS|LEIA_ME_PRIMEIRO|INDICE_DOCUMENTACAO|README_DOCUMENTACAO)' \
     | sort -rn
```

prints nothing. Today it prints **19 rows** — the eleven files slice 02 deletes plus the eight this
slice translates — topped by `docs/acessibilidade-inclusiva.md` at 71 and bottoming out at
`VALIDACAO_APP_FUNCIONANDO.md` at 5. Nineteen is the full remainder once the six manual-family files
and `README_DOCUMENTACAO.txt` are set aside, so when slices 02 and 03 are both done there is nothing
left for it to print.

Three things that block was getting wrong:

- **It was never silent, and could not be.** `grep -r` over the tree matched this very file, plus
  `slice-01`, `slice-04` and `docs/pitches/portuguese-docs.md`, which quote `ção|ções|não|está|usuári`
  inside their code fences — and then seven files under `.opencodeshare/`, `AGENTS.md`,
  `assets/figma/info.txt` and `src/app/app/complaints/new/_components/README.md`, none of them in the
  set to translate. Measured on `693a79c`: 32 paths. Reusing slice 01's bounded glob — repo root plus
  `docs/*.md`, no recursion — removes all of that without an exclusion list, and leaves `docs/plans/`
  free to keep quoting the markers.
- **`-l` made it possible to pass while fully Portuguese.** Listing any file with a single hit, with no
  threshold, meant `docs/project-status.md` and `docs/mvp-backlog.md` never appeared: both have **0**
  accented markers because they are written without accents. Under the whole-word marker set they score
  23 and 9, so they are now correctly red until translated.
- **The quoted product literals are excluded structurally, not by a fudge factor.** `grep -vE '"'`
  drops every line containing a double quote before counting, which is exactly the rule the Tests
  section states. Measured on `docs/acessibilidade-inclusiva.md`: of its 79 marker lines, 8 carry a
  quote and all 8 are pure product copy (`- "Enviar reclamacao"`, `- "Sou uma pessoa"`, …); the other
  71 are prose. So a faithful translation lands the file at 0 without anyone having to translate a UI
  string. If a doc needs more Portuguese than a quote can hold, the *If stuck* route below applies —
  `docs/archive/` is outside this glob.

And no link dangles:

```bash
git grep -n -e acessibilidade-inclusiva -e DOCUMENTACAO_FASE3 \
  -- '*.md' '*.txt' ':!docs/plans' ':!docs/pitches'
```

prints nothing. Today it prints six lines: `AGENTS.md:165`, `INDICE_DOCUMENTACAO.md:444`,
`LEIA_ME_PRIMEIRO.md:290`, `README.md:43` and `RELATORIO_FINAL_SPRINT_COMPLETO.md` at 291 and 384. The
last of those is deleted by slice 02; the other four are the references this slice repoints.

The `grep -rn` it replaces matched this slice's own file five times and the pitch twice, so it too was
permanently non-silent. `docs/plans` and `docs/pitches` are excluded because naming the old filename is
their job; every other reference is still in scope.

## If stuck

If translating one of the long files stalls — `docs/acessibilidade-inclusiva.md` at 600 lines is the
risk — do not leave it half-English. Half-translated is worse than untranslated: a reader cannot tell
which half is current. Move it to `docs/archive/` in Portuguese, note it in the inventory, and finish
the rest. `docs/pitches/README.md` already establishes `archive/` as a folder the tooling skips.
