import { test, expect } from "@playwright/test";

test("page loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toHaveLength(0);
});
