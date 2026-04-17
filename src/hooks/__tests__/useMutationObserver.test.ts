import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useRef, type RefObject } from "react";
import { useMutationObserver } from "../useMutationObserver";

function createRef(element: Element | null): RefObject<Element | null> {
  return { current: element };
}

describe("useMutationObserver", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("calls callback on child addition", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() => useMutationObserver(ref, callback));

    const child = document.createElement("span");
    container.appendChild(child);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it("calls callback on child removal", async () => {
    const child = document.createElement("span");
    container.appendChild(child);

    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() => useMutationObserver(ref, callback));

    container.removeChild(child);

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it("calls callback on attribute change with attributes option", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() =>
      useMutationObserver(ref, callback, {
        attributes: true,
        childList: false,
      })
    );

    container.setAttribute("data-test", "value");

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it("calls callback on characterData change", async () => {
    const textNode = document.createTextNode("hello");
    container.appendChild(textNode);

    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() =>
      useMutationObserver(ref, callback, {
        characterData: true,
        subtree: true,
        childList: false,
      })
    );

    textNode.textContent = "world";

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it("does not observe when ref is null", () => {
    const callback = vi.fn();
    const ref = createRef(null);

    expect(() => {
      renderHook(() => useMutationObserver(ref, callback));
    }).not.toThrow();
  });

  it("disconnects on unmount", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    const { unmount } = renderHook(() => useMutationObserver(ref, callback));
    unmount();

    // Mutations after unmount should not trigger callback
    const child = document.createElement("span");
    container.appendChild(child);

    // Give time for any async callbacks
    await new Promise((r) => setTimeout(r, 50));
    expect(callback).not.toHaveBeenCalled();
  });

  it("reconnects on options change", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    const { rerender } = renderHook(
      ({ options }) => useMutationObserver(ref, callback, options),
      { initialProps: { options: { childList: true } as MutationObserverInit } }
    );

    rerender({ options: { childList: true, attributes: true } });

    container.setAttribute("data-x", "y");

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it("callback receives MutationRecord array", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() => useMutationObserver(ref, callback));

    container.appendChild(document.createElement("div"));

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
      const records = callback.mock.calls[0][0];
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]).toHaveProperty("type");
    });
  });

  it("handles batched mutations", async () => {
    const callback = vi.fn();
    const ref = createRef(container);

    renderHook(() => useMutationObserver(ref, callback));

    container.appendChild(document.createElement("span"));
    container.appendChild(document.createElement("div"));

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
      // MutationObserver may batch or call separately
      const totalRecords = callback.mock.calls.reduce(
        (sum: number, call: any[]) => sum + call[0].length,
        0
      );
      expect(totalRecords).toBeGreaterThanOrEqual(2);
    });
  });

  it("does not error in SSR environment", () => {
    const ref = createRef(null);
    expect(() => {
      renderHook(() => useMutationObserver(ref, vi.fn()));
    }).not.toThrow();
  });
});
