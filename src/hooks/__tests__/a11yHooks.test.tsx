import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAnnouncer } from "../useAnnouncer";
import { useFocusReturn } from "../useFocusReturn";

describe("useAnnouncer", () => {
  beforeEach(() => {
    // Clear any previous-test announcer regions.
    document.body.replaceChildren();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates polite + assertive regions on first use", () => {
    renderHook(() => useAnnouncer());
    expect(
      document.querySelector('[data-vf-announcer="polite"]')
    ).not.toBeNull();
    expect(
      document.querySelector('[data-vf-announcer="assertive"]')
    ).not.toBeNull();
  });

  it("writes message into the polite region (default)", () => {
    const { result } = renderHook(() => useAnnouncer());
    act(() => result.current.announce("hello"));
    act(() => vi.advanceTimersByTime(100));
    const polite = document.querySelector('[data-vf-announcer="polite"]');
    expect(polite?.textContent).toBe("hello");
  });

  it("writes urgent messages into the assertive region", () => {
    const { result } = renderHook(() => useAnnouncer());
    act(() => result.current.announce("urgent", "assertive"));
    act(() => vi.advanceTimersByTime(100));
    const assertive = document.querySelector(
      '[data-vf-announcer="assertive"]'
    );
    expect(assertive?.textContent).toBe("urgent");
  });

  it("reuses existing regions across hook instances", () => {
    renderHook(() => useAnnouncer());
    const before = document.querySelectorAll(
      '[data-vf-announcer]'
    ).length;
    renderHook(() => useAnnouncer());
    const after = document.querySelectorAll('[data-vf-announcer]').length;
    expect(after).toBe(before);
  });
});

describe("useFocusReturn", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const other = document.createElement("input");
    document.body.appendChild(other);

    const { unmount } = renderHook(() => useFocusReturn());
    other.focus();
    expect(document.activeElement).toBe(other);

    unmount();
    act(() => vi.advanceTimersByTime(10));
    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
    document.body.removeChild(other);
  });

  it("does nothing when enabled=false", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const other = document.createElement("input");
    document.body.appendChild(other);

    const { unmount } = renderHook(() => useFocusReturn(false));
    other.focus();
    unmount();
    act(() => vi.advanceTimersByTime(10));
    expect(document.activeElement).toBe(other);

    document.body.removeChild(trigger);
    document.body.removeChild(other);
  });
});
