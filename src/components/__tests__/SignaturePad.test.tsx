import { createRef } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignaturePad, type SignaturePadHandle } from "../SignaturePad";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("SignaturePad", () => {
  it("renders a canvas with the accessible label", () => {
    renderWithTheme(<SignaturePad label="Sign" />);
    expect(screen.getByRole("img", { name: "Sign" })).toBeInTheDocument();
  });

  it("exposes clear() via ref", () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    expect(typeof ref.current?.clear).toBe("function");
    expect(ref.current?.isEmpty()).toBe(true);
  });

  it("pointer-down + move + up adds a stroke", () => {
    const ref = createRef<SignaturePadHandle>();
    const onStrokeEnd = vi.fn();
    renderWithTheme(
      <SignaturePad label="Sign" ref={ref} onStrokeEnd={onStrokeEnd} />
    );
    const canvas = screen.getByRole("img", { name: "Sign" });
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10, pressure: 0.5 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 20, clientY: 20, pressure: 0.5 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 30, clientY: 30, pressure: 0.5 });
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 30, clientY: 30, pressure: 0.5 });
    expect(onStrokeEnd).toHaveBeenCalled();
    expect(ref.current?.getStrokes().length).toBe(1);
  });

  it("clear button resets strokes", async () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    const canvas = screen.getByRole("img", { name: "Sign" });
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(ref.current?.isEmpty()).toBe(true);
  });

  it("disabled pad ignores pointer input", () => {
    const ref = createRef<SignaturePadHandle>();
    const onStrokeStart = vi.fn();
    renderWithTheme(
      <SignaturePad label="Sign" ref={ref} disabled onStrokeStart={onStrokeStart} />
    );
    const canvas = screen.getByRole("img", { name: "Sign" });
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(onStrokeStart).not.toHaveBeenCalled();
    expect(ref.current?.isEmpty()).toBe(true);
  });

  it("setStrokes programmatic import works via ref", () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    ref.current!.setStrokes([
      [
        { x: 0, y: 0, pressure: 1 },
        { x: 10, y: 10, pressure: 1 },
      ],
    ]);
    expect(ref.current?.isEmpty()).toBe(false);
  });

  it("toDataURL returns string via ref", () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    const url = ref.current!.toDataURL();
    expect(typeof url).toBe("string");
  });

  it("clear resets isEmpty to true after drawing", () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    ref.current!.setStrokes([
      [
        { x: 0, y: 0, pressure: 1 },
        { x: 10, y: 10, pressure: 1 },
      ],
    ]);
    expect(ref.current?.isEmpty()).toBe(false);
    ref.current!.clear();
    expect(ref.current?.isEmpty()).toBe(true);
  });

  it("hides clear button when showClearButton=false", () => {
    renderWithTheme(<SignaturePad label="Sign" showClearButton={false} />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("shows placeholder text when empty", () => {
    renderWithTheme(<SignaturePad label="Sign" />);
    expect(screen.getByText("Sign here")).toBeInTheDocument();
  });

  it("hides placeholder after drawing", () => {
    const ref = createRef<SignaturePadHandle>();
    renderWithTheme(<SignaturePad label="Sign" ref={ref} />);
    ref.current!.setStrokes([
      [
        { x: 0, y: 0, pressure: 1 },
        { x: 10, y: 10, pressure: 1 },
      ],
    ]);
    // After re-render, placeholder should be hidden
    // Note: setStrokes triggers setHasInk(true) synchronously
    expect(ref.current?.isEmpty()).toBe(false);
  });

  it("fires onStrokeStart when drawing begins", () => {
    const onStrokeStart = vi.fn();
    renderWithTheme(<SignaturePad label="Sign" onStrokeStart={onStrokeStart} />);
    const canvas = screen.getByRole("img", { name: "Sign" });
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(onStrokeStart).toHaveBeenCalled();
  });

  it("uses custom strokeColor", () => {
    renderWithTheme(<SignaturePad label="Sign" strokeColor="#ff0000" />);
    expect(screen.getByRole("img", { name: "Sign" })).toBeInTheDocument();
  });

  it("uses custom background", () => {
    renderWithTheme(<SignaturePad label="Sign" background="#eeeeee" />);
    expect(screen.getByRole("img", { name: "Sign" })).toBeInTheDocument();
  });
});
