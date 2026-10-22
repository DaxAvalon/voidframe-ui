import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { createMockStorage } from "../../testing/mocks";
import {
  WidgetShell,
  packLayout,
  reconcileLayout,
  useDashboardLayout,
  useWidgetShell,
  useWidgetShellStatus,
} from "../Widget";
import { AsyncData, asyncDataStatus } from "../AsyncData";
import { useState } from "react";

describe("packLayout with sizes", () => {
  it("keeps the uniform string[] behaviour", () => {
    expect(packLayout(["a", "b", "c"], 8, { w: 4, h: 2 })).toEqual([
      { id: "a", x: 0, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 2 },
      { id: "c", x: 0, y: 2, w: 4, h: 2 },
    ]);
  });

  it("packs mixed sizes into the lowest free row and fills gaps", () => {
    const layout = packLayout(
      [{ id: "tall", w: 4, h: 4 }, { id: "a", w: 8, h: 2 }, { id: "b", w: 8, h: 2 }, { id: "c" }],
      12,
      { w: 4, h: 2 }
    );
    expect(layout).toEqual([
      { id: "tall", x: 0, y: 0, w: 4, h: 4 },
      { id: "a", x: 4, y: 0, w: 8, h: 2 },
      { id: "b", x: 4, y: 2, w: 8, h: 2 },
      { id: "c", x: 0, y: 4, w: 4, h: 2 },
    ]);
  });

  it("clamps items wider than the grid and honours startY", () => {
    expect(packLayout([{ id: "wide", w: 20, h: 1 }], 6, { w: 4, h: 2, startY: 5 })).toEqual([
      { id: "wide", x: 0, y: 5, w: 6, h: 1 },
    ]);
  });
});

describe("reconcileLayout", () => {
  const stored = [
    { id: "a", x: 8, y: 0, w: 4, h: 2 },
    { id: "gone", x: 0, y: 0, w: 4, h: 2 },
    { id: "b", x: 4, y: 2, w: 4, h: 3 },
  ];

  it("keeps known positions, drops stale ids and packs newcomers below", () => {
    const next = reconcileLayout(stored, ["a", "b", { id: "new", w: 6, h: 1 }], 12);
    expect(next).toEqual([
      { id: "a", x: 8, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 2, w: 4, h: 3 },
      { id: "new", x: 0, y: 5, w: 6, h: 1 },
    ]);
  });

  it("returns the stored array itself when nothing changed", () => {
    const same = [stored[0]!, stored[2]!];
    expect(reconcileLayout(same, ["a", "b"], 12)).toBe(same);
  });

  it("clamps stored items that no longer fit the column count", () => {
    const next = reconcileLayout([{ id: "a", x: 6, y: 0, w: 6, h: 2 }], ["a"], 8);
    expect(next[0]).toEqual({ id: "a", x: 2, y: 0, w: 6, h: 2 });
  });
});

describe("useDashboardLayout", () => {
  it("reads a valid stored layout, persists changes and reconciles new items", () => {
    const storage = createMockStorage({
      board: JSON.stringify({ version: 1, layout: [{ id: "a", x: 4, y: 0, w: 4, h: 2 }] }),
    });
    const { result, rerender } = renderHook(
      ({ items }: { items: string[] }) =>
        useDashboardLayout({ storageKey: "board", items, cols: 12, storage }),
      { initialProps: { items: ["a"] } }
    );
    expect(result.current.layout).toEqual([{ id: "a", x: 4, y: 0, w: 4, h: 2 }]);
    rerender({ items: ["a", "b"] });
    expect(result.current.layout).toEqual([
      { id: "a", x: 4, y: 0, w: 4, h: 2 },
      { id: "b", x: 0, y: 2, w: 4, h: 2 },
    ]);
    expect(JSON.parse(storage.store.get("board")!)).toEqual({
      version: 1,
      layout: result.current.layout,
    });
    act(() => result.current.onLayoutChange([{ id: "a", x: 0, y: 0, w: 4, h: 2 }, { id: "b", x: 4, y: 0, w: 4, h: 2 }]));
    expect(JSON.parse(storage.store.get("board")!).layout[1]).toEqual({ id: "b", x: 4, y: 0, w: 4, h: 2 });
    act(() => result.current.reset());
    expect(result.current.layout).toEqual(packLayout(["a", "b"], 12));
    expect(storage.store.has("board")).toBe(false);
  });

  it("ignores malformed or mismatched-version storage", () => {
    const storage = createMockStorage({
      bad: "not json",
      shape: JSON.stringify([{ id: "a", x: "0" }]),
      old: JSON.stringify({ version: 1, layout: [{ id: "a", x: 9, y: 9, w: 1, h: 1 }] }),
    });
    for (const key of ["bad", "shape"]) {
      const { result } = renderHook(() => useDashboardLayout({ storageKey: key, items: ["a"], cols: 12, storage }));
      expect(result.current.layout).toEqual(packLayout(["a"], 12));
    }
    const { result } = renderHook(() =>
      useDashboardLayout({ storageKey: "old", items: ["a"], cols: 12, storage, version: 2 })
    );
    expect(result.current.layout).toEqual(packLayout(["a"], 12));
  });
});

describe("useWidgetShell", () => {
  function Body() {
    const [phase, setPhase] = useState<"loading" | "empty" | "error" | "ready">("loading");
    useWidgetShellStatus({
      loading: phase === "loading",
      empty: phase === "empty",
      error: phase === "error" ? "Boom" : undefined,
    });
    return (
      <div>
        <span>body content</span>
        <button type="button" onClick={() => setPhase("empty")}>empty</button>
        <button type="button" onClick={() => setPhase("error")}>error</button>
        <button type="button" onClick={() => setPhase("ready")}>ready</button>
      </div>
    );
  }

  it("lets the body drive loading, empty and error while staying mounted", () => {
    const { container } = renderWithTheme(
      <WidgetShell title="CPU" empty="Nothing yet">
        <Body />
      </WidgetShell>
    );
    const shell = container.querySelector(".vf-widget") as HTMLElement;
    expect(shell).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    const content = container.querySelector(".vf-widget__content") as HTMLElement;
    expect(content).toHaveAttribute("hidden");
    expect(content.textContent).toContain("body content");
    fireEvent.click(screen.getByText("empty"));
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(shell).not.toHaveAttribute("aria-busy");
    fireEvent.click(screen.getByText("error"));
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(shell).toHaveClass("vf-widget--error");
    fireEvent.click(screen.getByText("ready"));
    expect(content).not.toHaveAttribute("hidden");
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("props win over body status, and the hook is a no-op outside a shell", () => {
    renderWithTheme(
      <WidgetShell title="Fixed" loading={false}>
        <Body />
      </WidgetShell>
    );
    expect(screen.queryByText("Loading…")).toBeNull();
    const { result } = renderHook(() => useWidgetShell());
    expect(result.current.inShell).toBe(false);
    expect(() => result.current.setStatus({ loading: true })).not.toThrow();
  });
});

describe("AsyncData derived status", () => {
  it("derives status from isLoading / error / data", () => {
    expect(asyncDataStatus({ isLoading: true })).toBe("loading");
    expect(asyncDataStatus({ isLoading: true, error: new Error("x") })).toBe("error");
    expect(asyncDataStatus({ data: [] })).toBe("empty");
    expect(asyncDataStatus({ data: {} })).toBe("empty");
    expect(asyncDataStatus({ data: [1] })).toBe("success");
    expect(asyncDataStatus({ data: 0 })).toBe("success");
    expect(asyncDataStatus({ data: { rows: [] }, isEmpty: (d) => d.rows.length === 0 })).toBe("empty");
    expect(asyncDataStatus({})).toBe("empty");
  });

  it("renders without a status prop", () => {
    const { container, rerender } = renderWithTheme(
      <AsyncData<string[]> isLoading data={undefined} loading={<i>wait</i>}>
        {(rows) => <ul>{rows.map((r) => <li key={r}>{r}</li>)}</ul>}
      </AsyncData>
    );
    expect(screen.getByText("wait")).toBeInTheDocument();
    rerender(
      <AsyncData<string[]> data={["x"]}>
        {(rows) => <ul>{rows.map((r) => <li key={r}>{r}</li>)}</ul>}
      </AsyncData>
    );
    expect(screen.getByText("x")).toBeInTheDocument();
    expect(container.querySelector(".vf-async-data--success")).not.toBeNull();
  });
});
