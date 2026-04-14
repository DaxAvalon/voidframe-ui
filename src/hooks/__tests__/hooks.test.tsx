import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useCopyToClipboard,
  useDebounce,
  useForceUpdate,
  useHover,
  useFocus,
  useInterval,
  useLocalStorage,
  usePrevious,
  useToggle,
} from "..";

describe("useHover", () => {
  it("starts unhovered", () => {
    const { result } = renderHook(() => useHover());
    expect(result.current.hovered).toBe(false);
  });

  it("reflects mouse enter/leave via bind", () => {
    const { result } = renderHook(() => useHover());
    act(() => {
      result.current.bind.onMouseEnter({} as never);
    });
    expect(result.current.hovered).toBe(true);
    act(() => {
      result.current.bind.onMouseLeave({} as never);
    });
    expect(result.current.hovered).toBe(false);
  });
});

describe("useFocus", () => {
  it("starts unfocused", () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current.focused).toBe(false);
  });

  it("reflects focus/blur via bind", () => {
    const { result } = renderHook(() => useFocus());
    act(() => {
      result.current.bind.onFocus({} as never);
    });
    expect(result.current.focused).toBe(true);
    act(() => {
      result.current.bind.onBlur({} as never);
    });
    expect(result.current.focused).toBe(false);
  });
});

describe("useToggle", () => {
  it("starts with initial value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it("flips via toggle()", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it("sets explicit value via setValue", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });
});

describe("useDebounce", () => {
  it("initially returns the current value", () => {
    const { result } = renderHook(() => useDebounce("hello", 100));
    expect(result.current).toBe("hello");
  });

  it("updates after delay", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 100),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("b");
    vi.useRealTimers();
  });
});

describe("useLocalStorage", () => {
  it("falls back to initial value when storage is empty", () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useLocalStorage("x", 42));
    expect(result.current[0]).toBe(42);
  });

  it("persists set values to storage", () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useLocalStorage("x", 1));
    act(() => result.current[1](99));
    expect(result.current[0]).toBe(99);
    expect(window.localStorage.getItem("x")).toBe("99");
  });

  it("accepts updater function", () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useLocalStorage("counter", 0));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(1);
  });
});

describe("useInterval", () => {
  it("calls the callback on interval", async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    renderHook(() => useInterval(cb, 100));
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(cb).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("does not fire when delay is null", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    renderHook(() => useInterval(cb, null));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cb).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("useCopyToClipboard", () => {
  it("starts with copied=false", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
  });

  it("exposes copy function", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(typeof result.current.copy).toBe("function");
  });
});

describe("usePrevious", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(({ v }: { v: number }) => usePrevious(v), {
      initialProps: { v: 1 },
    });
    expect(result.current).toBeUndefined();
  });

  it("returns the previous value on subsequent renders", async () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) => usePrevious(v),
      { initialProps: { v: 1 } }
    );
    rerender({ v: 2 });
    await waitFor(() => expect(result.current).toBe(1));
    rerender({ v: 3 });
    await waitFor(() => expect(result.current).toBe(2));
  });
});

describe("useForceUpdate", () => {
  it("returns a stable function that triggers rerender", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useForceUpdate();
    });
    const initial = renders;
    act(() => result.current());
    expect(renders).toBeGreaterThan(initial);
  });
});
