import { test, expect } from "../helpers/fixtures";

test.describe("ColorPicker", () => {
  test("typing a valid hex into the Hex field updates the readout", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ColorPicker");
    await expect(page.getByTestId("hex")).toHaveText("#3366ff");
    const hex = page.getByLabel("Hex color");
    await hex.fill("#abcdef");
    // Valid 6-digit hex is parsed and canonicalised — round-trip should hit
    // #abcdef exactly.
    await expect(page.getByTestId("hex")).toHaveText("#abcdef");
  });

  test("clicking a preset swatch sets the hex value", async ({ gotoRoute, page }) => {
    await gotoRoute("ColorPicker");
    const swatches = page.getByRole("group", { name: "Color swatches" });
    await swatches.getByRole("button", { name: "#ff0000" }).click();
    await expect(page.getByTestId("hex")).toHaveText("#ff0000");
  });

  test("changing the Hue range input updates the hex readout", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ColorPicker");
    const before = await page.getByTestId("hex").textContent();
    const hue = page.getByLabel("Hue");
    // Native <input type="range"> controlled by React — set the value via
    // the prototype's native setter so React's internal value tracker sees
    // the change, then dispatch 'input' so onChange fires.
    await hue.evaluate((el) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
      setter?.call(input, "180");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.getByTestId("hex")).not.toHaveText(before ?? "");
  });
});
