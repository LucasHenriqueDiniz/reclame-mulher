---
status: done
tags:
  - area/clean-code
---

# Slice 01 — Replace the projects tab's hand-rolled cache

The card `oversized-files` slice 04 asked for and refused to do itself. Its own words:

> it is a cache that was already there and is now easier to see. Do not fix it in this slice. Note
> it, finish the split, and let it be its own card: `@tanstack/react-query` is already a dependency
> and replacing a hand-rolled cache with it is a change that deserves its own proof.

Its own plan directory rather than a slice 05 of that epic, because that pitch puts **behaviour
changes** out of scope in as many words, and this is one.

## Delivers

`src/app/app/company/dashboard/_components/projects-tab.tsx` reads its list from a react-query query
instead of from a `useState` seeded off a prop, and create, edit and delete invalidate that query
instead of hand-patching a local array.

What was there:

| handler | did |
|---|---|
| `useState(initial)` | seeded the list from the server-rendered `initial` prop, once |
| `handleSave` | mapped over `prev` to patch the edited row, or appended the new one |
| `handleDeleteSuccess` | filtered the deleted id out of `prev` |

Nothing refetched, and the rows that got merged in came from the modal's own response payload rather
than from a read. So the tab's list and the database could disagree until the page was reloaded.

## Needs

Nothing new. `@tanstack/react-query` is already a dependency, `QueryClientProvider` is already in
`src/app/providers.tsx` wrapping the whole tree from the root layout, and
`GET /api/company/projects` already exists and already scopes to the session's company.

## Tests

- Unit: the search filter, as a pure function.
- E2E: create, edit, delete and search on the projects tab.
- E2E: **the drift itself.** A create-edit-delete walk does not distinguish the two implementations —
  the old hand-merge put the response payload into the list, so its rows looked right too. The test
  that separates them writes a project straight to the API, behind the tab's back, and then asks
  whether leaving the tab and returning shows it.

## Done when

```bash
pnpm run lint && pnpm test --run && npx tsc --noEmit && pnpm run build >/dev/null 2>&1 && echo "build: ok"
pnpm run test:e2e
grep -c "setProjects" src/app/app/company/dashboard/_components/projects-tab.tsx || echo "setProjects: gone"
```

All four gates exit 0, the E2E suite reports no failures, and the grep finds no `setProjects`.

## If stuck

If the loading state on first open of the tab reads badly, the fallback is `initialData` on the query
fed from the page's existing server fetch. It is a fallback and not the plan because `initialData`
seeded from a prop is the same stale-copy shape wearing a react-query hat: the prop changes, the
cache does not.

## Outcome

Done. The tab holds no copy of the server's list: `setProjects` is gone, and
`src/hooks/use-company-projects.ts` is the only module in `src/` outside `src/app/api/` that names
the `/api/company/projects` URL.

| gate | result |
|---|---|
| `pnpm run lint` | exit 0 |
| `pnpm test --run` | exit 0 — 29 tests, 5 files |
| `npx tsc --noEmit` | exit 0 |
| `pnpm run build` | exit 0 |
| `pnpm run test:e2e` | **25 passed, 0 failed** (1.0m) |

### The shape it landed in

The query and the three mutations live in one hook module, `src/hooks/use-company-projects.ts`,
following the `src/hooks/use-blog.ts` convention already in the repo. No new route was needed:
`GET /api/company/projects` already existed and already read the company off the session, so the
query key is `["company", "projects"]` with no id in it.

**Each mutation returns its `invalidateQueries` promise from `onSuccess`.** That is the detail that
does the work: react-query then holds the mutation unsettled until the refetch lands, so
`mutateAsync` resolves against a list that already contains the write, and the modals — which close
on that promise — cannot close over a list that has not caught up.

**Both modals stopped calling `fetch`.** `CompanyProjectFormModal` takes an `onSubmit`, and
`CompanyDeleteProjectModal` an `onConfirm`; each keeps its own fields, validation and pending/error
state and awaits the injected call. They were used by nothing but this tab, so the contract change
cost nothing elsewhere. This is what removed the second path to the data: a modal that writes and
then hands its response payload back to the caller *is* the hand-rolled cache, and it does not matter
which component the merge happens in.

### The server fetch went away rather than becoming hydration

`ProjectsRepo.findByCompany` is out of the dashboard page's `Promise.all`, the `projects` prop is off
`CompanyDashboard`, and the `Project` type it re-exported is gone with it — the type now lives in the
hook as `CompanyProject`.

`initialData` fed from the page's server fetch was considered and rejected. It is the same stale-copy
shape in a new place: the prop changes, the cache does not. The page also paid for that query on
every dashboard visit while `complaints` is the tab that opens by default, so the fetch was usually
wasted. The cost is a "Carregando projetos…" line on first open of the tab, which the old version
had no need for and no state for.

### Proof that the test proves something

The card asked for an E2E pass over create, edit, delete and search. That walk passes — but on its
own it does not distinguish the two implementations, because the old hand-merge put the modal's own
response payload into the list and so rendered a plausible row too.

So the suite has a second test that writes a project **straight to the API, behind the tab's back**,
then leaves the projects tab and returns. It was run against the old component to check it can fail:
`git stash push -- src/`, then `pnpm exec playwright test e2e/08-company-projects-tab.spec.ts`.

```
✘  2 › the list refetches, so a project written behind the tab's back appears
   Locator: getByText('Projeto fora da aba 1788484555740')
   Expected: visible — element(s) not found
   at e2e/08-company-projects-tab.spec.ts:134
```

Line 134 is the assertion right after leaving and returning to the tab. The old component re-seeded
its `useState` from the `initial` prop the server rendered at page load, so it could not show that
row; the query refetches on mount and does. The test then deletes the project the same way, because
a stale list that merely grew would pass on the first half alone.

The other test fails against the old code too, but for a mechanical reason rather than a behavioural
one — the label association below changed its selectors — so it is not evidence of anything.

### Two things found on the way, both fixed because they blocked the proof

**The seeded company account could not manage projects at all.** `scripts/seed.ts` gave
`empresa@construtorax.com` the membership role `MEMBER`, and `canManageCompany` accepts only `OWNER`
and `ADMIN`, so `POST /api/company/projects` answered **403**. The first suite run failed on exactly
that. No signup path produces a MEMBER-only company:
`POST /api/auth/register-company` gives the registering user `OWNER`. The seed now says `OWNER`,
which is the fixture matching what the app itself creates. Nothing else keys off that role — the
post-login routing spec reads `users.role`, and the complaint-messages routes the company-reply spec
drives do not call `canManageCompany`.

This means the dashboard's projects tab has never worked for the only seeded company account, and
that the four project paths slice 04 listed could not have been hand-walked even if someone had tried.

**The form's labels named nothing.** `CompanyProjectFormModal`'s inner `Input` rendered a `<label>`
with no `htmlFor` and an input with no `id`, and the status `<select>` was the same. That is the
"form labels" case `docs/qa-gaps.md` item 1 already has open against `/login`, and it is why
`getByLabel` could not reach a single field. Fixed with `useId`, which is what made the spec
readable rather than a walk over positional selectors.

### Also closed

`ProjectsTab` no longer passes `companyId=""` to `CompanyProjectList` — the dead prop with the
misleading value that slice 04 noted and moved verbatim. The prop is declared optional and never
read, so dropping the argument is a deletion, not a behaviour change.

`CompanyProjectList`'s per-card **Editar** and **Excluir** buttons gained `aria-label`s naming their
project. Ten cards previously offered ten buttons all called "Excluir", which is unusable with a
screen reader and unaddressable from a test.

### Not fixed, on purpose

- **`stats.activeProjectsCount` still goes stale.** The metric cards above the tabs are server-rendered
  from `CompaniesRepo.getStats`, so creating or deleting a project updates the list and not the
  number. Pre-existing — the old code did not update it either. Fixing it means either a
  `router.refresh()` on every project mutation, which re-runs all three remaining server queries, or
  moving the stats onto a query of their own. Either is a separate change with its own argument.
- **`src/app/app/company/projects/page.tsx` was left alone.** A second, independent projects UI on its
  own route, 256 lines, shadcn instead of the inline-styled `@/components/company` family, create and
  delete but no edit and no search. It does *not* have the drift bug: it calls `await loadProjects()`
  after each write. The problem there is that it duplicates this feature entirely, which is a question
  about which of the two survives, not a cache to replace.
- **Search still matches name and description only,** not location — the public profile's own tab does
  search location. Widening it here would be a behaviour change riding along with this one.
