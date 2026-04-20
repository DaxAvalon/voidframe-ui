import { test, expect } from "../helpers/fixtures";

test.describe("RadioGroup", () => {
  test("clicking a different radio updates the selected value", async ({ gotoRoute, page }) => {
    await gotoRoute("RadioGroup");
    await expect(page.getByTestId("value")).toContainText("value: m");
    await page.getByRole("radio", { name: "Large" }).click();
    await expect(page.getByTestId("value")).toContainText("value: l");
  });
});
