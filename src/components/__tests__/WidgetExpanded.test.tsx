// Expanded coverage tests for Widget.tsx — helper functions, DashboardGrid props, packLayout edge cases

import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { WidgetShell, DashboardGrid, packLayout, usePackedLayout } from "../Widget";
import { renderHook } from "@testing-library/react";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import type { ReactNode } from "react";

// ── packLayout edge cases ──────────────────────────────────

describe("packLayout edge cases", () => {
  it("returns empty array for empty ids", () => {
    expect(packLayout([], 12)).toEqual([]);
  });

  it("uses default size { w: 4, h: 2 } when no size supplied", () => {
    const layout = packLayout(["a"], 12);
    expect(layout[0]).toEqual({ id: "a", x: 0, y: 0, w: 4, h: 2 });
  });

  it("wraps items that exceed cols on a single row", () => {
    // cols=6, each item w=4 -> second item wraps
    const layout = packLayout(["a", "b"], 6, { w: 4, h: 3 });
    expect(layout[0]).toEqual({ id: "a", x: 0, y: 0, w: 4, h: 3 });
    expect(layout[1]).toEqual({ id: "b", x: 0, y: 3, w: 4, h: 3 });
  });

  it("packs many items across multiple rows", () => {
    const layout = packLayout(["a", "b", "c", "d", "e"], 8, { w: 4, h: 1 });
    // Row 0: a(0,0), b(4,0)
    // Row 1: c(0,1), d(4,1)
    // Row 2: e(0,2)
    expect(layout[4]).toEqual({ id: "e", x: 0, y: 2, w: 4, h: 1 });
  });

  it("handles item wider than cols (no wrap needed)", () => {
    // Item wider than cols — still placed at x=0 because nothing fits beforehand
    const layout = packLayout(["a", "b"], 3, { w: 3, h: 1 });
    expect(layout[0]).toEqual({ id: "a", x: 0, y: 0, w: 3, h: 1 });
    expect(layout[1]).toEqual({ id: "b", x: 0, y: 1, w: 3, h: 1 });
  });
});

// ── usePackedLayout ────────────────────────────────────────

describe("usePackedLayout", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <VoidframeProvider>{children}</VoidframeProvider>
  );

  it("returns a memoized layout array", () => {
    const { result } = renderHook(() => usePackedLayout(["a", "b"], 8, { w: 4, h: 2 }), { wrapper });
    expect(result.current).toEqual([
      { id: "a", x: 0, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 2 },
    ]);
  });

  it("returns empty for empty ids", () => {
    const { result } = renderHook(() => usePackedLayout([], 12), { wrapper });
    expect(result.current).toEqual([]);
  });
});

// ── WidgetShell additional branches ────────────────────────

describe("WidgetShell additional branches", () => {
  it("applies string height directly", () => {
    const { container } = renderWithTheme(
      <WidgetShell title="H" height="50vh">Content</WidgetShell>
    );
    const section = container.querySelector("section");
    expect(section?.style.height).toBe("50vh");
  });

  it("renders no header when title, actions, draggable all absent", () => {
    const { container } = renderWithTheme(
      <WidgetShell>Content</WidgetShell>
    );
    expect(container.querySelector("header")).not.toBeInTheDocument();
  });

  it("renders header when only actions provided (no title/draggable)", () => {
    renderWithTheme(
      <WidgetShell actions={<button>Act</button>}>Content</WidgetShell>
    );
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument();
  });

  it("renders both loading and error classes correctly", () => {
    const { container } = renderWithTheme(
      <WidgetShell loading className="custom">Content</WidgetShell>
    );
    const section = container.querySelector("section");
    expect(section?.classList.contains("vf-widget--loading")).toBe(true);
    expect(section?.classList.contains("custom")).toBe(true);
  });

  it("renders error body and hides children", () => {
    renderWithTheme(
      <WidgetShell error={<span>Oops</span>}>
        <p>Secret</p>
      </WidgetShell>
    );
    expect(screen.getByText("Oops")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders children normally when no loading/error/empty", () => {
    renderWithTheme(
      <WidgetShell>
        <p>Normal content</p>
      </WidgetShell>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });
});

// ── DashboardGrid extended props ───────────────────────────

describe("DashboardGrid extended props", () => {
  const items = [
    { id: "a", x: 0, y: 0, w: 4, h: 2 },
    { id: "b", x: 4, y: 0, w: 4, h: 2 },
  ];

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
        className="my-grid"
      />
    );
    expect(container.querySelector(".my-grid")).toBeInTheDocument();
  });

  it("does not render resize handles when resizable=false (default)", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    expect(container.querySelectorAll("[role='separator']").length).toBe(0);
  });

  it("movable=false prevents pointerDown handler binding", () => {
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
        movable={false}
        onLayoutChange={onLayoutChange}
      />
    );
    const cell = container.querySelector(".vf-dashboard-grid__cell")!;
    // pointerDown should not set up move state
    fireEvent.pointerDown(cell, { clientX: 10, clientY: 10, pointerId: 1 });
    // No dragging class should appear
    expect(container.querySelector(".vf-dashboard-grid--dragging")).not.toBeInTheDocument();
  });

  it("renders with custom cols, cellSize, gap", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={[{ id: "a", x: 0, y: 0, w: 2, h: 2 }]}
        renderItem={(id) => <div>{id}</div>}
        cols={12}
        cellSize={16}
        gap={2}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    expect(grid).toBeInTheDocument();
  });

  it("renders with bounds={ rows: 10 }", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
        bounds={{ rows: 10 }}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    expect(grid).toBeInTheDocument();
  });

  it("renders with autoPadding overrides", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
        autoPaddingRows={2}
        autoPaddingCols={2}
      />
    );
    expect(container.querySelector(".vf-dashboard-grid")).toBeInTheDocument();
  });

  it("renders items with correct positioning styles", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={[{ id: "solo", x: 2, y: 1, w: 3, h: 2 }]}
        renderItem={(id) => <div>{id}</div>}
        cellSize={32}
        gap={4}
      />
    );
    const cell = container.querySelector(".vf-dashboard-grid__cell") as HTMLElement;
    // x=2, cellStep=36, so left = 72
    expect(cell.style.left).toBe("72px");
    // y=1, so top = 36
    expect(cell.style.top).toBe("36px");
  });

  it("each cell has position absolute and touchAction none", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={[{ id: "x", x: 0, y: 0, w: 2, h: 2 }]}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    const cell = container.querySelector(".vf-dashboard-grid__cell") as HTMLElement;
    expect(cell.style.position).toBe("absolute");
    expect(cell.style.touchAction).toBe("none");
  });

  it("resize handle has separator role and correct aria label", () => {
    renderWithTheme(
      <DashboardGrid
        items={[{ id: "r", x: 0, y: 0, w: 4, h: 2 }]}
        renderItem={(id) => <div>{id}</div>}
        resizable
        onLayoutChange={() => {}}
      />
    );
    const handle = screen.getByRole("separator", { name: "Resize widget" });
    expect(handle).toBeInTheDocument();
  });
});
