import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test, type Browser, type Page } from "@playwright/test";
import { STORAGE_STATE } from "../e2e/seed-credentials";
import { SCREENS, type Screen, type ScreenRole } from "./catalog";

const OUTPUT_DIR = join(__dirname, "..", "assets", "telas");

/**
 * 1440x900 at 2x. The width is a common laptop viewport, so the figures show
 * the layout a reader actually meets; the scale factor is what keeps the text
 * legible after Word shrinks the image to the page width.
 */
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

/**
 * JPEG, not PNG. Half of these screens carry a photographic background, and
 * PNG stores those at around 3.5 MB each — the assembled document came out at
 * 31 MB, which is not a document anyone can email to an advisor. At quality 88
 * and twice the pixel density, the compression is invisible in the figures and
 * the same document lands near 10 MB.
 */
const QUALITY = 88;

function contextOptions(role: ScreenRole) {
  return {
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    locale: "pt-BR",
    ...(role === "public" ? {} : { storageState: STORAGE_STATE[role] }),
  };
}

/**
 * Waits for the page to stop moving. `networkidle` alone is not enough: the
 * app fades content in, and a screenshot taken mid-transition shows a
 * half-transparent card.
 *
 * The fixed pause covers what the browser cannot report — content rendered a
 * frame after the last response — and `waitForMotionToStop` covers what it
 * can: the animations and transitions that pause was being asked to outlast.
 */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle").catch(() => {
    // A page that polls never goes idle. The timeout below is the real wait.
  });
  // The dev server paints its own floating badge over the bottom-left corner.
  // It is part of Next, not of the platform, and a reader of the manual would
  // read it as a control they are missing.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.waitForTimeout(600);
  await waitForMotionToStop(page);
}

/**
 * Resolves once every finite animation and CSS transition on the page has
 * finished.
 *
 * Infinite ones — spinners, pulses — never finish, so they are skipped rather
 * than waited on: a figure with a spinner in it is a data problem, not a
 * timing one, and waiting on one would hang the whole run.
 */
async function waitForMotionToStop(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      document.getAnimations().every((animation) => {
        const iterations = animation.effect?.getComputedTiming().iterations ?? 1;
        return (
          !Number.isFinite(iterations) ||
          animation.playState === "finished" ||
          animation.playState === "idle"
        );
      }),
    undefined,
    { timeout: 15_000 }
  );
}

async function capture(browser: Browser, screen: Screen): Promise<void> {
  const context = await browser.newContext(contextOptions(screen.role));
  const page = await context.newPage();

  try {
    if (screen.open) {
      await screen.open(page);
    } else if (screen.path) {
      await page.goto(screen.path);
    } else {
      throw new Error(`Screen ${screen.id} has neither path nor open()`);
    }

    await settle(page);

    await page.screenshot({
      path: join(OUTPUT_DIR, `${screen.id}.jpg`),
      type: "jpeg",
      quality: QUALITY,
      fullPage: screen.fullPage ?? false,
      animations: "disabled",
    });
  } finally {
    await context.close();
  }
}

test.describe("platform screens", () => {
  test.beforeAll(() => {
    // A stale PNG from a screen that was renamed or dropped would still be
    // picked up by the document generator, so the directory is rebuilt.
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
    mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  for (const screen of SCREENS) {
    test(`${screen.id} — ${screen.caption}`, async ({ browser }) => {
      await capture(browser, screen);
    });
  }
});
