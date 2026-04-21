import { test, expect } from "../helpers/fixtures";

test.describe("NumberStepper", () => {
  test("increment/decrement buttons update value", async ({ gotoRoute, page }) => {
    await gotoRoute("NumberStepper");
    await expect(page.getByTestId("value")).toHaveText("5");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("value")).toHaveText("6");
    await page.getByRole("button", { name: "Decrement" }).click();
    await page.getByRole("button", { name: "Decrement" }).click();
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("ArrowUp/ArrowDown on spinbutton input step the value", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NumberStepper");
    const input = page.getByRole("spinbutton");
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("value")).toHaveText("6");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("aria-valuenow reflects the current value", async ({ gotoRoute, page }) => {
    await gotoRoute("NumberStepper");
    const input = page.getByRole("spinbutton");
    await expect(input).toHaveAttribute("aria-valuenow", "5");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(input).toHaveAttribute("aria-valuenow", "6");
  });

  test("increment disabled at max=10; decrement disabled at min=0", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NumberStepper");
    const inc = page.getByRole("button", { name: "Increment" });
    const dec = page.getByRole("button", { name: "Decrement" });
    // Seed: start at 5, click Increment 5 times to reach 10.
    for (let i = 0; i < 5; i++) await inc.click();
    await expect(page.getByTestId("value")).toHaveText("10");
    await expect(inc).toBeDisabled();
    // Back down to 0 — decrement 10 times.
    for (let i = 0; i < 10; i++) await dec.click();
    await expect(page.getByTestId("value")).toHaveText("0");
    await expect(dec).toBeDisabled();
  });
});
