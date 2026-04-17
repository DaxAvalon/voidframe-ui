import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useHistoryState } from "../useHistoryState";

describe("useHistoryState", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;
  let backSpy: ReturnType<typeof vi.spyOn>;
  let forwardSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    forwardSpy = vi.spyOn(window.history, "forward").mockImplementation(() => {});
    // Reset history.state
    Object.defineProperty(window.history, "state", {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useHistoryState("hello"));
    expect(result.current.state).toBe("hello");
  });

  it("push updates state and calls pushState", () => {
    const { result } = renderHook(() => useHistoryState(0, "counter"));
    act(() => {
      result.current.push(5);
    });
    expect(result.current.state).toBe(5);
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ counter: 5 }),
      "",
      undefined
    );
  });

  it("replace updates state and calls replaceState", () => {
    const { result } = renderHook(() => useHistoryState(0, "counter"));
    act(() => {
      result.current.replace(10);
    });
    expect(result.current.state).toBe(10);
    expect(replaceStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ counter: 10 }),
      "",
      undefined
    );
  });

  it("syncs state on popstate event", () => {
    const { result } = renderHook(() => useHistoryState("a", "nav"));

    act(() => {
      // jsdom may not set .state on PopStateEvent via constructor,
      // so we create and assign it manually
      const event = new Event("popstate") as PopStateEvent;
      Object.defineProperty(event, "state", { value: { nav: "b" } });
      window.dispatchEvent(event);
    });
    expect(result.current.state).toBe("b");
  });

  it("back calls history.back", () => {
    const { result } = renderHook(() => useHistoryState(0));
    act(() => {
      result.current.back();
    });
    expect(backSpy).toHaveBeenCalled();
  });

  it("forward calls history.forward", () => {
    const { result } = renderHook(() => useHistoryState(0));
    act(() => {
      result.current.forward();
    });
    expect(forwardSpy).toHaveBeenCalled();
  });

  it("passes URL parameter to pushState", () => {
    const { result } = renderHook(() => useHistoryState("x", "page"));
    act(() => {
      result.current.push("y", "/new-path");
    });
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page: "y" }),
      "",
      "/new-path"
    );
  });

  it("namespaces state under key to avoid conflicts", () => {
    const { result } = renderHook(() => useHistoryState(1, "myKey"));
    act(() => {
      result.current.push(2);
    });
    const stateArg = pushStateSpy.mock.calls[0][0];
    expect(stateArg).toHaveProperty("myKey", 2);
  });

  it("reads existing history.state on mount", () => {
    Object.defineProperty(window.history, "state", {
      value: { stored: 42 },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useHistoryState(0, "stored"));
    expect(result.current.state).toBe(42);
  });

  it("returns initial state and no-ops in SSR-like environment", () => {
    // popstate with no matching key falls back to initial
    const { result } = renderHook(() => useHistoryState("default", "missing"));
    act(() => {
      const event = new Event("popstate") as PopStateEvent;
      Object.defineProperty(event, "state", { value: {} });
      window.dispatchEvent(event);
    });
    expect(result.current.state).toBe("default");
  });
});
