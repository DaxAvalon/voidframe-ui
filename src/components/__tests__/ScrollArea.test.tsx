// Coverage tests for ScrollArea (ScrollArea.tsx).
// Asserts on classes and inline styles, not measured layout.

import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { ScrollArea } from "../ScrollArea";

describe("ScrollArea", () => {
  it("renders the .vf-scroll-area class", () => {
    const { container } = renderWithTheme(
      <ScrollArea>
        <div>scrollable</div>
      </ScrollArea>
    );
    expect(container.querySelector(".vf-scroll-area")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { container } = renderWithTheme(
      <ScrollArea>
        <div>my-child</div>
      </ScrollArea>
    );
    expect(container.textContent).toContain("my-child");
  });

  it("defaults to vertical orientation modifier class", () => {
    const { container } = renderWithTheme(
      <ScrollArea>
        <div>v</div>
      </ScrollArea>
    );
    expect(
      container.querySelector(".vf-scroll-area--vertical")
    ).toBeInTheDocument();
  });

  it("supports orientation='horizontal'", () => {
    const { container } = renderWithTheme(
      <ScrollArea orientation="horizontal">
        <div>h</div>
      </ScrollArea>
    );
    expect(
      container.querySelector(".vf-scroll-area--horizontal")
    ).toBeInTheDocument();
  });

  it("supports orientation='both'", () => {
    const { container } = renderWithTheme(
      <ScrollArea orientation="both">
        <div>b</div>
      </ScrollArea>
    );
    expect(
      container.querySelector(".vf-scroll-area--both")
    ).toBeInTheDocument();
  });

  it("supports type='always' / 'hover' modifier classes", () => {
    const { container, rerender } = renderWithTheme(
      <ScrollArea type="always">
        <div>a</div>
      </ScrollArea>
    );
    expect(
      container.querySelector(".vf-scroll-area--always")
    ).toBeInTheDocument();

    rerender(
      <ScrollArea type="hover">
        <div>a</div>
      </ScrollArea>
    );
    expect(
      container.querySelector(".vf-scroll-area--hover")
    ).toBeInTheDocument();
  });

  it("renders height/maxHeight/width as inline styles", () => {
    const { container } = renderWithTheme(
      <ScrollArea height={200} maxHeight="50vh" width={300}>
        <div>z</div>
      </ScrollArea>
    );
    const root = container.querySelector(".vf-scroll-area") as HTMLElement;
    expect(root.style.height).toBe("200px");
    expect(root.style.maxHeight).toBe("50vh");
    expect(root.style.width).toBe("300px");
  });

  it("merges custom className", () => {
    const { container } = renderWithTheme(
      <ScrollArea className="custom-cls">
        <div>x</div>
      </ScrollArea>
    );
    const root = container.querySelector(".vf-scroll-area") as HTMLElement;
    expect(root.className).toContain("custom-cls");
  });

  it("forwards a ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <ScrollArea ref={ref}>
        <div>x</div>
      </ScrollArea>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.classList.contains("vf-scroll-area")).toBe(true);
  });

  it("renders empty when given no children", () => {
    const { container } = renderWithTheme(<ScrollArea />);
    expect(container.querySelector(".vf-scroll-area")).toBeInTheDocument();
  });
});
