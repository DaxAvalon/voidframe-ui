import { test, expect } from "../helpers/fixtures";

test.describe("Focus restore chain", () => {
  test("closing Popover returns focus to inner-trigger (inside Dialog)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("FocusChain");
    await page.getByTestId("top-trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByTestId("inner-trigger").click();
    await expect(page.getByTestId("popover-content")).toBeVisible();
    // A focus trap inside a modal=true popover lands focus on the first
    // focusable — the input — after mount.
    await expect(page.locator(":focus")).toHaveAttribute(
      "data-testid",
      "inside-popover"
    );

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-content")).toHaveCount(0);

    // Focus must return to `inner-trigger`, NOT escape up to `top-trigger`.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            document.activeElement?.getAttribute("data-testid")
          ),
        { timeout: 2_000 }
      )
      .toBe("inner-trigger");
    // And the Dialog is still present.
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("closing Dialog returns focus to the page-level top-trigger", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("FocusChain");
    await page.getByTestId("top-trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Close the Dialog directly with Escape (no popover in the chain).
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            document.activeElement?.getAttribute("data-testid")
          ),
        { timeout: 2_000 }
      )
      .toBe("top-trigger");
  });
});
