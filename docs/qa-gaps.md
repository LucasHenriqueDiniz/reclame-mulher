# QA gaps

What has not been verified, as opposed to what is architecturally wrong — that list lives in
`docs/architecture/ARCHITECTURE.md` under *Known gaps*, and the two overlap only on coverage.

Started as an audit on 2026-07-07 that walked 12 public pages and confirmed 8 gaps. The walkthrough
log and the percentage dashboards that came with it are gone: they were a snapshot, and a snapshot
of test coverage ages faster than anything else in a repository. What follows is what is still open.

Reviewed 2026-09-03, after a test runner arrived.

## 1. Accessibility is only partly audited

**Severity:** medium.

Homepage, login and register were checked by hand, with no Axe run. 37 or more pages have never
been through an automated audit, and neither dark mode nor 200% zoom has been checked at all.
Manual validation does not get you to WCAG AA.

Three located items, inherited from two accessibility reports deleted on 2026-09-03. They were
recorded only there. The originals are in `git log --diff-filter=D --name-only` for that commit —
deliberately not named here, since a filename that no longer exists sends a reader looking for
something that is not there. The report with the most detail named commit `dfa9baa`, which is still
in history:

- **Icon links with no accessible name — 4 cases.** Pages `/`, `/blog`, `/companies`. Decorative
  icons and SVGs inside links, with no `aria-label`. Medium priority: it affects screen readers.
- **Login form labels — 2 cases.** Page `/login`. The email and password inputs are not detected by
  the audit; the password field is a custom component, so review `PasswordField.tsx` for associated
  labels.
- **Testing with a real screen reader (NVDA or JAWS).** Never done. What exists is manual and
  visual.

Two further items from those reports were **not** carried over, because the reports call them audit
false positives and that was checked in the code rather than believed: `/blog` does have an `<h1>`,
at `src/app/blog/page.tsx:136`, and the "Pular para conteúdo principal" link is at
`src/app/layout.tsx:48` with `sr-only focus:not-sr-only`. The script missed both because it parses
static HTML with BeautifulSoup.

## 2. Responsiveness is unvalidated

**Severity:** medium.

Nothing has been tested at mobile 375px, tablet 768px or desktop 1920px. The likely failures are
overflow, touch targets too small, and layout breaking on mobile.

## 3. Test data is not confirmed in the database

**Severity:** medium.

`scripts/seed.ts` creates four test users, but whether they are in the database at any given moment
is not something any check asserts. Without them there is no real login, so the dashboards cannot
be exercised by hand. Run `pnpm run seed` first. The password is `defaultPassword` in
`scripts/seed.ts` — read it there rather than copying it into another document.

## 4. Two end-to-end flows are still uncovered

**Severity:** medium. Narrowed on 2026-09-03: this was "no E2E flows are tested" and most of it is
now false.

The Playwright suite covers four of the flows this listed — a person filing a report through the
four-step wizard, a company replying and moving the status, the author seeing that reply, and
post-login routing for all three roles. What it does not cover:

- **Admin managing companies.** `app/admin/companies` is still a placeholder, so there is nothing
  to drive yet.
- **Logout and session expiry.** A signed-out visitor being redirected is covered; signing out, and
  a token expiring mid-session, are not.

## 5. The API is exercised only through the UI

**Severity:** medium. Also narrowed on 2026-09-03.

`POST`, `PUT` and `DELETE` have no direct tests. The end-to-end suite reaches some of them through
the browser — the wizard posts a complaint, the reply flow moves a status, the settings screen
changes a password — so "the backend may be broken" no longer holds for those paths. Everything
else has never been called by a test.

## 6. Production performance is unknown

**Severity:** medium.

The optimised build, caching and compression have never been measured. The only numbers on record
came from a dev server with hot reload, which says nothing about production.

## 7. `TODO.md` overstates how done things are

**Severity:** medium.

It carried a "ready for production" status while whole areas were untested. P1 is implemented but
not fully verified; P2 and P3 were marked complete informally; P4 was never started.
