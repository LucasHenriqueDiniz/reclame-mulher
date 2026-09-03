---
status: blocked
tags:
  - area/docs
kanban: 54f4684f-69b3-4647-aa9a-73a01f69b65e
---

# Slice 04 — Decide whether the end-user manuals are product content

**BLOCKED on an owner decision, and the board will not carry this line — a blocked card keeps its
column.** The question is whether the six manual-family files are product content read by Brazilian
users, or internal documentation. If product, they stay Portuguese under the divergence
`docs/architecture/ARCHITECTURE.md` already records and this slice closes by writing that down. If
internal, they are 4,362 lines of translation or deletion. Nobody but the owner can answer it, and
the answer changes the work by an order of magnitude, so guessing is not a cheaper option.

## Delivers

An answer, recorded as a decision entry in `docs/architecture/ARCHITECTURE.md` — and then whichever of
the two follow-up slices the answer implies, written into this directory as `slice-05`.

The six files, 4,362 lines on `643e3fb`:

| file | lines |
|---|---|
| `MANUAL_PLATAFORMA.html` | 1,283 |
| `MANUAL_PLATAFORMA.md` | 999 |
| `FLUXOS_VISUAIS.md` | 758 |
| `INDICE_DOCUMENTACAO.md` | 488 |
| `GUIA_RAPIDO.md` | 422 |
| `LEIA_ME_PRIMEIRO.md` | 412 |

## Needs

- **The owner.** That is the block.
- Slice 01's inventory, so the question is asked about a known set rather than an impression.

The evidence to put in front of them, so the question is answerable in one pass: `INDICE_DOCUMENTACAO.md`
lines 168–176 route readers by audience — *"Pessoa (criar reclamação)"*, *"Empresa (responder)"*,
*"Admin/Moderador"*, *"Gestor Geral"* — and lines 186–198 are a rollout checklist that says to put
`MANUAL_PLATAFORMA.html` on a help site and send `GUIA_RAPIDO.md` to customer support. That reads as
product content. Against it: none of these is served by the app, and
`INDICE_DOCUMENTACAO.md:198` says *"Traduza GUIA_RAPIDO.md para EN e ES"* — the file's own plan was
always to be translated.

## Tests

- `ARCHITECTURE.md` gains a dated decision entry naming all six files and the choice.
- If the answer is *product*: the `Known gaps` bullet about 28 Portuguese documentation files is
  rewritten to name only what is actually a gap, and these six move to the Divergences table. That
  bullet's numbers are stale and get corrected in the same edit: slice 01's census measures **26 files,
  10,269 lines, 20 at the repo root and 6 under `docs/`**, not "28 … (~7,500 lines): 22 at the repo
  root, 6 in `docs/`". Only the `docs/` count and the "indexes nine of them by filename" claim hold.
- If the answer is *internal*: `slice-05` exists in this directory with its own `Done when`, and the
  gap bullet stays until it ships.
- Either way `INDICE_DOCUMENTACAO.md` is reconciled — it indexes nine files by filename, and slice 02
  will have deleted some of them.

## Done when

```bash
awk '/^## Decisions/{d=1;next} /^## Divergences/{d=0} d' docs/architecture/ARCHITECTURE.md \
  | grep -c MANUAL_PLATAFORMA
```

prints `1` or more, and

```bash
awk '/^## Known gaps/{d=1} d' docs/architecture/ARCHITECTURE.md | grep -c MANUAL_PLATAFORMA
```

prints `0`. Today both print `0`, so the first is what turns over. A gap says nobody has decided; a
decision says somebody has, which is the whole deliverable of this slice.

The bare `grep -n 'MANUAL_PLATAFORMA' docs/architecture/ARCHITECTURE.md` this replaces also failed
today (it printed nothing, exit 1), but it could not tell the two sections apart — adding the six
filenames to `Known gaps` would have satisfied it while deciding nothing. The `awk` window is bounded
by `## Divergences`, the section that follows `## Decisions` in that file. Entries there are shaped
`### D3 — …` with a `**Decision.** … Decided 2026-09-02.` line; match that shape.

## If stuck

If the owner is unreachable for long enough that this blocks the epic, ship slices 02 and 03 without
it — they are independent, they remove 2,530 lines and translate 3,018, and neither touches these six
files. Do not default to translating the manuals to unblock yourself: a Portuguese manual that a
Brazilian user reads is working software, and translating it is a regression that would be discovered
by a user, not by CI.
