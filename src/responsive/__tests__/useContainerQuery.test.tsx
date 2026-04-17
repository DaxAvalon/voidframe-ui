// Tests for useContainerQuery hook

import { renderHook, act } from "@testing-library/react";
import { useRef, type RefObject } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useContainerQuery, type ContainerQueryMap } from "../useContainerQuery";

// Mock ResizeObserver (already globally available from test/setup.ts)
// but we need to control callback invocation

describe("useContainerQuery", () => {
  let observeCallback: ResizeObserverCallback;
  const originalRO = globalThis.ResizeObserver;

  beforeEach(() => {
    globalThis.ResizeObserver = class MockRO {
      constructor(cb: ResizeObserverCallback) {
        observeCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalRO;
  });

  function createRef(width: number): RefObject<HTMLElement> {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width,
      height: 100,
      x: 0, y: 0, top: 0, left: 0, right: width, bottom: 100,
      toJSON: () => {},
    });
    return { current: el };
  }

  it("returns matching query key for element width", () => {
    const ref = createRef(500);
    const queries: ContainerQueryMap<"sm" | "md" | "lg"> = {
      lg: "(min-width: 800px)",
      md: "(min-width: 400px)",
      sm: "(min-width: 0px)",
    };
    const { result } = renderHook(() => useContainerQuery(ref, queries));
    // Width 500 should match md (min-width: 400px), since lg requires 800+
    expect(result.current).toBe("md");
  });

  it("returns null when no query matches", () => {
    const ref = createRef(100);
    const queries: ContainerQueryMap<"lg"> = {
      lg: "(min-width: 800px)",
    };
    const { result } = renderHook(() => useContainerQuery(ref, queries));
    expect(result.current).toBeNull();
  });

  it("handles max-width queries", () => {
    const ref = createRef(300);
    const queries: ContainerQueryMap<"narrow"> = {
      narrow: "(max-width: 400px)",
    };
    const { result } = renderHook(() => useContainerQuery(ref, queries));
    expect(result.current).toBe("narrow");
  });

  it("returns null when ref is empty", () => {
    const ref: RefObject<HTMLElement> = { current: null };
    const queries: ContainerQueryMap<"sm"> = {
      sm: "(min-width: 0px)",
    };
    const { result } = renderHook(() => useContainerQuery(ref, queries));
    expect(result.current).toBeNull();
  });
});
