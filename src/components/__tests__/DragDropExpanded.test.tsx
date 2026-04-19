// Expanded tests for DragDrop — DragDropContext, Droppable, Draggable, Sortable, ReorderList

import { screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  DragDropContext,
  Droppable,
  Draggable,
  Sortable,
  ReorderList,
} from "../DragDrop";

describe("DragDropContext (expanded)", () => {
  it("renders children", () => {
    renderWithTheme(
      <DragDropContext>
        <div data-testid="child">Hello</div>
      </DragDropContext>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("throws when Draggable is used outside context", () => {
    // Suppress React error boundary logging
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderWithTheme(
        <Draggable id="a">
          {({ dragRef }) => (
            <div ref={dragRef as never}>Item</div>
          )}
        </Draggable>
      );
    }).toThrow("Draggable / Droppable must be inside <DragDropContext>");
    consoleError.mockRestore();
  });
});

describe("Draggable (expanded)", () => {
  it("renders children with render-prop", () => {
    renderWithTheme(
      <DragDropContext>
        <Draggable id="item-1">
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} data-testid="draggable" {...dragHandleProps}>
              Drag me
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    const el = screen.getByTestId("draggable");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("role", "button");
    expect(el).toHaveAttribute("tabindex", "0");
    expect(el).toHaveAttribute("aria-label", "Drag handle for item-1");
  });

  it("sets draggable attribute on the ref element", () => {
    renderWithTheme(
      <DragDropContext>
        <Draggable id="item-1">
          {({ dragRef }) => (
            <div ref={dragRef as never} data-testid="draggable">
              Drag me
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    expect(screen.getByTestId("draggable")).toHaveAttribute("draggable", "true");
  });
});

describe("Sortable (expanded)", () => {
  it("renders items with correct structure", () => {
    const items = ["Apple", "Banana", "Cherry"];
    renderWithTheme(
      <Sortable
        value={items}
        getKey={(item) => item}
        onValueChange={() => {}}
        renderItem={(item, _index, { dragHandleProps }) => (
          <span {...dragHandleProps}>{item}</span>
        )}
      />
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("applies role=list on container and role=listitem on items", () => {
    const items = ["A", "B"];
    renderWithTheme(
      <Sortable
        value={items}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("applies vf-sortable class and strategy class", () => {
    const { container } = renderWithTheme(
      <Sortable
        value={["X"]}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(item) => <span>{item}</span>}
        strategy="horizontal"
      />
    );
    expect(container.querySelector(".vf-sortable")).toBeInTheDocument();
    expect(container.querySelector(".vf-sortable--horizontal")).toBeInTheDocument();
  });

  it("applies vertical strategy by default", () => {
    const { container } = renderWithTheme(
      <Sortable
        value={["X"]}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(container.querySelector(".vf-sortable--vertical")).toBeInTheDocument();
  });

  it("applies grid strategy class", () => {
    const { container } = renderWithTheme(
      <Sortable
        value={["X"]}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(item) => <span>{item}</span>}
        strategy="grid"
      />
    );
    expect(container.querySelector(".vf-sortable--grid")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Sortable
        value={["X"]}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(item) => <span>{item}</span>}
        className="my-list"
      />
    );
    expect(container.querySelector(".my-list")).toBeInTheDocument();
  });

  it("calls onChange on keyboard arrow reorder", () => {
    const onChange = vi.fn();
    const items = ["A", "B", "C"];

    function TestSortable() {
      const [list, setList] = useState(items);
      return (
        <Sortable
          value={list}
          getKey={(i) => i}
          onValueChange={(next) => {
            setList(next);
            onChange(next);
          }}
          renderItem={(item, _i, { dragHandleProps }) => (
            <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
          )}
        />
      );
    }

    renderWithTheme(<TestSortable />);
    const itemA = screen.getByTestId("item-A");
    fireEvent.keyDown(itemA, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(["B", "A", "C"]);
  });

  it("does not reorder past boundaries with ArrowUp at top", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Sortable
        value={["A", "B"]}
        getKey={(i) => i}
        onValueChange={onChange}
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
        )}
      />
    );
    fireEvent.keyDown(screen.getByTestId("item-A"), { key: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not reorder past boundaries with ArrowDown at bottom", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Sortable
        value={["A", "B"]}
        getKey={(i) => i}
        onValueChange={onChange}
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
        )}
      />
    );
    fireEvent.keyDown(screen.getByTestId("item-B"), { key: "ArrowDown" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("drag handle props include aria-label with item key", () => {
    renderWithTheme(
      <Sortable
        value={["foo"]}
        getKey={(i) => i}
        onValueChange={() => {}}
        renderItem={(_item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid="handle">handle</span>
        )}
      />
    );
    expect(screen.getByTestId("handle")).toHaveAttribute("aria-label", "Drag foo");
  });
});

describe("ReorderList (expanded)", () => {
  it("is the same component as Sortable", () => {
    expect(ReorderList).toBe(Sortable);
  });
});
