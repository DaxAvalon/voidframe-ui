import { test, expect } from "../helpers/fixtures";

test.describe("SignaturePad", () => {
  test("pointer stroke produces a non-empty canvas data URL", async ({ gotoRoute, page }) => {
    await gotoRoute("SignaturePad");
    const canvas = page.locator("canvas").first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("canvas has no bounding box");

    // Draw a short stroke across the centre.
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + 30, y);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, y, { steps: 8 });
    await page.mouse.up();

    // onValueChange fires with the PNG data URL on stroke-end.
    // SignaturePad emits a data:image/png;base64,… string which is
    // always >500 chars for any non-empty stroke.
    await expect.poll(async () => {
      const text = (await page.getByTestId("length").textContent()) ?? "";
      const match = text.match(/length:\s*(\d+)/);
      return match ? Number(match[1]) : 0;
    }).toBeGreaterThan(500);
  });
});
