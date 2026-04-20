import { test, expect } from "../helpers/fixtures";

test.describe("Combobox", () => {
  test("ArrowDown + Enter selects option", async ({ gotoRoute, page }) => {
    await gotoRoute("Combobox");
    const input = page.getByRole("combobox");
    await input.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    // After selection the emitted value is reflected in the `value:` paragraph.
    await expect(page.getByTestId("value")).toContainText(/selected: (apple|apricot|banana|cherry|grape)/);
  });

  test("typed query filters the listbox", async ({ gotoRoute, page }) => {
    await gotoRoute("Combobox");
    const input = page.getByRole("combobox");
    await input.click();
    await input.fill("cher");
    // Listbox should show Cherry and not Apple.
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    await expect(listbox.getByText("Cherry")).toBeVisible();
    await expect(listbox.getByText("Apple")).toHaveCount(0);
  });
});
