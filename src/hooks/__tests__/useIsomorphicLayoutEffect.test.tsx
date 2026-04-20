import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect";

describe("useIsomorphicLayoutEffect", () => {
  it("runs the effect on mount in a browser-like environment", () => {
    const fn = vi.fn();
    renderHook(() => useIsomorphicLayoutEffect(fn, []));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("runs the cleanup on unmount", () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() =>
      useIsomorphicLayoutEffect(() => cleanup, [])
    );
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("re-runs when a dep changes", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useIsomorphicLayoutEffect(fn, [dep]),
      { initialProps: { dep: 1 } }
    );
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({ dep: 2 });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
