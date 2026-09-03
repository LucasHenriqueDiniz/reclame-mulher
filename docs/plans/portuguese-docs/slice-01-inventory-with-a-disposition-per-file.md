---
status: todo
tags:
  - area/docs
kanban: 29067c2b-d8c3-49df-bb61-43e5742d7aec
---

# Slice 01 — An inventory with one disposition per file

## Delivers

`docs/product/legacy-docs-inventory.md` exists: one row per Portuguese documentation file, with its
line count, what it is, and one of three dispositions — `delete`, `translate`, `ask-owner`.

Nothing is deleted or translated in this slice. It exists so that the two slices after it are
mechanical, and so the owner reviews a table instead of a 10,269-line diff.

## Needs

- Nothing. It reads.
- ~45 minutes: the 26 files are long but only need skimming for kind, not for content. The biggest
  three are `MANUAL_PLATAFORMA.html` (1,283), `MANUAL_PLATAFORMA.md` (999) and `FLUXOS_VISUAIS.md`
  (758).
- The file list is reproducible, not hand-kept:

  ```bash
  for f in $(ls *.md *.txt *.html docs/*.md 2>/dev/null); do
    n=$(grep -ciE 'ção|ções|não|está|usuári|reclamaç' "$f")
    [ "$n" -gt 15 ] && echo "$(wc -l < "$f")	$f"
  done | sort -rn
  ```

  On `643e3fb` this prints 26 rows. `README.md`, `AGENTS.md` and `docs/README.md` fall below the
  threshold and are already English — confirm that rather than assuming it.

## Tests

- The table has exactly as many rows as the command above prints lines.
- Every row carries a disposition; `ask-owner` rows carry the question, not a shrug.
- The `delete` rows each say what makes the file dead — a superseded claim, a date, or a commit that
  replaced it. "Looks old" is not a reason.
- The rows for the nine files `INDICE_DOCUMENTACAO.md` names by filename are marked, because deleting
  or renaming one of those means editing the index in the same commit.

## Done when

```bash
test -f docs/product/legacy-docs-inventory.md && \
  grep -c '^| ' docs/product/legacy-docs-inventory.md
```

prints a number equal to 26 plus the two header rows, and

```bash
grep -cE '\| *(delete|translate|ask-owner) *\|' docs/product/legacy-docs-inventory.md
```

prints `26` — every file classified, none left blank.

## If stuck

If a file resists classification because it is half dead report and half live reference — `TODO.md`
and `CHANGELOG.md` are the likely two — split the row, not the file: mark it `translate` and note
which sections get dropped during the translation. Do not invent a fourth disposition; three
categories that get acted on beat five that get discussed.
