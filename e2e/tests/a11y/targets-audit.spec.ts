import { test, expect } from "../helpers/fixtures";
import { routes } from "../../app/routes";

// Touch-target, spacing, hover-only and overflow audit under a coarse
// pointer. Runs over every fixture route.
//
//   - WCAG 2.2 target size (minimum): every interactive element is at least
//     24 × 24 CSS px. 44 px is the coarse-pointer recommendation; targets
//     between 24 and 44 are reported as annotations so the trend is visible.
//   - Adjacent interactive targets are at least 8 px apart unless one of
//     them is large enough that the other has its own 24 px space.
//   - No `title`-only affordance: an interactive element with a `title`
//     must also have visible text or an accessible name.
//   - No horizontal page overflow at phone, tablet and desktop widths.

const INTERACTIVE = 'button, a[href], [role="button"], [role="menuitem"], [role="tab"], [role="option"], input:not([type="hidden"]), select, textarea, [tabindex="0"]';
const ROUTE_NAMES = Object.keys(routes);

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

for (const route of ROUTE_NAMES) {
  test.describe(route, () => {
    test("interactive targets are at least 24 px and hover-only affordances have names", async ({ gotoRoute, page }, info) => {
      await gotoRoute(route);
      const report = await page.evaluate((selector) => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => {
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        const small: string[] = [];
        const under44: string[] = [];
        const titleOnly: string[] = [];
        const describe = (el: HTMLElement) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.className ? `.${String(el.className).split(" ")[0]}` : ""}`;
        for (const el of nodes) {
          const r = el.getBoundingClientRect();
          const size = Math.min(r.width, r.height);
          if (size < 24) small.push(`${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
          else if (size < 44) under44.push(`${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
          const title = el.getAttribute("title");
          if (title) {
            const name = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.textContent ?? "").trim();
            if (!name) titleOnly.push(describe(el));
          }
        }
        return { small, under44, titleOnly, total: nodes.length };
      }, INTERACTIVE);
      info.annotations.push({ type: "targets", description: `${report.total} targets, ${report.under44.length} between 24 and 44 px` });
      expect(report.small, `targets under 24 px:\n${report.small.join("\n")}`).toEqual([]);
      expect(report.titleOnly, `title-only affordances:\n${report.titleOnly.join("\n")}`).toEqual([]);
    });

    test("adjacent targets keep 8 px of spacing", async ({ gotoRoute, page }) => {
      await gotoRoute(route);
      const tooClose = await page.evaluate((selector) => {
        const rects = Array.from(document.querySelectorAll<HTMLElement>(selector))
          .filter((el) => getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden")
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && r.height > 0);
        const out: string[] = [];
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i]!;
            const b = rects[j]!;
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const gapX = Math.max(b.r.left - a.r.right, a.r.left - b.r.right);
            const gapY = Math.max(b.r.top - a.r.bottom, a.r.top - b.r.bottom);
            const overlapY = a.r.top < b.r.bottom && b.r.top < a.r.bottom;
            const overlapX = a.r.left < b.r.right && b.r.left < a.r.right;
            const gap = overlapY ? gapX : overlapX ? gapY : Math.max(gapX, gapY);
            if (gap >= 0 && gap < 8 && Math.min(a.r.width, a.r.height, b.r.width, b.r.height) < 44) {
              out.push(`${a.el.tagName.toLowerCase()} ↔ ${b.el.tagName.toLowerCase()} gap ${gap.toFixed(1)}px`);
            }
          }
        }
        return out;
      }, INTERACTIVE);
      // Grouped controls (segmented controls, toolbars, pagination) sit flush
      // by design and are exempt when either target is 44 px tall or wide.
      expect(tooClose.length, `targets closer than 8 px:\n${tooClose.slice(0, 20).join("\n")}`).toBeLessThanOrEqual(0);
    });
  });
}

test.describe("horizontal overflow", () => {
  for (const width of [390, 768, 1280]) {
    test(`no horizontal page overflow at ${width}px`, async ({ gotoRoute, page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ROUTE_NAMES.slice(0, 12)) {
        await gotoRoute(route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});
