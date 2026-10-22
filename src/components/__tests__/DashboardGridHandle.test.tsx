// DashboardGrid: drag handle, keyboard move/resize, auto cell size, item ids.
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { DashboardGrid, WidgetShell } from "../Widget";

const items = [
  { id: "a", x: 0, y: 0, w: 4, h: 2 },
  { id: "b", x: 4, y: 0, w: 4, h: 2 },
];

describe("DashboardGrid dragHandle", () => {
  it("ignores a pointerdown on the body when a handle is required", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={() => {}}
        dragHandle
        renderItem={(id) => (
          <WidgetShell title={id} draggable>
            <button>inner</button>
          </WidgetShell>
        )}
      />
    );
    const cell = container.querySelector('[data-item-id="a"]')!;
    fireEvent.pointerDown(cell.querySelector("button")!, { pointerId: 1, clientX: 5, clientY: 5 });
    expect(cell.className).not.toContain("vf-dashboard-grid__cell--moving");
    fireEvent.pointerDown(cell.querySelector("[data-drag-handle]")!, { pointerId: 1, clientX: 5, clientY: 5 });
    expect(cell.className).toContain("vf-dashboard-grid__cell--moving");
  });

  it("starts a move from anywhere by default", () => {
    const { container } = renderWithTheme(
      <DashboardGrid items={items} onLayoutChange={() => {}} renderItem={(id) => <span>{id}</span>} />
    );
    const cell = container.querySelector('[data-item-id="a"]')!;
    fireEvent.pointerDown(cell.querySelector("span")!, { pointerId: 1, clientX: 5, clientY: 5 });
    expect(cell.className).toContain("vf-dashboard-grid__cell--moving");
  });
});

describe("DashboardGrid keyboard", () => {
  it("moves the focused card with arrow keys and clamps at the edges", () => {
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid items={items} cols={8} onLayoutChange={onLayoutChange} renderItem={(id) => <span>{id}</span>} />
    );
    const cell = container.querySelector('[data-item-id="a"]') as HTMLElement;
    expect(cell).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(cell, { key: "ArrowDown" });
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: "a", x: 0, y: 1, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 2 },
    ]);
    fireEvent.keyDown(cell, { key: "ArrowLeft" });
    expect(onLayoutChange).toHaveBeenCalledTimes(1); // already at column 0
  });

  it("swaps with the card it would land on", () => {
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid items={items} cols={8} onLayoutChange={onLayoutChange} renderItem={(id) => <span>{id}</span>} />
    );
    fireEvent.keyDown(container.querySelector('[data-item-id="a"]')!, { key: "ArrowRight" });
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: "a", x: 4, y: 0, w: 4, h: 2 },
      { id: "b", x: 0, y: 0, w: 4, h: 2 },
    ]);
  });

  it("resizes with Shift+Arrow when resizable", () => {
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid items={items} cols={8} resizable onLayoutChange={onLayoutChange} renderItem={(id) => <span>{id}</span>} />
    );
    fireEvent.keyDown(container.querySelector('[data-item-id="b"]')!, { key: "ArrowDown", shiftKey: true });
    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: "a", x: 0, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 3 },
    ]);
  });

  it("leaves arrow keys alone when they come from a control inside the card", () => {
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid items={items} onLayoutChange={onLayoutChange} renderItem={() => <input />} />
    );
    fireEvent.keyDown(container.querySelector("input")!, { key: "ArrowDown" });
    expect(onLayoutChange).not.toHaveBeenCalled();
  });
});

describe("DashboardGrid cellSize auto", () => {
  it("renders a full-width canvas", () => {
    const { container } = renderWithTheme(
      <DashboardGrid items={items} cellSize="auto" renderItem={(id) => <span>{id}</span>} />
    );
    const canvas = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    expect(canvas.style.width).toBe("100%");
    expect(canvas.querySelector('[data-item-id="b"]')).not.toBeNull();
  });
});
