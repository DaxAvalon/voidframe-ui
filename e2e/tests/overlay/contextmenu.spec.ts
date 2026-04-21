import { test, expect } from "../helpers/fixtures";

test.describe("ContextMenu", () => {
  test("right-click on surface opens menu with role=menu", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ContextMenu");
    await page.getByTestId("rightclick-surface").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    // Sanity: at least one menuitem rendered inside the menu.
    await expect(
      page.getByRole("menu").getByRole("menuitem").first()
    ).toBeVisible();
  });

  test("Escape closes the menu", async ({ gotoRoute, page }) => {
    await gotoRoute("ContextMenu");
    await page.getByTestId("rightclick-surface").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("clicking an item closes the menu", async ({ gotoRoute, page }) => {
    await gotoRoute("ContextMenu");
    await page.getByTestId("rightclick-surface").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByTestId("item-copy").click();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
});
