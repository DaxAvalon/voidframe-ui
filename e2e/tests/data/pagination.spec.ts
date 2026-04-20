import { test, expect } from "../helpers/fixtures";

test.describe("Pagination", () => {
  test("aria-current marks the active page; clicking a number updates value", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Pagination");
    await expect(page.getByTestId("page")).toContainText("page: 3");
    // Page 3 button has aria-current="page".
    const active = page.getByRole("button", { name: /^Page 3$/ });
    await expect(active).toHaveAttribute("aria-current", "page");
    // Click Next (›) or a known page.
    const nextButton = page.getByRole("button", { name: /Next page/i });
    await nextButton.click();
    await expect(page.getByTestId("page")).toContainText("page: 4");
  });
});
