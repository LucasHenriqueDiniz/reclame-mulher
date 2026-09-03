import { expect, test } from "@playwright/test";
import { STORAGE_STATE } from "./seed-credentials";

/**
 * MANUAL_PLATAFORMA.md, "Fluxo de Resposta da Empresa" — inbox, open the
 * report, read it, reply, then move the status.
 *
 * The manual's own summary of this flow ends with the status changing to
 * "RESPONDIDA" and the report moving between the inbox tabs, so the spec
 * follows it to that end rather than stopping at "reply sent".
 *
 * It writes to the seeded database on purpose: replying is the write this flow
 * exists for. That is why the suite runs on one worker against a database it
 * recreates every run.
 */
test.use({ storageState: STORAGE_STATE.company });

const OPEN_COMPLAINT = "Atraso na entrega de documentação da obra";
const REPLY =
  "Recebemos seu relato. A documentação de impacto ambiental será enviada " +
  "por e-mail em até 5 dias úteis, e o cronograma da obra segue anexo.";

test("the company replies to an open report and moves its status", async ({ page }) => {
  // The inbox the manual describes, with the counters above the list.
  await page.goto("/app/company/complaints");
  await expect(page.getByRole("heading", { name: "Reclamações" })).toBeVisible();
  await expect(page.getByText("Gerencie as reclamações recebidas por Construtora X")).toBeVisible();
  await expect(page.getByText("1 relato aguardando resposta")).toBeVisible();

  // Open the report that is still waiting.
  await page.getByText(OPEN_COMPLAINT).first().click();
  await expect(page).toHaveURL(/\/app\/company\/complaints\/[0-9a-f-]{36}$/);

  // The author's own words are on the page — this is the reading step.
  await expect(
    page.getByText("Solicitei a documentação de impacto ambiental há 30 dias")
  ).toBeVisible();
  await expect(page.getByText("Maria Silva").first()).toBeVisible();
  await expect(statusBadge(page)).toHaveText("Em aberto");

  // Reply.
  await page.getByPlaceholder("Escrever sua resposta...").fill(REPLY);
  await page.getByRole("button", { name: "Enviar resposta" }).click();

  await expect(page.getByText("Resposta enviada com sucesso!")).toBeVisible();
  // router.refresh() re-renders the thread from the server, so the reply being
  // on the page is the database's answer, not the textarea's leftovers.
  await expect(page.getByText(REPLY)).toBeVisible();

  // The manual says the status becomes "RESPONDIDA" once the reply goes out,
  // and it does — POST /api/company/complaints/[id]/messages moves it there
  // itself, so the badge changes without anyone touching "Mudar status".
  //
  // Scoped to the badge: "Em aberto" and "Respondida" are also two of the
  // options inside the "Mudar status" select, and those never go away.
  await expect(statusBadge(page)).toHaveText("Respondida");

  // Which leaves "Mudar status" for the step the manual marks optional:
  // marking the case resolved. The only <select> on the page is that one.
  await page.locator("select").selectOption("RESOLVED");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Status atualizado com sucesso.")).toBeVisible();

  // And the inbox agrees: nothing is waiting, and there are two resolved cases
  // where the seed left one.
  await page.goto("/app/company/complaints");
  await expect(page.getByText("1 relato aguardando resposta")).toHaveCount(0);
  await expect(page.getByText("Resolvida").first()).toBeVisible();
});

/**
 * The status pill in the blue header: the rounded <span> that sits next to the
 * report's title. Reaching it by shape rather than by text keeps the assertion
 * from matching the identically-worded <option>s in the status select.
 */
function statusBadge(page: import("@playwright/test").Page) {
  return page.locator("span.rounded-full").filter({ hasText: /aberto|Respondida|Resolvida|Cancelada/ }).first();
}

test("the author sees the company's reply on her own report", async ({ browser }) => {
  // The other half of the flow: the manual says the reply reaches the author.
  const context = await browser.newContext({ storageState: STORAGE_STATE.person });
  const page = await context.newPage();

  await page.goto("/app/complaints");
  await page.getByText(OPEN_COMPLAINT).first().click();

  await expect(page.getByText(REPLY)).toBeVisible();

  await context.close();
});
