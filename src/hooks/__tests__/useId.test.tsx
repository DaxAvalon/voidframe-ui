import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useId } from "../useId";

describe("useId", () => {
  it("returns a non-empty string with default prefix", () => {
    const { result } = renderHook(() => useId());
    expect(result.current).toMatch(/^vf-/);
    expect(result.current.length).toBeGreaterThan(3);
  });

  it("respects a custom prefix", () => {
    const { result } = renderHook(() => useId(undefined, "btn"));
    expect(result.current).toMatch(/^btn-/);
  });

  it("returns the provided ID verbatim when supplied", () => {
    const { result } = renderHook(() => useId("my-id"));
    expect(result.current).toBe("my-id");
  });

  it("strips colons from the underlying React id", () => {
    const { result } = renderHook(() => useId());
    expect(result.current).not.toContain(":");
  });

  it("is stable across re-renders", () => {
    const { result, rerender } = renderHook(() => useId());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
