// Expanded coverage tests for Gestures.tsx — Swipeable directions, SwipeActions, Zoomable

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Swipeable, SwipeActions, Zoomable } from "../Gestures";

describe("Swipeable pointer events", () => {
  it("fires onSwipeRight when swiped right past threshold", () => {
    const onSwipeRight = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeRight={onSwipeRight} threshold={50}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 10, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(onSwipeRight).toHaveBeenCalled();
  });

  it("fires onSwipeLeft when swiped left past threshold", () => {
    const onSwipeLeft = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeLeft={onSwipeLeft} threshold={50}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it("fires onSwipeDown when swiped down past threshold", () => {
    const onSwipeDown = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeDown={onSwipeDown} threshold={50}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 100, clientY: 10 });
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(onSwipeDown).toHaveBeenCalled();
  });

  it("fires onSwipeUp when swiped up past threshold", () => {
    const onSwipeUp = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeUp={onSwipeUp} threshold={50}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 100, clientY: 200 });
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(onSwipeUp).toHaveBeenCalled();
  });

  it("does not fire swipe when movement is below threshold", () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft} threshold={50}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 120, clientY: 100 });
    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("calls original onPointerDown/onPointerUp if provided", () => {
    const onPD = vi.fn();
    const onPU = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onPointerDown={onPD} onPointerUp={onPU}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(el, { clientX: 0, clientY: 0 });
    expect(onPD).toHaveBeenCalled();
    expect(onPU).toHaveBeenCalled();
  });

  it("handles pointerUp without prior pointerDown gracefully", () => {
    const { container } = renderWithTheme(
      <Swipeable onSwipeRight={() => {}}>
        <span>Content</span>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable")!;
    // Should not throw
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
  });
});

describe("SwipeActions pointer events", () => {
  it("renders without leading/trailing when not provided", () => {
    const { container } = renderWithTheme(
      <SwipeActions>
        <div>Item</div>
      </SwipeActions>
    );
    expect(container.querySelector(".vf-swipe-actions__leading")).not.toBeInTheDocument();
    expect(container.querySelector(".vf-swipe-actions__trailing")).not.toBeInTheDocument();
  });

  it("content starts at transform translateX(0px)", () => {
    const { container } = renderWithTheme(
      <SwipeActions trailingActions={<SwipeActions.Action>Del</SwipeActions.Action>}>
        <div>Item</div>
      </SwipeActions>
    );
    const content = container.querySelector(".vf-swipe-actions__content") as HTMLElement;
    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("pointer down then pointer up snaps to closed position", () => {
    const { container } = renderWithTheme(
      <SwipeActions
        trailingActions={<SwipeActions.Action>Del</SwipeActions.Action>}
        actionWidth={80}
      >
        <div>Item</div>
      </SwipeActions>
    );
    const content = container.querySelector(".vf-swipe-actions__content") as HTMLElement;
    fireEvent.pointerDown(content, { clientX: 200, pointerId: 1 });
    // Small move — below half threshold, should snap back to 0
    fireEvent.pointerUp(content);
    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("pointerMove without prior pointerDown does nothing", () => {
    const { container } = renderWithTheme(
      <SwipeActions trailingActions={<SwipeActions.Action>Del</SwipeActions.Action>}>
        <div>Item</div>
      </SwipeActions>
    );
    const content = container.querySelector(".vf-swipe-actions__content") as HTMLElement;
    fireEvent.pointerMove(content, { clientX: 100 });
    expect(content.style.transform).toBe("translateX(0px)");
  });

  it("SwipeAction default tone is neutral", () => {
    const { container } = renderWithTheme(
      <SwipeActions.Action>Act</SwipeActions.Action>
    );
    expect(container.querySelector(".vf-swipe-actions__action--neutral")).toBeInTheDocument();
  });

  it("SwipeAction applies custom className", () => {
    const { container } = renderWithTheme(
      <SwipeActions.Action className="custom">Act</SwipeActions.Action>
    );
    expect(container.querySelector(".custom")).toBeInTheDocument();
  });
});

describe("Zoomable extended", () => {
  it("zoom out button decreases level", async () => {
    renderWithTheme(
      <Zoomable defaultScale={1}>
        <div>Content</div>
      </Zoomable>
    );
    await userEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("reset button resets to 100%", async () => {
    renderWithTheme(
      <Zoomable defaultScale={2}>
        <div>Content</div>
      </Zoomable>
    );
    expect(screen.getByText("200%")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("clamps to min scale", async () => {
    renderWithTheme(
      <Zoomable defaultScale={0.5} min={0.5} step={0.1}>
        <div>Content</div>
      </Zoomable>
    );
    await userEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("clamps to max scale", async () => {
    renderWithTheme(
      <Zoomable defaultScale={4} max={4} step={0.1}>
        <div>Content</div>
      </Zoomable>
    );
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("400%")).toBeInTheDocument();
  });

  it("controlled scale via prop", () => {
    renderWithTheme(
      <Zoomable scale={1.5}>
        <div>Content</div>
      </Zoomable>
    );
    expect(screen.getByText("150%")).toBeInTheDocument();
  });

  it("wheel event changes zoom", () => {
    const onScaleChange = vi.fn();
    const { container } = renderWithTheme(
      <Zoomable onScaleChange={onScaleChange}>
        <div>Content</div>
      </Zoomable>
    );
    const viewport = container.querySelector(".vf-zoomable__viewport")!;
    fireEvent.wheel(viewport, { deltaY: -10 });
    expect(onScaleChange).toHaveBeenCalled();
  });
});
