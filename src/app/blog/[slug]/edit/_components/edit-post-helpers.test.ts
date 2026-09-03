import { describe, expect, it } from "vitest";
import { createSlugFromTitle, getErrorMessage } from "./edit-post-helpers";

describe("createSlugFromTitle", () => {
  it("lowercases an ASCII title and joins words with hyphens", () => {
    expect(createSlugFromTitle("Hello World")).toBe("hello-world");
  });

  /**
   * The regex is `\p{L}\p{N}`, not `\w`, and this is the test that says why: under
   * `\w` an accented letter is not a word character, so "Educação" would come back
   * as `educa-o` and the slug would lose the word.
   */
  it("keeps accented letters instead of dropping them", () => {
    expect(createSlugFromTitle("Educação Financeira")).toBe("educação-financeira");
  });

  it("collapses punctuation into single hyphens and trims the ends", () => {
    expect(createSlugFromTitle("  O que é isso?! (parte 2)  ")).toBe("o-que-é-isso-parte-2");
  });

  it("returns an empty string for an empty title", () => {
    expect(createSlugFromTitle("")).toBe("");
  });

  /**
   * Not an edge case for its own sake: the save handler refuses to create a post
   * when this returns empty, so a title of pure punctuation has to reach that
   * branch rather than producing a slug of hyphens.
   */
  it("returns an empty string for a title with nothing sluggable in it", () => {
    expect(createSlugFromTitle("!!! ???")).toBe("");
  });
});

describe("getErrorMessage", () => {
  it("uses the message of a real Error", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("falls back for a thrown string, which is not an Error", () => {
    expect(getErrorMessage("boom", "fallback")).toBe("fallback");
  });

  it("falls back for undefined", () => {
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
