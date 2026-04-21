import { test, expect } from "../helpers/fixtures";

test.describe("CommandPalette", () => {
  test("clicking open button renders dialog with role=dialog name='Command palette'", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("CommandPalette");
    await page.getByTestId("open").click();
    await expect(
      page.getByRole("dialog", { name: "Command palette" })
    ).toBeVisible();
  });

  test("typing 'sav' filters the list to only Save file", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("CommandPalette");
    await page.getByTestId("open").click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await page.keyboard.type("sav");
    const options = dialog.getByRole("option");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveText(/Save file/);
  });

  test("ArrowDown + Enter selects highlighted item and closes dialog", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("CommandPalette");
    await page.getByTestId("open").click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    // First item is auto-highlighted on open; one ArrowDown advances to the
    // second ("Save file"). Enter commits the selection.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("last-selected")).toHaveText("save");
    await expect(
      page.getByRole("dialog", { name: "Command palette" })
    ).toHaveCount(0);
  });

  test("Escape closes without making a selection", async ({ gotoRoute, page }) => {
    await gotoRoute("CommandPalette");
    await page.getByTestId("open").click();
    await expect(
      page.getByRole("dialog", { name: "Command palette" })
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Command palette" })
    ).toHaveCount(0);
    await expect(page.getByTestId("last-selected")).toHaveText("");
  });
});
