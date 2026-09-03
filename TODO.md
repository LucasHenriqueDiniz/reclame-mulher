# TODO

Operational backlog. The architectural violations are in `docs/architecture/ARCHITECTURE.md` under
*Known gaps*, and what has not been verified is in `docs/qa-gaps.md`; this file is the work queue.

Two things were dropped when this was translated on 2026-09-03, both dated snapshot rather than
backlog: the completed P1 section — 11 items closed in one sprint, each annotated "PASSOU EM
TESTES" at a time when `package.json` had no test script at all — and the sprint summary that
followed it. They are in git.

## How to read this

The original list had 63 items marked open, and **21 of them carried a note in their own body
saying they were finished** — "Prioridade: Concluído", "Concluído informalmente",
"Funcional" or "Concluído para MVP" — all under an unticked box. An open checkbox above a note that says done is
not information, so 20 of them are separated out below rather than left mixed in, and the
twenty-first is in the last section because evidence contradicts it. Nothing here asserts the 20
are done; they are the ones to verify first, because verifying is cheaper than redoing.

## P2 — core features

- [ ] Review the contracts of the main repos.
- [ ] Standardise how server-side operations return an error. Partially done.
- [ ] Review the complaint, company, project and message DTOs. Zod validation is in place, so this
      is a review rather than a build.
- [ ] Add sending, error and success states to the message UI. Only the basics are there.
- [ ] Standardise the empty states on the complaint screens.
- [ ] **Document the real authorisation model.** Only partly written down, and it is the highest
      priority in this section: the code enforces rules nobody can read.
- [ ] Cover the company, complaint and admin rules — implemented in the backend, never verified.
- [ ] Consolidate the main cards on the company dashboard.
- [ ] Define the minimum set of notification events.
- [ ] Build the sending structure, or the queue that replaces it.
- [ ] Define the contract for locality data. What exists is mock data.

## P3 — views and refinements

- [ ] Review the public company profile layout.
- [ ] Show the main metrics on the company profile. Only basic ones so far.
- [ ] Build contact preferences on the person profile. The fields are prepared.
- [ ] Review the reporter's complaint listing and its filters.
- [ ] Build a high-contrast mode. Not required for the MVP.
- [ ] Evaluate TTS or assisted reading.
- [ ] OAuth: settle the providers (Google and Facebook were named), design the callback strategy,
      and reconcile existing accounts by email.
- [ ] Review the Markdown editor in the blog CMS.
- [ ] Standardise the status filters and the text search, and keep filters in the URL where it
      helps.
- [ ] Review the copy and calls to action on the empty states.
- [ ] Review the loading skeletons.

## P4 — post-MVP

- [ ] Settle the user feedback model, and build administrative triage for it.
- [ ] Advanced auditing: filters by action and entity, and exporting administrative logs.
- [ ] Compound filters on complaints and companies.

## Claimed done, never ticked

Each carries a "Concluído" note of some kind in the original. Verify, then tick or reopen.

- A reusable message composer, and standardised status badges on complaints.
- The company dashboard's inbox, projects and profile wired to real data.
- Full password change, and account and profile editing in settings.
- On the company profile: active projects, public complaints, and empty states.
- On the person profile: the personal data view and the complaint history.
- The reporter's complaint detail page.
- The company's complaint inbox, detail page and status change.
- In the blog CMS: image upload through UploadThing, tags, and draft versus published.
- The consistent mock for the works/map view, marked "Concluído para MVP".

## Claims that did not survive review

The original marked these done. `docs/qa-gaps.md` is built from the pending lists of the audit
reports that actually ran, and it contradicts them:

- **"UX mobile: ✅ VALIDADO EM FASE 3."** Nothing has been tested at 375px. See `qa-gaps` item 2.
- **"✅ WCAG AA COMPLIANT"** on the complaint flow, and an accessibility section headed
  "✅ VALIDADA". Three located items are open — 4 icon links with no accessible name, 2 login form
  labels, and screen-reader testing never done. See `qa-gaps` item 1.
- **"Screen reader compatibility ✅ testado."** It was not. Same item.

Basic contrast, visible focus, error text, form labels and keyboard navigation were reviewed, and
those four remain ticked — no evidence contradicts them.
