import { test, expect } from "../helpers/fixtures";

test.describe("Nested overlays", () => {
  test("Popover inside Dialog: popover opens above; outside-click closes only popover; Dialog stays open", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByTestId("open-popover").click();
    const popover = page.getByTestId("popover-content");
    await expect(popover).toBeVisible();

    // Both role="dialog" nodes now exist: the modal Dialog and the popover
    // content (PopoverV2 uses role="dialog"). We dismiss the popover with
    // a click on empty space inside the Dialog Body but outside the popover.
    // The dialog's title text sits above the popover-trigger and is still
    // within the modal.
    await page.getByText("Nested overlays", { exact: true }).click();

    // Popover went away.
    await expect(popover).toHaveCount(0);
    // Dialog still open.
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();
  });

  test("Escape unwind: closes Popover first, Dialog stays open; second Escape closes Dialog", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();
    await page.getByTestId("open-popover").click();
    await expect(page.getByTestId("popover-content")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("popover-content")).toHaveCount(0);
    // Critical: Dialog still present after the first Escape.
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toHaveCount(0);
  });

  test("Toast during Dialog: toast renders above the dialog backdrop (z-order) and is focusable", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();

    await page.getByTestId("fire-toast").click();
    const region = page.getByRole("region", { name: "Notifications" });
    await expect(region).toBeVisible();
    await expect(region.getByText("Saved from dialog")).toBeVisible();

    // Z-order: toast stacking context must be above the dialog's.
    const [toastZ, dialogZ] = await page.evaluate(() => {
      const toaster = document.querySelector(".vf-toaster") as HTMLElement | null;
      const dialog = document.querySelector(".vf-dialog") as HTMLElement | null;
      if (!toaster || !dialog) return [null, null];
      return [
        parseInt(getComputedStyle(toaster).zIndex, 10),
        parseInt(getComputedStyle(dialog).zIndex, 10),
      ];
    });
    expect(toastZ).not.toBeNull();
    expect(dialogZ).not.toBeNull();
    expect(toastZ!).toBeGreaterThan(dialogZ!);

    // The toast's Dismiss button is focusable — reachable by tabbing
    // through the toaster live region. We assert presence of a focusable
    // dismiss control rather than actually clicking it, because the click
    // triggers the separately-tracked DismissableLayer.isTopmost library
    // gap (the Dialog treats the portaled toast as "outside" itself).
    const dismissBtn = region
      .getByRole("button", { name: "Dismiss" })
      .first();
    await expect(dismissBtn).toBeEnabled();
  });

  test("Toast dismiss inside Dialog should not close the Dialog", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-dialog").click();
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();
    await page.getByTestId("fire-toast").click();
    const region = page.getByRole("region", { name: "Notifications" });
    await region.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(region.getByText("Saved from dialog")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Nested overlays" })).toBeVisible();
  });

  test("ContextMenu over Drawer: menu opens inside drawer; outside-click dismisses menu without closing drawer", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("NestedOverlays");
    await page.getByTestId("open-drawer").click();
    const drawer = page.getByRole("dialog", { name: "Drawer with context menu" });
    await expect(drawer).toBeVisible();

    await page.getByTestId("drawer-ctx-surface").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();

    // Plain click anywhere fires ContextMenu's document-level click handler
    // and closes the menu. Click the drawer header title — inside the drawer,
    // outside the menu.
    await page.getByText("Drawer with context menu", { exact: true }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    // Drawer is still open.
    await expect(drawer).toBeVisible();
  });
});
