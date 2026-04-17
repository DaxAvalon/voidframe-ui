import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useFullscreen } from "../useFullscreen";
import { type RefObject } from "react";

describe("useFullscreen", () => {
  let requestFullscreenMock: ReturnType<typeof vi.fn>;
  let exitFullscreenMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    requestFullscreenMock = vi.fn().mockResolvedValue(undefined);
    exitFullscreenMock = vi.fn().mockResolvedValue(undefined);

    document.documentElement.requestFullscreen = requestFullscreenMock;
    document.exitFullscreen = exitFullscreenMock;
    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  it("isSupported is true when API available", () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isSupported).toBe(true);
  });

  it("isFullscreen is false initially", () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });

  it("enter calls requestFullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());
    await act(async () => {
      await result.current.enter();
    });
    expect(requestFullscreenMock).toHaveBeenCalled();
  });

  it("isFullscreen becomes true after fullscreenchange event", async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enter();
    });

    act(() => {
      Object.defineProperty(document, "fullscreenElement", {
        value: document.documentElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it("exit calls exitFullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());
    await act(async () => {
      await result.current.exit();
    });
    expect(exitFullscreenMock).toHaveBeenCalled();
  });

  it("isFullscreen becomes false after exit + fullscreenchange", async () => {
    const { result } = renderHook(() => useFullscreen());

    // Enter fullscreen
    act(() => {
      Object.defineProperty(document, "fullscreenElement", {
        value: document.documentElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(result.current.isFullscreen).toBe(true);

    // Exit fullscreen
    await act(async () => {
      await result.current.exit();
    });
    act(() => {
      Object.defineProperty(document, "fullscreenElement", {
        value: null,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it("toggle enters when not fullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());
    await act(async () => {
      await result.current.toggle();
    });
    expect(requestFullscreenMock).toHaveBeenCalled();
  });

  it("toggle exits when fullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());

    // Simulate being in fullscreen
    act(() => {
      Object.defineProperty(document, "fullscreenElement", {
        value: document.documentElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    await act(async () => {
      await result.current.toggle();
    });
    expect(exitFullscreenMock).toHaveBeenCalled();
  });

  it("element reflects current fullscreen element", () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => {
      Object.defineProperty(document, "fullscreenElement", {
        value: document.documentElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    expect(result.current.element).toBe(document.documentElement);
  });

  it("uses ref element when provided", async () => {
    const el = document.createElement("div");
    el.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const ref: RefObject<Element | null> = { current: el };

    const { result } = renderHook(() => useFullscreen(ref));
    await act(async () => {
      await result.current.enter();
    });
    expect(el.requestFullscreen).toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useFullscreen());
    unmount();

    const calls = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "fullscreenchange"
    );
    expect(calls.length).toBeGreaterThan(0);
    removeEventListenerSpy.mockRestore();
  });

  it("handles webkit prefix", async () => {
    // Remove standard API, add webkit
    delete (document.documentElement as any).requestFullscreen;
    const webkitRequest = vi.fn().mockResolvedValue(undefined);
    (document.documentElement as any).webkitRequestFullscreen = webkitRequest;

    const { result } = renderHook(() => useFullscreen());
    await act(async () => {
      await result.current.enter();
    });
    expect(webkitRequest).toHaveBeenCalled();

    // Restore
    document.documentElement.requestFullscreen = requestFullscreenMock;
  });

  it("does not error in SSR-like conditions", () => {
    expect(() => {
      renderHook(() => useFullscreen());
    }).not.toThrow();
  });
});
