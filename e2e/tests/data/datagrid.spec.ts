import { test, expect } from "../helpers/fixtures";

test.describe("DataGrid", () => {
  test("row checkbox toggles selection", async ({ gotoRoute, page }) => {
    await gotoRoute("DataGrid");
    await expect(page.getByTestId("selection")).toContainText("selected: —");
    // Click the Alice row's selection checkbox — pick the first data-row checkbox.
    const firstRowCheckbox = page.getByRole("row").nth(1).getByRole("checkbox");
    await firstRowCheckbox.click();
    await expect(page.getByTestId("selection")).not.toContainText("—");
  });

  test("select-all header checkbox selects all rows", async ({ gotoRoute, page }) => {
    await gotoRoute("DataGrid");
    const headerCheckbox = page.getByRole("row").first().getByRole("checkbox").first();
    await headerCheckbox.click();
    await expect(page.getByTestId("selection")).toContainText("a,b,c,d,e");
  });

  test("deselect via same checkbox clears the row", async ({ gotoRoute, page }) => {
    await gotoRoute("DataGrid");
    const firstRowCheckbox = page.getByRole("row").nth(1).getByRole("checkbox");
    await firstRowCheckbox.click();
    await expect(page.getByTestId("selection")).not.toContainText("—");
    await firstRowCheckbox.click();
    await expect(page.getByTestId("selection")).toContainText("selected: —");
  });
});
