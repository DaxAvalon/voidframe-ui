import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  computeAnchoredPosition,
  type AnchorRect,
  type Placement,
} from "../anchor";

const rect = (
  top: number,
  left: number,
  width: number,
  height: number
): AnchorRect => ({
  top,
  left,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const VP_W = 1000;
const VP_H = 800;

describe("computeAnchoredPosition", () => {
  let origInnerHeight: number;
  let origInnerWidth: number;

  beforeEach(() => {
    origInnerHeight = window.innerHeight;
    origInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerHeight", {
      value: VP_H,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerWidth", {
      value: VP_W,
      configurable: true,
      writable: true,
    });
  });
  afterEach(() => {
    Object.defineProperty(window, "innerHeight", {
      value: origInnerHeight,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerWidth", {
      value: origInnerWidth,
      configurable: true,
      writable: true,
    });
  });

  it("bottom-start aligns the floater's left with the trigger's left", () => {
    const r = rect(200, 200, 100, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 120, height: 60 },
      "bottom-start",
      4
    );
    expect(pos.side).toBe("bottom");
    expect(pos.top).toBe(244);
    expect(pos.left).toBe(200);
  });

  it("bottom-end aligns the floater's right with the trigger's right", () => {
    const r = rect(200, 200, 100, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 120, height: 60 },
      "bottom-end",
      4
    );
    expect(pos.left).toBe(300 - 120);
  });

  it("bottom center places the floater's center under the trigger's center", () => {
    const r = rect(200, 200, 100, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 60, height: 40 },
      "bottom",
      0
    );
    // trigger center = 250; floater center should be 250 → left = 250 - 30 = 220
    expect(pos.left).toBe(220);
  });

  it("top places the floater above the trigger", () => {
    const r = rect(200, 200, 100, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 100, height: 40 },
      "top",
      4
    );
    expect(pos.side).toBe("top");
    expect(pos.top).toBe(156);
  });

  it("left / right place the floater horizontally", () => {
    const r = rect(200, 400, 100, 40);
    const left = computeAnchoredPosition(
      r,
      { width: 80, height: 40 },
      "left",
      4
    );
    expect(left.left).toBe(316);
    const right = computeAnchoredPosition(
      r,
      { width: 80, height: 40 },
      "right",
      4
    );
    expect(right.left).toBe(504);
  });

  it("flips to the opposite side when the chosen side overflows the viewport", () => {
    // trigger hugging the top — top placement would be negative.
    const r = rect(10, 200, 100, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 100, height: 80 },
      "top",
      4
    );
    // Should have flipped to below the trigger (top = r.bottom + 4 = 54).
    expect(pos.top).toBe(54);
  });

  it("clamps the result 8px inside the viewport", () => {
    // Trigger off the right edge — floater would overflow.
    const r = rect(200, VP_W - 20, 40, 40);
    const pos = computeAnchoredPosition(
      r,
      { width: 200, height: 40 },
      "bottom-start",
      0
    );
    expect(pos.left).toBe(VP_W - 200 - 8);
  });

  it("works for all 12 placement tokens without throwing", () => {
    const r = rect(300, 300, 80, 30);
    const placements: Placement[] = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end",
    ];
    for (const p of placements) {
      const pos = computeAnchoredPosition(r, { width: 60, height: 40 }, p, 4);
      expect(Number.isFinite(pos.top)).toBe(true);
      expect(Number.isFinite(pos.left)).toBe(true);
      expect(["top", "bottom", "left", "right"]).toContain(pos.side);
    }
  });
});
