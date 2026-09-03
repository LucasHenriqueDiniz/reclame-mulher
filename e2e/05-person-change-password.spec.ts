import { expect, test } from "@playwright/test";
import { STORAGE_STATE, readSeedPassword } from "./seed-credentials";
import { runClientIp } from "./rate-limit-bucket";

/**
 * MANUAL_PLATAFORMA.md, "Configurações de Segurança" — the password change on
 * Configurações → Senha.
 *
 * The password is read from scripts/seed.ts, never written here, and the new
 * one is derived from it rather than invented, so this file contains no
 * credential of its own.
 *
 * The change is real: it rewrites the hash the seed produced. The test then
 * puts it back, which is worth doing for its own sake — it proves the new
 * password actually took effect, not just that the endpoint answered 200.
 */
test.use({
  storageState: STORAGE_STATE.person,
  // /api/auth/change-password is rate-limited, and this spec posts to it three
  // times. Its own bucket, per rate-limit-bucket.ts.
  extraHTTPHeaders: { "x-forwarded-for": runClientIp("change-password") },
});

const CURRENT_PASSWORD_FIELD = "Digite sua senha atual";
const NEW_PASSWORD_FIELD = "Mínimo 8 caracteres";
const CONFIRM_PASSWORD_FIELD = "Repita a nova senha";

async function submitPasswordChange(
  page: import("@playwright/test").Page,
  current: string,
  next: string
): Promise<void> {
  await page.getByPlaceholder(CURRENT_PASSWORD_FIELD).fill(current);
  await page.getByPlaceholder(NEW_PASSWORD_FIELD).fill(next);
  await page.getByPlaceholder(CONFIRM_PASSWORD_FIELD).fill(next);
  await page.getByRole("button", { name: "Salvar" }).click();
}

test("a person changes her password from the settings screen", async ({ page }) => {
  const seedPassword = readSeedPassword();
  const rotatedPassword = `${seedPassword}-rotated`;

  await page.goto("/app/settings");
  await page.getByRole("button", { name: "Senha", exact: true }).click();
  await expect(page.getByPlaceholder(CURRENT_PASSWORD_FIELD)).toBeVisible();

  // The wrong current password is refused, and says so.
  await submitPasswordChange(page, `${seedPassword}-wrong`, rotatedPassword);
  await expectToast(page, "Senha atual inválida");

  // The right one goes through.
  await submitPasswordChange(page, seedPassword, rotatedPassword);
  await expectToast(page, "Sua senha foi atualizada com sucesso.");

  // The seed password is now the wrong one. This is the assertion that the
  // change reached the database rather than only the response body — and it
  // flips the toast back to the error, so the last check below cannot pass on
  // a message that was already on screen.
  await submitPasswordChange(page, seedPassword, rotatedPassword);
  await expectToast(page, "Senha atual inválida");

  // Put the seed password back, so the database is left as the seed wrote it.
  await submitPasswordChange(page, rotatedPassword, seedPassword);
  await expectToast(page, "Sua senha foi atualizada com sucesso.");
});

/**
 * Toast text lands twice in the DOM: once in the toast itself and once in
 * Radix's aria-live announcer, which concatenates title and description. An
 * exact match picks the toast.
 */
async function expectToast(page: import("@playwright/test").Page, text: string): Promise<void> {
  await expect(page.getByText(text, { exact: true })).toBeVisible();
}
