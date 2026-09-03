# Technical backlog

Ordered by priority. P0 is what blocks calling the product complete; the last section is work that
was deliberately dropped.

## P0

- Persist `onboardingCompletedAt` at the end of both the person and company onboarding flows.
- Rework `ProfilesRepo.getRequiredOnboardingStep()` into a rule that is simple and predictable.
- Restrict the sensitive company routes to `OWNER` or `ADMIN` where it applies:
  - creating, editing and removing projects
  - editing the company profile
  - deleting or soft-deleting the company
- Build the minimum admin backend for company verification:
  - list what is pending
  - approve
  - reject
  - record who took the action

## P1

- Build real auditing: the table, the repo, the endpoint, and an admin screen wired to real data
  rather than to a fixture.
- Replace the `/api/blog/featured` mock with a real query.
- Settle one publishing rule for the blog and apply it to the public list, the public detail page
  and the tag filters alike.
- Choose production storage for complaint attachments.
- Expose reading and downloading an attachment in a controlled way.

## P2

- Reduce the technical inconsistency between the company screens and the rest of the app.
- Remove the small pieces of dead code still around.
- Review the `<img>` call sites. ⚠️ **Read the decision first:** `next.config` sets
  `images.unoptimized` because Vercel's image optimizer started answering 402, and with that flag
  on `<Image />` renders a plain `<img>` and optimizes nothing. Migrating the seven call sites buys
  nothing until that decision is revisited — see `docs/architecture/ARCHITECTURE.md`.

## Off the critical path

- Improve i18n beyond the current provider, if the product genuinely needs per-locale routes.
- Expand the blog's SEO and metadata.
- Refine the dashboard with metrics worth trusting.

## Dropped in the cleanup

Removed from the repository because they no longer described the project:

- the old `supabase/` migrations
- the old blog implementation docs
- the legacy troubleshooting notes
- the `dev-clean.bat` script

None of them were a source of truth or part of the runtime any more.

## Closed since this list was written

- **Lint warnings.** `pnpm run lint` is `eslint --max-warnings=0` as of 2026-09-03 and the tree is
  clean: 279 files, 0 errors, 0 warnings. A warning now fails CI, so there is nothing left to
  "clean up" on a schedule.
- **`components.json`.** It already points at `tailwind.config.ts` and `src/app/globals.css`, both
  of which exist. Checked 2026-09-03.
