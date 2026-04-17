import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useOrientation } from "../useOrientation";

describe("useOrientation", () => {
  let changeHandler: (() => void) | null = null;
  const addEventListenerMock = vi.fn((event: string, handler: () => void) => {
    if (event === "change") changeHandler = handler;
  });
  const removeEventListenerMock = vi.fn();

  beforeEach(() => {
    changeHandler = null;
    Object.defineProperty(screen, "orientation", {
      value: {
        angle: 0,
        type: "portrait-primary",
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns orientation type", () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe("portrait-primary");
  });

  it("isPortrait is true for portrait orientation", () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it("isLandscape is true for landscape orientation", () => {
    Object.defineProperty(screen, "orientation", {
      value: {
        angle: 90,
        type: "landscape-primary",
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      },
      configurable: true,
    });
    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it("reports correct angle", () => {
    Object.defineProperty(screen, "orientation", {
      value: {
        angle: 270,
        type: "landscape-secondary",
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      },
      configurable: true,
    });
    const { result } = renderHook(() => useOrientation());
    expect(result.current.angle).toBe(270);
  });

  it("updates on orientation change event", () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBe("portrait-primary");

    // Simulate orientation change
    Object.defineProperty(screen, "orientation", {
      value: {
        angle: 90,
        type: "landscape-primary",
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      },
      configurable: true,
    });

    act(() => {
      changeHandler?.();
    });

    expect(result.current.type).toBe("landscape-primary");
    expect(result.current.isLandscape).toBe(true);
  });

  it("cleans up event listener on unmount", () => {
    const { unmount } = renderHook(() => useOrientation());
    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("falls back to innerWidth/innerHeight when orientation API unavailable", () => {
    Object.defineProperty(screen, "orientation", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });

    const { result } = renderHook(() => useOrientation());
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isSupported).toBe(false);
  });

  it("is SSR-safe with defaults", () => {
    // isSupported is true when screen.orientation exists in jsdom
    const { result } = renderHook(() => useOrientation());
    expect(result.current.angle).toBeTypeOf("number");
    expect(result.current.type).toBeTypeOf("string");
    expect(typeof result.current.isPortrait).toBe("boolean");
  });
});
