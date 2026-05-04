// Final coverage tests for DataGrid.tsx
//
// Targets uncovered lines:
//   123-126, 134-135: readPersisted/writePersisted
//   247-262: persistKey hydration on mount
//   323: setColumnWidth callback
//   407-409: pagination slice
//   426: expand toggle
//   445-450: reorderRow
//   671-687: column resize handler
//   753-808: row reorder drag handlers, row expansion UI
//   875, 901-904, 920-922: column header reorder drag, sort toggle
//   962-998: loading/error/empty status rows
//   1000-1013: empty state
//   1017-1021: virtualized + groupBy warning
//   1051: virtual row rendering
//   1152-1153: DataGrid.Footer
//   1202-1203: DataGrid.Export default fileName
//   1230-1305: DataGrid.Pagination

import { act, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DataGrid, type DataGridColumn } from "../DataGrid";

interface Row {
  id: string;
  name: string;
  score: number;
  category: string;
}

const data: Row[] = [
  { id: "1", name: "Alpha", score: 30, category: "A" },
  { id: "2", name: "Beta", score: 10, category: "B" },
  { id: "3", name: "Gamma", score: 20, category: "A" },
];

const baseCols: DataGridColumn<Row>[] = [
  { key: "name", header: "Name", sortable: true, filterable: true },
  { key: "score", header: "Score", sortable: true },
  { key: "category", header: "Category" },
];

describe("DataGrid loading state", () => {
  it("shows Loading... when loading=true", () => {
    renderWithTheme(
      <DataGrid columns={baseCols} data={[]} rowKey={(r) => r.id} loading />
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

describe("DataGrid error state", () => {
  it("shows error content when error is set", () => {
    renderWithTheme(
      <DataGrid columns={baseCols} data={[]} rowKey={(r) => r.id} error="Something broke" />
    );
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });
});

describe("DataGrid empty state", () => {
  it("shows 'No rows' by default for empty data", () => {
    renderWithTheme(
      <DataGrid columns={baseCols} data={[]} rowKey={(r) => r.id} />
    );
    expect(screen.getByText("No rows")).toBeInTheDocument();
  });

  it("shows custom emptyState content", () => {
    renderWithTheme(
      <DataGrid columns={baseCols} data={[]} rowKey={(r) => r.id} emptyState="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("DataGrid pagination", () => {
  it("renders pagination with page info and navigation", () => {
    const onPageChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        pagination={{ pageSize: 2, page: 1, onPageChange }}
      >
        <DataGrid.Body />
        <DataGrid.Pagination />
      </DataGrid>
    );
    // Should show page info
    expect(screen.getByText(/Page 1/)).toBeInTheDocument();
    // Prev should be disabled on page 1
    expect(screen.getByText("Prev")).toBeDisabled();
    // Next should be enabled
    expect(screen.getByText("Next")).not.toBeDisabled();
  });

  it("navigates pages via Next/Prev buttons", async () => {
    const onPageChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        pagination={{ pageSize: 2, page: 1, onPageChange }}
      >
        <DataGrid.Body />
        <DataGrid.Pagination />
      </DataGrid>
    );
    await userEvent.click(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("supports page size change", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        pagination={{
          pageSize: 10,
          page: 1,
          onPageChange,
          onPageSizeChange,
          pageSizeOptions: [5, 10, 25],
        }}
      >
        <DataGrid.Body />
        <DataGrid.Pagination />
      </DataGrid>
    );
    const select = screen.getByRole("combobox", { name: "Page size" });
    await userEvent.selectOptions(select, "25");
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it("supports jump-to-page via Enter key", () => {
    const onPageChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        pagination={{ pageSize: 1, page: 1, onPageChange }}
      >
        <DataGrid.Body />
        <DataGrid.Pagination />
      </DataGrid>
    );
    const jumpInput = screen.getByRole("spinbutton", { name: "Jump to page" });
    fireEvent.change(jumpInput, { target: { value: "2" } });
    fireEvent.keyDown(jumpInput, { key: "Enter" });
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("ignores invalid jump-to-page values", () => {
    const onPageChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        pagination={{ pageSize: 1, page: 1, onPageChange }}
      >
        <DataGrid.Body />
        <DataGrid.Pagination />
      </DataGrid>
    );
    const jumpInput = screen.getByRole("spinbutton", { name: "Jump to page" });
    fireEvent.change(jumpInput, { target: { value: "999" } });
    fireEvent.keyDown(jumpInput, { key: "Enter" });
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe("DataGrid row reorder", () => {
  it("calls onRowReorder when row is dragged to new position", () => {
    const onRowReorder = vi.fn();
    const { container } = renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        onRowReorder={onRowReorder}
      />
    );
    const rows = container.querySelectorAll(".vf-datagrid__row");
    // Should have drag handles
    const handles = container.querySelectorAll(".vf-datagrid__drag");
    expect(handles.length).toBe(3);

    // Simulate drag from row 0 to row 1
    fireEvent.dragStart(rows[0], { dataTransfer: { effectAllowed: "" } });
    fireEvent.dragOver(rows[1], { dataTransfer: { dropEffect: "" } });
    fireEvent.drop(rows[1]);

    expect(onRowReorder).toHaveBeenCalledWith({ fromIndex: 0, toIndex: 1 });
  });
});

describe("DataGrid row expansion", () => {
  it("expands and collapses rows", async () => {
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        rowExpansion
        renderExpanded={(row) => <div data-testid="expanded">{(row as Row).name} details</div>}
      />
    );
    const expandBtns = screen.getAllByRole("button", { name: /Expand row/ });
    expect(expandBtns.length).toBe(3);

    // Click to expand
    await userEvent.click(expandBtns[0]);
    expect(screen.getByTestId("expanded")).toHaveTextContent("Alpha details");
    expect(expandBtns[0]).toHaveAttribute("aria-expanded", "true");

    // Click again to collapse
    await userEvent.click(expandBtns[0]);
    expect(screen.queryByTestId("expanded")).not.toBeInTheDocument();
  });
});

describe("DataGrid column reorder", () => {
  it("reorders columns via drag and drop on headers", () => {
    const onColumnReorder = vi.fn();
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", reorderable: true },
      { key: "score", header: "Score", reorderable: true },
    ];
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        onColumnReorder={onColumnReorder}
      />
    );

    const headers = screen.getAllByRole("columnheader");
    // Find the Name and Score headers (skip any utility columns)
    const nameHeader = headers.find((h) => h.textContent?.includes("Name"))!;
    const scoreHeader = headers.find((h) => h.textContent?.includes("Score"))!;

    // Drag Name onto Score
    fireEvent.dragStart(nameHeader, { dataTransfer: { effectAllowed: "" } });
    fireEvent.dragOver(scoreHeader, { dataTransfer: { dropEffect: "" } });
    fireEvent.drop(scoreHeader);

    expect(onColumnReorder).toHaveBeenCalledWith(
      expect.objectContaining({ from: "name", to: "score" })
    );
  });
});

describe("DataGrid persistence", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("persists column widths/hidden/order to localStorage", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} persistKey="test-grid">
        <DataGrid.Toolbar>
          <DataGrid.ColumnVisibility />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );

    // Should have written to localStorage
    const stored = localStorage.getItem("vf-datagrid:test-grid");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.order).toEqual(["name", "score"]);
  });

  it("hydrates persisted state on mount", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
    ];
    // Pre-persist hidden state
    localStorage.setItem(
      "vf-datagrid:hydrate-test",
      JSON.stringify({ hidden: ["score"], widths: {}, order: ["name", "score"] })
    );
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} persistKey="hydrate-test" />
    );
    // Score column should be hidden
    expect(screen.queryByText("Score")).not.toBeInTheDocument();
  });
});

describe("DataGrid groupBy", () => {
  it("renders group headers when groupBy is set", () => {
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        groupBy="category"
      />
    );
    // Should show group headers (rendered as <strong>) for category A and B
    const groupCells = document.querySelectorAll(".vf-datagrid__group-cell");
    expect(groupCells.length).toBe(2);
    const groupLabels = Array.from(groupCells).map((c) => c.querySelector("strong")?.textContent);
    expect(groupLabels).toContain("A");
    expect(groupLabels).toContain("B");
  });

  it("collapses and expands groups", async () => {
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        groupBy="category"
      />
    );
    // Find group toggle buttons by class
    const groupToggles = document.querySelectorAll(".vf-datagrid__group-toggle");
    expect(groupToggles.length).toBe(2);

    // Initially expanded
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    // Collapse group A
    await userEvent.click(groupToggles[0]);
    // Alpha and Gamma should be hidden (they're in category A)
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});

describe("DataGrid column resize interaction", () => {
  it("resizes column on pointer drag", () => {
    const onColumnResize = vi.fn();
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", resizable: true, initialWidth: 100 },
    ];
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        onColumnResize={onColumnResize}
      />
    );
    const handle = screen.getByRole("separator", { name: "Resize name" });

    // Simulate pointer drag
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    });

    // Simulate pointer move (window level)
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 150 }));
    });

    // Simulate pointer up
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
    });

    expect(onColumnResize).toHaveBeenCalled();
  });
});

describe("DataGrid sort toggle", () => {
  it("cycles through asc -> desc -> none on header clicks", async () => {
    const onSortChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        onSortChange={onSortChange}
      />
    );
    const nameHeader = screen.getByText("Name").closest("[role='columnheader']")!;

    // First click: asc
    await userEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });

    // Second click: desc
    await userEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "desc" });

    // Third click: clear
    await userEvent.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith(null);
  });
});

describe("DataGrid Footer", () => {
  it("renders footer div", () => {
    const cols: DataGridColumn<Row>[] = [{ key: "name", header: "Name" }];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Body />
        <DataGrid.Footer>Footer content</DataGrid.Footer>
      </DataGrid>
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});

describe("DataGrid selection modes", () => {
  it("single selection replaces previous selection", async () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        rowSelection="single"
        onSelectionChange={onSelectionChange}
      />
    );
    const radios = screen.getAllByRole("radio");
    await userEvent.click(radios[0]);
    await userEvent.click(radios[1]);

    // Last call should have only the second row selected
    const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
    expect(lastCall.size).toBe(1);
  });

  it("multi select all toggles all rows", async () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <DataGrid
        columns={baseCols}
        data={data}
        rowKey={(r) => r.id}
        rowSelection="multi"
        onSelectionChange={onSelectionChange}
      />
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    await userEvent.click(selectAll);
    const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
    expect(lastCall.size).toBe(3);

    // Click again to deselect all
    await userEvent.click(selectAll);
    const lastCall2 = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
    expect(lastCall2.size).toBe(0);
  });
});

describe("DataGrid column pinning", () => {
  it("applies pin class to pinned columns", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", pin: "left" },
      { key: "score", header: "Score", pin: "right" },
    ];
    const { container } = renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    expect(container.querySelector(".vf-datagrid__cell--pin-left")).toBeInTheDocument();
    expect(container.querySelector(".vf-datagrid__cell--pin-right")).toBeInTheDocument();
  });
});
