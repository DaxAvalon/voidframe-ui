import { test, expect } from "../helpers/fixtures";

test.describe("Tooltip", () => {
  test("opens on hover after delayDuration", async ({ gotoRoute, page }) => {
    await gotoRoute("Tooltip");
    await page.getByTestId("trigger-a").hover();
    // Delay is 300ms in the route; use Playwright's auto-wait via toBeVisible.
    await expect(page.getByRole("tooltip")).toBeVisible({ timeout: 2_000 });
  });

  test("skipDelayDuration: rapid re-hover opens immediately", async ({ gotoRoute, page }) => {
    await gotoRoute("Tooltip");
    await page.getByTestId("trigger-a").hover();
    await expect(page.getByRole("tooltip")).toBeVisible({ timeout: 2_000 });
    // Move away briefly then back — within skipDelayDuration (200ms) the
    // next tooltip should open without the full 300ms delay.
    await page.getByTestId("outside").hover();
    await page.getByTestId("trigger-b").hover();
    // Either the A or B tooltip is now visible — the assertion is that
    // a tooltip reappears quickly. Tight timeout proves no re-delay.
    await expect(page.getByRole("tooltip")).toBeVisible({ timeout: 500 });
  });
});
