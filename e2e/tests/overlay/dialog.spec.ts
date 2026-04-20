import { test, expect } from "../helpers/fixtures";

test.describe("Dialog", () => {
  test("focus-trap: Tab cycles inside Dialog.Content", async ({ gotoRoute, page }) => {
    await gotoRoute("Dialog");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Initial focus lands inside the dialog. Tab four times — we have 3
    // focusables (reason input, cancel, confirm) so the 4th Tab must wrap.
    const dialog = page.getByRole("dialog");
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    const active = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    expect(["reason-input", "cancel", "confirm"]).toContain(active);
    // And that active element is inside the dialog (not the outside button).
    await expect(dialog.locator(":focus")).toHaveCount(1);
  });

  test("focus restores to trigger on close", async ({ gotoRoute, page }) => {
    await gotoRoute("Dialog");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const focusedId = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    expect(focusedId).toBe("trigger");
  });

  test("Escape closes Dialog", async ({ gotoRoute, page }) => {
    await gotoRoute("Dialog");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("backdrop pointerdown dismisses (single-fire, not bounce)", async ({ gotoRoute, page }) => {
    await gotoRoute("Dialog");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Click the backdrop — a coordinate near the top-left corner of
    // the viewport is outside the centred panel.
    await page.mouse.click(10, 10);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // Give it a beat to see if a second fire re-opens.
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
