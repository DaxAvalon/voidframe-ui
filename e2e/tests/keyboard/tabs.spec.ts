import { test, expect } from "../helpers/fixtures";

test.describe("Tabs", () => {
  test("ArrowRight/Left cycles Tabs.Trigger focus (roving tabindex)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Tabs");
    await page.getByTestId("tab-overview").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("tab-activity")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("tab-settings")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("tab-activity")).toBeFocused();
  });

  test("Home/End jump to first / last trigger", async ({ gotoRoute, page }) => {
    await gotoRoute("Tabs");
    await page.getByTestId("tab-overview").focus();
    await page.keyboard.press("End");
    await expect(page.getByTestId("tab-settings")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByTestId("tab-overview")).toBeFocused();
  });
});
