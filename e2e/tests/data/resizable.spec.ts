import { test, expect } from "../helpers/fixtures";

test.describe("Resizable", () => {
  test("ArrowRight on focused handle redistributes sizes", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Resizable");
    await expect(page.getByTestId("sizes")).toHaveText("30/70");
    const handle = page.getByRole("separator");
    await handle.focus();
    await expect(handle).toBeFocused();
    await page.keyboard.press("ArrowRight");
    // Each press is 1% — left grows, right shrinks.
    await expect(page.getByTestId("sizes")).toHaveText("31/69");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("sizes")).toHaveText("32/68");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("sizes")).toHaveText("31/69");
  });

  test("pointer drag handle right increases left panel size", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Resizable");
    await expect(page.getByTestId("sizes")).toHaveText("30/70");
    const handle = page.getByRole("separator");
    const box = await handle.boundingBox();
    if (!box) throw new Error("handle has no bounding box");
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    // Move 20px to the right in small increments so pointermove events fire.
    await page.mouse.move(cx + 10, cy);
    await page.mouse.move(cx + 20, cy);
    await page.mouse.up();
    await expect
      .poll(async () => {
        const text = await page.getByTestId("sizes").textContent();
        return Number(text?.split("/")[0] ?? 0);
      })
      .toBeGreaterThan(30);
  });
});
