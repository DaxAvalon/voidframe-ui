// Coverage tests for DragDrop.tsx — keyboard reorder, Droppable render, Draggable keyboard

import { screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  DragDropContext,
  Droppable,
  Draggable,
  Sortable,
} from "../DragDrop";

describe("Draggable keyboard fallback", () => {
  it("picks up on Space and drops on second Space", () => {
    const onDragEnd = vi.fn();
    renderWithTheme(
      <DragDropContext onDragEnd={onDragEnd}>
        <Draggable id="item-1" droppableId="zone" index={0}>
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} {...dragHandleProps} data-testid="handle">
              Item 1
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    const handle = screen.getByTestId("handle");
    // Pick up
    fireEvent.keyDown(handle, { key: " " });
    expect(handle).toHaveAttribute("aria-grabbed", "true");
    // Drop
    fireEvent.keyDown(handle, { key: " " });
    expect(onDragEnd).toHaveBeenCalled();
  });

  it("picks up on Enter and drops on Enter", () => {
    const onDragEnd = vi.fn();
    renderWithTheme(
      <DragDropContext onDragEnd={onDragEnd}>
        <Draggable id="item-2" droppableId="zone" index={0}>
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} {...dragHandleProps} data-testid="handle">
              Item 2
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    const handle = screen.getByTestId("handle");
    fireEvent.keyDown(handle, { key: "Enter" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(onDragEnd).toHaveBeenCalled();
  });

  it("cancels on Escape after pick up", () => {
    const onDragEnd = vi.fn();
    renderWithTheme(
      <DragDropContext onDragEnd={onDragEnd}>
        <Draggable id="item-3" droppableId="zone" index={0}>
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} {...dragHandleProps} data-testid="handle">
              Item 3
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    const handle = screen.getByTestId("handle");
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "Escape" });
    expect(onDragEnd).toHaveBeenCalled();
    const event = onDragEnd.mock.calls[0][0];
    expect(event.destination).toBeNull();
  });

  it("Escape does nothing if not picked", () => {
    const onDragEnd = vi.fn();
    renderWithTheme(
      <DragDropContext onDragEnd={onDragEnd}>
        <Draggable id="item-4">
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} {...dragHandleProps} data-testid="handle">
              Item 4
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    fireEvent.keyDown(screen.getByTestId("handle"), { key: "Escape" });
    expect(onDragEnd).not.toHaveBeenCalled();
  });
});

describe("DragDropContext onDragStart", () => {
  it("fires onDragStart when drag begins", () => {
    const onDragStart = vi.fn();
    renderWithTheme(
      <DragDropContext onDragStart={onDragStart}>
        <Draggable id="d1" droppableId="z" index={2}>
          {({ dragRef, dragHandleProps }) => (
            <div ref={dragRef as never} {...dragHandleProps} data-testid="h">
              D
            </div>
          )}
        </Draggable>
      </DragDropContext>
    );
    // Pick up via keyboard triggers beginDrag which fires onDragStart
    fireEvent.keyDown(screen.getByTestId("h"), { key: " " });
    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({
        draggableId: "d1",
        source: { droppableId: "z", index: 2 },
      })
    );
  });
});

describe("Droppable render prop", () => {
  it("renders children with dropRef and isOver=false", () => {
    renderWithTheme(
      <DragDropContext>
        <Droppable id="drop1">
          {({ isOver }) => (
            <div data-testid="zone">
              {isOver ? "over" : "not-over"}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
    expect(screen.getByTestId("zone").textContent).toBe("not-over");
  });
});

describe("Sortable horizontal keyboard reorder", () => {
  it("ArrowRight moves item forward in horizontal mode", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Sortable
        items={["X", "Y", "Z"]}
        getKey={(i) => i}
        onChange={onChange}
        strategy="horizontal"
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
        )}
      />
    );
    fireEvent.keyDown(screen.getByTestId("item-X"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(["Y", "X", "Z"]);
  });

  it("ArrowLeft moves item backward in horizontal mode", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Sortable
        items={["X", "Y", "Z"]}
        getKey={(i) => i}
        onChange={onChange}
        strategy="horizontal"
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
        )}
      />
    );
    fireEvent.keyDown(screen.getByTestId("item-Y"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(["Y", "X", "Z"]);
  });

  it("non-arrow keys are ignored", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Sortable
        items={["X", "Y"]}
        getKey={(i) => i}
        onChange={onChange}
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps} data-testid={`item-${item}`}>{item}</span>
        )}
      />
    );
    fireEvent.keyDown(screen.getByTestId("item-X"), { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Sortable with handle mode", () => {
  it("does not set draggable on wrapper when handle=true", () => {
    const { container } = renderWithTheme(
      <Sortable
        items={["A"]}
        getKey={(i) => i}
        onChange={() => {}}
        handle
        renderItem={(item, _i, { dragHandleProps }) => (
          <span {...dragHandleProps}>{item}</span>
        )}
      />
    );
    const listitem = container.querySelector("[role='listitem']");
    expect(listitem?.getAttribute("draggable")).toBe("false");
  });
});
