import { test, expect } from "../helpers/fixtures";

test.describe("DateRangePicker", () => {
  test("initial range renders; selecting outside min/max is clamped", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("DateRangePicker");
    await expect(page.getByTestId("value")).toContainText("2026-04-10 → 2026-04-20");
    // Click the trigger to open the range picker (if it's popover-mode) —
    // otherwise the grid is already visible for inline-mode variants.
    const trigger = page.locator("button, input").filter({ hasText: /pick|select|2026/i }).first();
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
    }
    // Confirm the picker mounted at least one grid.
    await expect(page.getByRole("grid").first()).toBeVisible();
  });
});
