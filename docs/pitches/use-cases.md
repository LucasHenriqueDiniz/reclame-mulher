---
status: active
epic: use-cases
tags:
  - area/architecture
  - status/active
---

# A use-case layer, one case at a time

## Problem

Business rules live in HTTP route handlers, so they can only be exercised over HTTP.

`src/app/api/complaints/route.ts` `POST` is the clearest example. Between parsing the request and
writing the row it decides three things that have nothing to do with HTTP:

```ts
const company = await CompaniesRepo.findByIdOrNull(validatedData.company_id);
if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

if (validatedData.project_id) {
  const project = await ProjectsRepo.findByIdOrNull(validatedData.project_id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.companyId !== validatedData.company_id) {
    return NextResponse.json({ error: "Project does not belong to company" }, { status: 400 });
  }
}

const complaint = await ComplaintsRepo.create(validatedData, session.userId);
```

*A complaint must name a company that exists; if it names a project, that project must exist and must
belong to that company.* That is a domain rule. It is stated once, in a file that also does
`NextResponse.json`, `getSession()` and `console.error`, and testing it means standing up a request.

`src/server/use-cases/` does not exist. `docs/architecture/ARCHITECTURE.md` records why — decision D3,
*"Adopt the mechanical parts of the house style and record the architectural divergence here instead
of opening a refactor"* — and that decision stands. This pitch does not reopen it.

## Solution

**One use case, extracted from one handler, with tests. Not four layers in one pass.**

```ts
// src/server/use-cases/create-complaint.ts
export async function createComplaint(
  repos: { companies: CompaniesPort; projects: ProjectsPort; complaints: ComplaintsPort },
  input: CreateComplaintInput,
  userId: string,
): Promise<Result<Complaint, CreateComplaintError>>
```

Repositories arrive as a parameter, so a test passes fakes and the function needs no database. The
handler keeps exactly what is HTTP: read the session, parse the body, call this, map the result to a
status code.

Note what this is *not*. `ARCHITECTURE.md` records that repos are static-method classes with no
composition root, because *"a serverless function per route has no long-lived root to build in"*. The
parameter object is the cheapest thing that makes the function testable; it is not a DI container and
it does not create the `ports/` directory D3 declined.

## Surface

- new: `src/server/use-cases/create-complaint.ts` and its test
- changed: `src/app/api/complaints/route.ts` `POST`
- unchanged: `src/server/repos/*`, `src/server/dto/*`, the database, the HTTP contract

## Scope

**In.** Exactly one use case: creating a complaint.

**Out.** The other 31 route handlers. Extract the second one when a second one needs a test, not
because the first worked.

**Out.** Ports, adapters, a composition root, `domain/`. D3 rules these out and this pitch honours it.

**Out.** The 14 route files that reach past the repos straight into `@/db/client` — a separate gap in
`ARCHITECTURE.md`, and `api/complaints/route.ts` is not one of them.

## Open questions

None. The rules are already written down in the handler; this moves them somewhere they can be tested.

## Done

`pnpm test` runs a test of the complaint-creation rules that touches no database and no HTTP, and
`src/app/api/complaints/route.ts` contains no repository call other than the use case.
