import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "../useCountdown";
import { useDebouncedCallback } from "../useDebouncedCallback";
import { useIdle } from "../useIdle";
import { useRafInterval } from "../useRafInterval";
import { useStopwatch } from "../useStopwatch";
import { useThrottle } from "../useThrottle";
import { useThrottledCallback } from "../useThrottledCallback";
import { useTimeout } from "../useTimeout";

describe("useTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires callback after delay", () => {
    const fn = vi.fn();
    renderHook(() => useTimeout(fn, 100));
    act(() => vi.advanceTimersByTime(150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not fire when delay is null", () => {
    const fn = vi.fn();
    renderHook(() => useTimeout(fn, null));
    act(() => vi.advanceTimersByTime(500));
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("coalesces calls within the quiet window", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });
    act(() => vi.advanceTimersByTime(120));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("cancel() drops the pending call", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => result.current("x"));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(500));
    expect(fn).not.toHaveBeenCalled();
  });

  it("flush() fires the pending call immediately", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => result.current("x"));
    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledWith("x");
  });
});

describe("useThrottle (value)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("updates at most once per interval", () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) => useThrottle(v, 100),
      { initialProps: { v: 1 } }
    );
    expect(result.current).toBe(1);
    rerender({ v: 2 });
    rerender({ v: 3 });
    act(() => vi.advanceTimersByTime(120));
    expect(result.current).toBe(3);
  });
});

describe("useThrottledCallback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("leading-edge call fires immediately", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));
    act(() => result.current("first"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("drops calls within the window and schedules trailing", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(fn, 100));
    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith("a");
    act(() => vi.advanceTimersByTime(150));
    // Trailing call with latest args.
    expect(fn).toHaveBeenLastCalledWith("c");
  });
});

describe("useStopwatch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts paused by default", () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.running).toBe(false);
    expect(result.current.elapsed).toBe(0);
  });

  it("start/pause/reset work", () => {
    const { result } = renderHook(() => useStopwatch({ tickMs: 50 }));
    act(() => result.current.start());
    expect(result.current.running).toBe(true);
    act(() => vi.advanceTimersByTime(150));
    expect(result.current.elapsed).toBeGreaterThanOrEqual(100);
    act(() => result.current.pause());
    const paused = result.current.elapsed;
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.elapsed).toBe(paused);
    act(() => result.current.reset());
    expect(result.current.elapsed).toBe(0);
  });
});

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("computes days/hours/minutes/seconds from a future target", () => {
    const target =
      Date.now() + 2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5000;
    const { result } = renderHook(() =>
      useCountdown({ target, tickMs: 1000 })
    );
    expect(result.current.days).toBe(2);
    expect(result.current.hours).toBe(3);
    expect(result.current.minutes).toBe(4);
    expect(result.current.seconds).toBe(5);
    expect(result.current.completed).toBe(false);
  });

  it("ticks down as time advances", () => {
    const target = Date.now() + 10_000;
    const { result } = renderHook(() =>
      useCountdown({ target, tickMs: 1000 })
    );
    const initial = result.current.total;
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.total).toBeLessThan(initial);
  });

  it("fires onComplete when target is reached", () => {
    const onComplete = vi.fn();
    const target = Date.now() + 500;
    renderHook(() => useCountdown({ target, tickMs: 100, onComplete }));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onComplete exactly once, not repeatedly", () => {
    const onComplete = vi.fn();
    const target = Date.now() + 200;
    renderHook(() => useCountdown({ target, tickMs: 50, onComplete }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("returns completed state immediately for past target", () => {
    const onComplete = vi.fn();
    const target = Date.now() - 1000;
    const { result } = renderHook(() =>
      useCountdown({ target, tickMs: 1000, onComplete })
    );
    expect(result.current.completed).toBe(true);
    expect(result.current.total).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("useIdle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("becomes true after the timeout elapses without events", () => {
    const { result } = renderHook(() => useIdle(1000));
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current).toBe(true);
  });

  it("resets idle state on user input", () => {
    const { result } = renderHook(() => useIdle(1000));
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });
    expect(result.current).toBe(false);
  });

  it("resets on visibilitychange", () => {
    const { result } = renderHook(() => useIdle(500));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);
  });
});

describe("useRafInterval", () => {
  let rafCalls: Array<(t: number) => void>;
  let rafId: number;
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    rafCalls = [];
    rafId = 0;
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: (t: number) => void) => {
      rafCalls.push(cb);
      return ++rafId;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
  });
  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  it("fires the callback at the requested interval", () => {
    const fn = vi.fn();
    renderHook(() => useRafInterval(fn, 100));
    // Initial rAF scheduled. Simulate progressing time.
    const start = performance.now();
    // First tick: insufficient time elapsed.
    act(() => {
      rafCalls.shift()?.(start + 50);
    });
    expect(fn).not.toHaveBeenCalled();
    // Second tick: 150ms since start, enough for the 100ms interval.
    act(() => {
      rafCalls.shift()?.(start + 150);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not schedule when ms is null", () => {
    const fn = vi.fn();
    renderHook(() => useRafInterval(fn, null));
    expect(rafCalls).toHaveLength(0);
  });
});
