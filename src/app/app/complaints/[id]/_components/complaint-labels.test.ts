import { describe, expect, it } from "vitest";
import { complaintStatus } from "@/db/schema";
import { categoryLabel, countLabel, responseTimeLabel, statusLabel } from "./complaint-labels";

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

describe("countLabel", () => {
  /**
   * The bug this replaced: the card interpolated the number in front of a hardcoded plural,
   * so a company with one open dialogue read "1 diálogos ativos". Portuguese inflects the
   * adjective too, which is why the helper takes two whole phrases and not a stem plus "s".
   */
  it("uses the singular phrase for exactly one", () => {
    expect(countLabel(1, "diálogo ativo", "diálogos ativos")).toBe("1 diálogo ativo");
    expect(countLabel(1, "caso resolvido", "casos resolvidos")).toBe("1 caso resolvido");
    expect(countLabel(1, "projeto em andamento", "projetos em andamento")).toBe(
      "1 projeto em andamento"
    );
  });

  /**
   * Zero is plural in Portuguese, unlike English's "no cases". A company that has never been
   * complained about is the common way to reach this branch, so it is not a corner case.
   */
  it("uses the plural phrase for zero and for counts above one", () => {
    expect(countLabel(0, "caso resolvido", "casos resolvidos")).toBe("0 casos resolvidos");
    expect(countLabel(2, "caso resolvido", "casos resolvidos")).toBe("2 casos resolvidos");
    expect(countLabel(143, "caso resolvido", "casos resolvidos")).toBe("143 casos resolvidos");
  });
});

describe("responseTimeLabel", () => {
  it("renders the average as a duration when the company has answered", () => {
    expect(responseTimeLabel(43)).toBe("Resposta em 43h");
  });

  /**
   * The null branch is the whole point of the helper: `CompaniesRepo.getStats` returns null
   * for a company with no answered complaint, and the card used to fall back to a bare dash,
   * rendering "Resposta em -".
   */
  it("says there is no history instead of leaving a dash where a duration goes", () => {
    expect(responseTimeLabel(null)).toBe("Sem histórico de resposta");
    expect(responseTimeLabel(null)).not.toContain("-");
  });
});
