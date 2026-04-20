import { test, expect } from "./helpers/fixtures";

test("harness index renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Voidframe e2e harness/i })).toBeVisible();
});

test("Dialog route mounts", async ({ gotoRoute, page }) => {
  await gotoRoute("Dialog");
  await expect(page.getByTestId("trigger")).toBeVisible();
  await expect(page.getByTestId("outside")).toBeVisible();
});
