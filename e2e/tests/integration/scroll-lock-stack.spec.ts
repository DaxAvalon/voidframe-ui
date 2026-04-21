import { test, expect } from "../helpers/fixtures";

test.describe("Scroll lock stacking", () => {
  test("Drawer → Dialog → close Dialog keeps lock; closing Drawer unlocks", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ScrollLockStack");

    // Baseline: body scroll is not forced to hidden at rest.
    const beforeOverflow = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(beforeOverflow === "" || beforeOverflow === "visible").toBeTruthy();

    // Open the drawer — first lock acquired.
    await page.getByTestId("open-drawer").click();
    await expect(
      page.getByRole("dialog", { name: "Drawer" })
    ).toBeVisible();
    const afterDrawer = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(afterDrawer).toBe("hidden");

    // Open the nested Dialog — second lock on the shared counter.
    await page.getByTestId("open-nested-dialog").click();
    await expect(
      page.getByRole("dialog", { name: "Nested dialog" })
    ).toBeVisible();
    const afterBoth = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(afterBoth).toBe("hidden");

    // Close the Dialog — lock count drops to 1, body must stay locked
    // because the drawer still holds a lock.
    await page.getByTestId("nested-dialog-close").click();
    await expect(
      page.getByRole("dialog", { name: "Nested dialog" })
    ).toHaveCount(0);
    const afterDialogClose = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(afterDialogClose).toBe("hidden");
    // Drawer is still open.
    await expect(
      page.getByRole("dialog", { name: "Drawer" })
    ).toBeVisible();

    // Close the Drawer — final lock released, overflow restored.
    await page.getByTestId("drawer-close").click();
    await expect(
      page.getByRole("dialog", { name: "Drawer" })
    ).toHaveCount(0);
    const afterDrawerClose = await page.evaluate(
      () => document.body.style.overflow
    );
    expect(
      afterDrawerClose === "" || afterDrawerClose === beforeOverflow
    ).toBeTruthy();
  });
});
