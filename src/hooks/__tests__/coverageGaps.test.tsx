// Coverage-gap tests for hooks
//
// Targeted tests for uncovered lines/branches in:
//   - index.ts (useToggle key shortcut, useKeyboardShortcut modifiers,
//     useLocalStorage JSON parse error, useCopyToClipboard error path,
//     useScroll, useWindowSize)
//   - useForm.ts (lines 146-147 setValues, 150-153 setError)
//   - useFocusWithin.ts (focusout with relatedTarget inside container)
//   - useScrollPosition.ts (scroll event on element)
//   - useScrollDirection.ts (direction detection + target element)
//   - usePageVisibility.ts (visibilitychange event)

import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  useToggle,
  useKeyboardShortcut,
  useLocalStorage,
  useCopyToClipboard,
  useScroll,
  useWindowSize,
} from "..";
import { useForm } from "../useForm";
import { useFocusWithin } from "../useFocusWithin";
import { useScrollPosition } from "../useScrollPosition";
import { useScrollDirection } from "../useScrollDirection";
import { usePageVisibility } from "../usePageVisibility";

// ── useToggle: keyboard shortcut branch ──────────────────

describe("useToggle — keyboard shortcut", () => {
  it("toggles value when the configured key is pressed", () => {
    const { result } = renderHook(() => useToggle(false, "Escape"));
    expect(result.current[0]).toBe(false);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current[0]).toBe(true);
  });

  it("does not toggle for a different key", () => {
    const { result } = renderHook(() => useToggle(false, "Escape"));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(result.current[0]).toBe(false);
  });

  it("cleans up listener on unmount", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useToggle(false, "Escape"));
    unmount();
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
    spy.mockRestore();
  });
});

// ── useKeyboardShortcut: modifier branches ───────────────

describe("useKeyboardShortcut — modifiers", () => {
  it("fires handler when all modifiers match", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut("s", handler, { ctrl: true, shift: true })
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: true,
          shiftKey: true,
        })
      );
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("skips when ctrl required but not pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("s", handler, { ctrl: true }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("skips when meta required but not pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("k", handler, { meta: true }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("skips when alt required but not pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("x", handler, { alt: true }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("fires when alt is required and pressed", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("x", handler, { alt: true }));
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "x", altKey: true })
      );
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is case-insensitive", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("S", handler));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls preventDefault on matching key", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("k", handler));
    const event = new KeyboardEvent("keydown", { key: "k" });
    const preventSpy = vi.spyOn(event, "preventDefault");
    act(() => {
      window.dispatchEvent(event);
    });
    expect(preventSpy).toHaveBeenCalled();
  });
});

// ── useLocalStorage: JSON parse error branch ─────────────

describe("useLocalStorage — error branches", () => {
  afterEach(() => window.localStorage.clear());

  it("falls back to initial value when stored JSON is malformed", () => {
    window.localStorage.setItem("broken", "not-valid-json{{{");
    const { result } = renderHook(() => useLocalStorage("broken", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});

// ── useCopyToClipboard: error branch ─────────────────────

describe("useCopyToClipboard — clipboard error", () => {
  it("sets copied=false when clipboard.writeText rejects", async () => {
    const origClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current.copy("test");
    });
    expect(result.current.copied).toBe(false);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: origClipboard,
    });
  });
});

// ── useScroll: scroll event ──────────────────────────────

describe("useScroll", () => {
  it("tracks window scroll position", () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toEqual({ x: 0, y: 0 });
    // Simulate scroll
    Object.defineProperty(window, "scrollX", { configurable: true, value: 100 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toEqual({ x: 100, y: 200 });
    // Reset
    Object.defineProperty(window, "scrollX", { configurable: true, value: 0 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });
});

// ── useWindowSize: resize event ──────────────────────────

describe("useWindowSize", () => {
  it("tracks window dimensions on resize", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBeGreaterThanOrEqual(0);
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1920 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1080 });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toEqual({ width: 1920, height: 1080 });
  });
});

// ── useForm: setValues and setError branches ─────────────

describe("useForm — setValues and setError", () => {
  it("setValues merges multiple fields at once", () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: number }>({
        initialValues: { a: "x", b: 0 },
      })
    );
    act(() => {
      result.current.setValues({ a: "y", b: 42 });
    });
    expect(result.current.values.a).toBe("y");
    expect(result.current.values.b).toBe(42);
  });

  it("setError sets and clears field errors", () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({ initialValues: { name: "" } })
    );
    act(() => {
      result.current.setError("name", "Required");
    });
    expect(result.current.errors.name).toBe("Required");
    expect(result.current.isValid).toBe(false);
    act(() => {
      result.current.setError("name", null);
    });
    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it("handleSubmit prevents default on form event", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "ok" },
        onSubmit,
      })
    );
    const mockEvent = { preventDefault: vi.fn() };
    await act(async () => {
      await result.current.handleSubmit(mockEvent as never);
    });
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  it("coerces empty number input to empty string", () => {
    const { result } = renderHook(() =>
      useForm<{ count: number | string }>({ initialValues: { count: 0 } })
    );
    act(() => {
      result.current
        .register("count")
        .onChange({ target: { value: "", type: "number" } } as never);
    });
    expect(result.current.values.count).toBe("");
  });

  it("getField.setTouched marks field as touched", () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({ initialValues: { name: "" } })
    );
    expect(result.current.touched.name).toBeUndefined();
    act(() => {
      result.current.getField("name").setTouched();
    });
    expect(result.current.touched.name).toBe(true);
  });

  it("reset with partial next values updates initial ref", () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        initialValues: { a: "x", b: "y" },
      })
    );
    act(() => {
      result.current.reset({ a: "z" });
    });
    expect(result.current.values.a).toBe("z");
    expect(result.current.values.b).toBe("y");
    expect(result.current.isDirty).toBe(false);
  });
});

// ── useFocusWithin: focusout with relatedTarget inside ───

describe("useFocusWithin — focus movement within container", () => {
  it("stays true when focus moves within container", () => {
    const container = document.createElement("div");
    const btn1 = document.createElement("button");
    const btn2 = document.createElement("button");
    container.appendChild(btn1);
    container.appendChild(btn2);
    document.body.appendChild(container);

    const { result } = renderHook(() => {
      const ref = useRef<HTMLElement>(container);
      return useFocusWithin(ref);
    });

    act(() => {
      container.dispatchEvent(new Event("focusin", { bubbles: true }));
    });
    expect(result.current).toBe(true);

    // Focus moves from btn1 to btn2 — relatedTarget is still inside
    act(() => {
      container.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: btn2 })
      );
    });
    expect(result.current).toBe(true);

    document.body.removeChild(container);
  });

  it("becomes false when focus leaves container entirely", () => {
    const container = document.createElement("div");
    const btn = document.createElement("button");
    container.appendChild(btn);
    const outsideBtn = document.createElement("button");
    document.body.appendChild(container);
    document.body.appendChild(outsideBtn);

    const { result } = renderHook(() => {
      const ref = useRef<HTMLElement>(container);
      return useFocusWithin(ref);
    });

    act(() => {
      container.dispatchEvent(new Event("focusin", { bubbles: true }));
    });
    expect(result.current).toBe(true);

    act(() => {
      container.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: outsideBtn })
      );
    });
    expect(result.current).toBe(false);

    document.body.removeChild(container);
    document.body.removeChild(outsideBtn);
  });

  it("returns false when ref is null", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLElement>(null);
      return useFocusWithin(ref);
    });
    expect(result.current).toBe(false);
  });
});

// ── useScrollPosition: scroll event on element ──────────

describe("useScrollPosition — element scroll", () => {
  it("reads initial scroll position and updates on scroll", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollLeft", { configurable: true, value: 10 });
    Object.defineProperty(el, "scrollTop", { configurable: true, value: 20 });
    document.body.appendChild(el);

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(el as HTMLDivElement);
      return useScrollPosition(ref);
    });

    // Seeds on mount
    expect(result.current).toEqual({ x: 10, y: 20 });

    // Update on scroll
    Object.defineProperty(el, "scrollLeft", { configurable: true, value: 50 });
    Object.defineProperty(el, "scrollTop", { configurable: true, value: 100 });
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toEqual({ x: 50, y: 100 });

    document.body.removeChild(el);
  });
});

// ── useScrollDirection: direction detection ──────────────

describe("useScrollDirection — direction detection", () => {
  it("detects downward scroll on window", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    const { result } = renderHook(() => useScrollDirection({ threshold: 1 }));
    expect(result.current).toBeNull();

    Object.defineProperty(window, "scrollY", { configurable: true, value: 50 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe("down");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 10 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe("up");

    // Reset
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("ignores scroll below threshold", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    const { result } = renderHook(() => useScrollDirection({ threshold: 100 }));

    Object.defineProperty(window, "scrollY", { configurable: true, value: 5 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBeNull();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("observes a target element instead of window", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollTop", { configurable: true, value: 0 });
    document.body.appendChild(el);

    const { result } = renderHook(() =>
      useScrollDirection({ target: el, threshold: 1 })
    );

    Object.defineProperty(el, "scrollTop", { configurable: true, value: 30 });
    act(() => {
      el.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe("down");

    document.body.removeChild(el);
  });
});

// ── usePageVisibility: visibilitychange event ────────────

describe("usePageVisibility — visibilitychange", () => {
  it("updates state when visibility changes", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe("visible");

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("hidden");

    // Restore
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe("visible");
  });
});
