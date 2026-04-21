import { test, expect } from "../helpers/fixtures";

test.describe("ToastSystem", () => {
  test("fires a success toast, shows title in the aria-live region, dismiss removes it", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ToastSystem");
    await page.getByTestId("fire-success").click();

    const region = page.getByRole("region", { name: "Notifications" });
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(region.getByText("Saved")).toBeVisible();

    // Dismiss button on the bubble.
    await region.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(region.getByText("Saved")).toHaveCount(0);
  });

  test("firing 3 stacked toasts shows all 3 in the region", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ToastSystem");
    await page.getByTestId("fire-stack").click();

    const region = page.getByRole("region", { name: "Notifications" });
    await expect(region).toBeVisible();
    await expect(region.getByText("First")).toBeVisible();
    await expect(region.getByText("Second")).toBeVisible();
    await expect(region.getByText("Third")).toBeVisible();
  });
});
