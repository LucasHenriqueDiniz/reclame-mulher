import { describe, expect, it } from "vitest";
import { responseTimeLabel, responseTimeValue } from "./utils";

/**
 * Four components display a company's average response time, in two different shapes: a
 * bare value under a label of its own — the public profile's metric tiles and performance
 * card, and the dashboard's sub-line, which prefixes its own "Resp. média:" — and a
 * standalone sentence in the complaint detail sidebar, whose icon row has no label.
 *
 * They share this module so the empty case cannot drift. Three of them used to write their
 * own `avgResponseHours != null ? ... : "-"`, and the dash was the bug; the dashboard fell
 * back to `undefined`, which hid the line instead, so a company with no history could not
 * tell the metric apart from one that had scrolled off.
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
