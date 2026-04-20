import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type ThemeName = "dark" | "light" | "midnight" | "grey" | "system";

interface GotoRouteOptions {
  theme?: ThemeName;
}

export interface HarnessFixture {
  /** Navigate to `#/<name>` on the e2e harness. Optionally pass `?theme=`. */
  gotoRoute: (name: string, opts?: GotoRouteOptions) => Promise<void>;
  /**
   * Run axe-core against the current page and assert zero violations.
   * Disabled rules (harness-specific, not library issues):
   * - `color-contrast` — tokens vary across themes; covered manually in palette audit.
   * - `region` — harness <main> is already the sole landmark.
   * - `page-has-heading-one` — routes are component fixtures, not full pages.
   * - `landmark-one-main` — same reason.
   */
  expectAxeClean: () => Promise<void>;
}

export const test = base.extend<HarnessFixture>({
  gotoRoute: async ({ page }, use) => {
    await use(async (name: string, opts: GotoRouteOptions = {}) => {
      const query = opts.theme ? `?theme=${opts.theme}` : "";
      await page.goto(`/#/${name}${query}`);
      // Wait for the suspense fallback to resolve — any element rendered
      // inside <main> by the fixture signals the route has mounted.
      await page.locator("main > :not(p)").first().waitFor({ state: "attached", timeout: 10_000 });
    });
  },
  expectAxeClean: async ({ page }, use) => {
    await use(async () => {
      const results = await new AxeBuilder({ page })
        .disableRules([
          "color-contrast",
          "region",
          "page-has-heading-one",
          "landmark-one-main",
        ])
        .analyze();
      expect(results.violations, formatViolations(results.violations)).toEqual([]);
    });
  },
});

export { expect } from "@playwright/test";

/** Helper: position the mouse on top of an element's centre. */
export async function hoverCentre(page: Page, selector: string): Promise<void> {
  const locator = page.locator(selector).first();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`hoverCentre: ${selector} has no bounding box`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

function formatViolations(violations: unknown[]): string {
  if (!violations.length) return "";
  const summary = (violations as Array<{ id: string; description: string; nodes: unknown[] }>)
    .map((v) => `  [${v.id}] ${v.description} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`)
    .join("\n");
  return `Axe violations:\n${summary}`;
}
