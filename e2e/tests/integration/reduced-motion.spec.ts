import { test, expect } from "../helpers/fixtures";

// Contract (tokens.css + keyframes.css "Reduced motion" blocks):
// - OS prefers-reduced-motion zeroes all animation/transition durations…
// - …UNLESS the app opts out with data-vf-motion="never" on :root.
// - data-vf-motion="always" force-reduces regardless of OS preference.
// The keyframes.css blanket rule historically ignored the "never" opt-out;
// this spec pins the full matrix against real computed styles.

async function probeDurations(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    let el = document.getElementById("motion-probe");
    if (!el) {
      el = document.createElement("div");
      el.id = "motion-probe";
      el.style.transitionDuration = "300ms";
      el.style.animationDuration = "300ms";
      document.body.appendChild(el);
    }
    const cs = getComputedStyle(el);
    return {
      transition: cs.transitionDuration,
      animation: cs.animationDuration,
    };
  });
}

test.describe("reduced-motion contract", () => {
  test("OS preference zeroes durations by default", async ({ page, gotoRoute }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoRoute("Dialog");
    const { transition, animation } = await probeDurations(page);
    expect(parseFloat(transition)).toBeLessThan(0.01);
    expect(parseFloat(animation)).toBeLessThan(0.01);
  });

  test('data-vf-motion="never" opts out of the OS preference', async ({ page, gotoRoute }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoRoute("Dialog");
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-vf-motion", "never")
    );
    const { transition, animation } = await probeDurations(page);
    expect(transition).toBe("0.3s");
    expect(animation).toBe("0.3s");
  });

  test('data-vf-motion="always" force-reduces without the OS preference', async ({ page, gotoRoute }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoRoute("Dialog");
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-vf-motion", "always")
    );
    const { transition, animation } = await probeDurations(page);
    expect(parseFloat(transition)).toBeLessThan(0.01);
    expect(parseFloat(animation)).toBeLessThan(0.01);
  });

  test("no preference, no attribute: durations untouched", async ({ page, gotoRoute }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoRoute("Dialog");
    const { transition, animation } = await probeDurations(page);
    expect(transition).toBe("0.3s");
    expect(animation).toBe("0.3s");
  });
});
