import type { CompaniesRepo } from "@/server/repos/companies";
import type { ComplaintsRepo } from "@/server/repos/complaints";
import type { ProjectsRepo } from "@/server/repos/projects";
import type { CreateComplaintInput } from "@/server/dto/complaints";

/**
 * Every import in this file is `import type`, and that is load-bearing rather
 * than tidy: the repos open with `import "server-only"`, so importing one for its
 * value pulls that package — and Drizzle, and `@/db/client` — into whatever
 * imports this. Under Vitest that is an immediate
 * `Cannot find package 'server-only'`, which is how it was found.
 *
 * Types are erased, so this module has no runtime dependency on the adapter layer
 * at all. It depends on the *shape* of three methods and nothing else, which is
 * also why "no database" in the tests is a fact and not a hope.
 *
 * The wiring lives next door in `create-complaint.deps.ts`. It stops short of a
 * `createRepos(db)` factory: ARCHITECTURE.md names that as "the cheapest step
 * toward" a composition root this codebase does not have, and that is a decision
 * for its own pitch, not a side effect of extracting one use case.
 */
export type CreateComplaintDeps = {
  companies: Pick<typeof CompaniesRepo, "findByIdOrNull">;
  projects: Pick<typeof ProjectsRepo, "findByIdOrNull">;
  complaints: Pick<typeof ComplaintsRepo, "create">;
};

/**
 * Why a reason and not an HTTP status: the caller owns the protocol. Returning
 * `NextResponse` from here is the coupling this extraction exists to remove, and
 * it would also make the use case unusable from anything that is not a request —
 * a seed script, a server action, a test.
 */
export type CreateComplaintFailure =
  | "company-not-found"
  | "project-not-found"
  | "project-company-mismatch";

type Complaint = Awaited<ReturnType<typeof ComplaintsRepo.create>>;

export type CreateComplaintResult =
  | { ok: true; complaint: Complaint }
  | { ok: false; reason: CreateComplaintFailure };

/**
 * The three rules `POST /api/complaints` used to decide inline. Input is already
 * parsed: validation belongs to `CreateComplaintDto` at the edge, so a Zod
 * failure never reaches here.
 *
 * `deps` is required, with no default. A default would have to import the real
 * repos for their values, which is the thing the comment above explains cannot
 * happen — and it would let a test that forgets to pass fakes reach the database
 * and still pass.
 */
export async function createComplaint(
  input: CreateComplaintInput,
  userId: string,
  deps: CreateComplaintDeps
): Promise<CreateComplaintResult> {
  const company = await deps.companies.findByIdOrNull(input.company_id);
  if (!company) {
    return { ok: false, reason: "company-not-found" };
  }

  if (input.project_id) {
    const project = await deps.projects.findByIdOrNull(input.project_id);
    if (!project) {
      return { ok: false, reason: "project-not-found" };
    }

    // A project id that exists is not enough: it has to be *this* company's
    // project, or a complaint lands on a company that has nothing to do with it.
    if (project.companyId !== input.company_id) {
      return { ok: false, reason: "project-company-mismatch" };
    }
  }

  const complaint = await deps.complaints.create(input, userId);
  return { ok: true, complaint };
}
