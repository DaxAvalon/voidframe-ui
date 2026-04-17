import { describe, expect, it } from "vitest";
import {
  getStaggerDelay,
  staggerAnimation,
  staggerDelay,
} from "../animationSequence";

describe("animationSequence", () => {
  it("staggerDelay(0) returns '0ms'", () => {
    expect(staggerDelay(0)).toBe("0ms");
  });

  it("staggerDelay(1, 50) returns '50ms'", () => {
    expect(staggerDelay(1, 50)).toBe("50ms");
  });

  it("staggerDelay(3, 100) returns '300ms'", () => {
    expect(staggerDelay(3, 100)).toBe("300ms");
  });

  it("getStaggerDelay forward direction", () => {
    expect(getStaggerDelay(2, 5, { direction: "forward" })).toBe("100ms");
  });

  it("getStaggerDelay reverse direction", () => {
    // (5 - 1 - 0) * 50 = 200
    expect(getStaggerDelay(0, 5, { direction: "reverse" })).toBe("200ms");
  });

  it("getStaggerDelay center direction", () => {
    // |0 - floor(5/2)| * 50 = |0 - 2| * 50 = 100
    expect(getStaggerDelay(0, 5, { direction: "center" })).toBe("100ms");
  });

  it("staggerAnimation adds class and CSS property", () => {
    const els = Array.from({ length: 3 }, () => document.createElement("div"));
    staggerAnimation(els, "fade-in");
    for (const el of els) {
      expect(el.classList.contains("fade-in")).toBe(true);
      expect(el.style.getPropertyValue("--vf-stagger-delay")).toBeTruthy();
    }
  });

  it("staggerAnimation cleanup removes class and property", () => {
    const els = Array.from({ length: 3 }, () => document.createElement("div"));
    const cleanup = staggerAnimation(els, "fade-in");
    cleanup();
    for (const el of els) {
      expect(el.classList.contains("fade-in")).toBe(false);
      expect(el.style.getPropertyValue("--vf-stagger-delay")).toBe("");
    }
  });

  it("supports custom stagger value", () => {
    expect(staggerDelay(2, 100)).toBe("200ms");
    expect(getStaggerDelay(1, 3, { staggerMs: 100 })).toBe("100ms");
  });

  it("center direction gives 0ms to middle item", () => {
    // |2 - floor(5/2)| * 50 = |2 - 2| * 50 = 0
    expect(getStaggerDelay(2, 5, { direction: "center" })).toBe("0ms");
  });
});
