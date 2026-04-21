import { test, expect } from "../helpers/fixtures";

// Axe regressions often only surface once an overlay is *open* — that's
// when aria-controls points at a live panel, aria-labelledby resolves to
// a rendered title, and the dialog role enters the AT tree.
test.describe("axe: overlay-open state", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Axe sweep runs on chromium only");

  test("Dialog open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Dialog");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAxeClean();
  });

  test("DrawerV2 open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("DrawerV2");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAxeClean();
  });

  test("Sheet open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Sheet");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAxeClean();
  });

  test("Popover open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Popover");
    await page.getByTestId("trigger").click();
    await expect(page.getByTestId("content")).toBeVisible();
    await expectAxeClean();
  });

  test("Menu open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Menu");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expectAxeClean();
  });

  test("Popconfirm open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Popconfirm");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAxeClean();
  });

  test("ContextMenu open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("ContextMenu");
    await page.getByTestId("rightclick-surface").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    await expectAxeClean();
  });

  test("Spotlight open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("Spotlight");
    await page.getByTestId("start").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAxeClean();
  });

  test("CommandPalette open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("CommandPalette");
    await page.getByTestId("open").click();
    await expect(
      page.getByRole("dialog", { name: "Command palette" })
    ).toBeVisible();
    await expectAxeClean();
  });

  test("ToastSystem open", async ({ gotoRoute, page, expectAxeClean }) => {
    await gotoRoute("ToastSystem");
    await page.getByTestId("fire-success").click();
    await expect(page.getByRole("region", { name: "Notifications" })).toBeVisible();
    await expectAxeClean();
  });
});
