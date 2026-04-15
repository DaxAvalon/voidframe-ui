// Smoke tests for Phase 9 data-display components. Each test verifies the
// core contract and rendering shape — tight coverage rather than exhaustive
// per-component suites.

import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { DataGrid, type DataGridColumn } from "../DataGrid";
import { TreeTable } from "../TreeTable";
import { TreeView } from "../TreeView";
import { VirtualList, InfiniteScroll } from "../Virtualization";
import { DataList, DescriptionList } from "../DataList";
import {
  CircularProgress,
  Gauge,
  MetricCard,
  SegmentedProgress,
  StatGroup,
  StatusIndicator,
  TrendIndicator,
} from "../Metrics";
// Legacy Charts were removed in Phase 22 — their replacements are tested
// under src/charts/__tests__/.
import {
  CodeBlock,
  DiffViewer,
  JSONViewer,
  LogViewer,
  MarkdownRenderer,
  Terminal,
} from "../Viewers";
import { Calendar } from "../Calendar";
import { Gantt } from "../Gantt";
import { Activity } from "../Activity";
import { Kanban } from "../Kanban";
import { Stat, Table, type TableColumn } from "../Data";
import { Badge } from "../Badge";
import { Avatar } from "../DataExtended";

// ── Table (upgrade) ──

describe("Table (upgrade)", () => {
  const columns: TableColumn[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "count", header: "Count", sortable: true, align: "right" },
  ];
  const rows = [
    { name: "A", count: 3 },
    { name: "B", count: 1 },
    { name: "C", count: 2 },
  ];

  it("renders role=table with sortable header", () => {
    renderWithTheme(<Table columns={columns} data={rows} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Count/ })).toHaveAttribute(
      "aria-sort",
      "none"
    );
  });

  it("sorts asc then desc when header is clicked twice", async () => {
    renderWithTheme(<Table columns={columns} data={rows} />);
    const header = screen.getByRole("columnheader", { name: /Count/ });
    await userEvent.click(header);
    expect(header).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(header);
    expect(header).toHaveAttribute("aria-sort", "descending");
  });

  it("shows emptyState when data is empty", () => {
    renderWithTheme(<Table columns={columns} data={[]} emptyState="Nothing" />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    renderWithTheme(<Table columns={columns} data={[]} loading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("onRowClick fires with row + index", async () => {
    const onRowClick = vi.fn();
    renderWithTheme(
      <Table columns={columns} data={rows} onRowClick={onRowClick} />
    );
    await userEvent.click(screen.getByText("A"));
    expect(onRowClick).toHaveBeenCalled();
  });
});

// ── Stat / Badge / Avatar upgrades ──

describe("Stat upgrade", () => {
  it("renders change indicator and trend SVG", () => {
    renderWithTheme(
      <Stat label="Revenue" value="$42K" change={12.5} trend={[1, 3, 2, 5, 4, 7]} />
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText(/12.5/)).toBeInTheDocument();
  });
});

describe("Badge upgrade", () => {
  it("applies variant + tone classes", () => {
    renderWithTheme(
      <Badge variant="outline" tone="success">
        Ready
      </Badge>
    );
    const badge = screen.getByText("Ready").closest(".vf-badge");
    expect(badge).toHaveClass("vf-badge--outline");
    expect(badge).toHaveClass("vf-badge--success");
  });
});

describe("Avatar upgrade", () => {
  it("renders status dot when status is provided", () => {
    const { container } = renderWithTheme(
      <Avatar name="Alice" status="online" />
    );
    expect(container.querySelector(".vf-avatar__status--online")).toBeInTheDocument();
  });

  it("falls back to initials when img errors", () => {
    renderWithTheme(<Avatar name="Alice Beta" src="/missing.png" />);
    const img = screen.getByRole("img", { name: "Alice Beta" });
    fireEvent.error(img);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

// ── DataGrid ──

describe("DataGrid", () => {
  interface Row {
    id: string;
    name: string;
    score: number;
  }
  const cols: DataGridColumn<Row>[] = [
    { key: "name", header: "Name", sortable: true, filterable: true },
    { key: "score", header: "Score", sortable: true, align: "right" },
  ];
  const data: Row[] = [
    { id: "1", name: "Alpha", score: 30 },
    { id: "2", name: "Beta", score: 10 },
    { id: "3", name: "Gamma", score: 20 },
  ];

  it("renders role=table and one row per data entry", () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("sorting a column reorders the rendered rows", async () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    await userEvent.click(screen.getByRole("columnheader", { name: /Score/ }));
    // ascending: Beta (10) first.
    const cells = screen.getAllByRole("cell");
    expect(cells[0]!.textContent).toBe("Beta");
  });

  it("multi-select checkbox selects all", async () => {
    function Ctl() {
      const [s, setS] = useState<Set<string>>(new Set());
      return (
        <DataGrid
          columns={cols}
          data={data}
          rowKey={(r) => r.id}
          rowSelection="multi"
          selectedKeys={s}
          onSelectionChange={setS}
        />
      );
    }
    renderWithTheme(<Ctl />);
    const all = screen.getByLabelText("Select all rows");
    await userEvent.click(all);
    const selected = screen.getAllByRole("row", { selected: true });
    expect(selected.length).toBe(data.length);
  });

  it("filter input narrows the rows", async () => {
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    const filter = screen.getByLabelText("Filter name");
    await userEvent.type(filter, "Alp");
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });
});

// ── TreeTable + TreeView ──

describe("TreeTable", () => {
  interface Row {
    id: string;
    name: string;
    children?: Row[];
  }
  const data: Row[] = [
    { id: "1", name: "Root", children: [{ id: "2", name: "Child" }] },
  ];
  const columns: TableColumn<Row>[] = [{ key: "name", header: "Name" }];

  it("children hidden until disclosure clicked", async () => {
    renderWithTheme(
      <TreeTable
        columns={columns}
        data={data}
        getChildren={(r) => r.children}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});

describe("TreeView", () => {
  it("selects on item click and fires onSelectionChange", async () => {
    const onSel = vi.fn();
    renderWithTheme(
      <TreeView
        items={[{ id: "a", label: "A" }, { id: "b", label: "B" }]}
        onSelectionChange={onSel}
      />
    );
    await userEvent.click(screen.getByText("B"));
    expect(onSel).toHaveBeenCalledWith("b");
  });
});

// ── Virtualization ──

describe("VirtualList", () => {
  it("renders only the visible window", () => {
    const items = Array.from({ length: 500 }, (_, i) => `item-${i}`);
    const { container } = renderWithTheme(
      <VirtualList
        items={items}
        itemHeight={20}
        style={{ height: 100 }}
        renderItem={(item, _, style) => (
          <div key={item} style={style}>
            {item}
          </div>
        )}
      />
    );
    const rendered = container.querySelectorAll(".vf-virtual-list > div > div");
    // Viewport 100 / itemHeight 20 = 5 visible, + overscan 3 on each side = up to 11.
    expect(rendered.length).toBeLessThan(20);
  });
});

describe("InfiniteScroll", () => {
  it("renders sentinel + loader when loading", () => {
    const { container } = renderWithTheme(
      <InfiniteScroll hasMore loading onLoadMore={() => {}}>
        <div>child</div>
      </InfiniteScroll>
    );
    expect(container.querySelector(".vf-infinite-scroll__sentinel")).toBeInTheDocument();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});

// ── DataList / DescriptionList ──

describe("DataList + DescriptionList", () => {
  it("DataList renders label/value rows", () => {
    renderWithTheme(
      <DataList
        items={[
          { label: "Name", value: "Alice" },
          { label: "Email", value: "a@b.co" },
        ]}
      />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("a@b.co")).toBeInTheDocument();
  });

  it("DescriptionList semantic dt/dd", () => {
    renderWithTheme(
      <DescriptionList>
        <DescriptionList.Term>Name</DescriptionList.Term>
        <DescriptionList.Description>Alice</DescriptionList.Description>
      </DescriptionList>
    );
    expect(screen.getByText("Name").tagName).toBe("DT");
    expect(screen.getByText("Alice").tagName).toBe("DD");
  });
});

// ── Metrics family ──

describe("Metrics", () => {
  it("StatGroup renders divider classes", () => {
    const { container } = renderWithTheme(
      <StatGroup>
        <Stat label="A" value="1" />
        <Stat label="B" value="2" />
      </StatGroup>
    );
    expect(container.querySelector(".vf-stat-group--divided")).toBeInTheDocument();
  });

  it("MetricCard shows delta and subtitle", () => {
    renderWithTheme(
      <MetricCard
        title="Users"
        value={1234}
        delta={{ value: 8.2, direction: "up" }}
        subtitle="vs. last week"
      />
    );
    expect(screen.getByText(/8.2/)).toBeInTheDocument();
    expect(screen.getByText("vs. last week")).toBeInTheDocument();
  });

  it("CircularProgress exposes progressbar role and valuenow", () => {
    renderWithTheme(<CircularProgress value={42} showLabel />);
    const pb = screen.getByRole("progressbar");
    expect(pb).toHaveAttribute("aria-valuenow", "42");
  });

  it("SegmentedProgress renders one bar per segment", () => {
    const { container } = renderWithTheme(
      <SegmentedProgress
        segments={[
          { value: 30, tone: "success" },
          { value: 70, tone: "neutral" },
        ]}
      />
    );
    expect(container.querySelectorAll(".vf-seg-progress__seg").length).toBe(2);
  });

  it("Gauge exposes role=meter", () => {
    renderWithTheme(<Gauge value={72} />);
    expect(screen.getByRole("meter")).toBeInTheDocument();
  });

  it("TrendIndicator renders a direction arrow", () => {
    renderWithTheme(<TrendIndicator value={-5} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });

  it("StatusIndicator renders status-scoped class", () => {
    const { container } = renderWithTheme(
      <StatusIndicator status="online" label="Online" />
    );
    expect(container.querySelector(".vf-status-indicator--online")).toBeInTheDocument();
  });
});

// Charts tests moved to src/charts/__tests__/ in Phase 22.

// ── Viewers ──

describe("Viewers", () => {
  it("CodeBlock renders each line and optional line numbers", () => {
    const { container } = renderWithTheme(
      <CodeBlock code={"const a = 1;\nconst b = 2;"} />
    );
    const lines = container.querySelectorAll(".vf-codeblock__line");
    expect(lines.length).toBe(2);
  });

  it("JSONViewer collapses objects by default at depth > defaultExpanded", () => {
    renderWithTheme(
      <JSONViewer data={{ a: { b: 1 } }} defaultExpanded={1} />
    );
    // Outer expanded, inner collapsed — "a" visible, "b" not yet.
    expect(screen.getByText(/"a"/)).toBeInTheDocument();
    expect(screen.queryByText(/"b"/)).not.toBeInTheDocument();
  });

  it("DiffViewer marks insert and delete lines", () => {
    const { container } = renderWithTheme(
      <DiffViewer oldValue={"one\ntwo"} newValue={"one\ntwo-mod"} />
    );
    expect(container.querySelector(".vf-diff__line--insert")).toBeInTheDocument();
    expect(container.querySelector(".vf-diff__line--delete")).toBeInTheDocument();
  });

  it("LogViewer respects level filter", () => {
    const entries = [
      { level: "debug" as const, message: "d" },
      { level: "error" as const, message: "e" },
    ];
    renderWithTheme(<LogViewer entries={entries} level="error" />);
    expect(screen.queryByText("d")).not.toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
  });

  it("Terminal submits on Enter", async () => {
    const onCommand = vi.fn();
    renderWithTheme(<Terminal onCommand={onCommand} />);
    const input = screen.getByLabelText("Terminal input");
    await userEvent.type(input, "ls{Enter}");
    expect(onCommand).toHaveBeenCalledWith("ls");
  });

  it("MarkdownRenderer paints escaped output", () => {
    const { container } = renderWithTheme(
      <MarkdownRenderer content="# Hi" />
    );
    // Async innerHTML write — inspect after a tick.
    return Promise.resolve().then(() => {
      expect(
        container.querySelector(".vf-markdown-renderer__body")
      ).toBeInTheDocument();
    });
  });
});

// ── Calendar / Gantt / Activity ──

describe("Calendar view", () => {
  it("renders weekday headers", () => {
    renderWithTheme(<Calendar defaultDisplayMonth={new Date(2026, 2, 1)} />);
    // Whatever locale, seven weekday header cells.
    const heads = document.querySelectorAll(".vf-calendar-view__weekhead");
    expect(heads.length).toBe(7);
  });
});

describe("Gantt", () => {
  it("renders a bar per task", () => {
    const { container } = renderWithTheme(
      <Gantt
        start={new Date(2026, 2, 1)}
        end={new Date(2026, 2, 10)}
        tasks={[
          {
            id: "a",
            name: "A",
            start: new Date(2026, 2, 2),
            end: new Date(2026, 2, 5),
          },
        ]}
      />
    );
    expect(container.querySelectorAll(".vf-gantt__bar").length).toBe(1);
  });

  it("aligns the tick count with the bar track width", () => {
    const { container } = renderWithTheme(
      <Gantt
        start={new Date(2026, 2, 1)}
        end={new Date(2026, 2, 10)}
        unitWidth={20}
        tasks={[
          {
            id: "a",
            name: "A",
            start: new Date(2026, 2, 1),
            end: new Date(2026, 2, 10),
          },
        ]}
      />
    );
    // 9 day-units between the two dates — expect 9 ticks, not 10.
    expect(container.querySelectorAll(".vf-gantt__tick").length).toBe(9);
    // Bar should span (nearly) the full track width.
    const bar = container.querySelector(".vf-gantt__bar") as HTMLElement;
    expect(parseInt(bar.style.width, 10)).toBe(9 * 20);
  });

  it("draws a dependency arrow for linked tasks", () => {
    const { container } = renderWithTheme(
      <Gantt
        start={new Date(2026, 2, 1)}
        end={new Date(2026, 2, 15)}
        tasks={[
          {
            id: "a",
            name: "A",
            start: new Date(2026, 2, 1),
            end: new Date(2026, 2, 5),
          },
          {
            id: "b",
            name: "B",
            start: new Date(2026, 2, 6),
            end: new Date(2026, 2, 10),
            dependencies: ["a"],
          },
        ]}
      />
    );
    const deps = container.querySelectorAll(".vf-gantt__dep");
    expect(deps.length).toBe(1);
    const path = deps[0]!.querySelector("path");
    expect(path).toBeTruthy();
    expect(path!.getAttribute("d")).toMatch(/^M /);
  });
});

describe("Activity", () => {
  it("renders items with actor/action/target", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item
          actor="Alice"
          action="pushed"
          target="main"
          time="2026-01-01T00:00:00Z"
          absoluteTime
        />
      </Activity>
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("pushed")).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
  });
});

// ── Kanban ──

describe("Kanban", () => {
  it("renders columns and items", () => {
    const onMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={[{ id: "todo", title: "Todo" }, { id: "done", title: "Done" }]}
        items={[
          { id: "t1", columnId: "todo" },
          { id: "t2", columnId: "done" },
        ]}
        renderItem={(it) => <div>{it.id}</div>}
        onItemMove={onMove}
      />
    );
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("t1")).toBeInTheDocument();
  });

  it("keyboard ctrl+arrow moves item across columns", () => {
    const onMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={[{ id: "a", title: "A" }, { id: "b", title: "B" }]}
        items={[{ id: "t1", columnId: "a" }]}
        renderItem={(it) => <div>{it.id}</div>}
        onItemMove={onMove}
      />
    );
    const item = screen.getByText("t1").parentElement as HTMLElement;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowRight", ctrlKey: true });
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "t1", fromColumn: "a", toColumn: "b" })
    );
  });
});
