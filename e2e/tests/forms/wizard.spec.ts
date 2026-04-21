import { test, expect } from "../helpers/fixtures";

test.describe("Wizard", () => {
  test("first step visible; Next is disabled while input is empty", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Wizard");
    await expect(page.getByRole("group", { name: "Step account" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  test("filling the account input enables Next and advances to billing", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Wizard");
    await page.getByTestId("input-account").fill("ada");
    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByRole("group", { name: "Step billing" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Step account" })).toHaveCount(0);
  });

  test("Back/Previous button returns to the prior step", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Wizard");
    await page.getByTestId("input-account").fill("ada");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("group", { name: "Step billing" })).toBeVisible();
    // Wizard.Previous defaults to "Back" label.
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByRole("group", { name: "Step account" })).toBeVisible();
  });

  test("clicking Finish on the final step calls onComplete", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Wizard");
    await expect(page.getByTestId("done")).toHaveText("not-done");
    // Fill & advance each step. The final step's button label flips to
    // "Finish" (Wizard.Next default for isLast).
    await page.getByTestId("input-account").fill("ada");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByTestId("input-billing").fill("visa");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByTestId("input-review").fill("ok");
    await page.getByRole("button", { name: "Finish" }).click();
    await expect(page.getByTestId("done")).toHaveText("done");
  });
});
