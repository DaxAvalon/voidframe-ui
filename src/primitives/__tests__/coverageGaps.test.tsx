// Coverage-gap tests for primitives:
//   - DismissableLayer: onPointerDownOutside callback
//   - FocusScope: trapped with no focusables, restoreFocus=false, loop=false
//   - Presence: transition/animation exit flow

import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DismissableLayer } from "../DismissableLayer";
import { FocusScope } from "../FocusScope";
import { Presence } from "../Presence";

// ── DismissableLayer: onPointerDownOutside ───────────────

describe("DismissableLayer — onPointerDownOutside callback", () => {
  it("calls onPointerDownOutside (not just onDismiss) on outside click", async () => {
    const onPointerDown = vi.fn();
    render(
      <>
        <button data-testid="outside">out</button>
        <DismissableLayer onPointerDownOutside={onPointerDown}>
          <div>inside</div>
        </DismissableLayer>
      </>
    );
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByTestId("outside"),
    });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it("ignores non-Escape keydown events", () => {
    const onEsc = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={onEsc}>
        <div>inside</div>
      </DismissableLayer>
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });
    expect(onEsc).not.toHaveBeenCalled();
  });
});

// ── FocusScope: edge cases ───────────────────────────────

describe("FocusScope — edge cases", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("focuses the container itself when no focusable children exist", () => {
    render(
      <FocusScope data-testid="scope">
        <span>no focusables here</span>
      </FocusScope>
    );
    // The container div has tabIndex=-1 and should be focused
    const scope = screen.getByTestId("scope");
    expect(document.activeElement).toBe(scope);
  });

  it("traps Tab when no focusable children exist (prevents default)", () => {
    render(
      <FocusScope trapped data-testid="scope">
        <span>text</span>
      </FocusScope>
    );
    const scope = screen.getByTestId("scope");
    scope.focus();
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(event, "preventDefault");
    act(() => {
      scope.dispatchEvent(event);
    });
    expect(preventSpy).toHaveBeenCalled();
  });

  it("does not trap when trapped=false", async () => {
    render(
      <FocusScope trapped={false} autoFocus={false}>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusScope>
    );
    // With trapped=false, no keydown handler is installed — Tab should not wrap
    screen.getByTestId("b").focus();
    expect(document.activeElement).toBe(screen.getByTestId("b"));
  });

  it("does not auto-focus when autoFocus=false", () => {
    const prev = document.createElement("button");
    document.body.appendChild(prev);
    prev.focus();

    render(
      <FocusScope autoFocus={false}>
        <button data-testid="inner">inner</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(prev);
    document.body.removeChild(prev);
  });

  it("does not restore focus when restoreFocus=false", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <FocusScope restoreFocus={false}>
        <button data-testid="a">a</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(screen.getByTestId("a"));
    unmount();
    vi.advanceTimersByTime(10);
    // Focus should NOT be restored to trigger
    expect(document.activeElement).not.toBe(trigger);
    document.body.removeChild(trigger);
  });

  it("does not wrap when loop=false and Tab on last element", async () => {
    render(
      <FocusScope loop={false} trapped>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusScope>
    );
    screen.getByTestId("b").focus();
    // With loop=false, Tab on last should prevent default but not move focus
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      screen.getByTestId("b").parentElement!.dispatchEvent(event);
    });
    // Focus stays on b since loop=false, preventDefault stops browser Tab
    expect(document.activeElement).toBe(screen.getByTestId("b"));
  });
});

// ── Presence: animation/transition exit ──────────────────

describe("Presence — exit animation flow", () => {
  it("stays mounted during exit animation and unmounts on animationend", () => {
    // Mock getComputedStyle to report an active animation
    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      animationName: "fadeOut",
      animationDuration: "0.3s",
      transitionDuration: "0s",
    }) as unknown as typeof window.getComputedStyle;

    const { rerender, queryByTestId } = render(
      <Presence present>
        <div data-testid="p">content</div>
      </Presence>
    );
    expect(queryByTestId("p")).toBeInTheDocument();

    // Set present=false — should stay mounted because of animation
    rerender(
      <Presence present={false}>
        <div data-testid="p">content</div>
      </Presence>
    );
    // Node should still be mounted waiting for animationend
    const el = queryByTestId("p");
    expect(el).toBeInTheDocument();
    expect(el?.getAttribute("data-state")).toBe("closed");

    // Fire animationend to trigger unmount
    act(() => {
      el!.dispatchEvent(new Event("animationend", { bubbles: true }));
    });
    expect(queryByTestId("p")).not.toBeInTheDocument();

    window.getComputedStyle = origGetComputedStyle;
  });

  it("stays mounted during exit transition and unmounts on transitionend", () => {
    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn().mockReturnValue({
      animationName: "none",
      animationDuration: "0s",
      transitionDuration: "0.2s",
    }) as unknown as typeof window.getComputedStyle;

    const { rerender, queryByTestId } = render(
      <Presence present>
        <div data-testid="p">content</div>
      </Presence>
    );

    rerender(
      <Presence present={false}>
        <div data-testid="p">content</div>
      </Presence>
    );
    const el = queryByTestId("p");
    expect(el).toBeInTheDocument();

    act(() => {
      el!.dispatchEvent(new Event("transitionend", { bubbles: true }));
    });
    expect(queryByTestId("p")).not.toBeInTheDocument();

    window.getComputedStyle = origGetComputedStyle;
  });

  it("renders non-element children as-is when present", () => {
    const { container } = render(
      <Presence present>just text</Presence>
    );
    expect(container.textContent).toBe("just text");
  });

  it("re-enters after exit completes", () => {
    const { rerender, queryByTestId } = render(
      <Presence present>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).toBeInTheDocument();

    // Exit
    rerender(
      <Presence present={false}>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).not.toBeInTheDocument();

    // Re-enter
    rerender(
      <Presence present>
        <div data-testid="p">hi</div>
      </Presence>
    );
    expect(queryByTestId("p")).toBeInTheDocument();
  });
});
