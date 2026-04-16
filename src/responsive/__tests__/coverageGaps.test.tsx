// Coverage-gap tests for responsive:
//   - useContainerQuery: no-ResizeObserver fallback
//   - breakpoints.ts: isResponsiveObject edge cases, normalizeResponsive plain value
//   - ResponsiveBox: more breakpoint prop coverage

import { renderHook } from "@testing-library/react";
import { useRef, type RefObject } from "react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { useContainerQuery, type ContainerQueryMap } from "../useContainerQuery";
import {
  isResponsiveObject,
  normalizeResponsive,
  pickResponsive,
  BREAKPOINTS,
} from "../breakpoints";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ResponsiveBox } from "../ResponsiveBox";

// ── useContainerQuery: no-ResizeObserver fallback ────────

describe("useContainerQuery — no ResizeObserver", () => {
  const originalRO = globalThis.ResizeObserver;

  beforeEach(() => {
    // Remove ResizeObserver
    (globalThis as Record<string, unknown>).ResizeObserver = undefined;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalRO;
  });

  it("falls back to first key when ResizeObserver is unavailable", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref: RefObject<HTMLElement> = { current: el };
    const queries: ContainerQueryMap<"mobile" | "desktop"> = {
      mobile: "(min-width: 0px)",
      desktop: "(min-width: 768px)",
    };
    const { result } = renderHook(() => useContainerQuery(ref, queries));
    expect(result.current).toBe("mobile");
    document.body.removeChild(el);
  });
});

// ── breakpoints: edge cases ──────────────────────────────

describe("breakpoints — edge cases", () => {
  it("isResponsiveObject rejects null", () => {
    expect(isResponsiveObject(null as never)).toBe(false);
  });

  it("isResponsiveObject rejects arrays", () => {
    expect(isResponsiveObject([1, 2, 3] as never)).toBe(false);
  });

  it("isResponsiveObject accepts empty object with breakpoint keys", () => {
    expect(isResponsiveObject({ sm: 1 })).toBe(true);
  });

  it("normalizeResponsive with plain value fills base", () => {
    const n = normalizeResponsive(42);
    expect(n.base).toBe(42);
    expect(n.sm).toBeUndefined();
    expect(n.md).toBeUndefined();
    expect(n.lg).toBeUndefined();
    expect(n.xl).toBeUndefined();
    expect(n.xxl).toBeUndefined();
  });

  it("normalizeResponsive with full responsive object", () => {
    const n = normalizeResponsive({ base: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 });
    expect(n.base).toBe(1);
    expect(n.xxl).toBe(6);
  });

  it("pickResponsive returns undefined when no matching breakpoint", () => {
    expect(pickResponsive({ md: 2 }, "base")).toBeUndefined();
  });

  it("pickResponsive walks down from active breakpoint", () => {
    expect(pickResponsive({ base: 1, lg: 3 }, "xl")).toBe(3);
    expect(pickResponsive({ base: 1, lg: 3 }, "sm")).toBe(1);
  });
});

// ── ResponsiveBox: additional prop coverage ──────────────

describe("ResponsiveBox — additional props", () => {
  function installMatchMedia(width: number) {
    const entries = new Map<string, { matches: boolean; listeners: Array<(e: MediaQueryListEvent) => void> }>();
    const impl = vi.fn((query: string) => {
      const parsed = query.match(/min-width:\s*(\d+)px/);
      const minPx = parsed ? parseFloat(parsed[1]!) : 0;
      const entry = { matches: width >= minPx, listeners: [] as Array<(e: MediaQueryListEvent) => void> };
      entries.set(query, entry);
      return {
        matches: entry.matches,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
        onchange: null,
      } as unknown as MediaQueryList;
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: impl,
    });
  }

  it("applies align and justify props", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" align="center" justify="space-between">
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.alignItems).toBe("center");
    expect(box.style.justifyContent).toBe("space-between");
  });

  it("converts align start/end to flex-start/flex-end", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" align="start" justify="end">
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.alignItems).toBe("flex-start");
    expect(box.style.justifyContent).toBe("flex-end");
  });

  it("applies wrap prop", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" wrap={true}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.flexWrap).toBe("wrap");
  });

  it("applies wrap=false as nowrap", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" wrap={false}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.flexWrap).toBe("nowrap");
  });

  it("applies padding shorthand props", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox px={16} py={8} pt={4} pr={12} pb={20} pl={24}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.paddingInline).toBe("16px");
    expect(box.style.paddingBlock).toBe("8px");
    expect(box.style.paddingTop).toBe("4px");
    expect(box.style.paddingRight).toBe("12px");
    expect(box.style.paddingBottom).toBe("20px");
    expect(box.style.paddingLeft).toBe("24px");
  });

  it("applies margin shorthand props", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox mx={16} my={8} mt={4} mr={12} mb={20} ml={24}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.marginInline).toBe("16px");
    expect(box.style.marginBlock).toBe("8px");
    expect(box.style.marginTop).toBe("4px");
    expect(box.style.marginRight).toBe("12px");
    expect(box.style.marginBottom).toBe("20px");
    expect(box.style.marginLeft).toBe("24px");
  });

  it("applies sizing props", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox width={200} height={100} maxWidth={400} minWidth={50}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.width).toBe("200px");
    expect(box.style.height).toBe("100px");
    expect(box.style.maxWidth).toBe("400px");
    expect(box.style.minWidth).toBe("50px");
  });

  it("accepts string values for gap", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox gap="1rem">
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.gap).toBe("1rem");
  });

  it("merges custom style prop", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" style={{ color: "red" }}>
        <div>x</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.display).toBe("flex");
    expect(box.style.color).toBe("red");
  });
});
