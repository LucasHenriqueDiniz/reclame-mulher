---
status: done
tags:
  - area/docs
kanban: 54f4684f-69b3-4647-aa9a-73a01f69b65e
---

# Slice 04 — Deliver the end-user manuals this weekend

> **Delivered 2026-09-03, two days before the deadline.** All three gates pass: the six files are
> under `public/manuais/`, all six filenames appear in `src/app`, and the marker counts still read
> `55 79 41 38 63 61` with `/usr/bin/grep` — no manual content was touched.
>
> `INDICE_DOCUMENTACAO.md` moved 38 → 39, the one file the gate allows to move, and it is +1 for one
> reason: the `Traduza GUIA_RAPIDO.md para EN e ES` line now says translating the manuals is product
> i18n living next to `src/messages/`, not a debt this epic owes.
>
> Mechanism: `/manuais` indexes the family; `/manuais/<slug>` renders the five Markdown manuals as
> pages with the `ReactMarkdown` the blog already uses, so they are read rather than downloaded;
> `MANUAL_PLATAFORMA.html` is linked at its static URL because it already renders on its own. One
> line was added to `QUICK_LINKS` in `/ajuda` — the diff on that file is 2 insertions, 0 deletions,
> and the seed-password block is untouched.
>
> The index checked out: the audience table at :168-175 references only files that exist. The two
> names an automated sweep flags as missing — `GUIA_RAPIDO_EN.md` and `MANUAL.md` — are inside the
> "Suporte Multilíngue" section, one in a shell example and one in a table of *planned* translation
> priorities. Aspirational text, not broken links, and deliberately left alone.

**Answered by the owner on 2026-09-03: the six manual-family files are product content, and they
have to be delivered this weekend — Saturday 2026-09-05 / Sunday 2026-09-06. They are the focus of
the epic, not its tail.**

Two things follow.

**They stay Portuguese.** They fall under the `product language` divergence
`docs/architecture/ARCHITECTURE.md` already records — text read by a Brazilian user is a product
literal, not repo prose. Translating them was never the cheap option and is now the wrong one: it is
a regression a user would find, not CI. Delete is off the table for the same reason.

**And the work is no longer a decision, it is a delivery.** The question this slice carried is
answered, so nothing here waits on the owner any more. What is left is that the six files are not
reachable by anyone using the app — `/usr/bin/grep -rF` over `src/` and `public/` for the six
filenames matches nothing today, exit 1 — and the deadline is two days out. That is what the
`Done when` below measures:
a user can open them, by the weekend. Recording the answer in `ARCHITECTURE.md` is bookkeeping that
rides along; it is not the deliverable and it is not the gate.

## Delivers

The six manuals reachable from the running app, and the architecture file telling the truth about
why they are in Portuguese.

The six files, 4,362 lines, unchanged in content:

| file | lines | what it is for delivery |
|---|---|---|
| `MANUAL_PLATAFORMA.html` | 1,283 | the one a browser renders as-is; the primary artifact |
| `MANUAL_PLATAFORMA.md` | 999 | same manual in Markdown; needs a renderer or a download |
| `FLUXOS_VISUAIS.md` | 758 | flows, Markdown |
| `INDICE_DOCUMENTACAO.md` | 488 | the family's own index; routes readers by audience |
| `GUIA_RAPIDO.md` | 422 | the short one; `INDICE_DOCUMENTACAO.md:191` sends it to support |
| `LEIA_ME_PRIMEIRO.md` | 412 | the entry point, Markdown |

## Needs

- **The weekend.** Two days, and the delivery surface does not exist yet. This is the only slice in
  the epic with a date attached.
- **No new dependency.** `react-markdown` and `remark-gfm` are already in `package.json` and already
  used to render user-facing Markdown — `src/app/blog/[slug]/page.tsx:11` imports `ReactMarkdown`.
  Rendering the five `.md` manuals in a page is the same move the blog already makes. A raw `.md`
  under `public/` is served with a type the browser downloads rather than renders, so shipping the
  Markdown family as static files alone delivers a download, not a page. Decide which of the two you
  are promising before the weekend, not during it.
- **`/ajuda` is the attachment point, and it is a product page — add to it, do not rewrite it.**
  `src/app/ajuda/page.tsx:56-65` is a `Links Rápidos` array of `{ href, label, icon }`; a manual link
  is one more entry. The same page prints the seed password in clear text with a copy button
  (`:130`, `:183-184`) because that is how an evaluator signs in. A bulk edit over this repo already
  rewrote that block once and would have shipped a page telling users to read a TypeScript file; it
  was reverted at `b5f1735`. Anything that touches `src/app/ajuda/` gets read line by line.
- **The family's own distribution checklist**, `INDICE_DOCUMENTACAO.md:179-199`, which is a delivery
  plan written before this epic existed: *"Coloque MANUAL_PLATAFORMA.html em site de
  help/documentação"*, *"Criar link no README.md principal"*, *"Envie GUIA_RAPIDO.md para suporte ao
  cliente"*. The first two are in scope this weekend. The third is not a repo change.
- Slice 01's inventory, so the six are handled as a known set rather than an impression.

The audience table at `INDICE_DOCUMENTACAO.md:168-175` routes readers as *"Pessoa (criar
reclamação)"*, *"Empresa (responder)"*, *"Admin/Moderador"* and *"Gestor Geral"* — which is what
product content looks like — but two of its six rows are *"Desenvolvedor"* and *"Designer/PM"*. That
mixed audience is why the question needed the owner instead of a reading. It is recorded here so the
next person does not mistake it for a reason to reopen a decision that has been made.

## Tests

- The six files are reachable from a user-facing surface, and the link works from a cold load rather
  than only in the editor.
- **Their content is not touched.** No translation, no deletion, no reflow. The `Done when` guard
  below pins this with numbers, because "I only reformatted it" is how a manual gets translated by
  accident.
- `ARCHITECTURE.md` moves these six out of `Known gaps` and into the `Divergences` table, under the
  existing `product language` row or as a row of its own. A gap says nobody has decided; these are
  decided.
- The same edit corrects that bullet's stale numbers. It reads "28 documentation files … (~7,500
  lines): 22 at the repo root, 6 in `docs/`". Slice 01's census measures **26 files, 10,269 lines, 20
  at the repo root and 6 under `docs/`**. Only the `docs/` count and the "indexes nine of them by
  filename" claim hold. What is left of that bullet after the six manuals leave it is the genuine
  remainder — the files slices 02 and 03 still owe.
- `INDICE_DOCUMENTACAO.md` is reconciled: it indexes nine files by filename and slice 02 will have
  deleted some of them. A delivered index that points at a deleted file is a delivered bug.
- `INDICE_DOCUMENTACAO.md:198` — *"Traduza GUIA_RAPIDO.md para EN e ES"* — is now a product-i18n item
  next to `src/messages/`, not a docs-translation item this epic owes. Say so or drop the line;
  leaving it makes the file argue against the decision.

## Done when

**The manuals are served.** Next serves everything under `public/` at the site root, so this asks
where the bytes are without dictating a subdirectory:

```bash
for f in MANUAL_PLATAFORMA.html MANUAL_PLATAFORMA.md FLUXOS_VISUAIS.md \
         INDICE_DOCUMENTACAO.md GUIA_RAPIDO.md LEIA_ME_PRIMEIRO.md; do
  [ -n "$(find public -type f -name "$f")" ] || echo "NOT SERVED: $f"
done
```

prints nothing. Today it prints six `NOT SERVED:` lines, one per file. Verified in both directions:
copying `GUIA_RAPIDO.md` into `public/manuais/` drops the output to five lines, and deleting that copy
returns it to six.

**And they are linked from a page, not just sitting in `public/`:**

```bash
for f in MANUAL_PLATAFORMA.html MANUAL_PLATAFORMA.md FLUXOS_VISUAIS.md \
         INDICE_DOCUMENTACAO.md GUIA_RAPIDO.md LEIA_ME_PRIMEIRO.md; do
  /usr/bin/grep -rqF "$f" src/app 2>/dev/null || echo "NOT LINKED: $f"
done
```

prints nothing. Today: six `NOT LINKED:` lines. A file served at a URL nobody links is not delivered,
it is uploaded — that is why this is two gates and not one.

**And the manuals still say what they said.** Slice 01's marker grep, run over the six originals at
the repo root:

```bash
for f in MANUAL_PLATAFORMA.html MANUAL_PLATAFORMA.md FLUXOS_VISUAIS.md \
         INDICE_DOCUMENTACAO.md GUIA_RAPIDO.md LEIA_ME_PRIMEIRO.md; do
  printf '%s\t%s\n' "$(/usr/bin/grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao' "$f")" "$f"
done
```

still prints `55`, `79`, `41`, `38`, `63`, `61` in that order. Any number that falls is Portuguese
that left a product file, which is the regression this slice exists to avoid. `INDICE_DOCUMENTACAO.md`
is the one file whose count may legitimately move, because the `Tests` above reconcile its index and
its translation line; if it moves, say by how much and why in the commit.

**Two shell traps, both of which produce a near-pass rather than an error.**

`/usr/bin/grep` is spelled out on purpose. A bare `grep` is not the system `grep` in this repo's
working shell: the interactive profile defines a `grep` shell function that execs `ugrep 7.8.4`, and
the two disagree on `-w` next to an accented character. The same loop, same files, same minute, prints
`56 81 53 38 65 61` through the function and `55 79 41 38 63 61` through `/usr/bin/grep` —
`FLUXOS_VISUAIS.md` differs by twelve. Slice 01's census is quoted in the shim's numbers (it names
`MANUAL_PLATAFORMA.md` "highest at 81"), so a reader comparing that slice to this one will find a
mismatch that is measurement, not drift; this gate pins the binary so the numbers above mean one
thing. Not corrected in slice 01 here — that is its own edit, and re-running its whole census belongs
with it.

Write the six filenames out literally, as above, rather than through a variable. `for f in $MANUALS`
does not word-split under `zsh`: it passes all six names as one argument, and every gate then reports
a single line instead of six — which reads as five of six passing.

The gate this replaces asked `ARCHITECTURE.md` for a decision entry naming `MANUAL_PLATAFORMA`. It
was the right gate while the question was open and it is the wrong one now: the owner has answered, so
that check would pass on a commit that writes a paragraph and delivers nothing to a user. The
`ARCHITECTURE.md` edit stayed in `Tests`, where bookkeeping belongs.

## If stuck

If the weekend runs out with the surface half-built, ship `MANUAL_PLATAFORMA.html` alone and link it
from `/ajuda`. It is 1,283 lines, it renders in a browser with no page work, and it is the file the
family's own checklist names for a help site. That is a partial delivery that a user can read, which
beats five Markdown files behind a renderer that is not finished. Leave the two gates failing on the
other five and say which.

If the delivery ends up going through a route that reads the manuals from the repo root instead of
static files under `public/`, the first gate is wrong for the mechanism and gets rewritten to hit the
route in the same commit that changes the mechanism. Do not leave a gate that passes for a reason
nobody intended.

Do not translate the manuals to make the epic tidy, and do not delete them to make the census smaller.
The owner answered that question; both of those are now regressions with a deadline attached.

The filename still reads `slice-04-decide-the-manual-family.md` after the slice stopped being a
decision. Kept deliberately: nothing in the repo references it by path — `/usr/bin/grep -rn` for
`decide-the-manual-family` outside this file returns zero hits, exit 1 — and the board tracks the card
by the `kanban:` id in the frontmatter, not by the path, so a rename would buy a diff and nothing else.
