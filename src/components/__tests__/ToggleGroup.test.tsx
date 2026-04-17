import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, type ToggleGroupProps } from "../ToggleGroup";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const items = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Gamma" },
];

describe("ToggleGroup", () => {
  it("renders all items as buttons", () => {
    renderWithTheme(<ToggleGroup items={items} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent("Alpha");
    expect(buttons[1]).toHaveTextContent("Beta");
    expect(buttons[2]).toHaveTextContent("Gamma");
  });

  it("uncontrolled: clicking toggles active state", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup items={items} onValueChange={onValueChange} />
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("multiple items can be active simultaneously", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup items={items} onValueChange={onValueChange} />
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]!);
    await userEvent.click(buttons[2]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
  });

  it("controlled: value determines active, onValueChange fires", async () => {
    function Controlled() {
      const [v, setV] = useState<string[]>(["b"]);
      return (
        <>
          <ToggleGroup items={items} value={v} onValueChange={setV} />
          <button onClick={() => setV(["a", "c"])} data-testid="set">
            set
          </button>
        </>
      );
    }
    renderWithTheme(<Controlled />);
    const buttons = screen.getAllByRole("button");
    // Initially only "b" is active
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    // Set externally
    await userEvent.click(screen.getByTestId("set"));
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
  });

  it("defaultValue sets initial active items", () => {
    renderWithTheme(
      <ToggleGroup items={items} defaultValue={["a", "c"]} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
  });

  it("clicking active item deselects it", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup
        items={items}
        defaultValue={["a", "b"]}
        onValueChange={onValueChange}
      />
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]!);
    expect(onValueChange).toHaveBeenLastCalledWith(["b"]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("allowEmpty={false} prevents deselecting last item", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup
        items={items}
        defaultValue={["a"]}
        allowEmpty={false}
        onValueChange={onValueChange}
      />
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]!);
    // Should not have changed — "a" is still active
    expect(onValueChange).not.toHaveBeenCalled();
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled items cannot be toggled", async () => {
    const disabledItems = [
      { key: "a", label: "Alpha" },
      { key: "b", label: "Beta", disabled: true },
      { key: "c", label: "Gamma" },
    ];
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup items={disabledItems} onValueChange={onValueChange} />
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[1]!);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(buttons[1]).toBeDisabled();
  });

  it("disabled prop disables entire group", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup items={items} disabled onValueChange={onValueChange} />
    );
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
    await userEvent.click(buttons[0]!);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each(["default", "ghost", "accent"] as const)(
    "variant=%s applies correct class",
    (variant) => {
      renderWithTheme(<ToggleGroup items={items} variant={variant} />);
      const group = screen.getByRole("group");
      expect(group.className).toContain(`vf-toggle-group--${variant}`);
    }
  );

  it.each(["sm", "md", "lg"] as const)(
    "size=%s applies correct class",
    (size) => {
      renderWithTheme(<ToggleGroup items={items} size={size} />);
      const group = screen.getByRole("group");
      expect(group.className).toContain(`vf-toggle-group--${size}`);
    }
  );

  it('orientation="vertical" adds vertical class', () => {
    renderWithTheme(<ToggleGroup items={items} orientation="vertical" />);
    const group = screen.getByRole("group");
    expect(group.className).toContain("vf-toggle-group--vertical");
  });

  it("keyboard: Space/Enter toggles focused item", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup items={items} onValueChange={onValueChange} />
    );
    const buttons = screen.getAllByRole("button");
    buttons[0]!.focus();
    await userEvent.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <ToggleGroup items={items} defaultValue={["a"]} />
    );
    await expectNoA11yViolations(container);
    // Verify structural a11y attributes
    const group = screen.getByRole("group");
    expect(group).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toHaveAttribute("aria-pressed");
    }
  });
});
