import { test, expect } from "../helpers/fixtures";

test.describe("MenuBar", () => {
  test("ArrowRight opens next sibling and closes previous; ArrowLeft returns", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("MenuBar");
    // MenuBar triggers are role="menuitem" (nested inside role="menubar")
    // to satisfy aria-required-children.
    await page.getByRole("menuitem", { name: "File" }).click();
    await expect(page.getByTestId("file-new")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("edit-undo")).toBeVisible();
    // MenuBar-scoped activeId registry closes the previously-open File menu.
    await expect(page.getByTestId("file-new")).toHaveCount(0);
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("file-new")).toBeVisible();
  });
});
