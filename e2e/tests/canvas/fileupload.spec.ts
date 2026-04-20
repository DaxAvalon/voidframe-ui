import { test, expect } from "../helpers/fixtures";

test.describe("FileUpload", () => {
  test("dropping files populates the list via onValueChange", async ({ gotoRoute, page }) => {
    await gotoRoute("FileUpload");
    await expect(page.getByTestId("count")).toContainText("count: 0");
    // Use Playwright's setInputFiles against the hidden <input type="file">.
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: "one.txt", mimeType: "text/plain", buffer: Buffer.from("one") },
      { name: "two.txt", mimeType: "text/plain", buffer: Buffer.from("two") },
    ]);
    await expect(page.getByTestId("count")).toContainText("count: 2");
    await expect(page.getByTestId("names")).toContainText("one.txt");
    await expect(page.getByTestId("names")).toContainText("two.txt");
  });
});
