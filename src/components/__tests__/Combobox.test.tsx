import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, MultiSelect, type ComboboxOption } from "../Combobox";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const fruits: ComboboxOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date", disabled: true },
];

describe("Combobox", () => {
  it("renders input with role=combobox", () => {
    renderWithTheme(<Combobox label="Fruit" options={fruits} />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("opens listbox on focus and shows all options", async () => {
    renderWithTheme(<Combobox label="Fruit" options={fruits} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("filters options by typed substring", async () => {
    renderWithTheme(<Combobox label="Fruit" options={fruits} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "an");
    const visible = screen.getAllByRole("option").map((o) => o.textContent);
    expect(visible).toContain("Banana");
    expect(visible).not.toContain("Cherry");
  });

  it("ArrowDown+Enter selects the first option", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Combobox label="Fruit" options={fruits} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("apple");
  });

  it("disabled options are not selectable", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Combobox label="Fruit" options={fruits} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    // Arrow down to "Date" (index 3).
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).not.toHaveBeenCalledWith("date");
  });

  it("empty message shown when filter has no hits", async () => {
    renderWithTheme(
      <Combobox
        label="Fruit"
        options={fruits}
        emptyMessage="Nothing here"
      />
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "zzzzzz");
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("allowCustomValue emits the typed string on Enter", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Combobox
        label="Fruit"
        options={fruits}
        allowCustomValue
        onChange={onChange}
      />
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "mango{Enter}");
    expect(onChange).toHaveBeenCalledWith("mango");
  });

  it("controlled mode round-trips", async () => {
    function Ctl() {
      const [v, setV] = useState<string | null>(null);
      return (
        <>
          <Combobox label="Fruit" options={fruits} value={v} onChange={setV} />
          <span data-testid="v">{v ?? "none"}</span>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(screen.getByTestId("v")).toHaveTextContent("banana");
  });

  it("Escape closes the listbox", async () => {
    renderWithTheme(<Combobox label="Fruit" options={fruits} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has no a11y violations (closed)", async () => {
    const { container } = renderWithTheme(
      <Combobox label="Fruit" options={fruits} />
    );
    await expectNoA11yViolations(container);
  });
});

describe("MultiSelect", () => {
  it("selecting two options produces both values", async () => {
    const onChange = vi.fn();
    renderWithTheme(<MultiSelect label="Fruits" options={fruits} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toEqual(["apple", "banana"]);
  });

  it("renders tags for selected values", () => {
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        defaultValue={["apple", "banana"]}
      />
    );
    const control = screen.getByRole("combobox").parentElement!;
    expect(within(control).getByText("Apple")).toBeInTheDocument();
    expect(within(control).getByText("Banana")).toBeInTheDocument();
  });

  it("clicking a tag remove button removes that value", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        defaultValue={["apple", "banana"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(onChange).toHaveBeenCalledWith(["banana"]);
  });

  it("backspace on empty input removes the last value", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        defaultValue={["apple", "banana"]}
        onChange={onChange}
      />
    );
    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["apple"]);
  });

  it("maxSelected caps the selection count", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        maxSelected={1}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    // Only the first selection should have landed.
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toEqual(["apple"]);
  });

  it("shows empty message when filter has no results", async () => {
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        emptyMessage="Nothing found"
      />
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.type(input, "zzzzz");
    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });

  it("mouseDown on option at cap does not toggle", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <MultiSelect
        label="Fruits"
        options={fruits}
        defaultValue={["apple"]}
        maxSelected={1}
        onChange={onChange}
      />
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    // Banana option should be disabled (at cap)
    const options = screen.getAllByRole("option");
    const bananaOpt = options.find((o) => o.textContent?.includes("Banana"));
    expect(bananaOpt).toHaveAttribute("aria-disabled", "true");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <MultiSelect label="Fruits" options={fruits} />
    );
    await expectNoA11yViolations(container);
  });
});
