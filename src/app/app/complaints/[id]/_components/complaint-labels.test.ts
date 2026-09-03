import { describe, expect, it } from "vitest";
import { complaintStatus } from "@/db/schema";
import { categoryLabel, statusLabel } from "./complaint-labels";

/**
 * Two things are worth asserting about a lookup table that feeds JSX: that it covers
 * everything it will be handed, and that it does something sane with what it does not.
 *
 * The `undefined` half is not paranoia about a case that cannot happen. `strict` is on
 * but `noUncheckedIndexedAccess` is not, so TypeScript types `STATUS_LABELS[status]` as
 * `string` and dropping the `??` compiles without a complaint. Nothing but a test stands
 * between that edit and a page rendering the literal text "undefined".
 */
describe("statusLabel", () => {
  /**
   * The status list is read off the Drizzle enum rather than retyped here: `complaint_status`
   * is what the column accepts, so it is the whole set the detail page can be handed.
   * Adding a value to the enum without adding a label turns this red rather than shipping
   * a banner that reads "PENDING_REVIEW".
   *
   * The assertion is "does not return its own key" because a missing entry falls through
   * to the raw status — an entry-less map would otherwise pass a `toBeDefined()` check.
   */
  it("has a label for every status the schema enum allows", () => {
    for (const status of complaintStatus.enumValues) {
      expect(statusLabel(status), `no label for status ${status}`).not.toBe(status);
    }
  });

  it("translates each known status", () => {
    expect(statusLabel("OPEN")).toBe("Em aberto");
    expect(statusLabel("RESPONDED")).toBe("Respondida");
    expect(statusLabel("RESOLVED")).toBe("Concluído");
    expect(statusLabel("CANCELLED")).toBe("Cancelada");
  });

  it("falls back to the raw status when the map has no entry", () => {
    expect(statusLabel("PENDING_REVIEW")).toBe("PENDING_REVIEW");
  });
});

describe("categoryLabel", () => {
  /**
   * One value from each of the three columns the map serves, since they share it:
   * `impactCategory`, `urgencyLevel` and `impactScope`.
   */
  it("translates a value from each of the three fields it covers", () => {
    expect(categoryLabel("meio_ambiente")).toBe("Meio Ambiente");
    expect(categoryLabel("emergencial")).toBe("Emergencial");
    expect(categoryLabel("comunitario")).toBe("Comunitário");
  });

  /**
   * These columns are free-form `text`, not enums, so there is no list to check coverage
   * against and the fallback is the only guarantee available. It is also load-bearing
   * today: the new-complaint form writes `saude` and `familiar`, and the map has neither.
   */
  it("falls back to the raw value when the map has no entry", () => {
    expect(categoryLabel("assunto_desconhecido")).toBe("assunto_desconhecido");
  });
});
