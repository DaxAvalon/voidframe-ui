import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DragDropContext, Sortable, Draggable, Droppable } from "../DragDrop";

describe("DragDrop surface", () => {
  it("Sortable renders items", () => {
    const { container } = renderWithTheme(
      <Sortable
        items={["a", "b", "c"]}
        getKey={(item) => item}
        renderItem={(item) => <div data-testid={item}>{item}</div>}
        onReorder={() => {}}
      />
    );
    expect(container.textContent).toContain("a");
    expect(container.textContent).toContain("b");
    expect(container.textContent).toContain("c");
  });

  it("DragDropContext + Draggable + Droppable render", () => {
    const { container } = renderWithTheme(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable id="zone1">
          {(props) => <div {...props}><Draggable id="d1">{(dp) => <div {...dp}>drag</div>}</Draggable></div>}
        </Droppable>
      </DragDropContext>
    );
    expect(container.textContent).toContain("drag");
  });
});
