import { test, expect } from "../helpers/fixtures";

test.describe("Escape unwind", () => {
  test("Dialog + Popover: first Escape closes Popover, Dialog stays open; second Escape closes Dialog", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("FocusChain");
    await page.getByTestId("top-trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("inner-trigger").click();
    await expect(page.getByTestId("popover-content")).toBeVisible();

    // First Escape: closes the topmost DismissableLayer (popover).
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-content")).toHaveCount(0);
    // Critical assertion — Dialog survives the first Escape.
    await expect(page.getByRole("dialog")).toBeVisible();

    // Second Escape: closes the Dialog.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Dialog + Popover inside NestedOverlays route also unwinds in order", async ({
    gotoRoute,
    page,
  }) => {
    // Mirror test but from the NestedOverlays route — same primitives, but
    // the popover here is non-modal (no focus trap), so the ordering must
    // still hold purely from DismissableLayer topology.
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();

    await page.getByTestId("open-popover").click();
    await expect(page.getByTestId("popover-content")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-content")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toHaveCount(0);
  });
});
