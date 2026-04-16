// Expanded tests for useThemePersistence — cross-tab sync, whitelist filtering, clearTheme

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
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

describe("useThemePersistence (expanded)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("cross-tab sync via StorageEvent", () => {
    it("updates theme when storage event fires with matching key", async () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({ storage, key: "voidframe-theme" })
      );
      expect(result.current.theme).toBe("system");

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "voidframe-theme",
            newValue: "dark",
          })
        );
      });

      expect(result.current.theme).toBe("dark");
    });

    it("ignores storage events for different keys", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({ storage, key: "voidframe-theme" })
      );

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "other-key",
            newValue: "dark",
          })
        );
      });

      expect(result.current.theme).toBe("system");
    });

    it("reverts to defaultTheme when storage event has null newValue", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({ storage, key: "voidframe-theme", defaultTheme: "light" })
      );

      // First set a theme
      act(() => result.current.setTheme("dark"));
      expect(result.current.theme).toBe("dark");

      // Simulate clearing from another tab
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "voidframe-theme",
            newValue: null,
          })
        );
      });

      expect(result.current.theme).toBe("light");
    });

    it("cleans up event listener on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const storage = mockStorage();
      const { unmount } = renderHook(() =>
        useThemePersistence({ storage })
      );

      unmount();
      expect(removeSpy).toHaveBeenCalledWith("storage", expect.any(Function));
    });
  });

  describe("allowed whitelist filtering", () => {
    it("accepts persisted value when in allowed list", async () => {
      const storage = mockStorage();
      storage.set("voidframe-theme", "dark");
      const { result } = renderHook(() =>
        useThemePersistence({
          storage,
          allowed: ["light", "dark", "system"] as const,
          defaultTheme: "system",
        })
      );
      await vi.waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });
    });

    it("rejects persisted value when not in allowed list", async () => {
      const storage = mockStorage();
      storage.set("voidframe-theme", "hacker");
      const { result } = renderHook(() =>
        useThemePersistence({
          storage,
          allowed: ["light", "dark"] as const,
          defaultTheme: "light",
        })
      );
      // Should stay at default because "hacker" is not allowed
      await vi.waitFor(() => {
        expect(result.current.theme).toBe("light");
      });
    });

    it("rejects storage event values not in allowed list", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({
          storage,
          allowed: ["light", "dark"] as const,
          defaultTheme: "light",
        })
      );

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "voidframe-theme",
            newValue: "hacker",
          })
        );
      });

      // Should not change
      expect(result.current.theme).toBe("light");
    });

    it("accepts storage event values in allowed list", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({
          storage,
          allowed: ["light", "dark"] as const,
          defaultTheme: "light",
        })
      );

      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "voidframe-theme",
            newValue: "dark",
          })
        );
      });

      expect(result.current.theme).toBe("dark");
    });
  });

  describe("clearTheme behavior", () => {
    it("reverts to defaultTheme after clear", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({ storage, defaultTheme: "system" })
      );

      act(() => result.current.setTheme("dark"));
      expect(result.current.theme).toBe("dark");
      expect(storage._store["voidframe-theme"]).toBe("dark");

      act(() => result.current.clearTheme());
      expect(result.current.theme).toBe("system");
      expect(storage._store["voidframe-theme"]).toBeUndefined();
    });

    it("works with custom key", () => {
      const storage = mockStorage();
      const { result } = renderHook(() =>
        useThemePersistence({ storage, key: "my-theme", defaultTheme: "auto" })
      );

      act(() => result.current.setTheme("dark"));
      expect(storage._store["my-theme"]).toBe("dark");

      act(() => result.current.clearTheme());
      expect(result.current.theme).toBe("auto");
      expect(storage._store["my-theme"]).toBeUndefined();
    });

    it("handles storage without remove method", () => {
      const storage = {
        get: () => null,
        set: vi.fn(),
        // no remove method
      };
      const { result } = renderHook(() =>
        useThemePersistence({ storage, defaultTheme: "light" })
      );

      act(() => result.current.setTheme("dark"));
      // Should not throw when calling clearTheme without remove
      act(() => result.current.clearTheme());
      expect(result.current.theme).toBe("light");
    });
  });
});
