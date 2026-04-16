import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Transfer, type TransferItem } from "../Transfer";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const items: TransferItem[] = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Bravo" },
  { key: "c", label: "Charlie" },
  { key: "d", label: "Delta" },
];

describe("Transfer", () => {
  it("renders both panels with correct item distribution", () => {
    renderWithTheme(
      <Transfer items={items} defaultValue={["b", "d"]} />
    );
    const listboxes = screen.getAllByRole("listbox");
    expect(listboxes).toHaveLength(2);

    // Available panel (left) should have Alpha and Charlie
    const leftOptions = listboxes[0]!.querySelectorAll("[role='option']");
    expect(leftOptions).toHaveLength(2);
    expect(leftOptions[0]).toHaveTextContent("Alpha");
    expect(leftOptions[1]).toHaveTextContent("Charlie");

    // Selected panel (right) should have Bravo and Delta
    const rightOptions = listboxes[1]!.querySelectorAll("[role='option']");
    expect(rightOptions).toHaveLength(2);
    expect(rightOptions[0]).toHaveTextContent("Bravo");
    expect(rightOptions[1]).toHaveTextContent("Delta");
  });

  it("renders custom titles via titles prop", () => {
    renderWithTheme(
      <Transfer
        items={items}
        defaultValue={[]}
        titles={["Source", "Target"]}
      />
    );
    expect(screen.getByText(/^Source/)).toBeInTheDocument();
    expect(screen.getByText(/^Target/)).toBeInTheDocument();
  });

  it("uncontrolled: items move between panels on button click", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} onChange={onChange} />
    );
    const listboxes = screen.getAllByRole("listbox");

    // Check "Alpha" in left panel
    const alphaOption = listboxes[0]!.querySelectorAll("[role='option']")[0]!;
    await userEvent.click(alphaOption);

    // Click "move selected right" button
    await userEvent.click(
      screen.getByRole("button", { name: "Move selected right" })
    );
    expect(onChange).toHaveBeenCalledWith(["a"]);

    // Alpha should now be in the right panel
    const rightOptions = screen
      .getAllByRole("listbox")[1]!
      .querySelectorAll("[role='option']");
    expect(rightOptions).toHaveLength(1);
    expect(rightOptions[0]).toHaveTextContent("Alpha");
  });

  it("controlled: value prop determines selected panel contents, onChange fires", async () => {
    function Controlled() {
      const [v, setV] = useState<string[]>(["a"]);
      return (
        <>
          <Transfer items={items} value={v} onChange={setV} />
          <button onClick={() => setV(["a", "c"])} data-testid="set">
            set
          </button>
        </>
      );
    }
    renderWithTheme(<Controlled />);

    // Initially "a" is selected (right panel)
    let rightOptions = screen
      .getAllByRole("listbox")[1]!
      .querySelectorAll("[role='option']");
    expect(rightOptions).toHaveLength(1);
    expect(rightOptions[0]).toHaveTextContent("Alpha");

    // External state change
    await userEvent.click(screen.getByTestId("set"));
    rightOptions = screen
      .getAllByRole("listbox")[1]!
      .querySelectorAll("[role='option']");
    expect(rightOptions).toHaveLength(2);
    expect(rightOptions[0]).toHaveTextContent("Alpha");
    expect(rightOptions[1]).toHaveTextContent("Charlie");
  });

  it("selects item via checkbox click with visual selection state", async () => {
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} />
    );
    const listboxes = screen.getAllByRole("listbox");
    const firstOption = listboxes[0]!.querySelectorAll("[role='option']")[0]!;

    // Not selected initially
    expect(firstOption).not.toHaveClass("vf-transfer__item--selected");

    // Click to check
    await userEvent.click(firstOption);
    expect(firstOption).toHaveClass("vf-transfer__item--selected");
    expect(firstOption).toHaveAttribute("aria-selected", "true");
  });

  it("double-click moves item immediately", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} onChange={onChange} />
    );
    const listboxes = screen.getAllByRole("listbox");
    const alphaOption = listboxes[0]!.querySelectorAll("[role='option']")[0]!;

    await userEvent.dblClick(alphaOption);
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("search input filters items case-insensitively", async () => {
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} searchable />
    );
    const searchInputs = screen.getAllByPlaceholderText("Search...");
    expect(searchInputs).toHaveLength(2);

    // Type in left search
    await userEvent.type(searchInputs[0]!, "al");

    const leftOptions = screen
      .getAllByRole("listbox")[0]!
      .querySelectorAll("[role='option']");
    expect(leftOptions).toHaveLength(1);
    expect(leftOptions[0]).toHaveTextContent("Alpha");
  });

  it("move all buttons transfer entire panel contents", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} onChange={onChange} />
    );

    // Move all right
    await userEvent.click(
      screen.getByRole("button", { name: "Move all right" })
    );
    expect(onChange).toHaveBeenCalledWith(["a", "b", "c", "d"]);

    // Now move all left
    await userEvent.click(
      screen.getByRole("button", { name: "Move all left" })
    );
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("disabled items cannot be selected or moved", async () => {
    const disabledItems: TransferItem[] = [
      { key: "a", label: "Alpha", disabled: true },
      { key: "b", label: "Bravo" },
    ];
    const onChange = vi.fn();
    renderWithTheme(
      <Transfer items={disabledItems} defaultValue={[]} onChange={onChange} />
    );
    const listboxes = screen.getAllByRole("listbox");
    const disabledOption = listboxes[0]!.querySelectorAll("[role='option']")[0]!;

    expect(disabledOption).toHaveClass("vf-transfer__item--disabled");
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");

    // Click should not select
    await userEvent.click(disabledOption);
    expect(disabledOption).not.toHaveClass("vf-transfer__item--selected");

    // Double-click should not move
    await userEvent.dblClick(disabledOption);
    expect(onChange).not.toHaveBeenCalled();

    // Move all right should skip disabled
    await userEvent.click(
      screen.getByRole("button", { name: "Move all right" })
    );
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("disabled prop disables entire component", () => {
    renderWithTheme(
      <Transfer items={items} defaultValue={[]} disabled />
    );
    const root = document.querySelector(".vf-transfer")!;
    expect(root).toHaveClass("vf-transfer--disabled");

    // All action buttons should be disabled
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it.each(["sm", "md", "lg"] as const)(
    "size=%s renders correct CSS class",
    (size) => {
      renderWithTheme(
        <Transfer items={items} defaultValue={[]} size={size} />
      );
      const root = document.querySelector(".vf-transfer")!;
      expect(root).toHaveClass(`vf-transfer--${size}`);
    }
  );

  it("empty panel shows empty state text", () => {
    renderWithTheme(
      <Transfer items={[]} defaultValue={[]} />
    );
    const empties = screen.getAllByText("No items");
    expect(empties).toHaveLength(2);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Transfer
        items={items}
        defaultValue={["a"]}
        titles={["Available", "Selected"]}
      />
    );
    await expectNoA11yViolations(container);
  });
});
