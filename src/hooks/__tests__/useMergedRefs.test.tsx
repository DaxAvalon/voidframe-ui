import { renderHook } from "@testing-library/react";
import { createRef, useRef, type Ref } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMergedRefs } from "../useMergedRefs";

describe("useMergedRefs", () => {
  it("calls function refs with the assigned node", () => {
    const fnRef = vi.fn();
    const { result } = renderHook(() => useMergedRefs<HTMLDivElement>(fnRef));
    const node = document.createElement("div");
    result.current(node);
    expect(fnRef).toHaveBeenCalledWith(node);
  });

  it("populates object refs with the assigned node", () => {
    const objRef = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useMergedRefs(objRef));
    const node = document.createElement("div");
    result.current(node);
    expect(objRef.current).toBe(node);
  });

  it("dispatches to all refs in the same call", () => {
    const fnRef = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useMergedRefs(fnRef, objRef));
    const node = document.createElement("div");
    result.current(node);
    expect(fnRef).toHaveBeenCalledWith(node);
    expect(objRef.current).toBe(node);
  });

  it("skips null/undefined refs", () => {
    const fnRef = vi.fn();
    const { result } = renderHook(() =>
      useMergedRefs<HTMLDivElement>(null, undefined, fnRef)
    );
    const node = document.createElement("div");
    expect(() => result.current(node)).not.toThrow();
    expect(fnRef).toHaveBeenCalledWith(node);
  });
});

describe("useMergedRefs — integration", () => {
  it("works with internal + forwarded refs together", () => {
    function useInternalAndForwarded(forwarded: Ref<HTMLDivElement>) {
      const internal = useRef<HTMLDivElement>(null);
      const merged = useMergedRefs(internal, forwarded);
      return { internal, merged };
    }
    const forwarded = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useInternalAndForwarded(forwarded));
    const node = document.createElement("div");
    result.current.merged(node);
    expect(result.current.internal.current).toBe(node);
    expect(forwarded.current).toBe(node);
  });
});
