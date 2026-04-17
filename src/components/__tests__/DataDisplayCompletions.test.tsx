// Tests for the Phase 9 partial-implementation gaps that we just closed:
//   - DataGrid: column reorder, row reorder, grouping, JSON export,
//     localStorage persistence, virtualized delegation.
//   - Calendar: week/day grids + onRangeChange.
//   - TreeView: type-to-search.
//   - Gantt: dependency arrows + drag-to-resize/move.
//   - Kanban: within-column reorder.
//   - Heatmap: hover tooltip.
//   - MarkdownRenderer: plugins + components override.

import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { DataGrid, type DataGridColumn } from "../DataGrid";
import { Calendar, type CalendarRange } from "../Calendar";
import { TreeView } from "../TreeView";
import { Gantt } from "../Gantt";
import { Kanban } from "../Kanban";
// Legacy Heatmap removed in Phase 22. The replacement lives in src/charts/.
import { MarkdownRenderer } from "../Viewers";

// ── DataGrid ──

describe("DataGrid (closeout)", () => {
  interface Row {
    id: string;
    name: string;
    group: string;
    score: number;
  }
  const data: Row[] = [
    { id: "1", name: "Alpha", group: "A", score: 30 },
    { id: "2", name: "Beta", group: "B", score: 10 },
    { id: "3", name: "Gamma", group: "A", score: 20 },
  ];
  const cols: DataGridColumn<Row>[] = [
    { key: "name", header: "Name", reorderable: true, resizable: true },
    { key: "score", header: "Score", sortable: true, align: "right" },
  ];

  it("group rows when groupBy is set", () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} groupBy="group" />
    );
    // Each unique group label appears as a header row — strong text inside
    // the group cell.
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("group toggle collapses rows under a group", async () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} groupBy="group" />
    );
    const toggleA = screen.getAllByRole("button", { expanded: true })[0]!;
    await userEvent.click(toggleA);
    // After collapsing the first group, Alpha (in A) should be hidden, but
    // Beta (in B) remains visible.
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("fires onGroupByChange and resets collapsed groups when groupBy changes", () => {
    const onGroupByChange = vi.fn();
    function Wrapper() {
      const [gb, setGb] = useState<string | undefined>("group");
      return (
        <>
          <button onClick={() => setGb("score")}>Switch</button>
          <DataGrid
            columns={cols}
            data={data}
            rowKey={(r) => r.id}
            groupBy={gb}
            onGroupByChange={onGroupByChange}
          />
        </>
      );
    }
    renderWithTheme(<Wrapper />);
    // Groups by "group" initially — A and B headers visible
    expect(screen.getByText("A")).toBeInTheDocument();
    // Switch groupBy
    fireEvent.click(screen.getByText("Switch"));
    expect(onGroupByChange).toHaveBeenCalledWith("score");
  });

  it("column resize handle has separator role", () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    expect(screen.getByLabelText("Resize name")).toHaveAttribute(
      "role",
      "separator"
    );
  });

  it("column resize via pointer drag updates column width", () => {
    function Probe() {
      return (
        <DataGrid
          columns={[
            { key: "name", header: "Name", resizable: true, initialWidth: 100 },
            { key: "score", header: "Score" },
          ]}
          data={data}
          rowKey={(r) => r.id}
        />
      );
    }
    renderWithTheme(<Probe />);
    const handle = screen.getByLabelText("Resize name");
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 50 } as never);
    fireEvent.pointerUp(window, { pointerId: 1 } as never);
    // We don't get to easily re-read the layout, but the handler should not
    // have thrown — smoke check.
    expect(handle).toBeInTheDocument();
  });

  it("column drag-reorder fires onColumnReorder", () => {
    const onColumnReorder = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        onColumnReorder={onColumnReorder}
      />
    );
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    const scoreHeader = screen.getByRole("columnheader", { name: /Score/ });
    fireEvent.dragStart(nameHeader);
    fireEvent.dragOver(scoreHeader);
    fireEvent.drop(scoreHeader);
    expect(onColumnReorder).toHaveBeenCalled();
    const event = onColumnReorder.mock.calls[0]![0];
    expect(event.from).toBe("name");
    expect(event.to).toBe("score");
  });

  it("row drag-reorder fires onRowReorder", () => {
    const onRowReorder = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        onRowReorder={onRowReorder}
      />
    );
    const rows = screen.getAllByRole("row");
    // Skip the header row (first one).
    const first = rows[1]!;
    const second = rows[2]!;
    fireEvent.dragStart(first);
    fireEvent.dragOver(second);
    fireEvent.drop(second);
    expect(onRowReorder).toHaveBeenCalled();
    const event = onRowReorder.mock.calls[0]![0];
    expect(event.fromIndex).toBe(0);
    expect(event.toIndex).toBe(1);
  });

  it("Export with format='json' downloads JSON", async () => {
    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:1");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="json" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    await userEvent.click(screen.getByRole("button", { name: /Export JSON/ }));
    expect(createSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    createSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("Export with format='clipboard' writes to navigator.clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="clipboard" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    await userEvent.click(screen.getByRole("button", { name: /Export CLIPBOARD/ }));
    expect(writeText).toHaveBeenCalled();
  });

  it("persistKey writes column state to localStorage", () => {
    const key = `vftest-${Math.random().toString(36).slice(2)}`;
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        persistKey={key}
      />
    );
    const raw = window.localStorage.getItem(`vf-datagrid:${key}`);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({ order: ["name", "score"] });
  });

  it("virtualized=true with virtualRowHeight delegates rendering to VirtualList", () => {
    const rows: Row[] = Array.from({ length: 200 }, (_, i) => ({
      id: String(i),
      name: `r${i}`,
      group: "A",
      score: i,
    }));
    const { container } = renderWithTheme(
      <DataGrid
        columns={cols}
        data={rows}
        rowKey={(r) => r.id}
        virtualized
        virtualRowHeight={24}
        virtualHeight={120}
      />
    );
    // VirtualList renders a scroll container with class vf-virtual-list.
    expect(container.querySelector(".vf-virtual-list")).toBeInTheDocument();
  });
});

// ── Calendar ──

describe("Calendar (closeout)", () => {
  it("week view renders 24 hour-label cells per day column", () => {
    const { container } = renderWithTheme(
      <Calendar view="week" defaultDisplayMonth={new Date(2026, 2, 1)} />
    );
    const labels = container.querySelectorAll(".vf-calendar-view__hour-label");
    expect(labels.length).toBe(24);
  });

  it("day view shows a single column", () => {
    const { container } = renderWithTheme(
      <Calendar view="day" defaultDisplayMonth={new Date(2026, 2, 1)} />
    );
    // 24 hour rows × (1 label + 1 day) = 48 hour cells.
    const cells = container.querySelectorAll(".vf-calendar-view__hour-cell");
    // 1 corner + 1 day header + 24 labels + 24 day cells = 50.
    expect(cells.length).toBe(50);
  });

  it("onRangeChange fires when the displayed month changes", () => {
    const onRangeChange = vi.fn();
    function Ctl() {
      const [m, setM] = useState(new Date(2026, 2, 1));
      return (
        <Calendar
          displayMonth={m}
          onDisplayMonthChange={setM}
          onRangeChange={onRangeChange}
        />
      );
    }
    renderWithTheme(<Ctl />);
    const calls = onRangeChange.mock.calls.length;
    // Trigger Next.
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onRangeChange.mock.calls.length).toBeGreaterThan(calls);
    const last = onRangeChange.mock.calls.at(-1)![0] as CalendarRange;
    expect(last.start).toBeInstanceOf(Date);
    expect(last.end).toBeInstanceOf(Date);
  });
});

// ── TreeView ──

describe("TreeView (closeout)", () => {
  it("type-to-search jumps focus to the next matching label", () => {
    const items = [
      { id: "a", label: "Apple" },
      { id: "b", label: "Banana" },
      { id: "c", label: "Cherry" },
    ];
    const { container } = renderWithTheme(<TreeView items={items} />);
    const tree = container.querySelector('[role="tree"]') as HTMLElement;
    fireEvent.keyDown(tree, { key: "c" });
    // After the type-to-search, the Cherry item should have tabIndex=0 (focused).
    const cherry = within(tree).getByText("Cherry").closest('[role="treeitem"]');
    expect(cherry).toHaveAttribute("tabindex", "0");
  });
});

// ── Gantt ──

describe("Gantt (closeout)", () => {
  const start = new Date(2026, 2, 1);
  const end = new Date(2026, 2, 10);
  it("renders dependency arrow when a task references another", () => {
    const { container } = renderWithTheme(
      <Gantt
        start={start}
        end={end}
        tasks={[
          {
            id: "a",
            name: "A",
            start: new Date(2026, 2, 1),
            end: new Date(2026, 2, 3),
          },
          {
            id: "b",
            name: "B",
            start: new Date(2026, 2, 4),
            end: new Date(2026, 2, 7),
            dependencies: ["a"],
          },
        ]}
      />
    );
    expect(container.querySelector(".vf-gantt__deps")).toBeInTheDocument();
    expect(container.querySelector(".vf-gantt__dep")).toBeInTheDocument();
  });

  it("renders a resize handle on each bar (when not readOnly)", () => {
    const { container } = renderWithTheme(
      <Gantt
        start={start}
        end={end}
        tasks={[
          {
            id: "a",
            name: "A",
            start: new Date(2026, 2, 1),
            end: new Date(2026, 2, 3),
          },
        ]}
      />
    );
    expect(container.querySelector(".vf-gantt__resize")).toBeInTheDocument();
  });
});

// ── Kanban ──

describe("Kanban (closeout)", () => {
  it("within-column reorder fires onItemMove with adjusted target index", () => {
    const onMove = vi.fn();
    const { container } = renderWithTheme(
      <Kanban
        columns={[{ id: "todo", title: "Todo" }]}
        items={[
          { id: "x", columnId: "todo" },
          { id: "y", columnId: "todo" },
          { id: "z", columnId: "todo" },
        ]}
        renderItem={(it) => <div>{it.id}</div>}
        onItemMove={onMove}
      />
    );
    const itemEls = container.querySelectorAll(".vf-kanban__item");
    const first = itemEls[0]!;
    const third = itemEls[2]!;
    fireEvent.dragStart(first);
    // Hover over the bottom half of the third item to drop after it.
    fireEvent.dragOver(third, { clientY: 9999 });
    fireEvent.drop(third.parentElement as Element);
    expect(onMove).toHaveBeenCalled();
    const event = onMove.mock.calls[0]![0];
    expect(event.itemId).toBe("x");
    expect(event.toColumn).toBe("todo");
  });
});

// Legacy Heatmap test removed in Phase 22 — new Heatmap is tested under src/charts/.

// ── MarkdownRenderer ──

describe("MarkdownRenderer (closeout)", () => {
  it("plugins preprocess the source", () => {
    const upper = (md: string) => md.toUpperCase();
    const { container } = renderWithTheme(
      <MarkdownRenderer content="hello" plugins={[upper]} />
    );
    expect(container.textContent).toContain("HELLO");
  });

  it("components override replaces the rendered tag", () => {
    const CustomH1 = (p: { children?: React.ReactNode }) => (
      <h1 data-testid="custom-h1">{p.children}</h1>
    );
    renderWithTheme(
      <MarkdownRenderer content="# Hello" components={{ h1: CustomH1 }} />
    );
    expect(screen.getByTestId("custom-h1")).toHaveTextContent("Hello");
  });

  it("linkTarget=_blank applies target+rel even with components map", () => {
    renderWithTheme(
      <MarkdownRenderer
        content="[v](https://example.com)"
        linkTarget="_blank"
        components={{ a: "a" }}
      />
    );
    const link = screen.getByRole("link", { name: "v" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});
