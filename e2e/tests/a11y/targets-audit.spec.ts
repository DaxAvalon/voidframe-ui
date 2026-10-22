import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test, expect } from "../helpers/fixtures";
import { routes } from "../../app/routes";

// Touch-target, hover-only and overflow audit under a coarse pointer. Runs
// over every fixture route and only looks at voidframe-rendered elements
// (an element with a `vf-` class, or inside one); the harness's own bare
// buttons are not the library's to size.
//
//   - WCAG 2.2 SC 2.5.8 target size (minimum): an interactive element is at
//     least 24 × 24 CSS px, or it is undersized but spaced — a 24 px circle
//     centred on it meets no other target. 44 px is the coarse-pointer
//     recommendation; targets between 24 and 44 are counted in an annotation.
//   - Native checkbox / radio inputs are measured by their label (the real hit
//     area); visually hidden inputs are skipped because the visible proxy next
//     to them is audited in their place.
//   - No `title`-only affordance: an interactive element with a `title` must
//     also have visible text or an accessible name.
//   - No horizontal page overflow at phone, tablet and desktop widths.
//
// Known offenders live in targets-baseline.json, keyed by route. A new one
// fails the test; a fixed one is reported in an annotation so the entry can
// be pruned. Regenerate with:
//   TARGETS_BASELINE_UPDATE=1 npx playwright test --config e2e/playwright.config.ts e2e/tests/a11y/targets-audit.spec.ts --workers=1

const INTERACTIVE = 'button, a[href], [role="button"], [role="menuitem"], [role="tab"], [role="option"], input:not([type="hidden"]), select, textarea, [tabindex="0"]';
const ROUTE_NAMES = Object.keys(routes);
const UPDATE = !!process.env.TARGETS_BASELINE_UPDATE;
// Next to this spec; resolved from the running test so it works under both
// the CJS and ESM transpilation modes Playwright may pick.
const baselinePath = () => resolve(dirname(test.info().file), "targets-baseline.json");

type Baseline = Record<string, string[]>;
function readBaseline(): Baseline {
  try {
    return JSON.parse(readFileSync(baselinePath(), "utf-8")) as Baseline;
  } catch {
    return {};
  }
}

/** Collapse "tag.class 12×12" descriptors to "tag.class ×n" so pixel jitter does not churn the baseline. */
function summarise(items: string[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.replace(/ \d+×\d+$/, "");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => (n > 1 ? `${k} ×${n}` : k));
}

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

for (const route of ROUTE_NAMES) {
  test.describe(route, () => {
    test("targets meet WCAG 2.2 target size and hover-only affordances have names", async ({ gotoRoute, page }, info) => {
      await gotoRoute(route);
      const report = await page.evaluate((selector) => {
        const isVisible = (el: HTMLElement) => {
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const isLibrary = (el: HTMLElement) => /(^|\s)vf-/.test(el.className) || !!el.closest('[class*="vf-"]');
        const hiddenProxy = (el: HTMLElement) => {
          if (el.classList.contains("vf-visually-hidden")) return true;
          const r = el.getBoundingClientRect();
          return r.width <= 1 && r.height <= 1;
        };
        /** The hit area: a native checkbox/radio counts with its label. */
        const rectOf = (el: HTMLElement) => {
          let r = el.getBoundingClientRect();
          if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
            const label = el.closest("label") ?? (el.id ? document.querySelector<HTMLElement>(`label[for="${el.id}"]`) : null);
            if (label) {
              const lr = label.getBoundingClientRect();
              if (Math.min(lr.width, lr.height) > Math.min(r.width, r.height)) r = lr;
            }
          }
          return r;
        };
        const describe = (el: HTMLElement) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.className ? `.${String(el.className).split(" ")[0]}` : ""}`;

        const all = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(isVisible);
        const targets = all.filter((el) => isLibrary(el) && !hiddenProxy(el)).map((el) => ({ el, r: rectOf(el) }));
        const failing: string[] = [];
        const smallSpaced: string[] = [];
        const under44: string[] = [];
        const titleOnly: string[] = [];
        for (const { el, r } of targets) {
          const size = Math.min(r.width, r.height);
          const label = `${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`;
          if (size < 24) {
            // Spacing exception: a 24 px circle centred on the target meets no other target.
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const crowded = targets.some(({ el: other, r: o }) => {
              if (other === el || other.contains(el) || el.contains(other)) return false;
              const dx = Math.max(o.left - cx, 0, cx - o.right);
              const dy = Math.max(o.top - cy, 0, cy - o.bottom);
              return dx * dx + dy * dy < 12 * 12;
            });
            (crowded ? failing : smallSpaced).push(label);
          } else if (size < 44) {
            under44.push(label);
          }
          const title = el.getAttribute("title");
          if (title) {
            const name = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.textContent ?? "").trim();
            if (!name) titleOnly.push(describe(el));
          }
        }
        return { failing, smallSpaced, under44, titleOnly, total: targets.length };
      }, INTERACTIVE);

      info.annotations.push({
        type: "targets",
        description: `${report.total} targets; ${report.under44.length} between 24 and 44 px; ${report.smallSpaced.length} under 24 px but spaced`,
      });

      const offenders = summarise(report.failing);
      if (UPDATE) {
        const baseline = readBaseline();
        if (offenders.length) baseline[route] = offenders;
        else delete baseline[route];
        writeFileSync(baselinePath(), `${JSON.stringify(baseline, Object.keys(baseline).sort(), 2)}\n`);
      }
      const known = new Set(readBaseline()[route] ?? []);
      const fresh = offenders.filter((o) => !known.has(o));
      const fixed = [...known].filter((k) => !offenders.includes(k));
      if (fixed.length) info.annotations.push({ type: "baseline-fixed", description: `no longer failing, prune from targets-baseline.json: ${fixed.join(", ")}` });
      expect(fresh, `undersized, crowded targets not in targets-baseline.json:\n${fresh.join("\n")}`).toEqual([]);
      expect(report.titleOnly, `title-only affordances:\n${report.titleOnly.join("\n")}`).toEqual([]);
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
