import { test, expect } from "../helpers/fixtures";

test.describe("Portal z-order", () => {
  test("Tooltip class stacks above Dialog class via z-index tokens", async ({
    gotoRoute,
    page,
  }) => {
    // The voidframe public `Tooltip` export (DataExtended.tsx:188) is an
    // inline bubble, NOT a portaled overlay, so a true "tooltip-above-modal"
    // interaction isn't achievable through the public API without composing
    // `TooltipV2` from the advanced surface. The load-bearing contract for
    // Tier-D is that the tooltip's stacking context (governed by
    // `--vf-z-tooltip`) sits strictly above the dialog's
    // (`--vf-z-modal`). We assert that relationship directly from the
    // resolved stylesheet — it's what a portaled tooltip would rely on.
    await gotoRoute("Dialog");

    const [tooltipZ, dialogZ] = await page.evaluate(() => {
      const make = (cls: string) => {
        const el = document.createElement("div");
        el.className = cls;
        document.body.appendChild(el);
        const z = parseInt(getComputedStyle(el).zIndex, 10);
        el.remove();
        return z;
      };
      return [make("vf-tooltip-v2"), make("vf-dialog")];
    });

    expect(Number.isFinite(tooltipZ)).toBeTruthy();
    expect(Number.isFinite(dialogZ)).toBeTruthy();
    expect(tooltipZ).toBeGreaterThan(dialogZ);

    // Also confirm a portaled overlay (the Dialog) escapes the Harness
    // `<main>` wrapper — so stacking is governed purely by z-index, not
    // by a transformed/positioned ancestor creating a new stacking
    // context.
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const escapedMain = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const main = document.querySelector("main");
      if (!d || !main) return false;
      return !main.contains(d);
    });
    expect(escapedMain).toBeTruthy();
  });
});
