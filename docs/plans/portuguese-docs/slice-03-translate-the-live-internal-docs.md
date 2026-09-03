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

- Every `translate` file passes the Portuguese-marker grep with zero hits.
- Renamed files were moved with `git mv`, so the history follows.
- Every reference to a renamed file — in `docs/README.md`, in `INDICE_DOCUMENTACAO.md`, in
  `AGENTS.md`, in any wiki-link — points at the new name.
- **Product literals quoted inside these docs stay Portuguese.** `docs/acessibilidade-inclusiva.md`
  quotes user-facing copy; the prose around a quote is translated, the quote is not. Translating a
  quoted UI string makes the doc wrong about the app.

## Done when

```bash
grep -rlciE 'ção|ções|não|está|usuári' --include='*.md' --include='*.txt' \
  . --exclude-dir=node_modules --exclude-dir=.git | \
  grep -vE 'MANUAL_PLATAFORMA|GUIA_RAPIDO|FLUXOS_VISUAIS|LEIA_ME_PRIMEIRO|INDICE_DOCUMENTACAO'
```

prints nothing — every Portuguese doc left is one of the six manual-family files (five name patterns,
because `MANUAL_PLATAFORMA` matches both the `.md` and the `.html`) that slice 04 is still waiting on
the owner for. `README_DOCUMENTACAO.txt` rides with them; add it to the exclusion if the inventory
grouped it there.

And no link dangles:

```bash
grep -rn 'acessibilidade-inclusiva\|DOCUMENTACAO_FASE3' --include='*.md' . --exclude-dir=node_modules
```

prints nothing.

## If stuck

If translating one of the long files stalls — `docs/acessibilidade-inclusiva.md` at 600 lines is the
risk — do not leave it half-English. Half-translated is worse than untranslated: a reader cannot tell
which half is current. Move it to `docs/archive/` in Portuguese, note it in the inventory, and finish
the rest. `docs/pitches/README.md` already establishes `archive/` as a folder the tooling skips.
