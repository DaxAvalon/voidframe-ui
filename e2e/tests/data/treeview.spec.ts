import { test, expect } from "../helpers/fixtures";

test.describe("TreeView", () => {
  test("ArrowRight on hasChildren:true node triggers loadChildren", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("TreeView");
    // src is expanded by default. Click to focus "components" (hasChildren:true but no children yet).
    const componentsNode = page.getByText("components", { exact: true });
    await componentsNode.click();
    await page.keyboard.press("ArrowRight");
    // After loadChildren resolves, the two leaves appear.
    await expect(page.getByText("a.tsx", { exact: true })).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText("b.tsx", { exact: true })).toBeVisible();
  });

  test("Home/End jump to first/last visible node", async ({ gotoRoute, page }) => {
    await gotoRoute("TreeView");
    // Click a node to get focus inside the tree.
    await page.getByText("hooks", { exact: true }).click();
    await page.keyboard.press("Home");
    await expect(page.locator(":focus").first()).toContainText("src");
    await page.keyboard.press("End");
    const focused = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.textContent?.trim());
    // package.json is the last top-level item with hooks collapsed.
    expect(focused).toMatch(/package\.json|hooks/);
  });
});
