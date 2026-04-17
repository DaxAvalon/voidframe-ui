import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDerivedState } from "../useDerivedState";

describe("useDerivedState", () => {
  it("computes from initial deps", () => {
    const { result } = renderHook(() => useDerivedState(() => 2 + 3, [2, 3]));
    expect(result.current).toBe(5);
  });

  it("recomputes when deps change", () => {
    let multiplier = 2;
    const { result, rerender } = renderHook(() =>
      useDerivedState(() => 10 * multiplier, [multiplier])
    );
    expect(result.current).toBe(20);
    multiplier = 3;
    rerender();
    expect(result.current).toBe(30);
  });

  it("does not recompute when deps are the same", () => {
    const derive = vi.fn(() => "hello");
    const { rerender } = renderHook(() => useDerivedState(derive, [1, 2]));
    const callCount = derive.mock.calls.length;
    rerender();
    // Should not call derive again since deps haven't changed
    expect(derive).toHaveBeenCalledTimes(callCount);
  });

  it("custom isEqual prevents update", () => {
    let factor = 1;
    const isEqual = (prev: { v: number }, next: { v: number }) =>
      prev.v === next.v;
    const { result, rerender } = renderHook(() =>
      useDerivedState(() => ({ v: 10 * factor }), [factor], isEqual)
    );
    const first = result.current;
    expect(first).toEqual({ v: 10 });

    // Same factor -> same derived value -> isEqual returns true -> same ref
    factor = 1;
    rerender();
    expect(result.current).toBe(first);
  });

  it("handles multiple deps", () => {
    let a = 1;
    let b = 2;
    let c = 3;
    const { result, rerender } = renderHook(() =>
      useDerivedState(() => a + b + c, [a, b, c])
    );
    expect(result.current).toBe(6);
    a = 10;
    rerender();
    expect(result.current).toBe(15);
  });

  it("works with complex objects", () => {
    let items = [1, 2, 3];
    const { result, rerender } = renderHook(() =>
      useDerivedState(() => items.reduce((s, n) => s + n, 0), [items])
    );
    expect(result.current).toBe(6);
    items = [4, 5, 6];
    rerender();
    expect(result.current).toBe(15);
  });

  it("handles undefined return", () => {
    const { result } = renderHook(() =>
      useDerivedState(() => undefined, [1])
    );
    expect(result.current).toBeUndefined();
  });

  it("derive receives no args", () => {
    const derive = vi.fn(() => 42);
    renderHook(() => useDerivedState(derive, [1]));
    expect(derive).toHaveBeenCalledWith();
  });
});
