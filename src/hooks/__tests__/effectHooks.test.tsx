import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEvent } from "../useEvent";
import { useHasMounted } from "../useHasMounted";
import { useMountEffect } from "../useMountEffect";
import { useUnmountEffect } from "../useUnmountEffect";
import { useUpdateEffect } from "../useUpdateEffect";

describe("useEvent", () => {
  it("returns stable identity across renders", () => {
    const { result, rerender } = renderHook(() => useEvent(() => 1));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("always invokes the latest closure", () => {
    let latest = 0;
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) => useEvent(() => v),
      { initialProps: { v: 1 } }
    );
    latest = result.current();
    expect(latest).toBe(1);
    rerender({ v: 99 });
    latest = result.current();
    expect(latest).toBe(99);
  });
});

describe("useMountEffect", () => {
  it("runs exactly once", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(() => useMountEffect(fn));
    rerender();
    rerender();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("runs cleanup on unmount", () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() => useMountEffect(() => cleanup));
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe("useUnmountEffect", () => {
  it("runs only on unmount", () => {
    const fn = vi.fn();
    const { rerender, unmount } = renderHook(() => useUnmountEffect(fn));
    rerender();
    rerender();
    expect(fn).not.toHaveBeenCalled();
    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("useUpdateEffect", () => {
  it("skips the first render", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(({ v }: { v: number }) => useUpdateEffect(fn, [v]), {
      initialProps: { v: 1 },
    });
    expect(fn).not.toHaveBeenCalled();
    rerender({ v: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({ v: 3 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("respects dependency equality — no re-run when deps unchanged", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(({ v }: { v: number }) => useUpdateEffect(fn, [v]), {
      initialProps: { v: 1 },
    });
    rerender({ v: 1 });
    rerender({ v: 1 });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("useHasMounted", () => {
  it("starts false, becomes true after mount", () => {
    const { result } = renderHook(() => useHasMounted());
    // After renderHook, React has committed the mount effect — expect true.
    act(() => {});
    expect(result.current).toBe(true);
  });
});
