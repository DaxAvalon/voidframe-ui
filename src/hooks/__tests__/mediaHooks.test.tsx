import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useColorScheme } from "../useColorScheme";
import { usePrefersColorScheme } from "../usePrefersColorScheme";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  it("returns false with default matchMedia stub", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe("usePrefersColorScheme", () => {
  it("returns 'light' when prefers-dark is not matching (stub default)", () => {
    const { result } = renderHook(() => usePrefersColorScheme());
    expect(result.current).toBe("light");
  });
});

describe("useColorScheme", () => {
  it("defaults to 'system' which resolves to 'light' in test env", () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current.scheme).toBe("system");
    expect(result.current.resolved).toBe("light");
  });

  it("accepts a starting value", () => {
    const { result } = renderHook(() => useColorScheme("dark"));
    expect(result.current.scheme).toBe("dark");
    expect(result.current.resolved).toBe("dark");
  });

  it("setScheme updates both scheme and resolved", () => {
    const { result } = renderHook(() => useColorScheme("system"));
    expect(result.current.resolved).toBe("light");
    act(() => result.current.setScheme("dark"));
    expect(result.current.scheme).toBe("dark");
    expect(result.current.resolved).toBe("dark");
  });
});
