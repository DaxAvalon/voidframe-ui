// Tests for WidgetShell and DashboardGrid (packLayout helper)

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { WidgetShell, DashboardGrid, packLayout } from "../Widget";

describe("WidgetShell", () => {
  it("renders title and children", () => {
    renderWithTheme(
      <WidgetShell title="CPU Usage">
        <p>Content</p>
      </WidgetShell>
    );
    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders loading state with aria-busy", () => {
    const { container } = renderWithTheme(<WidgetShell title="Load" loading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("renders error state instead of children", () => {
    renderWithTheme(
      <WidgetShell title="Err" error="Something broke">
        <p>Hidden content</p>
      </WidgetShell>
    );
    expect(screen.getByText("Something broke")).toBeInTheDocument();
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders empty state when children are absent and empty is provided", () => {
    renderWithTheme(
      <WidgetShell title="Empty" empty="No data available" />
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders actions in header", () => {
    renderWithTheme(
      <WidgetShell title="Actions" actions={<button>Refresh</button>} />
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    renderWithTheme(
      <WidgetShell title="Footer" footer="Updated 5m ago">
        Content
      </WidgetShell>
    );
    expect(screen.getByText("Updated 5m ago")).toBeInTheDocument();
  });

  it("renders drag handle when draggable", () => {
    const { container } = renderWithTheme(
      <WidgetShell title="Drag" draggable>Content</WidgetShell>
    );
    expect(container.querySelector("[data-drag-handle]")).toBeInTheDocument();
  });

  it("renders resize handle when resizable", () => {
    const { container } = renderWithTheme(
      <WidgetShell title="Resize" resizable>Content</WidgetShell>
    );
    expect(container.querySelector("[data-resize-handle]")).toBeInTheDocument();
  });

  it("applies height as px when number", () => {
    const { container } = renderWithTheme(
      <WidgetShell title="H" height={200}>Content</WidgetShell>
    );
    const section = container.querySelector("section");
    expect(section?.style.height).toBe("200px");
  });
});

describe("packLayout", () => {
  it("lays out items in rows", () => {
    const layout = packLayout(["a", "b", "c"], 12, { w: 4, h: 2 });
    expect(layout).toEqual([
      { id: "a", x: 0, y: 0, w: 4, h: 2 },
      { id: "b", x: 4, y: 0, w: 4, h: 2 },
      { id: "c", x: 8, y: 0, w: 4, h: 2 },
    ]);
  });

  it("wraps to next row when exceeding cols", () => {
    const layout = packLayout(["a", "b", "c", "d"], 8, { w: 4, h: 2 });
    expect(layout[2]).toEqual({ id: "c", x: 0, y: 2, w: 4, h: 2 });
    expect(layout[3]).toEqual({ id: "d", x: 4, y: 2, w: 4, h: 2 });
  });
});

describe("DashboardGrid", () => {
  const items = [
    { id: "a", x: 0, y: 0, w: 4, h: 2 },
    { id: "b", x: 4, y: 0, w: 4, h: 2 },
  ];

  it("renders grid with cards", () => {
    renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
      />
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("renders resize handles when resizable", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={items}
        renderItem={(id) => <div>{id}</div>}
        resizable
        onLayoutChange={() => {}}
      />
    );
    const handles = container.querySelectorAll("[role='separator']");
    expect(handles.length).toBe(2);
  });
});
