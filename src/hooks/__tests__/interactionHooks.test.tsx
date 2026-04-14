import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEscapeKey } from "../useEscapeKey";
import { useKeyPress } from "../useKeyPress";
import { useLongPress } from "../useLongPress";

describe("useEscapeKey", () => {
  it("fires on Escape keydown", () => {
    const fn = vi.fn();
    renderHook(() => useEscapeKey(fn));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const fn = vi.fn();
    renderHook(() => useEscapeKey(fn));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(fn).not.toHaveBeenCalled();
  });

  it("respects `enabled=false`", () => {
    const fn = vi.fn();
    renderHook(() => useEscapeKey(fn, false));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("useKeyPress", () => {
  it("reflects held key state", () => {
    const { result } = renderHook(() => useKeyPress("Shift"));
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));
    });
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift" }));
    });
    expect(result.current).toBe(false);
  });
});

describe("useLongPress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires handler after threshold on pointer-down", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useLongPress(fn, { threshold: 500 }));
    act(() => {
      result.current.onPointerDown({} as never);
      vi.advanceTimersByTime(600);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not fire if released before threshold", () => {
    const fn = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(fn, { threshold: 500, onCancel })
    );
    act(() => {
      result.current.onPointerDown({} as never);
      vi.advanceTimersByTime(200);
      result.current.onPointerUp({} as never);
    });
    expect(fn).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
