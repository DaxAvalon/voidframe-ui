import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useThemePersistence } from "../useThemePersistence";

function mockStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    get: (k: string) => store[k] ?? null,
    set: (k: string, v: string) => { store[k] = v; },
    remove: (k: string) => { delete store[k]; },
    _store: store,
  };
}

describe("useThemePersistence hydrate and same-tab sync", () => {
  it("hydrate='sync' returns the stored value on the first render", () => {
    const storage = mockStorage({ "voidframe-theme": "midnight" });
    let first: string | undefined;
    const { result } = renderHook(() => {
      const r = useThemePersistence({ storage, hydrate: "sync" });
      first ??= r.theme;
      return r;
    });
    expect(first).toBe("midnight");
    expect(result.current.theme).toBe("midnight");
  });

  it("hydrate='sync' ignores a stored value outside `allowed`", () => {
    const storage = mockStorage({ "voidframe-theme": "neon" });
    const { result } = renderHook(() =>
      useThemePersistence({ storage, hydrate: "sync", allowed: ["dark", "light"], defaultTheme: "dark" })
    );
    expect(result.current.theme).toBe("dark");
  });

  it("two instances with the same key stay in sync in one tab", () => {
    const storage = mockStorage();
    const a = renderHook(() => useThemePersistence({ storage, key: "k" }));
    const b = renderHook(() => useThemePersistence({ storage, key: "k" }));
    const other = renderHook(() => useThemePersistence({ storage, key: "other" }));
    act(() => a.result.current.setTheme("light"));
    expect(b.result.current.theme).toBe("light");
    expect(other.result.current.theme).toBe("system");
    act(() => b.result.current.clearTheme());
    expect(a.result.current.theme).toBe("system");
    expect(storage._store.k).toBeUndefined();
  });
});
