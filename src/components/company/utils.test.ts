import { describe, expect, it } from "vitest";
import { responseTimeLabel, responseTimeValue } from "./utils";

/**
 * Three components display a company's average response time, in two different shapes: a
 * bare value under its own label (the public profile's metric tiles and performance card)
 * and a standalone sentence (the complaint detail sidebar, whose icon row has no label).
 *
 * They share this module so the empty case cannot drift — all three used to write their own
 * `avgResponseHours != null ? ... : "-"`, and the dash was the bug.
 *
 * A fourth reader, the company dashboard, is deliberately not on these helpers: its average
 * is a sub-line under another metric and it already falls back to `undefined`, which drops
 * the line rather than printing a dash. Routing it through here would put a placeholder
 * where today there is nothing.
 */
describe("responseTimeValue", () => {
  it("renders the average as a duration", () => {
    expect(responseTimeValue(43)).toBe("43h");
  });

  /**
   * `CompaniesRepo.getStats` returns null, not zero, for a company that has never answered
   * a complaint. The slot is labelled, so the placeholder says only what is missing.
   */
  it("names the empty case instead of leaving a bare dash", () => {
    expect(responseTimeValue(null)).toBe("Sem histórico");
    expect(responseTimeValue(null)).not.toBe("-");
  });
});

describe("responseTimeLabel", () => {
  it("renders the average as a sentence", () => {
    expect(responseTimeLabel(43)).toBe("Resposta em 43h");
  });

  it("names the empty case instead of leaving a bare dash", () => {
    expect(responseTimeLabel(null)).toBe("Sem histórico de resposta");
    expect(responseTimeLabel(null)).not.toContain("-");
  });
});

/**
 * The two formatters build their empty text from one constant, which is the point of
 * putting them side by side. This pins that relationship: rewording the placeholder has to
 * move both strings together, or this turns red rather than shipping a profile that says
 * "Sem histórico" in one card and something else in the next.
 */
describe("the two shapes agree on the empty case", () => {
  it("builds the sentence from the same words as the value", () => {
    expect(responseTimeLabel(null)).toContain(responseTimeValue(null));
  });
});
