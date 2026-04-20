import { test, expect } from "../helpers/fixtures";

test.describe("MultiSelect", () => {
  test("Backspace removes last chip when input empty", async ({ gotoRoute, page }) => {
    await gotoRoute("MultiSelect");
    // Default: alpha,bravo selected.
    await expect(page.getByTestId("values")).toContainText("alpha,bravo");
    const input = page.getByRole("combobox");
    await input.focus();
    // Empty-input Backspace should pop the trailing chip (bravo).
    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("values")).toContainText("selected: alpha");
  });
});
