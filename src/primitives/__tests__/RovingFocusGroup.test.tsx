import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RovingFocusGroup, RovingFocusItem } from "../RovingFocusGroup";

describe("RovingFocusGroup", () => {
  const items = ["a", "b", "c"];

  function Group(props: React.ComponentProps<typeof RovingFocusGroup>) {
    return (
      <RovingFocusGroup defaultValue="a" {...props}>
        {items.map((v) => (
          <RovingFocusItem key={v} value={v} data-testid={v}>
            {v}
          </RovingFocusItem>
        ))}
      </RovingFocusGroup>
    );
  }

  it("gives the first item tabindex=0, rest tabindex=-1", () => {
    render(<Group />);
    expect(screen.getByTestId("a").getAttribute("tabindex")).toBe("0");
    expect(screen.getByTestId("b").getAttribute("tabindex")).toBe("-1");
    expect(screen.getByTestId("c").getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowRight moves focus to the next item and updates tabindex", async () => {
    render(<Group orientation="horizontal" />);
    const a = screen.getByTestId("a");
    a.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByTestId("b"));
    expect(screen.getByTestId("b").getAttribute("tabindex")).toBe("0");
    expect(screen.getByTestId("a").getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowLeft moves focus to the previous item", async () => {
    render(<Group orientation="horizontal" defaultValue="b" />);
    const b = screen.getByTestId("b");
    b.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });

  it("vertical orientation uses ArrowDown/ArrowUp", async () => {
    render(<Group orientation="vertical" />);
    screen.getByTestId("a").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByTestId("b"));
  });

  it("loop=true wraps past the end", async () => {
    render(<Group orientation="horizontal" loop defaultValue="c" />);
    screen.getByTestId("c").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });

  it("Home and End jump to first / last", async () => {
    render(<Group orientation="horizontal" defaultValue="b" />);
    screen.getByTestId("b").focus();
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(screen.getByTestId("c"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });

  it("compound shorthand: RovingFocusGroup.Item", () => {
    render(
      <RovingFocusGroup defaultValue="x">
        <RovingFocusGroup.Item value="x" data-testid="x">
          x
        </RovingFocusGroup.Item>
      </RovingFocusGroup>
    );
    expect(screen.getByTestId("x")).toBeInTheDocument();
  });
});
