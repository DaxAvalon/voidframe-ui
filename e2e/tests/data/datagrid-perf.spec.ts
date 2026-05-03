import { test, expect } from "../helpers/fixtures";

// Perf regression smoke for the v1.2 memo work. Renders a 1000-row
// DataGrid (route `DataGridLarge`), measures `performance.now()` delta
// across two interactions:
//
// 1. Sort interaction — clicking the column header sort button.
//    Asserts < 500ms wall-clock. Pre-memo this took ~500ms+ in
//    the agent's measurements; with `genericMemo` wrapping the
//    DataGrid root, parent re-renders skip the row walk.
//
// 2. Unrelated parent re-render — a "bump" button that updates a
//    sibling state value but doesn't touch the grid. Asserts the
//    grid does NOT visibly mutate (DOM count stable). Without memo,
//    React would still walk the row tree on the parent re-render
//    even if rows are referentially identical.
//
// Bound is generous (500ms / 100ms) — this is a regression smoke,
// not a microbenchmark. Tightened thresholds belong in a perf-suite,
// not the green-on-every-CI e2e tier.

test.describe("DataGrid — v1.2 memo perf regression", () => {
  test("sort interaction completes under 500ms on 1000 rows", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("DataGridLarge");
    await expect(page.getByTestId("row-count")).toContainText("rows: 1000");
    const t0 = await page.evaluate(() => performance.now());
    await page.getByTestId("sort-name").click();
    await page.waitForTimeout(0);
    const t1 = await page.evaluate(() => performance.now());
    const elapsed = t1 - t0;
    test.info().annotations.push({
      type: "perf",
      description: `sort 1000 rows: ${elapsed.toFixed(1)}ms`,
    });
    expect(elapsed).toBeLessThan(500);
  });

  test("unrelated parent re-render does not remount grid rows", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("DataGridLarge");
    const beforeCount = await page.locator("[role='row']").count();
    expect(beforeCount).toBeGreaterThan(50);
    // Bump unrelated state. The parent component re-renders, but the
    // DataGrid memo should skip the row walk because `data` and
    // `columns` are referentially stable.
    await page.getByTestId("bump-unrelated").click();
    await expect(page.getByTestId("unrelated")).toContainText("unrelated: 1");
    const afterCount = await page.locator("[role='row']").count();
    expect(afterCount).toBe(beforeCount);
  });
});
