import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createMockStorage } from "../../testing/mocks";
import { usePersistedChoice } from "../usePersistedChoice";
import { useThemePersistence } from "../useThemePersistence";
import { useLongPress } from "../useLongPress";
import { usePolling } from "../usePolling";
import { useScrollHighlight } from "../useScrollHighlight";
import { formatBytes } from "../../utils/formatters";
import { groupByDay } from "../../components/Chat/helpers";
import { contrastRatio, luminance } from "../../tokens";
import * as root from "../../index";

type Pointer = { clientX: number; clientY: number };
const pe = (x: number, y: number) => ({ clientX: x, clientY: y }) as unknown as import("react").PointerEvent;

describe("usePersistedChoice", () => {
  it("hydrates, validates against allowed, persists, syncs instances and clears", () => {
    const storage = createMockStorage({ density: "compact", bad: "nope" });
    const { result } = renderHook(() =>
      usePersistedChoice("density", { default: "comfortable", allowed: ["comfortable", "compact"], storage, hydrate: "sync" })
    );
    expect(result.current.value).toBe("compact");
    const other = renderHook(() =>
      usePersistedChoice("density", { default: "comfortable", allowed: ["comfortable", "compact"], storage, hydrate: "sync" })
    );
    act(() => result.current.setValue("comfortable"));
    expect(storage.store.get("density")).toBe("comfortable");
    expect(other.result.current.value).toBe("comfortable");
    act(() => result.current.clear());
    expect(storage.store.has("density")).toBe(false);
    const invalid = renderHook(() => usePersistedChoice("bad", { default: "a", allowed: ["a", "b"], storage, hydrate: "sync" }));
    expect(invalid.result.current.value).toBe("a");
    // useThemePersistence is the same hook with theme names.
    const theme = renderHook(() => useThemePersistence({ key: "t", defaultTheme: "dark", storage, hydrate: "sync" }));
    act(() => theme.result.current.setTheme("light"));
    expect(storage.store.get("t")).toBe("light");
    expect(theme.result.current.theme).toBe("light");
  });
});

describe("useLongPress slop tolerance", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires after the threshold, cancels on movement beyond tolerance, ignores leave by default", () => {
    const handler = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() => useLongPress(handler, { threshold: 300, moveTolerance: 8, onCancel }));
    act(() => result.current.onPointerDown(pe(0, 0)));
    act(() => result.current.onPointerMove(pe(3, 3)));
    act(() => result.current.onPointerLeave(pe(3, 3)));
    act(() => vi.advanceTimersByTime(300));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    act(() => result.current.onPointerDown(pe(0, 0)));
    act(() => result.current.onPointerMove(pe(0, 20)));
    act(() => vi.advanceTimersByTime(300));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("cancelOnLeave restores the old behaviour", () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useLongPress(handler, { threshold: 100, cancelOnLeave: true }));
    act(() => result.current.onPointerDown(pe(0, 0)));
    act(() => result.current.onPointerLeave(pe(0, 0)));
    act(() => vi.advanceTimersByTime(100));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("usePolling", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs immediately and on the interval, skips overlapping runs, pauses when disabled", async () => {
    let resolve: (() => void) | null = null;
    const fn = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const { result, rerender } = renderHook(({ enabled }: { enabled: boolean }) => usePolling(fn, 1000, { enabled }), {
      initialProps: { enabled: true },
    });
    expect(fn).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(fn).toHaveBeenCalledTimes(1); // still in flight: skipped
    await act(async () => {
      resolve!();
      await Promise.resolve();
    });
    expect(result.current.count).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(fn).toHaveBeenCalledTimes(2);
    rerender({ enabled: false });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("useScrollHighlight", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("scrolls the target into view and flags it for a while", () => {
    const el = document.createElement("section");
    el.id = "row-42";
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    const { result } = renderHook(() => useScrollHighlight({ highlightMs: 500, fromHash: false }));
    let ok = false;
    act(() => {
      ok = result.current.highlight("row-42");
    });
    expect(ok).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(el).toHaveAttribute("data-highlight", "true");
    expect(result.current.activeId).toBe("row-42");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(el).not.toHaveAttribute("data-highlight");
    expect(result.current.activeId).toBeNull();
    expect(result.current.highlight("missing")).toBe(false);
    el.remove();
  });
});

describe("exported helpers", () => {
  it("formatBytes supports decimal base and digits", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1500, { base: 1000 })).toBe("1.5 kB");
    expect(formatBytes(1_000_000, { base: 1000, decimals: 0 })).toBe("1 MB");
    expect(formatBytes(0)).toBe("0 B");
  });

  it("groupByDay groups and labels by local day", () => {
    const now = new Date(2026, 2, 10, 12);
    const items = [
      { id: 1, at: new Date(2026, 2, 10, 9) },
      { id: 2, at: new Date(2026, 2, 9, 23, 59) },
      { id: 3, at: new Date(2026, 2, 10, 1) },
      { id: 4, at: null },
    ];
    const groups = groupByDay(items, (i) => i.at, { now });
    expect(groups.map((g) => [g.key, g.label, g.items.map((i) => i.id)])).toEqual([
      ["2026-03-10", "Today", [1, 3]],
      ["2026-03-09", "Yesterday", [2]],
    ]);
  });

  it("contrastRatio and luminance reach the root and the tokens entry", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
    expect(typeof root.contrastRatio).toBe("function");
    expect(typeof root.lineDiff).toBe("function");
    expect(typeof root.groupByDay).toBe("function");
    expect(typeof root.toISODate).toBe("function");
  });
});
