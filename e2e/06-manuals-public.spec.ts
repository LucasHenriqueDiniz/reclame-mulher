import { expect, test } from "@playwright/test";

/**
 * The end-user manuals, and the one thing about them a static check cannot see.
 *
 * Delivering them passed two gates — the six files are under `public/manuais/`, and
 * all six filenames appear under `src/app` — and the delivery was still broken: the
 * middleware gated `/manuais` behind a session, so every route answered `307` to
 * `/login`. "Served" and "linked" are both true of a page nobody can open.
 *
 * These manuals document how to use the platform. The reader who needs them most is
 * the one who has not signed in: someone deciding whether to register, or stuck at
 * the login screen. So the requirement is reachability *without* a session, and that
 * is what this file measures.
 *
 * Every context here is deliberately session-free — no `storageState`.
 *
 * ⚠️ **The failure mode of these assertions was verified against the deployed site, not
 * locally.** Removing `/manuais` from the middleware's public list and re-running this
 * file on a fresh local server (`CI=1`, port killed first) still passed nine of nine —
 * `next dev` did not reproduce the redirect. The same request against Vercel, on a
 * deployment reported `success`, answered `307` to `/login` while `/ajuda` answered
 * `200`. So the bug is real and production-only, and the strength of this file as a
 * guard is unproven: it asserts the right thing and it holds today, but it has not been
 * shown to fail when the middleware regresses. Treat a green run here as weaker evidence
 * than a `curl` against the deployment until someone reproduces the dev/production
 * divergence.
 */

const MARKDOWN_MANUALS = [
  "leia-me-primeiro",
  "guia-rapido",
  "indice",
  "fluxos-visuais",
  "manual-da-plataforma",
] as const;

test.describe("manuals are readable without signing in", () => {
  test("the index lists the family and does not redirect", async ({ page }) => {
    const response = await page.goto("/manuais");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/manuais$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Manuais");
  });

  for (const slug of MARKDOWN_MANUALS) {
    test(`/manuais/${slug} renders as a page`, async ({ page }) => {
      const response = await page.goto(`/manuais/${slug}`);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/manuais/${slug}$`));

      // Rendered, not downloaded: the Markdown became headings in the DOM.
      await expect(page.locator("article h1, article h2").first()).toBeVisible();
    });
  }

  test("the HTML manual is served as a file, not redirected", async ({ request }) => {
    // Requested through `request` rather than `page` so a redirect shows as a status
    // rather than as a rendered login screen.
    const response = await request.get("/manuais/MANUAL_PLATAFORMA.html", {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<html");
  });

  test("the raw Markdown is downloadable", async ({ request }) => {
    const response = await request.get("/manuais/GUIA_RAPIDO.md", { maxRedirects: 0 });

    expect(response.status()).toBe(200);
    // Portuguese on purpose — this is product content. If this assertion starts
    // failing because the text is English, the manual was translated by accident.
    expect(await response.text()).toContain("Guia");
  });

  test("the help page links to the manuals", async ({ page }) => {
    await page.goto("/ajuda");

    await expect(page.getByRole("link", { name: /Manuais da Plataforma/i })).toBeVisible();
  });
});
