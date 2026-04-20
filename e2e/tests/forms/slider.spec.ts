import { test, expect } from "../helpers/fixtures";

test.describe("Slider", () => {
  test("ArrowRight increments by step", async ({ gotoRoute, page }) => {
    await gotoRoute("Slider");
    await expect(page.getByTestId("value")).toContainText("value: 50");
    const input = page.getByRole("slider");
    await input.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("value")).toContainText("value: 55");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("value")).toContainText("value: 60");
  });

  test("ArrowLeft respects min clamp", async ({ gotoRoute, page }) => {
    await gotoRoute("Slider");
    const input = page.getByRole("slider");
    await input.focus();
    // Home jumps to min (0) on native range input.
    await page.keyboard.press("Home");
    await expect(page.getByTestId("value")).toContainText("value: 0");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("value")).toContainText("value: 0");
  });

  test("End jumps to max", async ({ gotoRoute, page }) => {
    await gotoRoute("Slider");
    const input = page.getByRole("slider");
    await input.focus();
    await page.keyboard.press("End");
    await expect(page.getByTestId("value")).toContainText("value: 100");
  });
});
