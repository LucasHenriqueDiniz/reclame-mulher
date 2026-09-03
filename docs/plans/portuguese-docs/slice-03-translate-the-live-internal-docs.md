---
status: done
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
for f in $(find . docs -maxdepth 1 \( -name '*.md' -o -name '*.txt' -o -name '*.html' \) -type f | sed 's|^\./||'); do
  n=$(grep -vE '"' "$f" | grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao')
  [ "$n" -gt 0 ] && printf '%s\t%s\n' "$n" "$f"
done | grep -vE '(MANUAL_PLATAFORMA|GUIA_RAPIDO|FLUXOS_VISUAIS|LEIA_ME_PRIMEIRO|INDICE_DOCUMENTACAO|README_DOCUMENTACAO)' \
     | sort -rn
```
⚠️ **`ls *.md *.txt *.html` is not the census command any more.** `README_DOCUMENTACAO.txt` was the
only `.txt` in the repository and slice 02 deleted it, so the `*.txt` glob now matches nothing —
and zsh treats a glob with no match as a hard error that aborts the whole command *before* `ls`
runs, which `2>/dev/null` cannot suppress. The result is zero files censused and zero output, which
reads as a pass. Measured on 2026-09-03: the `ls` form printed nothing in zsh while six Portuguese
files sat in the tree. `find` does not expand globs in the shell, so it gives the same 15 files in
both bash and zsh — verified as identical sets.


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
  -- '*.md' '*.txt' ':!docs/plans' ':!docs/pitches' ':!docs/product'
```
⚠️ **`:!docs/product` was added on 2026-09-03,** for the reason slice 02's sweep already carries:
`docs/product/legacy-docs-inventory.md` names all 26 documents by design, delete rows included, so
without that exclusion this gate can never be silent no matter how the work goes. It did not need
the exclusion when it was written, because the inventory did not exist yet.


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

## Outcome

All six `translate` files are in English and the prose census is silent. The set was six, not the
eight this document listed: three of its candidates — `docs/FINAL_TEST_SUMMARY.md`,
`docs/e2e-test-report.md` and `docs/DOCUMENTACAO_FASE3.md` — were marked `delete` by slice 01 and
are gone, and one file it did not list, `AUDITORIA_COMPLETA_PROBLEMAS.md`, was marked `translate`
and had a Portuguese filename too. The inventory decided the set, exactly as this document says it
should.

The quoted-literal rule worked as predicted, to the number. This slice measured 8 quoted lines in
`docs/acessibilidade-inclusiva.md` and called all 8 pure product copy; the translation lands at
exactly 8 marker lines, all of them inside double quotes, so the prose gate scores it 0 without
anyone translating a UI string. `TODO.md` and `docs/qa-gaps.md` each keep a couple more for the
same reason — a Portuguese status value and a Portuguese link label, both quoted.

### The `Done when` census was passing while six Portuguese files sat in the tree

`ls *.md *.txt *.html docs/*.md 2>/dev/null` stopped working the moment slice 02 deleted
`README_DOCUMENTACAO.txt`, the only `.txt` in the repository. zsh treats a glob with no match as a
hard error and aborts the command *before* `ls` runs, so `2>/dev/null` cannot suppress it. Measured
on 2026-09-03: the block printed nothing in zsh — which this document reads as a pass — with six
Portuguese documents present. The `find` form now used expands nothing in the shell and returns the
same 15 files in bash and zsh, verified as identical sets.

That is the third gate in this epic whose failure mode was a false pass, and the first where a gate
was broken by an *earlier slice of the same epic* rather than written wrong.

### Two renames, and one gate that could never be silent

`docs/acessibilidade-inclusiva.md` became `docs/inclusive-accessibility.md`, and
`AUDITORIA_COMPLETA_PROBLEMAS.md` became `docs/qa-gaps.md` — renamed and moved out of the repo root,
since an audit-gap list is not a conventional root file and `docs/` is where the internal docs live.
Both moved with `git mv`. Four references were repointed (`AGENTS.md`, `README.md`,
`INDICE_DOCUMENTACAO.md`, `LEIA_ME_PRIMEIRO.md`) and `pnpm run manuais:sync` carried the last two
into `public/manuais/`, with `manuais:check` confirming byte-identity afterwards.

The dangling-link gate needed `:!docs/product` added, for the reason slice 02's sweep already
carries: the inventory names all 26 documents by design, so without that exclusion the gate can
never be silent however the work goes. It did not need it when it was written, because the inventory
did not exist yet.

### Three documents were not just translated

Faithful translation would have preserved claims that other documents in the same repository
contradict, so those were resolved rather than restated in English:

- **`CHANGELOG.md`** was a 508-line sprint report. It claimed an implemented E2E suite, an Axe
  audit, NVDA testing and viewport validation at 375px — and `package.json` had no `"test"` script
  until 2026-09-03, while the audit reports themselves list the last three as never done. Now Keep
  a Changelog format, with the contradictions recorded under the `0.1.0` entry rather than dropped
  silently.
- **`TODO.md`** had 21 items marked open whose own body said `Prioridade: Concluído`. An open
  checkbox above a note that says done is not information. Twenty are listed for verification; the
  twenty-first, "UX mobile ✅ VALIDADO", is contradicted by `docs/qa-gaps.md` and is recorded as
  such.
- **`docs/qa-gaps.md`** narrowed two of its own items with evidence instead of inheriting them. The
  E2E gap said no flows were tested; four are, so it now names only the two that are not — admin
  managing companies, and logout and session expiry. The API gap now says the endpoints are
  exercised through the UI and never called directly.

`docs/inclusive-accessibility.md` lost 252 lines and no content: the original restated each
principle as a bullet list repeating its own heading.
