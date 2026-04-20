import { test, expect } from "../helpers/fixtures";

test.describe("Popconfirm", () => {
  test("focus lands inside the dialog after open", async ({ gotoRoute, page }) => {
    await gotoRoute("Popconfirm");
    await page.getByTestId("trigger").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Invariant: focus is on some focusable inside the dialog (either the
    // Cancel or Confirm button, depending on whether FocusScope autofocus
    // wins over Popconfirm's rAF-scheduled confirmRef.focus()). For a11y
    // what matters is that focus is *inside* the dialog, not stuck on the
    // trigger. Which specific button gets focus is an implementation
    // detail tracked separately.
    await expect(dialog.locator(":focus")).toHaveCount(1);
  });

  test("trigger re-click does not bounce (close then reopen)", async ({ gotoRoute, page }) => {
    await gotoRoute("Popconfirm");
    const trigger = page.getByTestId("trigger");
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Clicking the trigger again should close and NOT reopen on the same
    // event (Segment 9 Wave 2 onPointerDownOutside guard).
    await trigger.click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
