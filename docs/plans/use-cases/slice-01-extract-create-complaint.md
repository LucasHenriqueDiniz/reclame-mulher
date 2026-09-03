---
status: todo
tags:
  - area/architecture
kanban: c1d60649-6cbd-4445-8f71-d596b1d14cf7
---

# Slice 01 — Extract createComplaint out of the route handler

## Delivers

`src/server/use-cases/create-complaint.ts` exists and holds the three rules that
`src/app/api/complaints/route.ts` `POST` decides today. The handler shrinks to session, parse, call,
map — and the rules become callable without a request object.

The HTTP contract does not change: 401 with no session, 404 for a missing company, 404 for a missing
project, 400 when the project belongs to another company, 400 on a Zod failure, 201 with the created
complaint. The response bodies keep their exact `error` strings, so nothing on the client moves.

## Needs

- **Slice 02 of `honest-ci`.** Without a runner there is no way to prove this refactor kept behaviour,
  and a refactor you cannot prove is a rewrite. This is the ordering constraint of the whole epic.
- 30 minutes reading `src/app/api/complaints/route.ts` (125 lines) and
  `src/server/repos/{companies,projects,complaints}.ts` for the three signatures the use case needs:
  `findByIdOrNull`, `findByIdOrNull`, `create`.
- A `Result`-shaped return, or a thrown typed error. Either works; pick one and the handler maps it.
  Do not return `NextResponse` from the use case — that is the coupling being removed.

## Tests

Against `createComplaint` with fake repos, no database:

- a valid input with no `project_id` calls `complaints.create` once, with the input and the userId
- a `company_id` no company matches returns the company-not-found error and **never calls**
  `complaints.create`
- a `project_id` no project matches returns the project-not-found error and never calls
  `complaints.create`
- a project whose `companyId` differs from the input's `company_id` returns the mismatch error — this
  is the rule most likely to be lost in the move, so it gets its own test
- **the mutation check**: delete the `project.companyId !== validatedData.company_id` comparison and
  that test must fail. If it still passes, the fake is not wired.

Plus one that keeps the handler honest:

- `src/app/api/complaints/route.ts` imports no repository module.

## Done when

```bash
pnpm test -- --run src/server/use-cases/create-complaint.test.ts 2>&1 | tail -3
```

prints `Tests  5 passed (5)`, and

```bash
grep -cE 'CompaniesRepo|ProjectsRepo|ComplaintsRepo' src/app/api/complaints/route.ts
```

prints `1` — the `GET` handler still calls `ComplaintsRepo` directly, which this slice does not touch;
anything above `1` means `POST` kept a repository call it was supposed to hand over.

## If stuck

If the repos resist being passed as a parameter because they are static-method classes rather than
instances, do not convert them. Type the parameter structurally against the three methods actually
used:

```ts
type Deps = {
  companies: Pick<typeof CompaniesRepo, "findByIdOrNull">;
  projects: Pick<typeof ProjectsRepo, "findByIdOrNull">;
  complaints: Pick<typeof ComplaintsRepo, "create">;
};
```

That takes the classes as they are, keeps the fakes tiny, and stops short of the `createRepos(db)`
factory `ARCHITECTURE.md` names as *"the cheapest step toward"* a composition root — which is a
decision for a later pitch, not a side effect of this one.
