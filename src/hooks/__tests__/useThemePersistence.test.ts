// Tests for useThemePersistence hook

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useThemePersistence } from "../useThemePersistence";

function mockStorage() {
  const store: Record<string, string> = {};
  return {
    get: (k: string) => store[k] ?? null,
    set: (k: string, v: string) => { store[k] = v; },
    remove: (k: string) => { delete store[k]; },
    _store: store,
  };
}

describe("useThemePersistence", () => {
  it("defaults to 'system' when nothing persisted", () => {
    const storage = mockStorage();
    const { result } = renderHook(() =>
      useThemePersistence({ storage })
    );
    expect(result.current.theme).toBe("system");
  });

  it("uses custom defaultTheme", () => {
    const storage = mockStorage();
    const { result } = renderHook(() =>
      useThemePersistence({ storage, defaultTheme: "dark" })
    );
    expect(result.current.theme).toBe("dark");
  });

  it("reads persisted value on mount", async () => {
    const storage = mockStorage();
    storage.set("voidframe-theme", "midnight");
    const { result } = renderHook(() =>
      useThemePersistence({ storage })
    );
    // After effect runs
    await vi.waitFor(() => {
      expect(result.current.theme).toBe("midnight");
    });
  });

  it("persists on setTheme", () => {
    const storage = mockStorage();
    const { result } = renderHook(() =>
      useThemePersistence({ storage })
    );
    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(storage._store["voidframe-theme"]).toBe("light");
  });

  it("clears persisted value and reverts to default", () => {
    const storage = mockStorage();
    storage.set("voidframe-theme", "midnight");
    const { result } = renderHook(() =>
      useThemePersistence({ storage, defaultTheme: "dark" })
    );
    act(() => result.current.clearTheme());
    expect(result.current.theme).toBe("dark");
    expect(storage._store["voidframe-theme"]).toBeUndefined();
  });

  it("uses custom storage key", () => {
    const storage = mockStorage();
    const { result } = renderHook(() =>
      useThemePersistence({ storage, key: "my-theme" })
    );
    act(() => result.current.setTheme("grey"));
    expect(storage._store["my-theme"]).toBe("grey");
  });

  it("ignores persisted values not in allowed list", async () => {
    const storage = mockStorage();
    storage.set("voidframe-theme", "hacker");
    const { result } = renderHook(() =>
      useThemePersistence({
        storage,
        allowed: ["dark", "light", "midnight"] as const,
        defaultTheme: "dark",
      })
    );
    // "hacker" not in allowed, should stay at default
    await vi.waitFor(() => {
      expect(result.current.theme).toBe("dark");
    });
  });
});
