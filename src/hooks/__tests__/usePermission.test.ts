import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePermission } from "../usePermission";

function createMockStatus(state: PermissionState) {
  return {
    state,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function setupPermissions(mockStatus: ReturnType<typeof createMockStatus>) {
  Object.defineProperty(navigator, "permissions", {
    value: {
      query: vi.fn().mockResolvedValue(mockStatus),
    },
    configurable: true,
  });
}

describe("usePermission", () => {
  const originalPermissions = navigator.permissions;

  afterEach(() => {
    Object.defineProperty(navigator, "permissions", {
      value: originalPermissions,
      configurable: true,
    });
  });

  it("isGranted when granted", async () => {
    const mock = createMockStatus("granted");
    setupPermissions(mock);
    const { result } = renderHook(() => usePermission("camera"));
    await act(async () => {});
    expect(result.current.isGranted).toBe(true);
    expect(result.current.status).toBe("granted");
  });

  it("isDenied when denied", async () => {
    const mock = createMockStatus("denied");
    setupPermissions(mock);
    const { result } = renderHook(() => usePermission("microphone"));
    await act(async () => {});
    expect(result.current.isDenied).toBe(true);
    expect(result.current.status).toBe("denied");
  });

  it("isPrompt when prompt", async () => {
    const mock = createMockStatus("prompt");
    setupPermissions(mock);
    const { result } = renderHook(() => usePermission("notifications"));
    await act(async () => {});
    expect(result.current.isPrompt).toBe(true);
    expect(result.current.status).toBe("prompt");
  });

  it("isSupported false when permissions API unavailable", async () => {
    Object.defineProperty(navigator, "permissions", {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => usePermission("camera"));
    await act(async () => {});
    expect(result.current.isSupported).toBe(false);
    expect(result.current.status).toBe("not-supported");
  });

  it("not-supported for unknown permission names", async () => {
    Object.defineProperty(navigator, "permissions", {
      value: {
        query: vi.fn().mockRejectedValue(new TypeError("not supported")),
      },
      configurable: true,
    });
    const { result } = renderHook(() => usePermission("clipboard-read"));
    await act(async () => {});
    expect(result.current.status).toBe("not-supported");
    expect(result.current.isSupported).toBe(false);
  });

  it("updates on change event", async () => {
    const mock = createMockStatus("prompt");
    setupPermissions(mock);
    const { result } = renderHook(() => usePermission("geolocation"));
    await act(async () => {});
    expect(result.current.isPrompt).toBe(true);

    const changeHandler = mock.addEventListener.mock.calls.find(
      ([event]: [string]) => event === "change"
    )?.[1] as (() => void) | undefined;
    expect(changeHandler).toBeDefined();

    mock.state = "granted" as PermissionState;
    await act(async () => {
      changeHandler!();
    });
    expect(result.current.isGranted).toBe(true);
  });

  it("cleans up listener on unmount", async () => {
    const mock = createMockStatus("granted");
    setupPermissions(mock);
    const { unmount } = renderHook(() => usePermission("camera"));
    await act(async () => {});
    unmount();
    expect(mock.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("works with different permission names", async () => {
    const mock = createMockStatus("granted");
    setupPermissions(mock);
    const { result } = renderHook(() => usePermission("clipboard-write"));
    await act(async () => {});
    expect(result.current.isGranted).toBe(true);
    expect(
      (navigator.permissions!.query as ReturnType<typeof vi.fn>)
    ).toHaveBeenCalledWith({ name: "clipboard-write" });
  });

  it("SSR safe with default not-supported", () => {
    const origNav = globalThis.navigator;
    // @ts-expect-error - simulating SSR
    delete (globalThis as Record<string, unknown>).navigator;
    Object.defineProperty(globalThis, "navigator", {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => usePermission("camera"));
    expect(result.current.status).toBe("not-supported");
    expect(result.current.isSupported).toBe(false);
    Object.defineProperty(globalThis, "navigator", {
      value: origNav,
      configurable: true,
    });
  });
});
