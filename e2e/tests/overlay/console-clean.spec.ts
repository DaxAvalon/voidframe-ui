import { test, expect } from "../helpers/fixtures";

// Contract: opening and closing every overlay logs nothing. A console.error
// or an uncaught page error while an overlay opens fails the suite.

const OVERLAY_ROUTES = [
  "Dialog",
  "DrawerV2",
  "Sheet",
  "Popover",
  "Tooltip",
  "HoverCard",
  "Menu",
  "MenuBar",
  "ContextMenu",
  "Popconfirm",
  "Spotlight",
  "CommandPalette",
  "ToastSystem",
  "NestedOverlays",
];

for (const route of OVERLAY_ROUTES) {
  test(`${route} opens with zero console errors`, async ({ gotoRoute, page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    await gotoRoute(route);
    const triggers = page.locator("button, [data-testid$='surface'], [data-testid$='trigger']");
    const count = await triggers.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const trigger = triggers.nth(i);
      if (!(await trigger.isVisible())) continue;
      if (route === "ContextMenu") await trigger.click({ button: "right" });
      else if (route === "Tooltip" || route === "HoverCard") await trigger.hover();
      else await trigger.click();
      await page.waitForTimeout(150);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(50);
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
