import { test, expect } from "../helpers/fixtures";

// Tier C display sweep — axe/render coverage for mostly-passive display
// components across all four built-in themes. Render-smoke catches
// "component throws on render" regressions without cycling themes, and a
// single interactive flow verifies the BannerAlert dismiss callback.

type Theme = "dark" | "light" | "midnight" | "grey";
const THEMES: readonly Theme[] = ["dark", "light", "midnight", "grey"];

const SECTIONS = [
  "cards",
  "status",
  "progress",
  "avatars",
  "feedback",
  "empty",
  "skeleton",
] as const;

test.describe("axe: DisplaySweep", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Axe sweep runs on chromium only"
  );

  for (const theme of THEMES) {
    test(`DisplaySweep — ${theme} theme at rest`, async ({
      gotoRoute,
      expectAxeClean,
    }) => {
      await gotoRoute("DisplaySweep", { theme });
      await expectAxeClean();
    });
  }
});

test.describe("DisplaySweep render smoke", () => {
  test("every section renders without error", async ({ gotoRoute, page }) => {
    await gotoRoute("DisplaySweep");
    for (const name of SECTIONS) {
      await expect(page.getByTestId(`section-${name}`)).toBeVisible();
    }
  });

  test("BannerAlert dismiss hides the banner", async ({ gotoRoute, page }) => {
    await gotoRoute("DisplaySweep");
    const banner = page.getByTestId("banner-dismissible");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Dismiss" }).click();
    await expect(banner).toBeHidden();
  });
});
