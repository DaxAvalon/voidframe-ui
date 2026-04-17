import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAbortController } from "../useAbortController";

describe("useAbortController", () => {
  it("returns a valid AbortSignal", () => {
    const { result } = renderHook(() => useAbortController());
    expect(result.current.signal).toBeInstanceOf(AbortSignal);
    expect(result.current.signal.aborted).toBe(false);
  });

  it("abort() aborts the current controller", () => {
    const { result } = renderHook(() => useAbortController());
    act(() => {
      result.current.abort();
    });
    expect(result.current.isAborted).toBe(true);
  });

  it("isAborted reflects signal.aborted state", () => {
    const { result } = renderHook(() => useAbortController());
    expect(result.current.isAborted).toBe(false);
    act(() => {
      result.current.abort();
    });
    expect(result.current.isAborted).toBe(true);
  });

  it("auto-aborts on unmount", () => {
    const { result, unmount } = renderHook(() => useAbortController());
    const signal = result.current.signal;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("reset() creates fresh controller and aborts old one", () => {
    const { result } = renderHook(() => useAbortController());
    const oldSignal = result.current.signal;

    act(() => {
      result.current.reset();
    });

    expect(oldSignal.aborted).toBe(true);
    expect(result.current.isAborted).toBe(false);
  });

  it("signal is passable to fetch-like APIs", () => {
    const { result } = renderHook(() => useAbortController());
    const signal = result.current.signal;
    // Verify it has the expected shape for fetch
    expect(signal).toHaveProperty("aborted");
    expect(signal).toHaveProperty("addEventListener");
    expect(signal).toHaveProperty("removeEventListener");
  });

  it("abort accepts a custom reason", () => {
    const { result } = renderHook(() => useAbortController());
    act(() => {
      result.current.abort("user cancelled");
    });
    expect(result.current.isAborted).toBe(true);
    // The signal stores the reason
    expect(result.current.signal.reason).toBe("user cancelled");
  });

  it("handles multiple resets", () => {
    const { result } = renderHook(() => useAbortController());
    const firstSignal = result.current.signal;
    expect(firstSignal.aborted).toBe(false);

    let secondController: AbortController;
    act(() => {
      secondController = result.current.reset();
    });
    // First signal was aborted by reset
    expect(firstSignal.aborted).toBe(true);
    expect(secondController!.signal.aborted).toBe(false);

    let thirdController: AbortController;
    act(() => {
      thirdController = result.current.reset();
    });
    // Second was aborted by the second reset
    expect(secondController!.signal.aborted).toBe(true);
    expect(thirdController!.signal.aborted).toBe(false);
    expect(result.current.isAborted).toBe(false);
  });
});
