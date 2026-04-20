import { test, expect } from "../helpers/fixtures";

test.describe("HoverCard", () => {
  test("opens on hover, closes on mouseleave", async ({ gotoRoute, page }) => {
    await gotoRoute("HoverCard");
    await page.getByTestId("trigger").hover();
    await expect(page.getByTestId("content")).toBeVisible({ timeout: 2_000 });
    // Move the cursor to a fixed corner — dodges Playwright's
    // actionability check when the HoverCard panel overlays the outside
    // button's hover target area.
    await page.mouse.move(0, 0);
    await expect(page.getByTestId("content")).toHaveCount(0, { timeout: 2_000 });
  });
});
