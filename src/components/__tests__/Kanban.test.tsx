import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Kanban, type KanbanColumn, type KanbanItem } from "../Kanban";

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const items: KanbanItem[] = [
  { id: "1", columnId: "todo", title: "Task 1" },
  { id: "2", columnId: "todo", title: "Task 2" },
  { id: "3", columnId: "doing", title: "Task 3" },
  { id: "4", columnId: "done", title: "Task 4" },
];

function renderItem(item: KanbanItem) {
  return <span>{item.title as string}</span>;
}

describe("Kanban", () => {
  it("renders all columns", () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} />
    );
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders items in their respective columns", () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
    expect(screen.getByText("Task 4")).toBeInTheDocument();
  });

  it("renders search input when searchable", () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} searchable />
    );
    expect(screen.getByRole("textbox", { name: "Search cards" })).toBeInTheDocument();
  });

  it("filters items by search query", async () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} searchable />
    );
    const search = screen.getByRole("textbox", { name: "Search cards" });
    await userEvent.type(search, "Task 1");
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
  });

  it("has group role with Kanban board label", () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} />
    );
    expect(screen.getByRole("group", { name: "Kanban board" })).toBeInTheDocument();
  });

  it("fires onSearch callback when provided", async () => {
    const onSearch = vi.fn();
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        searchable
        onSearch={onSearch}
      />
    );
    const search = screen.getByRole("textbox", { name: "Search cards" });
    await userEvent.type(search, "test");
    expect(onSearch).toHaveBeenCalledWith("t");
  });

  it("renders custom column headers", () => {
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        renderColumnHeader={(col, count) => (
          <span>{`${col.title} (${count})`}</span>
        )}
      />
    );
    expect(screen.getByText("To Do (2)")).toBeInTheDocument();
    expect(screen.getByText("In Progress (1)")).toBeInTheDocument();
  });

  it("Ctrl+ArrowRight fires onItemMove to next column", () => {
    const onItemMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        onItemMove={onItemMove}
      />
    );
    const item = screen.getByText("Task 1").closest("li")!;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowRight", ctrlKey: true });
    expect(onItemMove).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "1",
        fromColumn: "todo",
        toColumn: "doing",
      })
    );
  });

  it("Ctrl+ArrowLeft fires onItemMove to previous column", () => {
    const onItemMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        onItemMove={onItemMove}
      />
    );
    const item = screen.getByText("Task 3").closest("li")!;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowLeft", ctrlKey: true });
    expect(onItemMove).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "3",
        fromColumn: "doing",
        toColumn: "todo",
      })
    );
  });

  it("does not move past first column", () => {
    const onItemMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        onItemMove={onItemMove}
      />
    );
    const item = screen.getByText("Task 1").closest("li")!;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowLeft", ctrlKey: true });
    expect(onItemMove).not.toHaveBeenCalled();
  });

  it("applies at-limit class when WIP limit is reached", () => {
    const wipColumns: KanbanColumn[] = [
      { id: "todo", title: "To Do", wip: 2 },
      { id: "doing", title: "In Progress" },
      { id: "done", title: "Done" },
    ];
    const { container } = renderWithTheme(
      <Kanban columns={wipColumns} items={items} renderItem={renderItem} />
    );
    expect(
      container.querySelector(".vf-kanban__column--at-limit")
    ).toBeInTheDocument();
  });

  it("WIP limit prevents keyboard move into full column", () => {
    const wipColumns: KanbanColumn[] = [
      { id: "todo", title: "To Do", wip: 2 },
      { id: "doing", title: "In Progress" },
      { id: "done", title: "Done" },
    ];
    const onItemMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={wipColumns}
        items={items}
        renderItem={renderItem}
        onItemMove={onItemMove}
      />
    );
    // Try to move task3 from doing to todo (which is at WIP=2)
    const item = screen.getByText("Task 3").closest("li")!;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowLeft", ctrlKey: true });
    expect(onItemMove).not.toHaveBeenCalled();
  });

  it("readOnly prevents keyboard move", () => {
    const onItemMove = vi.fn();
    renderWithTheme(
      <Kanban
        columns={columns}
        items={items}
        renderItem={renderItem}
        onItemMove={onItemMove}
        readOnly
      />
    );
    const item = screen.getByText("Task 1").closest("li")!;
    item.focus();
    fireEvent.keyDown(item, { key: "ArrowRight", ctrlKey: true });
    expect(onItemMove).not.toHaveBeenCalled();
  });

  it("renders item count in default header", () => {
    renderWithTheme(
      <Kanban columns={columns} items={items} renderItem={renderItem} />
    );
    const counts = document.querySelectorAll(".vf-kanban__count");
    const texts = Array.from(counts).map((el) => el.textContent);
    expect(texts).toContain("2");
    expect(texts).toContain("1");
  });
});
