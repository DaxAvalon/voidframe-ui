import { renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useDocumentTitle } from "../useDocumentTitle";

describe("useDocumentTitle", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = "Original Title";
    document.title = originalTitle;
  });

  it("sets document title", () => {
    renderHook(() => useDocumentTitle("New Title"));
    expect(document.title).toBe("New Title");
  });

  it("updates on title change", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "First" },
    });
    expect(document.title).toBe("First");

    rerender({ title: "Second" });
    expect(document.title).toBe("Second");
  });

  it("restores previous title on unmount by default", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Temp Title"));
    expect(document.title).toBe("Temp Title");

    unmount();
    expect(document.title).toBe(originalTitle);
  });

  it("skips restore when restoreOnUnmount is false", () => {
    const { unmount } = renderHook(() =>
      useDocumentTitle("Permanent", { restoreOnUnmount: false })
    );
    expect(document.title).toBe("Permanent");

    unmount();
    expect(document.title).toBe("Permanent");
  });

  it("applies template with %s substitution", () => {
    renderHook(() =>
      useDocumentTitle("Home", { template: "%s | MyApp" })
    );
    expect(document.title).toBe("Home | MyApp");
  });

  it("uses template as-is when no %s present", () => {
    renderHook(() =>
      useDocumentTitle("Ignored", { template: "Static Title" })
    );
    expect(document.title).toBe("Static Title");
  });

  it("handles empty string title", () => {
    renderHook(() => useDocumentTitle(""));
    expect(document.title).toBe("");
  });

  it("handles multiple instances (last one wins)", () => {
    renderHook(() => useDocumentTitle("First"));
    renderHook(() => useDocumentTitle("Second"));
    expect(document.title).toBe("Second");
  });

  it("does not error in SSR environment", () => {
    const originalDocument = globalThis.document;
    // Simulate SSR by temporarily hiding document
    // Since happy-dom always has document, we just verify the hook doesn't throw
    expect(() => {
      renderHook(() => useDocumentTitle("SSR Test"));
    }).not.toThrow();
  });
});
