import { expect, test } from "@playwright/test";
import { STORAGE_STATE } from "./seed-credentials";

/**
 * Covers the walkthrough `oversized-files` slice 01 asks for, as a spec rather
 * than as a paragraph in a pull request. The split moved state across four
 * component boundaries — the tag list, the cover image, the preview and the
 * formatting toolbar — and that is the class of change that type-checks, builds,
 * and is still wrong at runtime.
 *
 * Not covered: uploading a cover image by the file picker or by dropping one on
 * the editor. Both go through UploadThing, which this suite has no offline stand-in
 * for. The field's other path, typing a URL, is covered.
 */
test.use({ storageState: STORAGE_STATE.admin });

const SEEDED_POST = "como-reclamar-com-seguranca";

/**
 * The tag names are deliberately not seeded ones. Saving a post with a tag whose
 * name differs from an existing tag only by case returns a 500: `BlogRepo.linkTags`
 * arbitrates `ON CONFLICT` on `name` alone, while `blog_tags` is also unique on
 * `slug`, so "infraestrutura" against the seeded "Infraestrutura" collides on the
 * constraint the clause does not cover. That is a real bug and not this spec's
 * subject — filed separately rather than encoded here as expected behaviour.
 */

test("a new post can be written, tagged, previewed and saved", async ({ page }) => {
  await page.goto("/blog/new/edit");
  await expect(page.getByRole("heading", { name: "Criar Novo Post" })).toBeVisible();

  const title = `Post de teste ${Date.now()}`;
  await page.getByPlaceholder("Digite o título do post").fill(title);

  // The toolbar writes into the textarea it finds, which is the seam most likely
  // to have broken: it moved into its own component and reaches the field through
  // `document.querySelector`.
  const body = page.getByPlaceholder("Escreva seu conteúdo em Markdown...");
  await body.fill("Corpo do post com conteudo suficiente para salvar.");
  await page.getByRole("button", { name: "Negrito" }).click();
  await expect(body).toHaveValue(/\*\*/);

  // Tags: add two, remove one. `newTag` now lives inside TagInput while the
  // committed list stays on the page, so a broken contract shows up here.
  // The remove button carries an aria-label because it is an icon-only control.
  // `docs/qa-gaps.md` item 1 lists exactly this class of button as an open gap;
  // this is one instance of it closed, found because the test could not name it.
  const tagField = page.getByPlaceholder("Adicionar tag...");
  await tagField.fill("tag-de-teste-a");
  await tagField.press("Enter");
  await tagField.fill("tag-de-teste-b");
  await tagField.press("Enter");
  await expect(page.getByText("tag-de-teste-a", { exact: true })).toBeVisible();
  await expect(page.getByText("tag-de-teste-b", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Remover tag tag-de-teste-a" }).click();
  await expect(page.getByText("tag-de-teste-a", { exact: true })).toHaveCount(0);
  await expect(page.getByText("tag-de-teste-b", { exact: true })).toBeVisible();

  // The cover field's typed-URL path.
  await page.getByPlaceholder("URL da imagem").fill("https://example.com/capa.png");

  // Preview and back. The preview is its own component now and reads title and
  // content as props rather than closing over them.
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Editar" }).click();
  await expect(body).toBeVisible();

  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForURL(/\/blog\/post-de-teste-/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});

test("an existing post loads into the editor and saves", async ({ page }) => {
  await page.goto(`/blog/${SEEDED_POST}/edit`);
  await expect(page.getByRole("heading", { name: "Editar Post" })).toBeVisible();

  // The fetch in `useEffect` fills the fields. It reads state the split moved, so
  // an empty title here is the loop-or-no-fetch failure the slice warned about.
  await expect(page.getByPlaceholder("Digite o título do post")).toHaveValue(
    "Como reclamar com segurança"
  );
  const body = page.getByPlaceholder("Escreva seu conteúdo em Markdown...");
  await expect(body).not.toHaveValue("");

  await body.fill("Guia atualizado pelo teste de ponta a ponta.");
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForURL(`/blog/${SEEDED_POST}`);
});
