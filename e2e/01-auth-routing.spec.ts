import { expect, test } from "@playwright/test";
import { SEED_ACCOUNTS, STORAGE_STATE } from "./seed-credentials";

/**
 * MANUAL_PLATAFORMA.md, "Navegação Pós-Login" and "Fluxo de Autenticação".
 *
 * The manual promises each role a different home: a person lands on her own
 * reports, a company on its dashboard, an admin in the admin area. Those three
 * promises are the first thing a reader of the manual tries, and nothing in
 * the repository checked any of them before this suite.
 *
 * It also pins down that the session — not the URL — is what opens those
 * pages, which is what makes the rest of the suite meaningful: the specs are
 * signed in because global setup signed them in, not because /app happens to
 * be reachable.
 */
test.describe("post-login routing per role", () => {
  test("a signed-out visitor is sent to the login page", async ({ page }) => {
    // No storageState: this context carries no session cookie.
    await page.goto("/app/complaints");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("a person lands on her own reports", async ({ browser }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.person });
    const page = await context.newPage();

    await page.goto("/app");

    await expect(page).toHaveURL(/\/app\/complaints$/);
    await expect(page.getByRole("heading", { name: "Meus Relatos" })).toBeVisible();
    await expect(page.getByText(SEED_ACCOUNTS.person.name).first()).toBeVisible();

    await context.close();
  });

  test("a company lands on its dashboard", async ({ browser }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.company });
    const page = await context.newPage();

    await page.goto("/app/company/dashboard");

    await expect(page.getByText("Reclamações recebidas")).toBeVisible();
    await expect(page.getByText("Construtora X").first()).toBeVisible();

    await context.close();
  });

  test("an admin reaches the admin area", async ({ browser }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.admin });
    const page = await context.newPage();

    await page.goto("/app/admin");

    await expect(page.getByRole("heading", { name: "Área Administrativa" })).toBeVisible();
    await expect(page.getByText("Esta área é restrita a administradores")).toBeVisible();

    await context.close();
  });
});
