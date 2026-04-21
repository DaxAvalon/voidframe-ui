import { test, expect } from "../helpers/fixtures";

test.describe("Spotlight", () => {
  test("start opens dialog at step 1 with 1 / 2 progress", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Spotlight");
    await page.getByTestId("start").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-label", "Step one");
    await expect(dialog.getByRole("heading", { name: "Step one" })).toBeVisible();
    await expect(dialog.getByText("1 / 2")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Next" })).toBeVisible();
  });

  test("Next advances to step 2 (progress 2 / 2, button becomes Done)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Spotlight");
    await page.getByTestId("start").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(dialog.getByRole("heading", { name: "Step two" })).toBeVisible();
    await expect(dialog.getByText("2 / 2")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Done" })).toBeVisible();
  });

  test("Done closes the tour", async ({ gotoRoute, page }) => {
    await gotoRoute("Spotlight");
    await page.getByTestId("start").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Next" }).click();
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
