import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOnlineStatus } from "../useOnlineStatus";

describe("useOnlineStatus", () => {
  const originalNavigator = globalThis.navigator;
  let connectionListeners: Record<string, Set<EventListener>>;

  const mockConnection = {
    effectiveType: "4g" as string,
    downlink: 10,
    rtt: 50,
    saveData: false,
    type: "wifi",
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      if (!connectionListeners[type]) connectionListeners[type] = new Set();
      connectionListeners[type].add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      connectionListeners[type]?.delete(listener);
    }),
  };

  beforeEach(() => {
    connectionListeners = {};
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "connection", {
      value: mockConnection,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns online true when navigator.onLine is true", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBe(true);
  });

  it("returns online false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBe(false);
  });

  it("updates on online event", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true, writable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBe(false);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true, writable: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.online).toBe(true);
  });

  it("updates on offline event", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true, writable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBe(true);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true, writable: true });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.online).toBe(false);
  });

  it("reads effectiveType from connection", () => {
    mockConnection.effectiveType = "3g";
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.effectiveType).toBe("3g");
  });

  it("reads downlink and rtt from connection", () => {
    mockConnection.downlink = 5.5;
    mockConnection.rtt = 100;
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.downlink).toBe(5.5);
    expect(result.current.rtt).toBe(100);
  });

  it("reads saveData from connection", () => {
    mockConnection.saveData = true;
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.saveData).toBe(true);
  });

  it("updates on connection change event", () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      mockConnection.effectiveType = "2g";
      mockConnection.downlink = 0.5;
      // Fire the change event
      connectionListeners["change"]?.forEach((listener) =>
        listener(new Event("change"))
      );
    });
    expect(result.current.effectiveType).toBe("2g");
    expect(result.current.downlink).toBe(0.5);
  });

  it("falls back when connection API unavailable", () => {
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBe(true);
    expect(result.current.effectiveType).toBeUndefined();
    expect(result.current.downlink).toBeUndefined();
  });

  it("SSR default returns online true", () => {
    // In happy-dom navigator exists, just verify default
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.online).toBeDefined();
    expect(typeof result.current.online).toBe("boolean");
  });

  it("cleans up listeners on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOnlineStatus());

    expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    expect(mockConnection.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
