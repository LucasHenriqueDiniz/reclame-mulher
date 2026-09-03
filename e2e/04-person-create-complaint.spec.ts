import { expect, test } from "@playwright/test";
import { STORAGE_STATE } from "./seed-credentials";

/**
 * MANUAL_PLATAFORMA.md, "Fluxo de Criação de Reclamação" — the four-step
 * wizard, step by step, ending on the success screen with a protocol id.
 *
 * This is the flow the manual spends the most pages on and the one a reader
 * will try first, so it is walked through the interface exactly as written:
 * pick the company, answer the history question, describe the problem, skip
 * the photos, classify, send.
 */
test.use({ storageState: STORAGE_STATE.person });

test("a person files a report through the four-step wizard", async ({ page }) => {
  await page.goto("/app/complaints/new");

  // Step 1 opens on the company picker: "Busque a empresa para iniciar seu relato".
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.locator("#company-search").fill("Construtora");
  await page.getByRole("button", { name: "Selecionar Construtora X" }).click();

  // The picked company takes over the wizard header.
  await expect(page.getByText("Construtora X").first()).toBeVisible();

  // Step 1: "Você já reclamou sobre isso em outro lugar?"
  await page.locator("#previous-complaint-no").click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  // Step 2: "Conte o que aconteceu".
  const title = "Poeira da obra entrando em casa";
  await page.locator("#complaint-title").fill(title);
  await page
    .locator("#complaint-description")
    .fill(
      "A obra levanta poeira o dia inteiro e ela entra pelas janelas. " +
        "Minha filha tem asma e passou a semana com crise."
    );
  await page.locator("#complaint-location").fill("Rua das Flores, 123 - São Paulo");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  // Step 3: attachments are optional, and the button says so.
  await expect(page.getByText("Quer enviar uma foto?")).toBeVisible();
  await page.getByRole("button", { name: "Continuar sem foto" }).click();

  // Step 4: the three required classifications, then send.
  await selectOption(page, "Qual tipo de problema?", "Saúde");
  await selectOption(page, "Quão urgente é?", "Alta — precisa de solução rápida");
  await selectOption(page, "Quem mais está sendo afetado?", "Minha família");

  await page.getByRole("button", { name: "Enviar relato" }).click();

  // The success screen the manual describes: confirmation, title, protocol id.
  await expect(page.getByRole("heading", { name: "Seu relato foi criado com sucesso!" })).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText("Identificador do relato")).toBeVisible();
  await expect(page.getByText(/^#R-[0-9A-F]{4}-[0-9A-F]{4}$/)).toBeVisible();

  // And it is really there: the new report shows up on her own list.
  await page.goto("/app/complaints");
  await expect(page.getByText(title)).toBeVisible();
});

/**
 * The classification fields are Radix selects: a combobox button that opens a
 * listbox. ComplaintField renders the label and the trigger as siblings, so
 * the label's parent is the field — which is how each of the three (four, when
 * the company has projects) selects is told apart without counting positions.
 */
async function selectOption(
  page: import("@playwright/test").Page,
  label: string,
  option: string
): Promise<void> {
  const field = page.locator("label", { hasText: label }).first().locator("xpath=..");
  await field.getByRole("combobox").click();
  await page.getByRole("option", { name: option }).click();
}
