import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useElementSize } from "../useElementSize";
import { useFocusVisible } from "../useFocusVisible";
import { useFocusWithin } from "../useFocusWithin";
import { useIntersectionObserver } from "../useIntersectionObserver";
import { useNetworkStatus } from "../useNetworkStatus";
import { usePageVisibility } from "../usePageVisibility";
import { useResizeObserver } from "../useResizeObserver";
import { useScrollPosition } from "../useScrollPosition";
import { useScrollDirection } from "../useScrollDirection";

describe("useResizeObserver", () => {
  it("returns initial zeroed size before first callback", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useResizeObserver(ref);
    });
    expect(result.current).toEqual({ width: 0, height: 0 });
  });

  it("updates state from ResizeObserver entries + disconnects on unmount", async () => {
    let trigger: ((entries: ResizeObserverEntry[]) => void) | null = null;
    const disconnect = vi.fn();
    const saved = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(cb: (entries: ResizeObserverEntry[]) => void) {
        trigger = cb;
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
    } as unknown as typeof ResizeObserver;

    const node = document.createElement("div");
    document.body.appendChild(node);
    const { result, unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(node);
      return useResizeObserver(ref);
    });

    await act(async () => {
      trigger?.([
        { contentRect: { width: 320, height: 180 } } as ResizeObserverEntry,
      ]);
    });
    expect(result.current).toEqual({ width: 320, height: 180 });

    unmount();
    expect(disconnect).toHaveBeenCalled();

    globalThis.ResizeObserver = saved;
    document.body.removeChild(node);
  });
});

describe("useElementSize", () => {
  it("delegates to useResizeObserver", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useElementSize(ref);
    });
    expect(result.current).toEqual({ width: 0, height: 0 });
  });
});

describe("useIntersectionObserver", () => {
  it("returns isIntersecting=false before any entry", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useIntersectionObserver(ref);
    });
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it("updates state from IntersectionObserver entries", async () => {
    let trigger: ((entries: IntersectionObserverEntry[]) => void) | null = null;
    const disconnect = vi.fn();
    const saved = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        trigger = cb;
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
      root = null;
      rootMargin = "";
      thresholds = [];
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;

    const node = document.createElement("div");
    document.body.appendChild(node);
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(node);
      return useIntersectionObserver(ref);
    });
    const fakeEntry = { isIntersecting: true } as IntersectionObserverEntry;
    await act(async () => {
      trigger?.([fakeEntry]);
    });
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.entry).toBe(fakeEntry);

    globalThis.IntersectionObserver = saved;
    document.body.removeChild(node);
  });

  it("disconnects after first intersection when `once` is set", async () => {
    let trigger: ((entries: IntersectionObserverEntry[]) => void) | null = null;
    const disconnect = vi.fn();
    const saved = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        trigger = cb;
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
      root = null;
      rootMargin = "";
      thresholds = [];
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;

    const node = document.createElement("div");
    document.body.appendChild(node);
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(node);
      return useIntersectionObserver(ref, { once: true });
    });
    await act(async () => {
      trigger?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });
    expect(disconnect).toHaveBeenCalled();

    globalThis.IntersectionObserver = saved;
    document.body.removeChild(node);
  });
});

describe("useScrollPosition", () => {
  it("returns initial zero", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useScrollPosition(ref);
    });
    expect(result.current).toEqual({ x: 0, y: 0 });
  });
});

describe("useScrollDirection", () => {
  it("returns null initially", () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBeNull();
  });
});

describe("useFocusVisible", () => {
  it("starts true and flips to false on pointerdown", () => {
    const { result } = renderHook(() => useFocusVisible());
    expect(result.current).toBe(true);
    act(() => {
      document.dispatchEvent(new Event("pointerdown"));
    });
    expect(result.current).toBe(false);
  });

  it("flips back to true on keydown", () => {
    const { result } = renderHook(() => useFocusVisible());
    act(() => {
      document.dispatchEvent(new Event("pointerdown"));
    });
    expect(result.current).toBe(false);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    });
    expect(result.current).toBe(true);
  });
});

describe("useFocusWithin", () => {
  it("returns false initially and responds to focusin", () => {
    const container = document.createElement("div");
    const btn = document.createElement("button");
    container.appendChild(btn);
    document.body.appendChild(container);

    const { result } = renderHook(() => {
      const ref = useRef<HTMLElement>(container);
      return useFocusWithin(ref);
    });
    expect(result.current).toBe(false);
    act(() => {
      container.dispatchEvent(new Event("focusin", { bubbles: true }));
    });
    expect(result.current).toBe(true);

    document.body.removeChild(container);
  });
});

describe("usePageVisibility", () => {
  it("returns 'visible' by default", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe("visible");
  });
});

describe("useNetworkStatus", () => {
  it("returns online=true by default in test env", () => {
    // happy-dom reports navigator.onLine = true.
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.online).toBe(true);
  });

  it("flips to offline on offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.online).toBe(false);
    // restore
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });
});

// Silence unused warnings on imports we only type-check above.
void vi;
