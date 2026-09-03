import { expect, test } from "@playwright/test";
import { SEED_ACCOUNTS, STORAGE_STATE } from "./seed-credentials";

/**
 * MANUAL_PLATAFORMA.md, "Dashboard da Usuária Pessoa".
 *
 * The manual tells a reader she will find her own reports here, each with its
 * status, and tabs to narrow the list down. Two things worth proving: the
 * status filters really filter, and the list is hers — Ana's report about the
 * night-time noise is in the same seeded database and must not appear on
 * Maria's list.
 */
test.use({ storageState: STORAGE_STATE.person });

test("the report list shows only her own reports", async ({ page }) => {
  await page.goto("/app/complaints");

  await expect(page.getByRole("heading", { name: "Meus Relatos" })).toBeVisible();
  await expect(page.getByText(SEED_ACCOUNTS.person.name).first()).toBeVisible();

  // Maria's two seeded reports.
  await expect(page.getByText("Atraso na entrega de documentação da obra")).toBeVisible();
  await expect(page.getByText("Falta de sinalização na via")).toBeVisible();

  // Ana's report is seeded against the same company and must stay out.
  await expect(page.getByText("Barulho fora do horário permitido")).toHaveCount(0);
});

test("the status tabs narrow the list down", async ({ page }) => {
  await page.goto("/app/complaints");

  // The filter strip is a <nav> of plain buttons, not an ARIA tablist.
  await page.getByRole("button", { name: "Concluídas" }).click();
  await expect(page.getByText("Falta de sinalização na via")).toBeVisible();
  await expect(page.getByText("Atraso na entrega de documentação da obra")).toHaveCount(0);

  await page.getByRole("button", { name: "Não Respondidas" }).click();
  await expect(page.getByText("Atraso na entrega de documentação da obra")).toBeVisible();
  await expect(page.getByText("Falta de sinalização na via")).toHaveCount(0);
});

test("a report opens on its own detail page", async ({ page }) => {
  await page.goto("/app/complaints");

  await page.getByText("Atraso na entrega de documentação da obra").first().click();

  await expect(page).toHaveURL(/\/app\/complaints\/[0-9a-f-]{36}$/);
  await expect(
    page.getByText("Solicitei a documentação de impacto ambiental há 30 dias")
  ).toBeVisible();
});
