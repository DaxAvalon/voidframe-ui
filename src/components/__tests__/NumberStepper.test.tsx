import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberStepper } from "../NumberStepper";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("NumberStepper", () => {
  it("renders with default value", () => {
    renderWithTheme(<NumberStepper defaultValue={5} label="Qty" />);
    const spinbutton = screen.getByRole("spinbutton");
    expect(spinbutton).toHaveAttribute("aria-valuenow", "5");
  });

  it("increment button increases value by step", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={3} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).toHaveBeenCalledWith(4);
  });

  it("decrement button decreases value by step", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={3} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Decrement" }));
    expect(onValueChange).toHaveBeenCalledWith(2);
  });

  it("value clamped at max — increment disabled", () => {
    renderWithTheme(<NumberStepper defaultValue={10} max={10} />);
    const incBtn = screen.getByRole("button", { name: "Increment" });
    expect(incBtn).toBeDisabled();
  });

  it("value clamped at min — decrement disabled", () => {
    renderWithTheme(<NumberStepper defaultValue={0} min={0} />);
    const decBtn = screen.getByRole("button", { name: "Decrement" });
    expect(decBtn).toBeDisabled();
  });

  it("custom step (e.g., step=5)", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={10} step={5} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).toHaveBeenCalledWith(15);
    await userEvent.click(screen.getByRole("button", { name: "Decrement" }));
    expect(onValueChange).toHaveBeenCalledWith(10);
  });

  it("controlled: value/onValueChange", async () => {
    function Controlled() {
      const [v, setV] = useState(7);
      return (
        <>
          <NumberStepper value={v} onValueChange={setV} />
          <span data-testid="readout">{v}</span>
        </>
      );
    }
    renderWithTheme(<Controlled />);
    expect(screen.getByTestId("readout")).toHaveTextContent("7");
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(screen.getByTestId("readout")).toHaveTextContent("8");
  });

  it("uncontrolled: defaultValue", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={2} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it("disabled disables both buttons and input", () => {
    renderWithTheme(<NumberStepper defaultValue={5} disabled />);
    expect(screen.getByRole("button", { name: "Decrement" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increment" })).toBeDisabled();
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  it("readOnly prevents changes", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={5} readOnly onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("formatValue customizes display", () => {
    renderWithTheme(
      <NumberStepper
        defaultValue={5}
        formatValue={(v) => `$${v}`}
      />,
    );
    const spinbutton = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(spinbutton.value).toBe("$5");
  });

  it("label renders accessible label", () => {
    renderWithTheme(<NumberStepper defaultValue={1} label="Quantity" />);
    const labelEl = screen.getByText("Quantity");
    expect(labelEl).toBeInTheDocument();
    const spinbutton = screen.getByRole("spinbutton");
    const labelId = labelEl.id;
    expect(spinbutton).toHaveAttribute("aria-labelledby", labelId);
  });

  it("hideInput shows value as text only", () => {
    renderWithTheme(
      <NumberStepper defaultValue={3} hideInput label="Count" />,
    );
    const spinbutton = screen.getByRole("spinbutton");
    expect(spinbutton.tagName.toLowerCase()).toBe("span");
    expect(spinbutton).toHaveTextContent("3");
  });

  it.each(["sm", "md", "lg"] as const)("renders size=%s class", (size) => {
    const { container } = renderWithTheme(
      <NumberStepper defaultValue={0} size={size} />,
    );
    const el = container.querySelector(`.vf-number-stepper--${size}`);
    expect(el).toBeInTheDocument();
  });

  it("ArrowUp increments and ArrowDown decrements", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <NumberStepper defaultValue={5} onValueChange={onValueChange} />,
    );
    const spinbutton = screen.getByRole("spinbutton");
    spinbutton.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenCalledWith(6);
    await userEvent.keyboard("{ArrowDown}");
    expect(onValueChange).toHaveBeenCalledWith(5);
  });

  it("has no a11y violations with role=spinbutton and aria attributes", async () => {
    const { container } = renderWithTheme(
      <NumberStepper
        defaultValue={5}
        min={0}
        max={10}
        label="Quantity"
      />,
    );
    const spinbutton = screen.getByRole("spinbutton");
    expect(spinbutton).toHaveAttribute("aria-valuemin", "0");
    expect(spinbutton).toHaveAttribute("aria-valuemax", "10");
    expect(spinbutton).toHaveAttribute("aria-valuenow", "5");
    await expectNoA11yViolations(container);
  });
});
