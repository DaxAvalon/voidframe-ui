import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Swipeable, SwipeActions, Zoomable } from "../Gestures";

describe("Swipeable", () => {
  it("renders children with swipeable class", () => {
    const { container } = renderWithTheme(
      <Swipeable>
        <span>Content</span>
      </Swipeable>
    );
    expect(container.querySelector(".vf-swipeable")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

describe("SwipeActions", () => {
  it("renders content and action panels", () => {
    const { container } = renderWithTheme(
      <SwipeActions
        leadingActions={<SwipeActions.Action>Pin</SwipeActions.Action>}
        trailingActions={<SwipeActions.Action tone="danger">Delete</SwipeActions.Action>}
      >
        <div>Item</div>
      </SwipeActions>
    );
    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByText("Pin")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(container.querySelector(".vf-swipe-actions__leading")).toBeInTheDocument();
    expect(container.querySelector(".vf-swipe-actions__trailing")).toBeInTheDocument();
  });

  it("SwipeAction applies tone class", () => {
    const { container } = renderWithTheme(
      <SwipeActions.Action tone="success">Done</SwipeActions.Action>
    );
    expect(container.querySelector(".vf-swipe-actions__action--success")).toBeInTheDocument();
  });
});

describe("Zoomable", () => {
  it("renders children with zoom controls", () => {
    renderWithTheme(
      <Zoomable>
        <div>Zoom me</div>
      </Zoomable>
    );
    expect(screen.getByText("Zoom me")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset zoom" })).toBeInTheDocument();
  });

  it("shows zoom level percentage", () => {
    renderWithTheme(<Zoomable><div>Content</div></Zoomable>);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("hides controls when controls=false", () => {
    renderWithTheme(<Zoomable controls={false}><div>Content</div></Zoomable>);
    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument();
  });

  it("fires onScaleChange when zoom buttons clicked", async () => {
    const onScaleChange = vi.fn();
    renderWithTheme(
      <Zoomable onScaleChange={onScaleChange}>
        <div>Content</div>
      </Zoomable>
    );
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onScaleChange).toHaveBeenCalled();
  });
});
