---
status: active
epic: docs
tags:
  - area/docs
  - status/active
---

# Portuguese documentation

## Problem

**26 documentation files, 10,269 lines, are entirely in Portuguese.** Counted on `643e3fb` with a
Portuguese-marker grep (`ção|ções|não|está|usuári|reclamaç|…`) over every `.md`, `.txt` and `.html`
at the repo root and in `docs/`:

| where | files | lines |
|---|---|---|
| repo root | 20 (19 `.md`/`.txt` + `MANUAL_PLATAFORMA.html`) | 8,173 |
| `docs/` | 6 | 2,096 |

The `language` skill says everything that lands in a repo is English, and
`docs/architecture/ARCHITECTURE.md` already carries the exception this project claims: product content
read by a Brazilian user — `src/messages/pt-BR/`, `email-templates/`, user-visible JSX — stays
Portuguese. Documentation is not on that list.

**But a bulk translation is the wrong fix, because these files are not one kind of thing.** Three
kinds sit in the same directory:

1. **Dead sprint reports.** `RELATORIO_AUDITORIA_FINAL.md`, `RELATORIO_TESTES_E2E_COMPLETO.md`,
   `RELATORIO_TESTES_REAIS.md`, `RELATORIO_CORRECOES_ACESSIBILIDADE.md`,
   `RELATORIO_FINAL_SPRINT_COMPLETO.md`, `AUDITORIA_COMPLETA_PROBLEMAS.md`, `STATUS_FINAL_PRODUCAO.md`
   ("80% pronto"), `GITHUB_PUSH_SUMMARY.md`, `VALIDACAO_APP_FUNCIONANDO.md`,
   `MAPEAMENTO_TELAS_COMPLETO.md`, `PLANO_IMPLEMENTACAO_SPRINT.md` — 11 files, 2,530 lines. Their
   commit messages say what they are — `8417a87 docs: status final de produção - 80% pronto`,
   `18c75b2 docs: resumo do push para github - 18 commits enviados`.
   Translating a stale report produces a stale report in English.
2. **End-user manuals.** `MANUAL_PLATAFORMA.md` (999 lines) and `.html` (1,283), `FLUXOS_VISUAIS.md`,
   `INDICE_DOCUMENTACAO.md`, `GUIA_RAPIDO.md`, `LEIA_ME_PRIMEIRO.md` — 6 files, 4,362 lines.
   `INDICE_DOCUMENTACAO.md` routes readers to these by
   audience — *"Pessoa (criar reclamação)"*, *"Empresa (responder)"*, *"Admin/Moderador"* — which is
   the description of product content, not of internal prose.
3. **Live internal docs.** `docs/acessibilidade-inclusiva.md`, `docs/mvp-backlog.md`,
   `docs/project-status.md`, `docs/DOCUMENTACAO_FASE3.md`, `docs/FINAL_TEST_SUMMARY.md`,
   `docs/e2e-test-report.md`, `TODO.md`, `CHANGELOG.md` — 8 files, 3,018 lines. Plus
   `README_DOCUMENTACAO.txt` (359), the one file whose kind is genuinely unclear: it is an index of
   the manuals, written as a plain-text readme.

**And a rename breaks a link silently.** `INDICE_DOCUMENTACAO.md` names nine of these files by
filename across 15 lines — headings, an audience table, and a checklist. Nothing resolves those; they
are plain text.

## Solution

Decide per file before touching any file, then execute in the order that shrinks the problem fastest:
delete the dead, translate the live, and leave the manuals to the owner.

## Surface

Every file in the table above, plus `INDICE_DOCUMENTACAO.md`, `docs/README.md`, and the `Known gaps`
list in `docs/architecture/ARCHITECTURE.md`, which records this gap and has to be updated when it
closes.

## Scope

**In.** Documentation prose: `.md`, `.txt` and `.html` at the repo root and in `docs/`.

**Out.** `src/messages/pt-BR/`, `email-templates/`, Zod messages in `src/server/dto/*`, and
user-visible JSX strings. All four are product literals, and `ARCHITECTURE.md` already records the
divergence and its argument.

**Out.** `src/app/ajuda/` and `src/app/empresas/`. A route segment is a public URL — changing one is a
redirect question, and `ARCHITECTURE.md` lists it as its own gap.

**Out.** `.opencodeshare/` (9 files, still Portuguese). Which of `AGENTS.md` and `.opencodeshare/` is
canonical is an open owner decision, so translating the loser would be wasted work.

## Open questions

**Are the end-user manuals product content?** If yes they stay Portuguese under the existing
divergence and this epic simply records that. If no they are internal docs and get translated or
deleted. Only the owner can answer, and slice 04 carries the question.

## Done

```bash
grep -rlciE 'ção|não|usuári' --include='*.md' --include='*.txt' . --exclude-dir=node_modules | wc -l
```

returns only the files the owner decided to keep in Portuguese, and every one of those is named in
`docs/architecture/ARCHITECTURE.md` as a recorded divergence rather than as a gap.
