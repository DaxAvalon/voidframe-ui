import { test, expect } from "../helpers/fixtures";

test.describe("Theme switch while overlay open", () => {
  test("dark → light: dialog stays open, data-vf-theme flips, axe clean", async ({
    gotoRoute,
    page,
    browserName,
    expectAxeClean,
  }) => {
    // Axe sweep is chromium-only; the rest of the test runs everywhere.
    await gotoRoute("ThemeSwitchLive", { theme: "dark" });
    await expect(page.locator(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "dark"
    );

    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Drive the theme switch via the harness: update the query portion of
    // the hash and fire the event. The Harness re-reads theme on render
    // and passes a new `themeName` to VoidframeProvider.
    await page.evaluate(() => {
      window.location.hash = "#/ThemeSwitchLive?theme=light";
    });

    await expect(page.locator(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "light"
    );
    // Dialog remains open and visible after the theme swap.
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByTestId("dialog-body")).toBeVisible();

    if (browserName === "chromium") await expectAxeClean();
  });

  test("light → dark: also survives reverse switch", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ThemeSwitchLive", { theme: "light" });
    await expect(page.locator(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "light"
    );

    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.evaluate(() => {
      window.location.hash = "#/ThemeSwitchLive?theme=dark";
    });

    await expect(page.locator(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "dark"
    );
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
