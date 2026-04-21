import { test, expect } from "../helpers/fixtures";

test.describe("Menu", () => {
  test("opening the menu auto-focuses the first item; arrow-nav cycles", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Menu");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("menu")).toBeVisible();
    // Menu.Content's effect moves focus to the first non-disabled item on
    // open via rAF; Playwright auto-waits on toBeFocused.
    await expect(page.getByTestId("item-first")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("item-second")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("item-first")).toBeFocused();
  });

  test("SubTrigger ArrowRight opens submenu; ArrowLeft closes", async ({ gotoRoute, page }) => {
    await gotoRoute("Menu");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("menu").first()).toBeVisible();
    const subTrigger = page.getByTestId("sub-trigger");
    await subTrigger.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("sub-item-one")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("sub-item-one")).toHaveCount(0);
  });
});
