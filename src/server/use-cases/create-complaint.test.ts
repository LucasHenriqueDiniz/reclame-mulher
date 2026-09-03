import { describe, expect, it, vi } from "vitest";
import type { CreateComplaintInput } from "@/server/dto/complaints";
import { createComplaint, type CreateComplaintDeps } from "./create-complaint";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const COMPANY_ID = "22222222-2222-4222-8222-222222222222";
const PROJECT_ID = "33333333-3333-4333-8333-333333333333";

function input(over: Partial<CreateComplaintInput> = {}): CreateComplaintInput {
  return {
    company_id: COMPANY_ID,
    title: "Assédio no setor",
    description: "Descrição longa o suficiente para o DTO aceitar.",
    has_previous_complaint_elsewhere: false,
    is_public: true,
    is_anonymous: false,
    ...over,
  };
}

/**
 * The fakes answer only the three methods the use case calls, which is the whole
 * point of typing `Deps` structurally: no database, no Drizzle, no schema.
 * `created` is not a real row — nothing here asserts on its shape, only that it
 * is handed back untouched.
 */
function deps(over: {
  company?: unknown;
  project?: unknown;
  created?: unknown;
} = {}) {
  const create = vi.fn().mockResolvedValue(over.created ?? { id: "complaint-1" });
  return {
    create,
    fakes: {
      companies: { findByIdOrNull: vi.fn().mockResolvedValue("company" in over ? over.company : { id: COMPANY_ID }) },
      projects: { findByIdOrNull: vi.fn().mockResolvedValue("project" in over ? over.project : { id: PROJECT_ID, companyId: COMPANY_ID }) },
      complaints: { create },
    } as unknown as CreateComplaintDeps,
  };
}

describe("createComplaint", () => {
  it("creates the complaint when there is no project, passing the input and the userId through", async () => {
    const { create, fakes } = deps({ created: { id: "complaint-42" } });
    const data = input();

    const result = await createComplaint(data, USER_ID, fakes);

    expect(result).toEqual({ ok: true, complaint: { id: "complaint-42" } });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(data, USER_ID);
  });

  it("reports company-not-found and never reaches the complaints repo", async () => {
    const { create, fakes } = deps({ company: null });

    const result = await createComplaint(input(), USER_ID, fakes);

    expect(result).toEqual({ ok: false, reason: "company-not-found" });
    expect(create).not.toHaveBeenCalled();
  });

  it("reports project-not-found and never reaches the complaints repo", async () => {
    const { create, fakes } = deps({ project: null });

    const result = await createComplaint(input({ project_id: PROJECT_ID }), USER_ID, fakes);

    expect(result).toEqual({ ok: false, reason: "project-not-found" });
    expect(create).not.toHaveBeenCalled();
  });

  /**
   * Its own test because it is the rule most likely to be lost in the move: the
   * project exists and the company exists, so every cheaper check passes and only
   * the ownership comparison stands between a complaint and the wrong company.
   */
  it("reports project-company-mismatch when the project belongs to another company", async () => {
    const { create, fakes } = deps({
      project: { id: PROJECT_ID, companyId: "44444444-4444-4444-8444-444444444444" },
    });

    const result = await createComplaint(input({ project_id: PROJECT_ID }), USER_ID, fakes);

    expect(result).toEqual({ ok: false, reason: "project-company-mismatch" });
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the complaint when the project does belong to the company", async () => {
    const { create, fakes } = deps();

    const result = await createComplaint(input({ project_id: PROJECT_ID }), USER_ID, fakes);

    expect(result).toMatchObject({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
