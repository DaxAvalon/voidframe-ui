import { test, expect } from "../helpers/fixtures";

test.describe("ScrollArea", () => {
  test("inner content overflows the container (scrollHeight > clientHeight)", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("ScrollArea");
    const area = page.locator(".vf-scroll-area").first();
    await expect(area).toBeVisible();
    const metrics = await area.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  });

  test("programmatic scroll updates scrollTop", async ({ gotoRoute, page }) => {
    await gotoRoute("ScrollArea");
    const area = page.locator(".vf-scroll-area").first();
    await expect(area).toBeVisible();
    const before = await area.evaluate((el) => el.scrollTop);
    expect(before).toBe(0);
    await area.evaluate((el) => {
      el.scrollTop = 250;
    });
    await expect
      .poll(async () => area.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    const after = await area.evaluate((el) => el.scrollTop);
    expect(after).toBeGreaterThan(before);
  });
});
