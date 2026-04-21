import { test, expect } from "../helpers/fixtures";

test.describe("Collapsible", () => {
  test("trigger reports aria-expanded=false when closed and body is not in DOM", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Collapsible");
    const trigger = page.getByRole("button", { name: /Details/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("body")).toHaveCount(0);
  });

  test("click toggles aria-expanded to true and reveals body", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Collapsible");
    const trigger = page.getByRole("button", { name: /Details/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("body")).toBeVisible();
  });

  test("Enter on focused trigger toggles", async ({ gotoRoute, page }) => {
    await gotoRoute("Collapsible");
    const trigger = page.getByRole("button", { name: /Details/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("body")).toBeVisible();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("body")).toHaveCount(0);
  });

  test("Space on focused trigger toggles", async ({ gotoRoute, page }) => {
    await gotoRoute("Collapsible");
    const trigger = page.getByRole("button", { name: /Details/ });
    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("body")).toBeVisible();
  });
});
