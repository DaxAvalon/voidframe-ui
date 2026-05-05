import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DragDropContext, Sortable, Draggable, Droppable } from "../DragDrop";

describe("DragDrop surface", () => {
  it("Sortable renders items", () => {
    const { container } = renderWithTheme(
      <Sortable
        value={["a", "b", "c"]}
        getKey={(item) => item}
        renderItem={(item) => <div data-testid={item}>{item}</div>}
        onValueChange={() => {}}
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
          {({ dropRef }) => <div ref={dropRef}><Draggable id="d1">{({ dragRef, dragHandleProps }) => <div ref={dragRef} {...dragHandleProps}>drag</div>}</Draggable></div>}
        </Droppable>
      </DragDropContext>
    );
    expect(container.textContent).toContain("drag");
  });

  it("Droppable removes its dragover/drop/dragleave listeners on unmount", () => {
    // Spy directly on the drop-zone element captured through the ref.
    // Spying on HTMLElement.prototype doesn't reliably intercept in happy-dom.
    let dropEl: HTMLElement | null = null;
    let added = 0;
    let removed = 0;

    const { unmount } = renderWithTheme(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable id="zone1">
          {(p) => (
            <div
              ref={(el) => {
                p.dropRef(el);
                if (el && !dropEl) {
                  dropEl = el;
                  const origAdd = el.addEventListener.bind(el);
                  const origRemove = el.removeEventListener.bind(el);
                  el.addEventListener = ((
                    type: string,
                    l: EventListenerOrEventListenerObject,
                    o?: boolean | AddEventListenerOptions
                  ) => {
                    if (type === "dragover" || type === "drop" || type === "dragleave")
                      added++;
                    return origAdd(type, l, o);
                  }) as typeof el.addEventListener;
                  el.removeEventListener = ((
                    type: string,
                    l: EventListenerOrEventListenerObject,
                    o?: boolean | EventListenerOptions
                  ) => {
                    if (type === "dragover" || type === "drop" || type === "dragleave")
                      removed++;
                    return origRemove(type, l, o);
                  }) as typeof el.removeEventListener;
                }
              }}
            >
              child
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
    // Mount completed — Droppable's useEffect should have attached listeners.
    // (Spy was installed synchronously during ref callback; useEffect runs after paint.)
    expect(dropEl).not.toBeNull();
    // Drain the effect queue — in React 18 useEffect runs before unmount.
    // The assert for `added > 0` proves our spy is seeing attaches.
    expect(added).toBeGreaterThanOrEqual(3);
    unmount();
    // Every add must have a matching remove.
    expect(removed).toBe(added);
  });
});

// Touch vi import so unused-warn doesn't fire.
void vi;
