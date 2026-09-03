# Legacy documentation inventory

One row per Portuguese documentation file, with a disposition. Nothing is deleted or translated
here — slices 02 and 03 of the `portuguese-docs` epic act on this table, and the point is that the
owner reviews 26 rows instead of a 10,271-line diff.

## The census

The file list is reproducible rather than hand-kept:

```bash
for f in $(find . docs -maxdepth 1 \( -name '*.md' -o -name '*.txt' -o -name '*.html' \) -type f | sed 's|^\./||'); do
  n=$(grep -ciwE 'não|nao|está|esta|são|sao|que|para|uma|dos|das|usuário|usuario|reclamação|reclamacao' "$f")
  [ "$n" -gt 0 ] && printf '%s\t%s\t%s\n' "$n" "$(wc -l < "$f")" "$f"
done | sort -rn
```
⚠️ **`ls *.md *.txt *.html` is not the census command any more.** `README_DOCUMENTACAO.txt` was the
only `.txt` in the repository and slice 02 deleted it, so the `*.txt` glob now matches nothing —
and zsh treats a glob with no match as a hard error that aborts the whole command *before* `ls`
runs, which `2>/dev/null` cannot suppress. The result is zero files censused and zero output, which
reads as a pass. Measured on 2026-09-03: the `ls` form printed nothing in zsh while six Portuguese
files sat in the tree. `find` does not expand globs in the shell, so it gives the same 15 files in
both bash and zsh — verified as identical sets.


**26 files, 10,271 lines** — 20 at the repo root, 6 under `docs/`. Exactly three globbed files
score `0` and are correctly excluded: `README.md`, `AGENTS.md` and `docs/README.md`, the three
already in English. That clean separation is what makes `-gt 0` a real threshold rather than an
arbitrary one, and it was confirmed, not assumed.

(The slice measured 10,269 lines at `693a79c`. The two extra lines are an edit to
`INDICE_DOCUMENTACAO.md` made during the manuals delivery on 2026-09-03.)

## Dispositions

- **`delete` — 14 files, 3,954 lines.** Removed in slice 02.
- **`translate` — 6 files, 1,953 lines.** Rewritten in English in slice 03.
- **`keep` — 6 files, 4,364 lines.** Untouched: Portuguese on purpose.

Written as a list rather than a table on purpose. A summary row that put a bare
disposition in its own table cell would be counted by the disposition gate below, which
would then read 29 for 26 rows — and the first draft of this very paragraph tripped it
by quoting such a row inline, reading 27.

`keep` is a fourth disposition the slice told me not to invent, and the reason is in
**Divergence** at the bottom. `ask-owner` has no rows, also explained there.

`idx` marks a file `INDICE_DOCUMENTACAO.md` names by filename: deleting or renaming one of those
means editing the index in the same commit.

## The table

| file | lines | what it is | idx | disposition | why |
|---|---|---|---|---|---|
| `MANUAL_PLATAFORMA.md` | 999 | End-user manual | idx | `keep` | Product content for a Brazilian user. Owner decided 2026-09-03; recorded in `ARCHITECTURE.md`. Served at `/manuais` |
| `MANUAL_PLATAFORMA.html` | 1283 | End-user manual, HTML build | idx | `keep` | Same decision. `pnpm run manuais:check` keeps `public/manuais/` byte-identical to it |
| `FLUXOS_VISUAIS.md` | 758 | End-user flow diagrams | idx | `keep` | Same decision |
| `INDICE_DOCUMENTACAO.md` | 490 | Index of the manual family | — | `keep` | Same decision. It is the index the other five hang off, and it is served |
| `GUIA_RAPIDO.md` | 422 | End-user quick guide | idx | `keep` | Same decision |
| `LEIA_ME_PRIMEIRO.md` | 412 | End-user starting point | idx | `keep` | Same decision |
| `docs/inclusive-accessibility.md` — renamed 2026-09-03 from `docs/acessibilidade-inclusiva.md` | 600 | Design doctrine for low-literacy users — guidelines, not a report | idx | `translate` | Live reference. Internal doc, so English per `ARCHITECTURE.md`. The index cites it as a *path* under "Documentação Técnica" beside `src/db/schema.ts`, so translating the content does not break a reader's path |
| `TODO.md` | 440 | Operational backlog, P1–P4 | — | `translate` | Half live: the P2/P3/P4 items are real work. **Drop** the "Status base: 91 → 80 tarefas" header and the Sprint-3 completion markers — that is a dated snapshot, and `docs/qa-gaps.md` item 8 already says this file is stale |
| `CHANGELOG.md` | 508 | Version history from `[0.1.0]` on | — | `translate` | Live file that keeps growing. Translate entries in place rather than dropping them: a changelog's value is the sequence, so losing history to gain English is a bad trade |
| `docs/qa-gaps.md` — renamed and moved 2026-09-03 from `AUDITORIA_COMPLETA_PROBLEMAS.md` at the repo root | 142 | Audit of 2026-07-07 — *and* a list of 8 open gaps | — | `translate` | **Not dead.** "PROBLEMAS AINDA IDENTIFICADOS" is the only surviving list of open gaps: 2 (accessibility partly audited), 3 (responsiveness unvalidated), 4 (test data not loaded), 7 (production performance unknown) are all still open. **Drop** the "TESTES REALIZADOS" walkthrough log and items 1, 5 and 6, closed on 2026-09-03 by the Playwright suite and its CI job |
| `docs/project-status.md` | 209 | Describes the actual architecture — Next.js App Router, Drizzle, not Supabase | idx | `translate` | Live reference, and the only document that states what the stack actually is |
| `docs/mvp-backlog.md` | 54 | Technical backlog, P0/P1 | idx | `translate` | Live. Its P0 items (`onboardingCompletedAt`, `ProfilesRepo.getRequiredOnboardingStep`, company route roles) are **not** on the kanban board, so the board has not superseded it |
| `docs/FINAL_TEST_SUMMARY.md` | 461 | "Testes Totais: 20/20 Passando (100%)" | — | `delete` | The claim is false as written. `package.json` had no `"test"` script until `cfc2124` (2026-09-03) — there was no automated suite to pass. The NVDA transcript inside gives it away: this is a manual walkthrough tabulated as a test run |
| `docs/e2e-test-report.md` | 425 | "Relatório de Testes E2E", 07/07 | — | `delete` | Manual browser walkthrough. The first `e2e/*.spec.ts` landed 2026-09-03 (#11), so the name now points at a real Playwright suite with its own CI job — keeping this invites reading the wrong one |
| `RELATORIO_TESTES_E2E_COMPLETO.md` | 190 | Second write-up of the same 07/07 session | — | `delete` | Duplicate of the row above, same date, same event |
| `RELATORIO_TESTES_REAIS.md` | 212 | Manual session log against `http://localhost:5000` | — | `delete` | A port, a date, and no reproducible step. Superseded by the E2E suite |
| `VALIDACAO_APP_FUNCIONANDO.md` | 123 | Third write-up of that same localhost session | — | `delete` | Duplicate, same date, same server |
| `RELATORIO_AUDITORIA_FINAL.md` | 270 | Audit snapshot, 2026-07-07, "AUDITORIA COMPLETA" | — | `delete` | Dated snapshot with no open items; the gap list that survives is `docs/qa-gaps.md` |
| `RELATORIO_CORRECOES_ACESSIBILIDADE.md` | 225 | Write-up of the accessibility fixes — *and* 4 open items with pages and case counts | — | `delete` | ⚠️ **This row was incomplete when written.** It names its own commit `dfa9baa`, so the fixes are in git; but its "PROBLEMAS PENDENTES" section held two gaps recorded nowhere else. Slice 02 moved those into the surviving list before deleting, per *If stuck*. Two further items were audit-script false positives, verified in the code |
| `RELATORIO_FINAL_SPRINT_COMPLETO.md` | 452 | Sprint wrap-up, 07/07, "100%" | — | `delete` | Dated snapshot. Checked for open items: it lists none |
| `STATUS_FINAL_PRODUCAO.md` | 261 | Percentage dashboard: "80% PRONTO", "E2E parcial" | — | `delete` | Headline contradicted — the app is deployed and the E2E job is green. ⚠️ It does carry open items: responsiveness is `docs/qa-gaps.md` item 3, but **the 4 icon-link aria-labels and the login-form review are only here**. Slice 02 must move those two into the surviving list before deleting this |
| `docs/DOCUMENTACAO_FASE3.md` | 321 | "Fase 3" phase report | — | `delete` | Dated report for a phase that ended, 07/07 |
| `GITHUB_PUSH_SUMMARY.md` | 254 | Write-up of one push of 18 commits | — | `delete` | `git log` is that record, exactly and forever |
| `PLANO_IMPLEMENTACAO_SPRINT.md` | 134 | "Em Andamento" plan, "Estimativa 11-15 horas" | — | `delete` | A plan still marked in-progress for a sprint that ended on its own start date |
| `MAPEAMENTO_TELAS_COMPLETO.md` | 267 | Snapshot of 43 screens, "Em validação" | — | `delete` | Already drifted: `find src/app -name page.tsx` counts **44** today. `find` is the reproducible source and the doc is a copy that ages |
| `README_DOCUMENTACAO.txt` | 359 | ASCII-art index of the manual family, banner says "2025" | — | `delete` | Superseded by `INDICE_DOCUMENTACAO.md`, which does the same job and is the one actually served at `/manuais`. Its box-drawing characters are also mojibake in the committed bytes |

## Divergence from the slice

**`keep` is a fourth disposition, which the slice forbade.** The slice was written before
2026-09-03, the day the owner decided the six-file manual family stays Portuguese — a decision now
recorded in `ARCHITECTURE.md` and enforced by `pnpm run manuais:check`, with the manuals served at
`/manuais`. None of the three allowed dispositions is honest for those six: `delete` and
`translate` both contradict that decision, and `ask-owner` re-asks a question already answered in
writing.

The slice's stated reason for three categories is that "three categories that get acted on beat
five that get discussed". `keep` is acted on — slices 02 and 03 skip the file — so it serves that
reason rather than working against it. The `Done when` gate in slice 04 was widened to accept it.

**`ask-owner` has no rows,** and that is not a shrug. The table *is* the ask: the slice's own
premise is that the owner reviews dispositions rather than a diff, so every `delete` here is a
proposal awaiting exactly that review. The one classification I could not have made from evidence
— the manuals' language — was already decided by the owner.

**Two files resisted classification the way the slice predicted, but not the two it named.** It
expected `TODO.md` and `CHANGELOG.md` to be the half-dead ones. `TODO.md` was; `CHANGELOG.md` was
not, being simply live. The surprises were `docs/qa-gaps.md` and
`STATUS_FINAL_PRODUCAO.md`, which read as dated reports and turned out to be the only places some
open gaps are written down. Both rows were split per the slice's own guidance rather than deleted
on the strength of their dates.

## Slice 03: what the translations actually did

All six `translate` rows are in English, and the census scores each at 0. Three of them shrank by
more than half, because the dated snapshot inside them went with the translation rather than
surviving it in another language:

| file | was | now | what came out |
|---|---|---|---|
| `TODO.md` | 440 | 84 | The completed P1 section and the sprint summary. 21 items were marked open with a note in their own body claiming they were done; 20 are listed for verification and one is contradicted by `docs/qa-gaps.md` |
| `CHANGELOG.md` | 508 | 80 | It was a sprint report, not a changelog. Now Keep a Changelog format. Its claims of a passing E2E suite, an Axe audit, NVDA testing and 375px validation are all contradicted by the documents that recorded the same work |
| `docs/inclusive-accessibility.md` | 600 | 348 | Nothing removed — the original repeated each principle as a bulleted restatement of its own heading. Every quoted product string stayed Portuguese |
| `docs/qa-gaps.md` | 142 | 91 | The walkthrough log and the percentage dashboards. Two items were narrowed rather than closed: the E2E gap now names only the two flows still uncovered, and the API gap says it is exercised through the UI |
| `docs/project-status.md` | 209 | 160 | Only prose compression. The `components.json` complaint went, since it now points at the files that exist |
| `docs/mvp-backlog.md` | 54 | 62 | Grew: two items closed since it was written are recorded as closed, with dates |
