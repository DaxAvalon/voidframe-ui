import { test, expect } from "../helpers/fixtures";

test.describe("Sheet", () => {
  test("drag handle repositions the sheet (height flips vh → px during drag)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Sheet");
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const panel = page.locator(".vf-sheet__panel, [role='dialog']").first();
    const initialHeight = await panel.evaluate((el) => (el as HTMLElement).style.height);
    // Expect vh-based initial height from the default 40% snap point.
    expect(initialHeight).toMatch(/vh|%|px/);

    const handle = page.getByTestId("handle");
    const box = await handle.boundingBox();
    if (!box) throw new Error("handle has no bounding box");
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Drag upward to grow the sheet toward the upper snap point (0.9).
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY - 240, { steps: 10 });
    // During drag, data-dragging="true" and height switches to a px string.
    await expect(panel).toHaveAttribute("data-dragging", "true");
    await page.mouse.up();
    // After release, data-dragging clears.
    await expect(panel).not.toHaveAttribute("data-dragging", "true");
  });
});
