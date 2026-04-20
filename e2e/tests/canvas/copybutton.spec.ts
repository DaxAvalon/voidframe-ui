import { test, expect } from "../helpers/fixtures";

test.describe("CopyButton", () => {
  // Firefox/Webkit have stricter clipboard permissions; skip those engines
  // for this test and keep chromium (which grants clipboard-write via the
  // playwright.config projects permission list).
  test.skip(({ browserName }) => browserName !== "chromium", "Clipboard grant in Playwright is chromium-only for CI stability");

  test("click writes text to clipboard and flips the label", async ({ gotoRoute, page }) => {
    await gotoRoute("CopyButton");
    const button = page.getByRole("button", { name: /Copy token/i });
    await button.click();
    // Label should flip to the copiedLabel while copiedDuration holds.
    await expect(page.getByRole("button", { name: /Copied!/ })).toBeVisible({ timeout: 2_000 });
    // onCopy fired with the text payload.
    await expect(page.getByTestId("last-copied")).toContainText("voidframe-clipboard-payload");
    // Read from the real clipboard for an extra-strong assertion.
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe("voidframe-clipboard-payload");
  });
});
