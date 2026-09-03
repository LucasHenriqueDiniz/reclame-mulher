import { describe, expect, it } from "vitest";
import { CreateComplaintDto } from "./complaints";

/**
 * The first unit test in this repository, against the schema that guards the one
 * write a visitor can make: creating a complaint.
 *
 * `CreateComplaintDto` is chosen because it is pure — no database, no session, no
 * Next.js request object. A first test that needs a Postgres container is a first test
 * that never gets written.
 *
 * These assertions are about behaviour rather than about the shape of Zod: that a
 * complete payload survives parsing, that each required field is actually required,
 * and that an unknown key is dropped instead of reaching a handler. Relaxing any
 * required field in the schema turns one of them red — verified by doing it.
 */

const VALID = {
  company_id: "3f2a1c9e-8b7d-4e6f-9a1b-2c3d4e5f6a7b",
  title: "Obra parada há três meses",
  description: "A obra ao lado de casa parou e o terreno está acumulando entulho e água.",
} as const;

describe("CreateComplaintDto", () => {
  it("parses a complete payload and keeps the three required fields", () => {
    const parsed = CreateComplaintDto.parse(VALID);

    expect(parsed.company_id).toBe(VALID.company_id);
    expect(parsed.title).toBe(VALID.title);
    expect(parsed.description).toBe(VALID.description);
  });

  it("rejects a payload with no company_id, and says which field", () => {
    const { company_id: _omitted, ...withoutCompany } = VALID;

    const result = CreateComplaintDto.safeParse(withoutCompany);

    expect(result.success).toBe(false);
    // The path matters more than the message: a handler and a form field both key off
    // it, so a schema change that moves the error elsewhere breaks them silently.
    expect(result.error?.issues.map((i) => i.path.join("."))).toContain("company_id");
  });

  it("rejects an empty title", () => {
    const result = CreateComplaintDto.safeParse({ ...VALID, title: "" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join("."))).toContain("title");
  });

  it("rejects a description shorter than the minimum", () => {
    const result = CreateComplaintDto.safeParse({ ...VALID, description: "curto" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join("."))).toContain("description");
  });

  it("drops an unknown key instead of passing it through", () => {
    const parsed = CreateComplaintDto.parse({ ...VALID, is_admin: true });

    // Not merely "undefined": the key must be absent, because anything reaching the
    // insert from a request body is a field a visitor chose.
    expect(Object.keys(parsed)).not.toContain("is_admin");
  });
});
