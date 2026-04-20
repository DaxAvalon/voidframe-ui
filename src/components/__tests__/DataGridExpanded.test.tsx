// Expanded DataGrid tests — column visibility, resize, export, filter, bulk actions, inline editing

import { screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DataGrid, type DataGridColumn } from "../DataGrid";

interface Row {
  id: string;
  name: string;
  score: number;
  city: string;
}

const data: Row[] = [
  { id: "1", name: "Alpha", score: 30, city: "NYC" },
  { id: "2", name: "Beta", score: 10, city: "LA" },
  { id: "3", name: "Gamma", score: 20, city: "NYC" },
];

describe("DataGrid column visibility", () => {
  it("hides columns marked as hidden", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score", hidden: true },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    // "Score" header should not appear because column is hidden
    expect(screen.queryByText("Score")).not.toBeInTheDocument();
  });

  it("ColumnVisibility toggles column visibility", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.ColumnVisibility />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    // Both columns should be visible initially
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();

    // The visibility panel shows checkboxes for each column
    const colVisGroup = screen.getByRole("group");
    const checkboxes = within(colVisGroup).getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    // Both checked initially
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    // Click to hide "score"
    await userEvent.click(checkboxes[1]);
    // Score header should now be hidden in the body
    const headers = document.querySelectorAll(".vf-datagrid__header-cell");
    const headerTexts = Array.from(headers).map((h) => h.textContent);
    expect(headerTexts).not.toContain("Score");
  });
});

describe("DataGrid column resize", () => {
  it("renders resize handle for resizable columns", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", resizable: true },
      { key: "score", header: "Score" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    const handle = screen.getByRole("separator", { name: "Resize name" });
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveClass("vf-datagrid__resize-handle");
  });

  it("does not render resize handle for non-resizable columns", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });
});

describe("DataGrid export", () => {
  it("renders CSV export button", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="csv" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
  });

  it("renders JSON export button", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="json" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    expect(screen.getByText("Export JSON")).toBeInTheDocument();
  });

  it("CSV export triggers download", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
      { key: "score", header: "Score" },
    ];

    // Mock createObjectURL and revokeObjectURL
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();

    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="csv" fileName="test.csv" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );

    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    const mockAnchor = origCreateElement("a");
    mockAnchor.click = clickSpy;
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return mockAnchor;
      return origCreateElement(tag);
    });

    await userEvent.click(screen.getByText("Export CSV"));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(mockAnchor.download).toBe("test.csv");

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    vi.restoreAllMocks();
  });

  it("JSON export triggers download", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];

    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = vi.fn();

    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="json" fileName="data.json" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );

    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    const mockAnchor = origCreateElement("a");
    mockAnchor.click = clickSpy;
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return mockAnchor;
      return origCreateElement(tag);
    });

    await userEvent.click(screen.getByText("Export JSON"));

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.download).toBe("data.json");

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    vi.restoreAllMocks();
  });

  it("clipboard export uses clipboard API", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];

    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="clipboard" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );

    await userEvent.click(screen.getByText("Export CLIPBOARD"));
    expect(writeTextSpy).toHaveBeenCalled();
    const csvContent = writeTextSpy.mock.calls[0][0] as string;
    expect(csvContent).toContain("name");
    expect(csvContent).toContain("Alpha");
  });

  it("renders custom export label", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Export format="csv" label="Download" />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    expect(screen.getByText("Download")).toBeInTheDocument();
  });
});

describe("DataGrid filter input", () => {
  it("renders filter input for filterable columns", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", filterable: true },
      { key: "score", header: "Score" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    const filterInput = screen.getByRole("textbox", { name: "Filter name" });
    expect(filterInput).toBeInTheDocument();
    expect(filterInput).toHaveAttribute("placeholder", "Filter\u2026");
  });

  it("filters rows when filter value is typed", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", filterable: true },
      { key: "score", header: "Score" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    const filterInput = screen.getByRole("textbox", { name: "Filter name" });
    await userEvent.type(filterInput, "Alpha");

    // Only Alpha row should remain
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  });

  it("DataGrid.Filters renders separate filter inputs", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", filterable: true },
      { key: "city", header: "City", filterable: true },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Filters />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    const filterGroup = document.querySelector(".vf-datagrid__filters");
    expect(filterGroup).toBeInTheDocument();
  });
});

describe("DataGrid bulk actions", () => {
  it("does not render bulk actions when nothing selected", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} rowSelection="multi">
        <DataGrid.BulkActions>
          {(count) => <span>Selected: {count}</span>}
        </DataGrid.BulkActions>
        <DataGrid.Body />
      </DataGrid>
    );
    expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
  });

  it("renders bulk actions when rows are selected", async () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name" },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} rowSelection="multi">
        <DataGrid.BulkActions>
          {(count) => <span data-testid="bulk">Selected: {count}</span>}
        </DataGrid.BulkActions>
        <DataGrid.Body />
      </DataGrid>
    );
    // Select first row
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is "select all", skip it
    await userEvent.click(checkboxes[1]);

    expect(screen.getByTestId("bulk")).toHaveTextContent("Selected: 1");
  });
});

describe("DataGrid selection scope", () => {
  it("toggleAll selects all filtered rows across pages", async () => {
    const onSelectionChange = vi.fn();
    const cols: DataGridColumn<Row>[] = [{ key: "name", header: "Name" }];
    const many: Row[] = Array.from({ length: 6 }, (_, i) => ({
      id: `r${i}`,
      name: `Row ${i}`,
      value: i,
      group: "A",
    }));
    renderWithTheme(
      <DataGrid
        columns={cols}
        data={many}
        rowKey={(r) => r.id}
        rowSelection="multi"
        onSelectionChange={onSelectionChange}
        pagination={{ page: 1, pageSize: 3 }}
      />
    );
    const selectAll = screen.getAllByRole("checkbox")[0]!;
    await userEvent.click(selectAll);
    const selected = onSelectionChange.mock.calls.at(-1)?.[0] as
      | Set<string>
      | undefined;
    expect(selected?.size).toBe(many.length);
  });

  it("onGroupByChange does not re-fire when the parent re-passes the same groupBy prop", () => {
    const onGroupByChange = vi.fn();
    const cols: DataGridColumn<Row>[] = [{ key: "name", header: "Name" }];
    const { rerender } = renderWithTheme(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        groupBy="group"
        onGroupByChange={onGroupByChange}
      />
    );
    rerender(
      <DataGrid
        columns={cols}
        data={data}
        rowKey={(r) => r.id}
        groupBy="group"
        onGroupByChange={onGroupByChange}
      />
    );
    expect(onGroupByChange).not.toHaveBeenCalled();
  });
});

describe("DataGrid inline editing", () => {
  it("starts editing on double-click", async () => {
    const onCellEdit = vi.fn();
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", editable: true, onCellEdit },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    // Double-click on the cell content
    const cell = screen.getByText("Alpha");
    fireEvent.doubleClick(cell);

    // Should now show an input
    const input = document.querySelector(".vf-datagrid__cell-editor") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("Alpha");
  });

  it("commits edit on Enter", async () => {
    const onCellEdit = vi.fn();
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", editable: true, onCellEdit },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    fireEvent.doubleClick(screen.getByText("Alpha"));
    const input = document.querySelector(".vf-datagrid__cell-editor") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "AlphaEdited");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCellEdit).toHaveBeenCalledWith(data[0], "AlphaEdited");
  });

  it("cancels edit on Escape", async () => {
    const onCellEdit = vi.fn();
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", editable: true, onCellEdit },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id} />
    );
    fireEvent.doubleClick(screen.getByText("Alpha"));
    const input = document.querySelector(".vf-datagrid__cell-editor") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Escape" });

    // Should not have called onCellEdit
    expect(onCellEdit).not.toHaveBeenCalled();
    // Input should be removed
    expect(document.querySelector(".vf-datagrid__cell-editor")).not.toBeInTheDocument();
  });
});

describe("DataGrid search", () => {
  it("renders search input", () => {
    const cols: DataGridColumn<Row>[] = [
      { key: "name", header: "Name", filterable: true },
    ];
    renderWithTheme(
      <DataGrid columns={cols} data={data} rowKey={(r) => r.id}>
        <DataGrid.Toolbar>
          <DataGrid.Search placeholder="Type to search..." />
        </DataGrid.Toolbar>
        <DataGrid.Body />
      </DataGrid>
    );
    const search = document.querySelector(".vf-datagrid__search") as HTMLInputElement;
    expect(search).toBeInTheDocument();
    expect(search.placeholder).toBe("Type to search...");
  });
});
