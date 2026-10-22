import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { Kanban, type KanbanItem, type KanbanMoveEvent } from "../Kanban";

interface Card extends KanbanItem {
  title: string;
  points: number;
}

const columns = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done", wip: 1 },
];
const cards: Card[] = [
  { id: "a", columnId: "todo", title: "Alpha", points: 1 },
  { id: "b", columnId: "todo", title: "Beta", points: 2 },
  { id: "c", columnId: "todo", title: "Gamma", points: 3 },
  { id: "d", columnId: "doing", title: "Delta", points: 5 },
];

function item(id: string): HTMLElement {
  return screen.getByText(id).closest("li") as HTMLElement;
}

describe("Kanban move events", () => {
  it("is generic: renderItem, getSearchable and onItemClick receive the card type", () => {
    const onItemClick = vi.fn<(card: Card) => void>();
    renderWithTheme(
      <Kanban<Card>
        columns={columns}
        items={cards}
        renderItem={(card) => <span>{card.title.toUpperCase()}</span>}
        getSearchable={(card) => [card.title, String(card.points)]}
        onItemClick={(card) => onItemClick(card)}
      />
    );
    expect(screen.getByText("ALPHA")).toBeInTheDocument();
    fireEvent.click(screen.getByText("DELTA"));
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "d", points: 5 }));
  });

  it("keyboard moves report the resulting order of both columns", () => {
    const onMove = vi.fn<(e: KanbanMoveEvent) => void>();
    renderWithTheme(
      <Kanban columns={columns} items={cards} renderItem={(c) => <span>{c.id}</span>} onItemMove={onMove} />
    );
    fireEvent.keyDown(item("b"), { key: "ArrowRight", ctrlKey: true });
    expect(onMove).toHaveBeenCalledWith({
      itemId: "b",
      fromColumn: "todo",
      toColumn: "doing",
      toIndex: 1,
      toColumnOrder: ["d", "b"],
      fromColumnOrder: ["a", "c"],
    });
  });

  it("drag within a column reports one order for both fields and respects the source removal", () => {
    const onMove = vi.fn<(e: KanbanMoveEvent) => void>();
    renderWithTheme(
      <Kanban columns={columns} items={cards} renderItem={(c) => <span>{c.id}</span>} onItemMove={onMove} />
    );
    const a = item("a");
    const c = item("c");
    fireEvent.dragStart(a);
    // Drop on the lower half of "c": index 3 before removal, 2 after.
    vi.spyOn(c, "getBoundingClientRect").mockReturnValue({
      top: 100,
      height: 40,
      bottom: 140,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);
    fireEvent.dragOver(c, { clientY: 130 });
    fireEvent.drop(screen.getByRole("list", { name: "Todo" }));
    expect(onMove).toHaveBeenCalledTimes(1);
    const ev = onMove.mock.calls[0]![0];
    expect(ev.toIndex).toBe(2);
    expect(ev.toColumnOrder).toEqual(["b", "c", "a"]);
    expect(ev.fromColumnOrder).toEqual(["b", "c", "a"]);
  });

  it("drag to another column appends by default and lists both resulting columns", () => {
    const onMove = vi.fn<(e: KanbanMoveEvent) => void>();
    renderWithTheme(
      <Kanban columns={columns} items={cards} renderItem={(c) => <span>{c.id}</span>} onItemMove={onMove} />
    );
    fireEvent.dragStart(item("a"));
    const doing = screen.getByRole("list", { name: "Doing" });
    fireEvent.dragOver(doing);
    fireEvent.drop(doing);
    expect(onMove.mock.calls[0]![0]).toMatchObject({
      itemId: "a",
      fromColumn: "todo",
      toColumn: "doing",
      toIndex: 1,
      toColumnOrder: ["d", "a"],
      fromColumnOrder: ["b", "c"],
    });
  });

  it("suppresses the click that follows a drag, and activates on Enter / Space", () => {
    const onItemClick = vi.fn();
    renderWithTheme(
      <Kanban columns={columns} items={cards} renderItem={(c) => <span>{c.id}</span>} onItemClick={onItemClick} />
    );
    const a = item("a");
    expect(a).toHaveClass("vf-kanban__item--clickable");
    fireEvent.dragStart(a);
    fireEvent.dragEnd(a);
    fireEvent.click(a);
    expect(onItemClick).not.toHaveBeenCalled();
    fireEvent.keyDown(a, { key: "Enter" });
    fireEvent.keyDown(a, { key: " " });
    expect(onItemClick).toHaveBeenCalledTimes(2);
    expect(onItemClick.mock.calls[0]![0]).toMatchObject({ id: "a" });
  });

  it("columnMaxHeight sets the column height variable", () => {
    renderWithTheme(
      <Kanban columns={columns} items={cards} renderItem={(c) => <span>{c.id}</span>} columnMaxHeight={320} data-testid="board" />
    );
    expect(screen.getByTestId("board").style.getPropertyValue("--vf-kanban-column-max-height")).toBe("320px");
  });
});
