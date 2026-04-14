import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Slot, mergeSlotProps } from "../Slot";
import { _resetWarnings, getLogger, setLogger } from "../../utils/warn";

describe("Slot", () => {
  it("merges slot props onto the single child element", () => {
    render(
      <Slot data-testid="t" data-extra="yes">
        <button type="button">Click</button>
      </Slot>
    );
    const btn = screen.getByTestId("t");
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("data-extra", "yes");
  });

  it("does not introduce a wrapper element", () => {
    const { container } = render(
      <Slot>
        <a href="/">Link</a>
      </Slot>
    );
    // The single rendered child is the <a>.
    expect(container.firstChild?.nodeName).toBe("A");
  });

  it("composes event handlers — child first, slot second", async () => {
    const calls: string[] = [];
    const childClick = vi.fn(() => calls.push("child"));
    const slotClick = vi.fn(() => calls.push("slot"));
    render(
      <Slot onClick={slotClick}>
        <button type="button" onClick={childClick}>
          Go
        </button>
      </Slot>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["child", "slot"]);
  });

  it("merges style — slot first, child overrides", () => {
    render(
      <Slot style={{ color: "red", padding: 8 }}>
        <span style={{ color: "blue" }}>x</span>
      </Slot>
    );
    const el = screen.getByText("x");
    expect(el.style.color).toBe("blue");
    expect(el.style.padding).toBe("8px");
  });

  it("concatenates className", () => {
    render(
      <Slot className="vf-button">
        <a className="link">x</a>
      </Slot>
    );
    expect(screen.getByText("x").className).toBe("vf-button link");
  });

  it("forwards ref to the child element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Slot ref={ref}>
        <a href="/">x</a>
      </Slot>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe("Slot — invalid input", () => {
  let logged: unknown[][];
  const original = getLogger();

  beforeEach(() => {
    logged = [];
    setLogger({ warn: (...args) => logged.push(args) });
    _resetWarnings();
  });

  afterEach(() => {
    setLogger(original);
  });

  it("renders null and warns when child is not a valid element", () => {
    const { container } = render(<Slot>plain text</Slot>);
    expect(container.firstChild).toBeNull();
    expect(logged.length).toBeGreaterThan(0);
  });
});

describe("mergeSlotProps", () => {
  it("only sets slot-defined props (does not clobber child)", () => {
    const merged = mergeSlotProps(
      { id: "slot-id" },
      { id: "child-id", extra: "x" }
    );
    expect(merged.id).toBe("slot-id");
    expect(merged.extra).toBe("x");
  });

  it("composes handlers", () => {
    const childFn = vi.fn();
    const slotFn = vi.fn();
    const merged = mergeSlotProps({ onClick: slotFn }, { onClick: childFn });
    (merged.onClick as () => void)();
    expect(childFn).toHaveBeenCalled();
    expect(slotFn).toHaveBeenCalled();
  });

  it("uses slot handler alone if child has none", () => {
    const slotFn = vi.fn();
    const merged = mergeSlotProps({ onClick: slotFn }, {});
    (merged.onClick as () => void)();
    expect(slotFn).toHaveBeenCalled();
  });
});
