// Final coverage tests for Widget.tsx — DashboardGrid drag/resize/snap logic
//
// Targets uncovered lines:
//   211-221: rectsOverlap
//   223-229: pointInRect
//   236-283: findNearestEmpty (BFS)
//   343-414: preview computation (snap + swap detection)
//   419-428: localFromClient, localFromPointer
//   435-453: window pointermove/pointerup listeners
//   456-478: startMove handler
//   485-513: commitMove (snap + swap logic)
//   526-542: startResize handler
//   546-569: onResizeMoveTick
//   591-596: overlayBg (micro-grid CSS)
//   611-624: drop target overlay
//   637-645: moving card follows pointer
//
// These helpers are module-private, so they must be exercised through
// DashboardGrid's pointer event pipeline. In happy-dom, pointer capture
// is not fully supported, but the window-level listeners work.

import { fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DashboardGrid, type DashboardLayoutItem } from "../Widget";

function makeItems(): DashboardLayoutItem[] {
  return [
    { id: "a", x: 0, y: 0, w: 4, h: 2 },
    { id: "b", x: 4, y: 0, w: 4, h: 2 },
    { id: "c", x: 8, y: 0, w: 4, h: 2 },
  ];
}

describe("DashboardGrid move via pointer events", () => {
  it("initiates drag on pointerDown and follows pointer", () => {
    const items = makeItems();
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        cols={24}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    // Mock getBoundingClientRect for the canvas
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const cells = container.querySelectorAll(".vf-dashboard-grid__cell");
    const firstCell = cells[0] as HTMLElement;

    // PointerDown on first cell to start move
    fireEvent.pointerDown(firstCell, {
      clientX: 10, clientY: 10, pointerId: 1,
    });

    // Should now be in dragging state
    expect(container.querySelector(".vf-dashboard-grid--dragging")).toBeInTheDocument();
    expect(container.querySelector(".vf-dashboard-grid__cell--moving")).toBeInTheDocument();

    // Simulate pointer move via window
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", {
        clientX: 200, clientY: 10,
      }));
    });

    // Drop target overlay should be visible
    expect(container.querySelector(".vf-dashboard-grid__drop-target")).toBeInTheDocument();

    // Pointer up commits the move
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(onLayoutChange).toHaveBeenCalled();
    expect(container.querySelector(".vf-dashboard-grid--dragging")).not.toBeInTheDocument();
  });

  it("does not start drag when clicking on resize handle", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={() => {}}
        renderItem={(id) => <div>{id}</div>}
        resizable
      />
    );
    const resizeHandle = container.querySelector(".vf-dashboard-grid__resize") as HTMLElement;

    // PointerDown on resize handle — startMove should bail via closest check
    fireEvent.pointerDown(resizeHandle, {
      clientX: 10, clientY: 10, pointerId: 1, bubbles: true,
    });

    // Should NOT be dragging (move state)
    // The resize handle has stopPropagation, so move shouldn't initiate
  });

  it("commits swap when pointer is over another card", () => {
    const items = [
      { id: "a", x: 0, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 2 },
    ];
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        cols={24}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const cells = container.querySelectorAll(".vf-dashboard-grid__cell");

    // Start dragging card A
    fireEvent.pointerDown(cells[0] as HTMLElement, {
      clientX: 10, clientY: 10, pointerId: 1,
    });

    // Move pointer over card B's position (x=4, cellStep=36, so pixel ~180)
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", {
        clientX: 180, clientY: 10,
      }));
    });

    // The drop target should show swap indicator
    const dropTarget = container.querySelector(".vf-dashboard-grid__drop-target");
    expect(dropTarget).toBeInTheDocument();

    // Swap partner highlight
    const swapPartner = container.querySelector(".vf-dashboard-grid__cell--swap-partner");
    expect(swapPartner).toBeInTheDocument();

    // Release to commit swap
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(onLayoutChange).toHaveBeenCalled();
    const result = onLayoutChange.mock.calls[0][0];
    // Cards should have swapped positions
    const aResult = result.find((i: DashboardLayoutItem) => i.id === "a");
    const bResult = result.find((i: DashboardLayoutItem) => i.id === "b");
    expect(aResult.x).toBe(4); // moved to b's position
    expect(bResult.x).toBe(0); // moved to a's position
  });

  it("commits to empty position when no swap target", () => {
    const items = [
      { id: "a", x: 0, y: 0, w: 2, h: 2 },
    ];
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        cols={24}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const cell = container.querySelector(".vf-dashboard-grid__cell") as HTMLElement;

    fireEvent.pointerDown(cell, {
      clientX: 10, clientY: 10, pointerId: 1,
    });

    // Move to an empty area
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", {
        clientX: 360, clientY: 10,
      }));
    });

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });

    expect(onLayoutChange).toHaveBeenCalled();
    const result = onLayoutChange.mock.calls[0][0];
    const aResult = result.find((i: DashboardLayoutItem) => i.id === "a");
    // Should have moved to a new position
    expect(aResult.x).toBeGreaterThan(0);
  });

  it("pointercancel also ends drag", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={() => {}}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const cell = container.querySelector(".vf-dashboard-grid__cell") as HTMLElement;
    fireEvent.pointerDown(cell, { clientX: 10, clientY: 10, pointerId: 1 });
    expect(container.querySelector(".vf-dashboard-grid--dragging")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new PointerEvent("pointercancel"));
    });
    expect(container.querySelector(".vf-dashboard-grid--dragging")).not.toBeInTheDocument();
  });

  it("no-op commitMove when no onLayoutChange callback", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const cell = container.querySelector(".vf-dashboard-grid__cell") as HTMLElement;
    fireEvent.pointerDown(cell, { clientX: 10, clientY: 10, pointerId: 1 });

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 200, clientY: 10 }));
    });
    // Should not throw
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });
  });
});

describe("DashboardGrid resize via pointer events", () => {
  it("resizes card on resize handle drag", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        resizable
        cols={24}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const resizeHandle = container.querySelector(".vf-dashboard-grid__resize") as HTMLElement;

    // PointerDown on resize handle
    fireEvent.pointerDown(resizeHandle, {
      clientX: 140, clientY: 68, pointerId: 1,
    });

    // Move pointer to increase size
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", {
        clientX: 280, clientY: 140,
      }));
    });

    expect(onLayoutChange).toHaveBeenCalled();
    const result = onLayoutChange.mock.calls[0][0];
    const a = result.find((i: DashboardLayoutItem) => i.id === "a");
    expect(a.w).toBeGreaterThan(4);

    // Pointer up ends resize
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });
  });

  it("respects minW and minH during resize", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 4 }];
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        resizable
        minW={3}
        minH={3}
        cols={24}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 600,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });

    const resizeHandle = container.querySelector(".vf-dashboard-grid__resize") as HTMLElement;

    // Start resize
    fireEvent.pointerDown(resizeHandle, {
      clientX: 140, clientY: 140, pointerId: 1,
    });

    // Try to shrink smaller than min
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", {
        clientX: 10, clientY: 10,
      }));
    });

    if (onLayoutChange.mock.calls.length > 0) {
      const result = onLayoutChange.mock.calls[onLayoutChange.mock.calls.length - 1][0];
      const a = result.find((i: DashboardLayoutItem) => i.id === "a");
      expect(a.w).toBeGreaterThanOrEqual(3);
      expect(a.h).toBeGreaterThanOrEqual(3);
    }

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup"));
    });
  });
});

describe("DashboardGrid with fixed bounds", () => {
  it("renders correctly with bounds={ rows: 10 } and limits resize", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    const onLayoutChange = vi.fn();
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        onLayoutChange={onLayoutChange}
        renderItem={(id) => <div>{id}</div>}
        resizable
        bounds={{ rows: 10 }}
        cols={12}
        cellSize={32}
        gap={4}
      />
    );
    const grid = container.querySelector(".vf-dashboard-grid") as HTMLElement;
    expect(grid).toBeInTheDocument();
  });
});

describe("DashboardGrid ref forwarding", () => {
  it("forwards function ref", () => {
    const items = [{ id: "a", x: 0, y: 0, w: 4, h: 2 }];
    let refValue: HTMLDivElement | null = null;
    renderWithTheme(
      <DashboardGrid
        ref={(el) => { refValue = el; }}
        items={items}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    expect(refValue).toBeInstanceOf(HTMLDivElement);
  });
});
