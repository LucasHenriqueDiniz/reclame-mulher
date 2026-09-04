import { describe, expect, it } from "vitest";
import { filterProjects } from "./projects-tab-helpers";

const projects = [
  { name: "Obra Rodovia BR-101", description: "Duplicação do trecho SP-RJ." },
  { name: "Ponte Nova", description: "Construção da ponte sobre o rio." },
  { name: "Sem descrição", description: null },
];

describe("filterProjects", () => {
  it("returns the whole list for an empty search", () => {
    expect(filterProjects(projects, "")).toHaveLength(3);
  });

  /**
   * Whitespace is not a search. The tab's field is trimmed before it reaches
   * here, so a user who types a space still sees every project rather than the
   * empty list a naive `includes(" ")` would leave behind.
   */
  it("returns the whole list for a search of only whitespace", () => {
    expect(filterProjects(projects, "   ")).toHaveLength(3);
  });

  it("matches a name case-insensitively", () => {
    expect(filterProjects(projects, "PONTE nova").map((p) => p.name)).toEqual(["Ponte Nova"]);
  });

  /**
   * "rodovia" is in the first project's name and "ponte" is in the second's
   * description, so a filter that only looked at one of the two fields would
   * still pass a test that asserted just one of these.
   */
  it("matches the description as well as the name", () => {
    expect(filterProjects(projects, "ponte").map((p) => p.name)).toEqual(["Ponte Nova"]);
    expect(filterProjects(projects, "trecho").map((p) => p.name)).toEqual(["Obra Rodovia BR-101"]);
  });

  it("keeps a project whose description is null when the name matches", () => {
    expect(filterProjects(projects, "descrição").map((p) => p.name)).toEqual(["Sem descrição"]);
  });

  it("returns nothing when neither field matches", () => {
    expect(filterProjects(projects, "aeroporto")).toEqual([]);
  });
});
