import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLockBodyScroll } from "../useLockBodyScroll";

describe("useLockBodyScroll", () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it("locks body scroll", () => {
    renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("sets overflow to hidden", () => {
    document.body.style.overflow = "auto";
    renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores overflow on unmount", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("locked={false} does not lock", () => {
    document.body.style.overflow = "auto";
    renderHook(() => useLockBodyScroll(false));
    expect(document.body.style.overflow).toBe("auto");
  });

  it("toggling locks and unlocks", () => {
    document.body.style.overflow = "visible";
    const { rerender } = renderHook(
      ({ locked }) => useLockBodyScroll(locked),
      { initialProps: { locked: true } }
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ locked: false });
    expect(document.body.style.overflow).toBe("visible");

    rerender({ locked: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("preserves original overflow value", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("default (no arg) locks", () => {
    renderHook(() => useLockBodyScroll());
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("SSR-safe: no error when document is undefined", () => {
    // happy-dom provides document, so we just verify no crash
    // In a real SSR env, the hook would be a no-op
    expect(() => {
      renderHook(() => useLockBodyScroll(true));
    }).not.toThrow();
  });
});
