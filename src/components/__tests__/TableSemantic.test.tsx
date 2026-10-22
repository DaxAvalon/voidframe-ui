// Table as="table": real table elements with the same column API.
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Table, type TableColumn } from "../Data";

interface Row {
  id: string;
  name: string;
  score: number;
}
const columns: TableColumn<Row>[] = [
  { key: "name", header: "Name", rowHeader: true, width: "40%" },
  { key: "score", header: "Score", sortable: true, align: "right" },
];
const data: Row[] = [
  { id: "a", name: "Alice", score: 94 },
  { id: "b", name: "Bob", score: 78 },
];

describe("Table as='table'", () => {
  it("emits table, thead, tbody, tr, th scope=col and td", () => {
    const { container } = renderWithTheme(
      <Table as="table" columns={columns} data={data} rowKey={(r) => r.id} />
    );
    const table = container.querySelector("table.vf-table__table")!;
    expect(table).toBeTruthy();
    expect(table.querySelectorAll("thead > tr > th[scope='col']").length).toBe(2);
    expect(table.querySelectorAll("tbody > tr").length).toBe(2);
    expect(table.querySelectorAll("tbody td").length).toBe(2);
    expect(table.querySelectorAll("colgroup > col").length).toBe(2);
    expect((table.querySelector("col") as HTMLElement).style.width).toBe("40%");
    expect(screen.getByRole("table")).toBe(table);
    expect(container.querySelector(".vf-table")).toHaveClass("vf-table--semantic");
  });

  it("renders rowHeader columns as th scope=row and keeps cell classes", () => {
    const { container } = renderWithTheme(
      <Table as="table" columns={columns} data={data} />
    );
    const rowHeaders = container.querySelectorAll("tbody th[scope='row']");
    expect(rowHeaders.length).toBe(2);
    expect(rowHeaders[0]).toHaveTextContent("Alice");
    expect(rowHeaders[0]).toHaveClass("vf-table__cell", "vf-table__cell--row-header");
    expect(screen.getAllByRole("rowheader").length).toBe(2);
  });

  it("grid mode gives rowHeader columns role=rowheader", () => {
    renderWithTheme(<Table columns={columns} data={data} />);
    expect(screen.getAllByRole("rowheader").length).toBe(2);
    expect(screen.getAllByRole("cell").length).toBe(2);
  });

  it("applies rowTone as data-tone and a class, and rowAttributes on the tr", () => {
    const { container } = renderWithTheme(
      <Table
        as="table"
        columns={columns}
        data={data}
        rowTone={(r) => (r.score < 80 ? "danger" : undefined)}
        rowAttributes={(r) => ({ "data-testid": `row-${r.id}` })}
      />
    );
    const bob = screen.getByTestId("row-b");
    expect(bob.tagName).toBe("TR");
    expect(bob).toHaveAttribute("data-tone", "danger");
    expect(bob).toHaveClass("vf-table__row", "vf-table__row--danger");
    expect(screen.getByTestId("row-a")).not.toHaveAttribute("data-tone");
    expect(container.querySelectorAll("tbody tr").length).toBe(2);
  });

  it("sorts from the th by click and keyboard with aria-sort", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const { container } = renderWithTheme(
      <Table as="table" columns={columns} data={data} onSortChange={onSortChange} />
    );
    const th = screen.getByRole("columnheader", { name: /Score/ });
    expect(th).toHaveAttribute("aria-sort", "none");
    await user.click(th);
    expect(th).toHaveAttribute("aria-sort", "ascending");
    expect(
      container.querySelector("tbody th .vf-table__cell-value")!.textContent
    ).toBe("Bob");
    th.focus();
    await user.keyboard("{Enter}");
    expect(th).toHaveAttribute("aria-sort", "descending");
    expect(onSortChange).toHaveBeenLastCalledWith({ key: "score", direction: "desc" });
  });

  it("empty and loading states span all columns", () => {
    const { container, rerender } = renderWithTheme(
      <Table as="table" columns={columns} data={[]} />
    );
    expect(container.querySelector("tbody td")).toHaveAttribute("colspan", "2");
    expect(container.textContent).toContain("No rows");
    rerender(<Table as="table" columns={columns} data={[]} loading />);
    expect(container.textContent).toContain("Loading…");
  });

  it("onRowClick fires from a tr", async () => {
    const onRowClick = vi.fn();
    renderWithTheme(
      <Table as="table" columns={columns} data={data} onRowClick={onRowClick} />
    );
    await userEvent.click(screen.getByText("Bob"));
    expect(onRowClick).toHaveBeenCalledWith(data[1], 1);
  });
});
