import { test, expect } from "../helpers/fixtures";

test.describe("Accordion", () => {
  test("ArrowDown moves between triggers; Enter toggles item", async ({ gotoRoute, page }) => {
    await gotoRoute("Accordion");
    const triggerA = page.getByTestId("trigger-a");
    const triggerB = page.getByTestId("trigger-b");
    await triggerA.focus();
    await page.keyboard.press("ArrowDown");
    await expect(triggerB).toBeFocused();
    // Initially only A is open (defaultValue="a"); pressing Enter on B
    // opens B (and closes A under type="single").
    await page.keyboard.press("Enter");
    await expect(triggerB).toHaveAttribute("aria-expanded", "true");
    await expect(triggerA).toHaveAttribute("aria-expanded", "false");
  });
});
