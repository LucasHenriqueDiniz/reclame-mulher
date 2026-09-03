---
status: done
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
- The file list is reproducible, not hand-kept. This is the census; call it `PT_MARKERS` below:

  ```bash
  for f in $(ls *.md *.txt *.html docs/*.md 2>/dev/null); do
    n=$(grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao' "$f")
    [ "$n" -gt 0 ] && printf '%s\t%s\t%s\n' "$n" "$(wc -l < "$f")" "$f"
  done | sort -rn
  ```

  Run on `693a79c` this prints **26 rows totalling 10,269 lines** — 20 at the repo root and 6 under
  `docs/` — with `MANUAL_PLATAFORMA.md` highest at 81 marker lines and
  `VALIDACAO_APP_FUNCIONANDO.md` lowest at 6. Exactly three of the globbed files score `0`:
  `README.md`, `AGENTS.md` and `docs/README.md`, the three that are already English. Confirm that
  separation rather than assuming it; it is what makes `-gt 0` safe instead of arbitrary.

  **Why the markers are whole words and mostly unaccented.** The earlier version of this command
  counted accented substrings (`ção|ções|não|está|usuári|reclamaç`) above a threshold of 15, and
  printed only 22 rows — it missed four files that are Portuguese written *without* accents:
  `docs/project-status.md` (0 accented hits), `docs/mvp-backlog.md` (0),
  `docs/acessibilidade-inclusiva.md` (1) and `PLANO_IMPLEMENTACAO_SPRINT.md` (13, under the
  threshold). Those four are precisely the ones slices 02 and 03 plan to delete or translate, so the
  base slice of the epic was handing the next two a list four files short. Note that `-w` is what makes
  words like `que`, `esta` and `dos` safe (they would otherwise match inside *question*, *estate*,
  *dose*) — and that `-w` also silently zeroes a substring marker, which is why `ção` is gone from the
  set: `grep -ciwE 'ção' MANUAL_PLATAFORMA.md` prints `0` where `grep -ciE` prints `128`.

## Tests

- The table has exactly as many rows as the census prints lines, and names each file by the same path
  the census prints (`docs/mvp-backlog.md`, not `mvp-backlog.md`) so the coverage gate can match it.
- Every row carries a disposition; `ask-owner` rows carry the question, not a shrug.
- The `delete` rows each say what makes the file dead — a superseded claim, a date, or a commit that
  replaced it. "Looks old" is not a reason.
- The rows for the nine files `INDICE_DOCUMENTACAO.md` names by filename are marked, because deleting
  or renaming one of those means editing the index in the same commit.

## Done when

Every censused file has a row — this is the gate, and it checks identity rather than arithmetic:

```bash
for f in $(ls *.md *.txt *.html docs/*.md 2>/dev/null); do
  n=$(grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao' "$f")
  [ "$n" -gt 0 ] && { grep -qF "$f" docs/product/legacy-docs-inventory.md 2>/dev/null \
    || echo "NOT IN INVENTORY: $f"; }
done
```

prints nothing. Today it prints 26 `NOT IN INVENTORY:` lines, one per censused file, because
`docs/product/legacy-docs-inventory.md` does not exist yet. Verified both directions: against a
complete stub inventory it prints 0 lines, and it returns to 26 the moment the file is removed.

And every row carries a disposition:

```bash
grep -cE '\| *`?(delete|translate|ask-owner|keep)`? *\|' docs/product/legacy-docs-inventory.md
```

prints `26`.

Two widenings against the form this slice first wrote, both forced by the delivered table and
both argued under *Outcome*: `keep` joins the alternatives, and the backticks are optional
because a disposition is a literal value and the document marks it as one. Note that the
summary of counts at the top of the inventory is a **list**, not a table, for this gate's
sake — a row shaped as a bare disposition in its own cell is counted too, and the first draft
read `27` because a paragraph explaining that hazard quoted one inline.

Counting `^| ` table lines was the earlier form of the first gate, expecting "26 plus the two header
rows". Two things were wrong with it: the separator row this repo writes as `|---|---|` has no space
after the pipe and so is never counted, making the expected total 27 rather than 28; and a row count
cannot tell you *which* file is missing. The loop above names it.

## If stuck

If a file resists classification because it is half dead report and half live reference — `TODO.md`
and `CHANGELOG.md` are the likely two — split the row, not the file: mark it `translate` and note
which sections get dropped during the translation. Do not invent a fourth disposition; three
categories that get acted on beat five that get discussed.

## Outcome

`docs/product/legacy-docs-inventory.md` holds 26 rows. Both gates pass, and gate 1 was verified
in both directions as the slice asks: `0` missing with the file present, `26` the moment it is
removed.

The census reproduced exactly — 26 files, and the three zero-scoring globbed files are
`README.md`, `AGENTS.md` and `docs/README.md`, the separation this slice said to confirm rather
than assume. Line total is 10,271 against the 10,269 measured at `693a79c`; the two extra are an
edit to `INDICE_DOCUMENTACAO.md` from the manuals delivery.

**`keep`, a fourth disposition.** This slice forbade inventing one. It was written before
2026-09-03, the day the owner decided the six-file manual family stays Portuguese — now recorded
in `ARCHITECTURE.md`, enforced by `pnpm run manuais:check`, and served at `/manuais`. For those
six files `delete` and `translate` both contradict a written decision and `ask-owner` re-asks an
answered question. The slice's reason for keeping the set at three was that "three categories that
get acted on beat five that get discussed"; `keep` is acted on, since slices 02 and 03 skip the
file, so it serves that reason instead of eroding it. Six of 26 rows.

**Two files read as dead reports and were not.** The slice predicted `TODO.md` and `CHANGELOG.md`
as the hard cases. `TODO.md` was one; `CHANGELOG.md` turned out simply live. The two that actually
resisted were `AUDITORIA_COMPLETA_PROBLEMAS.md`, whose "PROBLEMAS AINDA IDENTIFICADOS" is the only
surviving list of open gaps, and `STATUS_FINAL_PRODUCAO.md`, which carries two open items — the
four icon-link aria-labels and the login-form review — that exist nowhere else. Both were split
per this slice's own *If stuck* rather than deleted on the strength of their dates.

**Input for slice 02, which its plan does not have yet:** it cannot simply delete
`STATUS_FINAL_PRODUCAO.md`. Those two open items have to move into the surviving list first.

**`ask-owner` has no rows,** which is a finding and not a shrug: the table itself is the ask, so
every `delete` row is a proposal awaiting the review this slice was built to enable.

Two `delete` reasons were checked rather than asserted, because "looks old" is not a reason:
`docs/FINAL_TEST_SUMMARY.md` claims `20/20` passing when `package.json` had no `"test"` script
until `cfc2124` earlier today, and `MAPEAMENTO_TELAS_COMPLETO.md` maps 43 screens where
`find src/app -name page.tsx` counts 44.
