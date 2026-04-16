// Coverage-gap tests for dev:
//   - useRenderProfiler.ts: record/clear/subscribe, deferNotify error isolation
//   - DevPanel.tsx: theme tab tokens display, about tab mode display

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DevPanel, getProfilerStore, recordRender } from "../index";
import { _resetWarnings } from "../../utils/warn";

// ── ProfilerStore: record/clear/subscribe ────────────────

describe("ProfilerStore — direct API", () => {
  beforeEach(() => {
    getProfilerStore().clear();
  });

  it("record creates and updates stats", async () => {
    const store = getProfilerStore();
    store.record("test-id", "mount", 5.0);
    const stats = store.get("test-id");
    expect(stats).toBeDefined();
    expect(stats!.renderCount).toBe(1);
    expect(stats!.lastDuration).toBe(5.0);
    expect(stats!.avgDuration).toBe(5.0);
    expect(stats!.totalDuration).toBe(5.0);
    expect(stats!.lastPhase).toBe("mount");

    store.record("test-id", "update", 3.0);
    const updated = store.get("test-id");
    expect(updated!.renderCount).toBe(2);
    expect(updated!.totalDuration).toBe(8.0);
    expect(updated!.avgDuration).toBe(4.0);
    expect(updated!.lastDuration).toBe(3.0);
    expect(updated!.lastPhase).toBe("update");
  });

  it("all() returns snapshot of all entries", () => {
    const store = getProfilerStore();
    expect(store.all()).toEqual([]);

    store.record("a", "mount", 1);
    store.record("b", "mount", 2);
    expect(store.all()).toHaveLength(2);
  });

  it("clear(id) removes only that entry", () => {
    const store = getProfilerStore();
    store.record("x", "mount", 1);
    store.record("y", "mount", 2);
    expect(store.all()).toHaveLength(2);

    store.clear("x");
    expect(store.get("x")).toBeUndefined();
    expect(store.get("y")).toBeDefined();
    expect(store.all()).toHaveLength(1);
  });

  it("clear() removes all entries", () => {
    const store = getProfilerStore();
    store.record("a", "mount", 1);
    store.record("b", "mount", 2);
    store.clear();
    expect(store.all()).toEqual([]);
  });

  it("subscribe fires on record for matching id", async () => {
    const store = getProfilerStore();
    const listener = vi.fn();
    const unsub = store.subscribe("sub-test", listener);

    store.record("sub-test", "mount", 1);
    // Listener fires via queueMicrotask
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalled();
    });

    unsub();
    listener.mockClear();
    store.record("sub-test", "update", 2);
    // Should not fire after unsub
    await new Promise((r) => setTimeout(r, 10));
    expect(listener).not.toHaveBeenCalled();
  });

  it("subscribe fires on clear for matching id", async () => {
    const store = getProfilerStore();
    const listener = vi.fn();
    store.record("clear-test", "mount", 1);
    store.subscribe("clear-test", listener);

    store.clear("clear-test");
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalled();
    });
  });

  it("subscribeAll fires on any record or clear", async () => {
    const store = getProfilerStore();
    const listener = vi.fn();
    const unsub = store.subscribeAll(listener);

    store.record("any-id", "mount", 1);
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    listener.mockClear();
    store.clear();
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    unsub();
  });

  it("deferNotify isolates listener errors", async () => {
    const store = getProfilerStore();
    const errorSpy = vi.fn();
    const goodListener = vi.fn();

    // Subscribe a listener that throws
    store.subscribeAll(() => {
      throw new Error("boom");
    });
    store.subscribeAll(goodListener);

    store.record("error-test", "mount", 1);
    await vi.waitFor(() => {
      expect(goodListener).toHaveBeenCalled();
    });
  });

  it("recordRender delegates to store.record", () => {
    const store = getProfilerStore();
    recordRender("callback-test", "mount", 2.5);
    const stats = store.get("callback-test");
    expect(stats).toBeDefined();
    expect(stats!.lastDuration).toBe(2.5);
  });
});

// ── DevPanel: theme tab token display ────────────────────

describe("DevPanel — theme tab tokens", () => {
  beforeEach(() => {
    _resetWarnings();
    getProfilerStore().clear();
  });

  it("displays token count on theme tab", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="theme" />);
    const toolbar = container.querySelector(".vf-dev-panel__toolbar");
    expect(toolbar?.textContent).toContain("tokens");
  });
});

// ── DevPanel: about tab mode display ─────────────────────

describe("DevPanel — about tab", () => {
  it("shows framework name and mode", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="about" />);
    expect(container.textContent).toContain("voidframe");
    expect(container.textContent).toContain("development");
  });

  it("shows version when provided", () => {
    const { container } = renderWithTheme(
      <DevPanel defaultTab="about" version="3.0.0" />
    );
    expect(container.textContent).toContain("3.0.0");
    expect(container.textContent).toContain("version");
  });

  it("does not show version section when not provided", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="about" />);
    // "version" key should not appear in the dl
    const dds = container.querySelectorAll("dd");
    const ddTexts = Array.from(dds).map((d) => d.textContent);
    expect(ddTexts).not.toContain("version");
  });
});

// ── DevPanel: renders tab clear button ───────────────────

describe("DevPanel — renders tab clear", () => {
  beforeEach(() => {
    _resetWarnings();
    getProfilerStore().clear();
  });

  it("clear button on renders tab is disabled when no scopes", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="renders" />);
    const clearBtn = container.querySelector(".vf-dev-panel__action") as HTMLButtonElement;
    expect(clearBtn.disabled).toBe(true);
  });

  it("shows empty state when no profiler scopes", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="renders" />);
    expect(container.textContent).toContain("No profiler scopes");
  });
});
