import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FocusScope } from "../FocusScope";

describe("FocusScope", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("auto-focuses the first focusable descendant on mount", () => {
    render(
      <FocusScope>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });

  it("does not auto-focus when autoFocus=false", () => {
    const prev = document.createElement("button");
    document.body.appendChild(prev);
    prev.focus();

    render(
      <FocusScope autoFocus={false}>
        <button data-testid="a">a</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(prev);
    document.body.removeChild(prev);
  });

  // Note: happy-dom doesn't simulate native Tab focus traversal between
  // boundaries, so we test the trap-at-boundary behavior directly:
  // focus the last/first element, send Tab/Shift+Tab, assert wrap.

  it("Tab on the last focusable wraps to first when loop=true", async () => {
    render(
      <FocusScope loop>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusScope>
    );
    screen.getByTestId("b").focus();
    expect(document.activeElement).toBe(screen.getByTestId("b"));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByTestId("a"));
  });

  it("Shift+Tab on the first focusable wraps to last when loop=true", async () => {
    render(
      <FocusScope loop>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(screen.getByTestId("a"));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId("b"));
  });

  it("restores focus to previously-focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(
      <FocusScope>
        <button data-testid="a">a</button>
      </FocusScope>
    );
    expect(document.activeElement).toBe(screen.getByTestId("a"));
    unmount();
    vi.advanceTimersByTime(10);
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
