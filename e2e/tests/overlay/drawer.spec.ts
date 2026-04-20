import { test, expect } from "../helpers/fixtures";

test.describe("DrawerV2", () => {
  test("side=right opens; body scroll locked while open (modal)", async ({ gotoRoute, page }) => {
    await gotoRoute("DrawerV2");
    const beforeOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // ScrollLock sets body.style.overflow = "hidden".
    const whileOpen = await page.evaluate(() => document.body.style.overflow);
    expect(whileOpen).toBe("hidden");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const afterOverflow = await page.evaluate(() => document.body.style.overflow);
    // Restored — either back to the pre-open value or cleared.
    expect(afterOverflow === "" || afterOverflow === beforeOverflow).toBeTruthy();
  });

  test("focus restores to trigger on Escape close", async ({ gotoRoute, page }) => {
    await gotoRoute("DrawerV2");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const focusedId = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    expect(focusedId).toBe("trigger");
  });

  test("Close button dismisses", async ({ gotoRoute, page }) => {
    await gotoRoute("DrawerV2");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("drawer-close").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
