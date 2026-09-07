import { expect, test, type Page } from "@playwright/test";
import { STORAGE_STATE } from "./seed-credentials";

/**
 * The projects tab's four paths — create, edit, delete, search — plus the reason
 * this change exists.
 *
 * The tab used to seed a `useState` from a server-fetched `initial` prop and
 * hand-mutate that array on every save and delete. Nothing refetched, so its
 * list and the database drifted until the page was reloaded. It is now a
 * `@tanstack/react-query` query with three mutations that invalidate it.
 *
 * A create-edit-delete walk on its own does not tell the two apart: the old
 * hand-merge put the modal's own response payload into the list, so the row it
 * rendered looked right too. The last test is the one that separates them.
 */
test.use({ storageState: STORAGE_STATE.company });

const SEEDED_PROJECT = "Obra Rodovia BR-101";
const OTHER_SEEDED_PROJECT = "Ponte Nova";

async function openProjectsTab(page: Page) {
  await page.goto("/app/company/dashboard?tab=projects");
  await expect(page.getByText(SEEDED_PROJECT)).toBeVisible();
}

/**
 * The tab is remounted, so the query behind it decides what is rendered.
 *
 * "Left the tab" is asserted on the add button rather than on a project name
 * disappearing: the complaints tab names the project each complaint is filed
 * against, so the seeded project's name is still on the page over there.
 */
async function leaveAndReturnToProjectsTab(page: Page) {
  const addButton = page.getByRole("button", { name: "Adicionar novo projeto" });
  await page.getByRole("button", { name: "Reclamações" }).click();
  await expect(addButton).toHaveCount(0);
  await page.getByRole("button", { name: "Projetos" }).click();
  await expect(addButton).toBeVisible();
}

test("a project can be created, edited and deleted", async ({ page }) => {
  await openProjectsTab(page);

  // ─── Create ───
  const name = `Projeto E2E ${Date.now()}`;
  await page.getByRole("button", { name: "Adicionar novo projeto" }).click();
  await page.getByLabel("Título do projeto").fill(name);
  await page.getByLabel("Descrição do projeto").fill("Descrição criada pelo teste.");
  await page.getByLabel("Localização do projeto").fill("Curitiba, PR");
  await page.getByLabel("Status do projeto").selectOption("IN_PROGRESS");
  await page.getByRole("button", { name: "Criar" }).click();

  // The modal closes on the mutation's promise, and that promise only settles
  // once the invalidated query has refetched — so the row being here is a read
  // of the database, not the payload the POST returned.
  await expect(page.getByLabel("Título do projeto")).toHaveCount(0);
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText("Descrição criada pelo teste.")).toBeVisible();

  // ─── Search ───
  const searchField = page.getByPlaceholder("Buscar projetos...");
  await searchField.fill(name);
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText(SEEDED_PROJECT)).toHaveCount(0);

  // Searching a description, not just a name: the filter reads both fields.
  await searchField.fill("Duplicação do trecho");
  await expect(page.getByText(SEEDED_PROJECT)).toBeVisible();
  await expect(page.getByText(name)).toHaveCount(0);

  await searchField.fill("");
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText(SEEDED_PROJECT)).toBeVisible();

  // ─── Edit ───
  const editedName = `${name} editado`;
  await page.getByRole("button", { name: `Editar ${name}` }).click();

  // The form is filled from the list the query returned. An empty field here
  // means the row never came back from the server.
  await expect(page.getByLabel("Título do projeto")).toHaveValue(name);
  await expect(page.getByLabel("Localização do projeto")).toHaveValue("Curitiba, PR");
  await page.getByLabel("Título do projeto").fill(editedName);
  await page.getByLabel("Status do projeto").selectOption("COMPLETED");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByLabel("Título do projeto")).toHaveCount(0);
  await expect(page.getByText(editedName)).toBeVisible();
  await expect(page.getByText("Concluído")).toBeVisible();

  // A reload proves the edit was written, not just rendered.
  await page.reload();
  await expect(page.getByText(editedName)).toBeVisible();

  // ─── Delete ───
  await page.getByRole("button", { name: `Excluir ${editedName}` }).click();
  // `exact`, because every card carries an "Excluir <name>" button of its own.
  await page.getByRole("button", { name: "Excluir", exact: true }).click();

  await expect(page.getByText(editedName)).toHaveCount(0);
  await expect(page.getByText(SEEDED_PROJECT)).toBeVisible();

  await page.reload();
  await expect(page.getByText(editedName)).toHaveCount(0);
});

/**
 * The regression test for the cache this change removed, and the only test here
 * that fails against the old component.
 *
 * A project is written straight to the API, behind the tab's back, so no modal
 * ever hands the list a payload for it. The tab is then left and returned to.
 * The old version re-seeded its `useState` from the `initial` prop the server
 * rendered at page load and so could never show this row; the query refetches on
 * mount and does.
 */
test("the list refetches, so a project written behind the tab's back appears", async ({
  page,
}) => {
  await openProjectsTab(page);

  const name = `Projeto fora da aba ${Date.now()}`;
  const created = await page.request.post("/api/company/projects", {
    data: { name, description: "Escrito direto na API.", status: "PLANNING" },
  });
  expect(created.ok()).toBe(true);
  const { project } = (await created.json()) as { project: { id: string } };

  // Not visible yet: nothing has told this tab to read again.
  await expect(page.getByText(name)).toHaveCount(0);

  await leaveAndReturnToProjectsTab(page);
  await expect(page.getByText(name)).toBeVisible();

  // Deleted behind the tab's back too, so the refetch has to drop a row as well
  // as add one — a stale list that merely grew would pass on the half above.
  const deleted = await page.request.delete(`/api/company/projects/${project.id}`);
  expect(deleted.ok()).toBe(true);
  await expect(page.getByText(name)).toBeVisible();

  await leaveAndReturnToProjectsTab(page);
  await expect(page.getByText(name)).toHaveCount(0);
  await expect(page.getByText(OTHER_SEEDED_PROJECT)).toBeVisible();
});
