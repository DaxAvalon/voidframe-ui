import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Transition } from "../Transition";

describe("Transition", () => {
  it("renders the child when show=true", () => {
    render(
      <Transition show>
        <div data-testid="child">hi</div>
      </Transition>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("does not render when show=false on initial mount", () => {
    render(
      <Transition show={false}>
        <div data-testid="child">hi</div>
      </Transition>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("applies .vf-transition + type modifier class to the child", () => {
    render(
      <Transition show type="scale">
        <div data-testid="child">hi</div>
      </Transition>
    );
    const el = screen.getByTestId("child");
    expect(el).toHaveClass("vf-transition");
    expect(el).toHaveClass("vf-transition--scale");
  });

  it.each(
    ["fade", "scale", "slide-up", "slide-down", "slide-left", "slide-right"] as const
  )("supports type=%s", (type) => {
    render(
      <Transition show type={type}>
        <div data-testid="child">hi</div>
      </Transition>
    );
    expect(screen.getByTestId("child")).toHaveClass(`vf-transition--${type}`);
  });

  it("preserves existing className on the child", () => {
    render(
      <Transition show type="fade">
        <div data-testid="child" className="custom">
          hi
        </div>
      </Transition>
    );
    const el = screen.getByTestId("child");
    expect(el).toHaveClass("custom");
    expect(el).toHaveClass("vf-transition--fade");
  });

  it("injects duration CSS variables when `duration` prop is set", () => {
    render(
      <Transition show duration={300}>
        <div data-testid="child">hi</div>
      </Transition>
    );
    const el = screen.getByTestId("child") as HTMLElement;
    expect(el.style.getPropertyValue("--vf-transition-enter-duration")).toBe("300ms");
    expect(el.style.getPropertyValue("--vf-transition-exit-duration")).toBe("300ms");
  });

  it("`enterDuration` and `exitDuration` can differ", () => {
    render(
      <Transition show enterDuration={200} exitDuration={100}>
        <div data-testid="child">hi</div>
      </Transition>
    );
    const el = screen.getByTestId("child") as HTMLElement;
    expect(el.style.getPropertyValue("--vf-transition-enter-duration")).toBe("200ms");
    expect(el.style.getPropertyValue("--vf-transition-exit-duration")).toBe("100ms");
  });

  it("preserves existing inline style", () => {
    render(
      <Transition show duration={200}>
        <div data-testid="child" style={{ color: "red" }}>
          hi
        </div>
      </Transition>
    );
    const el = screen.getByTestId("child") as HTMLElement;
    expect(el.style.color).toBe("red");
    expect(el.style.getPropertyValue("--vf-transition-enter-duration")).toBe("200ms");
  });
});
