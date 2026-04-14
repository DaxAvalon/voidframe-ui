import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DismissableLayer } from "../DismissableLayer";

describe("DismissableLayer", () => {
  it("calls onEscapeKeyDown on Escape", () => {
    const onEsc = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={onEsc}>
        <div>inside</div>
      </DismissableLayer>
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onEsc).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss for both Escape and outside click", async () => {
    const onDismiss = vi.fn();
    render(
      <>
        <button data-testid="outside">outside</button>
        <DismissableLayer onDismiss={onDismiss}>
          <div data-testid="inside">inside</div>
        </DismissableLayer>
      </>
    );
    // Outside pointer-down
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByTestId("outside"),
    });
    expect(onDismiss).toHaveBeenCalled();
    onDismiss.mockClear();
    // Escape
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it("does not fire when pointer-down target is inside the layer", async () => {
    const onDismiss = vi.fn();
    render(
      <DismissableLayer onDismiss={onDismiss}>
        <div data-testid="inside">inside</div>
      </DismissableLayer>
    );
    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByTestId("inside"),
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("only the topmost layer reacts to Escape", () => {
    const outerEsc = vi.fn();
    const innerEsc = vi.fn();
    render(
      <DismissableLayer onEscapeKeyDown={outerEsc}>
        <DismissableLayer onEscapeKeyDown={innerEsc}>
          <div>inner</div>
        </DismissableLayer>
      </DismissableLayer>
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(innerEsc).toHaveBeenCalledTimes(1);
    expect(outerEsc).not.toHaveBeenCalled();
  });
});
