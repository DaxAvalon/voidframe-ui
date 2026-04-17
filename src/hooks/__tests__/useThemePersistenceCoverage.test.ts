// Coverage tests for useThemePersistence — defaultStorage path (lines 33-64)
//
// The defaultStorage() function is only reached when no `storage` option
// is passed, so every prior test that supplies a mock storage object skips it.

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useThemePersistence } from "../useThemePersistence";

describe("useThemePersistence with defaultStorage (no storage option)", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("reads from real localStorage on mount", async () => {
    localStorage.setItem("voidframe-theme", "dark");
    const { result } = renderHook(() =>
      useThemePersistence({ defaultTheme: "light" })
    );
    // Post-mount effect reads persisted value
    await vi.waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });
  });

  it("writes to real localStorage on setTheme", () => {
    const { result } = renderHook(() => useThemePersistence());
    act(() => result.current.setTheme("dark"));
    expect(localStorage.getItem("voidframe-theme")).toBe("dark");
  });

  it("removes from real localStorage on clearTheme", () => {
    localStorage.setItem("voidframe-theme", "dark");
    const { result } = renderHook(() => useThemePersistence());
    act(() => result.current.clearTheme());
    expect(localStorage.getItem("voidframe-theme")).toBeNull();
  });

  it("handles localStorage.getItem throwing (security/quota error)", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const { result } = renderHook(() =>
      useThemePersistence({ defaultTheme: "light" })
    );
    // Should fall back to default without throwing
    await vi.waitFor(() => {
      expect(result.current.theme).toBe("light");
    });
  });

  it("handles localStorage.setItem throwing (quota error)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => useThemePersistence());
    // Should not throw
    expect(() => {
      act(() => result.current.setTheme("dark"));
    }).not.toThrow();
  });

  it("handles localStorage.removeItem throwing", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const { result } = renderHook(() => useThemePersistence());
    // Should not throw
    expect(() => {
      act(() => result.current.clearTheme());
    }).not.toThrow();
  });

  it("uses default key 'voidframe-theme' and default theme 'system'", () => {
    const { result } = renderHook(() => useThemePersistence());
    expect(result.current.theme).toBe("system");
  });
});
