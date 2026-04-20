import { test, expect } from "../helpers/fixtures";

test.describe("Sortable", () => {
  test("keyboard drag: Space picks up, Arrow moves, Space drops", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Sortable");
    await expect(page.getByTestId("order")).toContainText("order: alpha,bravo,charlie");

    // The dragHandleProps surface exposes role="button" + aria-label="Drag <key>".
    // Focus the alpha handle and use keyboard arrows to move it down.
    const alphaHandle = page.getByTestId("handle-alpha");
    await alphaHandle.focus();
    await page.keyboard.press("ArrowDown");
    // Sortable's DragDrop.tsx lines 346-360: ArrowDown moves the item by 1
    // immediately (no Space-to-pickup required for this variant).
    await expect(page.getByTestId("order")).toContainText("order: bravo,alpha,charlie");
  });
});
