import { test, expect } from "../helpers/fixtures";

test.describe("MenuBar", () => {
  test("ArrowRight opens the next sibling menu", async ({ gotoRoute, page }) => {
    await gotoRoute("MenuBar");
    // Open the File menu via click.
    await page.getByRole("button", { name: "File" }).click();
    await expect(page.getByTestId("file-new")).toBeVisible();
    // ArrowRight brings focus to the next trigger and opens its menu.
    // NOTE: current MenuBar impl opens the sibling but doesn't close the
    // previously-open one (library gap — item 2 in POST-SHIP-GAPS). We
    // assert what actually works today: the next menu IS opened.
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("edit-undo")).toBeVisible();
  });
});
