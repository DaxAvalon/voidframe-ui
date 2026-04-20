import { test, expect } from "../helpers/fixtures";

test.describe("Menu", () => {
  test("ArrowDown cycles items once focus is inside the menu", async ({ gotoRoute, page }) => {
    await gotoRoute("Menu");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("menu")).toBeVisible();
    // NOTE: Menu.Trigger click-opens the menu but does not auto-move focus
    // into it (library gap; item 1 in POST-SHIP-GAPS). Seed focus manually.
    await page.getByTestId("item-first").focus();
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
