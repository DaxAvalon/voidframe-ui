import { test, expect } from "../helpers/fixtures";

test.describe("DatePicker", () => {
  test("renders a date grid and the currently-selected date", async ({ gotoRoute, page }) => {
    await gotoRoute("DatePicker");
    // Inline variant — calendar is always visible.
    await expect(page.getByRole("grid")).toBeVisible();
    // Initial value is 2026-04-15.
    await expect(page.getByTestId("value")).toContainText("2026-04-15");
  });

  test("clicking a different day updates the selected value", async ({ gotoRoute, page }) => {
    await gotoRoute("DatePicker");
    // Click "20" inside the current month's grid.
    const grid = page.getByRole("grid");
    await grid.getByRole("gridcell", { name: "20" }).click();
    await expect(page.getByTestId("value")).toContainText("2026-04-20");
  });
});
