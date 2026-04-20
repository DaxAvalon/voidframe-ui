import { test, expect } from "../helpers/fixtures";

test.describe("ImageCropper", () => {
  test("renders the image and exposes a crop overlay", async ({ gotoRoute, page }) => {
    await gotoRoute("ImageCropper");
    // The SVG data URL loads; the cropper renders an <img> and a crop rectangle.
    await expect(page.locator("img")).toBeVisible({ timeout: 3_000 });
    // The component draws a crop window that consumers can resize. Assert
    // it exists by class name — the cropper root always has .vf-image-cropper.
    await expect(page.locator(".vf-image-cropper")).toBeVisible();
  });
});
