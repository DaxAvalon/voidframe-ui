import { test, expect } from "../helpers/fixtures";

test.describe("Stepper", () => {
  test("renders as <ol aria-label='Progress steps'>", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Stepper");
    await expect(
      page.getByRole("list", { name: "Progress steps" })
    ).toBeVisible();
  });

  test("clicking step 3 fires onValueChange; current reads '2'", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Stepper");
    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByTestId("current")).toHaveText("2");
  });

  test("current step has aria-current='step'", async ({ gotoRoute, page }) => {
    await gotoRoute("Stepper");
    await page.getByRole("button", { name: "Review" }).click();
    // The <li> wrapping the active step gets aria-current="step". Locate the
    // list item whose descendant button is named "Review".
    const activeItem = page
      .getByRole("listitem")
      .filter({ has: page.getByRole("button", { name: "Review" }) });
    await expect(activeItem).toHaveAttribute("aria-current", "step");
  });
});
