import { expect, test } from "@playwright/test";
import { STORAGE_STATE } from "./seed-credentials";

/**
 * The company statistics that appear on four screens: how many dialogues, cases and
 * projects a company has, and how fast it answers.
 *
 * This spec exists because those numbers used to be interpolated in front of hardcoded
 * plurals — "1 diálogos ativos" — and because a company that has never answered rendered
 * its average response time as a bare "-". Both are text a unit test can pin in isolation,
 * but neither is reachable from one: the strings are built inside a client component that
 * the Vitest `node` environment cannot render. A browser is the only place the assembled
 * line can be read.
 *
 * ── Why it is numbered 02b ──────────────────────────────────────────────────────────────
 *
 * Every assertion here depends on Construtora X having exactly ONE of each thing, which is
 * the seeded state and the whole point — 1 is the only count that takes the singular. Two
 * later specs destroy it: `03-company-reply` moves a report to RESPONDED and `04-person-
 * create-complaint` adds a row, after which the counts are 2 and the singular is correct
 * to no longer appear. So this has to run after `02-person-dashboard` and before `03`,
 * and Playwright orders by file path.
 *
 * The alternative was renumbering 03 through 05, which would have rewritten the history of
 * three files to insert one.
 */
test.describe("company statistics", () => {
  /**
   * Construtora X, as the seed leaves it: 3 reports, of which 1 RESOLVED and 1 RESPONDED,
   * and 1 IN_PROGRESS project. Three separate ones, so a bug that pluralises off the wrong
   * field still shows up.
   *
   * `avg_sec` is null because every seeded row is written in one statement, so `updated_at`
   * equals `created_at` and `CompaniesRepo.getStats` returns null rather than a duration.
   * That is what puts the empty response-time case on screen without the seed having to
   * stage it.
   */
  test.describe("on a report's detail page", () => {
    test.use({ storageState: STORAGE_STATE.person });

    test("the company card agrees in number and names its empty response time", async ({
      page,
    }) => {
      await page.goto("/app/complaints");
      await page.getByText("Atraso na entrega de documentação da obra").first().click();
      await expect(page).toHaveURL(/\/app\/complaints\/[0-9a-f-]{36}$/);

      // The stats are the company's, so prove the page names it before reading them.
      // Its name appears in three places on this page — the header, the card and the
      // metadata row — hence .first() rather than a walk up to the card element.
      await expect(page.getByText("Construtora X").first()).toBeVisible();

      await expect(page.getByText("1 diálogo ativo", { exact: true })).toBeVisible();
      await expect(page.getByText("1 caso resolvido", { exact: true })).toBeVisible();
      await expect(page.getByText("1 projeto em andamento", { exact: true })).toBeVisible();

      /**
       * The negative half matters more than the positive one. Asserting only that the
       * singular is present would still pass if the plural were rendered somewhere else on
       * the same page, and the bug was precisely a second string being shown.
       */
      await expect(page.getByText("1 diálogos ativos")).toHaveCount(0);
      await expect(page.getByText("1 casos resolvidos")).toHaveCount(0);
      await expect(page.getByText("1 projetos em andamento")).toHaveCount(0);

      await expect(page.getByText("Sem histórico de resposta")).toBeVisible();
      await expect(page.getByText("Resposta em -")).toHaveCount(0);
    });
  });

  /**
   * The public profile shows the same metric twice on one page — the tile strip at the top
   * and the performance card inside the Reclamações tab — so it is the screen where the two
   * could disagree about what "no data" is called.
   *
   * Signed out on purpose: the route renders for anonymous visitors, and a company's public
   * page is the one screen here a reader reaches without an account.
   */
  test.describe("on the public company profile", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("both cards name the empty response time the same way", async ({ page }) => {
      await page.goto("/company/construtora-x");

      await expect(page.getByRole("heading", { name: "Construtora X" })).toBeVisible();
      await expect(page.getByText("Tempo médio de resposta").first()).toBeVisible();
      await expect(page.getByText("Sem histórico").first()).toBeVisible();
      await expect(page.getByText("-", { exact: true })).toHaveCount(0);

      await page.getByRole("button", { name: /Reclamações/ }).click();
      await expect(page.getByText("Desempenho")).toBeVisible();

      /**
       * Once for the tile, once for the performance card. The count is the assertion: a
       * regression that reworded one of the two formatters would leave a single match here
       * while both `toBeVisible` checks above still passed.
       */
      await expect(page.getByText("Sem histórico")).toHaveCount(2);
    });

    /**
     * Transportes Sul reaches the empty response time by a different route than Construtora
     * X: it has no reports at all, rather than reports whose timestamps average to nothing.
     * Both end at a null from `CompaniesRepo.getStats`, but only one of them would survive a
     * change that started deriving the average from the report count.
     *
     * This does not check the zero-is-plural half of the rule. The plural sentences are
     * built by `countLabel`, which only renders on a report's detail page, and a company
     * with no reports has no such page to open — `countLabel(0, ...)` is covered in
     * `complaint-labels.test.ts` instead.
     */
    test("a company with no reports at all names its empty response time", async ({
      page,
    }) => {
      await page.goto("/company/transportes-sul");

      await expect(page.getByRole("heading", { name: "Transportes Sul" })).toBeVisible();
      await expect(page.getByText("Sem histórico").first()).toBeVisible();
      await expect(page.getByText("-", { exact: true })).toHaveCount(0);
    });
  });

  /**
   * The dashboard is the fourth reader and the odd one out: it renders the average as a
   * sub-line under another metric, and it used to pass `undefined`, which made MetricCard
   * drop the line entirely rather than print a dash. The assertion is that the line is
   * there at all.
   */
  test.describe("on the company's own dashboard", () => {
    test.use({ storageState: STORAGE_STATE.company });

    test("the average response time shows instead of vanishing", async ({ page }) => {
      await page.goto("/app/company/dashboard");

      await expect(page.getByText("Taxa de resolução")).toBeVisible();
      await expect(page.getByText("Resp. média: Sem histórico")).toBeVisible();
    });
  });
});
