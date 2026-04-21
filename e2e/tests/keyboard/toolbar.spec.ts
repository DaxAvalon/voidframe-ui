import { test, expect } from "../helpers/fixtures";

// NOTE: The Toolbar's header comment (src/components/Toolbar.tsx:1-7) claims
// "roving tabindex" but no arrow-key navigation / tabindex management is
// actually implemented — every child button is individually tabbable. We do
// not assert roving-tabindex behaviour here; see the report for the gap.

test.describe("Toolbar", () => {
  test("root has role=toolbar with aria-orientation=horizontal", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Toolbar");
    const toolbar = page.getByRole("toolbar");
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("clicking ToggleItem 'center' sets align and toggles aria-pressed state", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Toolbar");
    // Default value is "left" (controlled by the route's state).
    await expect(page.getByTestId("align")).toHaveText("left");
    await expect(page.getByTestId("toggle-left")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await page.getByTestId("toggle-center").click();
    await expect(page.getByTestId("align")).toHaveText("center");
    await expect(page.getByTestId("toggle-center")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(page.getByTestId("toggle-left")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  test("clicking the same toggle a second time deselects it (single type)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Toolbar");
    await page.getByTestId("toggle-center").click();
    await expect(page.getByTestId("align")).toHaveText("center");
    await page.getByTestId("toggle-center").click();
    await expect(page.getByTestId("align")).toHaveText("");
    await expect(page.getByTestId("toggle-center")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
