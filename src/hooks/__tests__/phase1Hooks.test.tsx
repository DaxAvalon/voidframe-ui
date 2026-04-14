// Coverage-focused tests for Phase 1 hooks that shipped without dedicated files.
// Augments the shared `hooks.test.tsx` suite.

import { act, render, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, type RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useClickOutside,
  useKeyboardShortcut,
  useMediaQuery,
  useScroll,
  useWindowSize,
} from "..";

// ── useClickOutside ──────────────────────────────────────────

describe("useClickOutside", () => {
  it("fires handler on mousedown outside the ref element", async () => {
    const handler = vi.fn();
    function Probe({ handlerRef }: { handlerRef: (r: RefObject<HTMLDivElement>) => void }) {
      const ref = useClickOutside<HTMLDivElement>(handler);
      handlerRef(ref);
      return (
        <>
          <div ref={ref} data-testid="inside">
            inside
          </div>
          <button data-testid="outside">outside</button>
        </>
      );
    }
    let capturedRef: RefObject<HTMLDivElement> | null = null;
    render(<Probe handlerRef={(r) => (capturedRef = r)} />);
    expect(capturedRef).not.toBeNull();
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: document.querySelector('[data-testid="outside"]')!,
    });
    expect(handler).toHaveBeenCalled();
  });

  it("does NOT fire for clicks inside the ref element", async () => {
    const handler = vi.fn();
    function Probe() {
      const ref = useClickOutside<HTMLDivElement>(handler);
      return (
        <div ref={ref} data-testid="inside">
          <button data-testid="inner">inner</button>
        </div>
      );
    }
    render(<Probe />);
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: document.querySelector('[data-testid="inner"]')!,
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

// ── useMediaQuery ────────────────────────────────────────────

describe("useMediaQuery", () => {
  it("returns false with the default matchMedia stub", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 9999px)"));
    expect(result.current).toBe(false);
  });

  it("subscribes + unsubscribes to matchMedia changes", () => {
    const listeners = new Map<string, ((e: MediaQueryListEvent) => void)[]>();
    const addSpy = vi.fn((type: string, fn: (e: MediaQueryListEvent) => void) => {
      const list = listeners.get(type) ?? [];
      list.push(fn);
      listeners.set(type, list);
    });
    const removeSpy = vi.fn(
      (type: string, fn: (e: MediaQueryListEvent) => void) => {
        const list = listeners.get(type) ?? [];
        listeners.set(
          type,
          list.filter((l) => l !== fn)
        );
      }
    );
    const savedMM = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addSpy,
      removeEventListener: removeSpy,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 500px)"));
    expect(addSpy).toHaveBeenCalledWith("change", expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("change", expect.any(Function));

    window.matchMedia = savedMM;
  });
});

// ── useKeyboardShortcut ──────────────────────────────────────

describe("useKeyboardShortcut", () => {
  it("fires handler for a matching key press", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("k", handler));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("respects modifier requirements", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcut("k", handler, { meta: true })
    );
    // Without meta, should not fire.
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(handler).not.toHaveBeenCalled();
    // With meta, should fire.
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true })
      );
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is case-insensitive", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("K", handler));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut("k", handler));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

// ── useScroll ────────────────────────────────────────────────

describe("useScroll", () => {
  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;

  beforeEach(() => {
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 0,
      writable: true,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: originalScrollX,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: originalScrollY,
    });
  });

  it("starts at 0,0", () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it("reads window scroll on scroll event", () => {
    const { result } = renderHook(() => useScroll());
    (window as unknown as { scrollX: number }).scrollX = 50;
    (window as unknown as { scrollY: number }).scrollY = 100;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toEqual({ x: 50, y: 100 });
  });
});

// ── useWindowSize ────────────────────────────────────────────

describe("useWindowSize", () => {
  it("reads initial window dimensions", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });

  it("updates on resize event", () => {
    const { result } = renderHook(() => useWindowSize());
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1234,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 567,
      writable: true,
    });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toEqual({ width: 1234, height: 567 });
  });
});

// Keep the `useRef` import alive for future additions.
void useRef;
