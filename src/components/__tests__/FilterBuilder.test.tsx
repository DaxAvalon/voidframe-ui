import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import {
  FilterBuilder,
  type FilterField,
  type FilterRule,
} from "../FilterBuilder";

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "string" },
  { key: "age", label: "Age", type: "number" },
  { key: "active", label: "Active", type: "boolean" },
  {
    key: "status",
    label: "Status",
    type: "enum",
    enumValues: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
  },
];

describe("FilterBuilder", () => {
  it("shows add button in empty state", () => {
    renderWithTheme(<FilterBuilder fields={fields} />);
    expect(screen.getByText("Add filter")).toBeInTheDocument();
  });

  it("add creates a new rule", async () => {
    renderWithTheme(<FilterBuilder fields={fields} />);
    await userEvent.click(screen.getByText("Add filter"));
    expect(screen.getByLabelText("Filter field")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter operator")).toBeInTheDocument();
  });

  it("field options show all fields", async () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "" },
        ]}
      />
    );
    const fieldSelect = screen.getByLabelText("Filter field");
    const options = fieldSelect.querySelectorAll("option");
    expect(options.length).toBe(4);
  });

  it("string field gets string operators", async () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "" },
        ]}
      />
    );
    const opSelect = screen.getByLabelText("Filter operator");
    const options = opSelect.querySelectorAll("option");
    const values = Array.from(options).map((o) => o.value);
    expect(values).toContain("contains");
    expect(values).toContain("not_contains");
  });

  it("number field gets number operators", async () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "age", operator: "equals", value: "" },
        ]}
      />
    );
    const opSelect = screen.getByLabelText("Filter operator");
    const options = opSelect.querySelectorAll("option");
    const values = Array.from(options).map((o) => o.value);
    expect(values).toContain("greater_than");
    expect(values).toContain("less_than");
  });

  it("boolean field shows select for value", async () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "active", operator: "equals", value: true },
        ]}
      />
    );
    const valueSelect = screen.getByLabelText("Filter value");
    expect(valueSelect.tagName).toBe("SELECT");
  });

  it("remove button removes a rule", async () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "test" },
        ]}
        onValueChange={handleChange}
      />
    );
    await userEvent.click(screen.getByLabelText("Remove filter"));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("clear all removes all rules", async () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "" },
          { id: "2", field: "age", operator: "equals", value: "" },
        ]}
        onValueChange={handleChange}
      />
    );
    await userEvent.click(screen.getByText("Clear all"));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("works as controlled component", () => {
    const rules: FilterRule[] = [
      { id: "1", field: "name", operator: "equals", value: "test" },
    ];
    function Wrapper() {
      const [val, setVal] = useState(rules);
      return (
        <FilterBuilder fields={fields} value={val} onValueChange={setVal} />
      );
    }
    renderWithTheme(<Wrapper />);
    expect(screen.getByLabelText("Filter value")).toHaveValue("test");
  });

  it("uncontrolled defaultValue renders rules", () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "contains", value: "hello" },
        ]}
      />
    );
    expect(screen.getByLabelText("Filter value")).toHaveValue("hello");
  });

  it("maxRules disables add button when limit reached", () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "" },
        ]}
        maxRules={1}
      />
    );
    expect(screen.getByText("Add filter")).toBeDisabled();
  });

  it("disabled prop disables all inputs", () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "name", operator: "equals", value: "" },
        ]}
        disabled
      />
    );
    expect(screen.getByLabelText("Filter field")).toBeDisabled();
    expect(screen.getByLabelText("Filter operator")).toBeDisabled();
    expect(screen.getByLabelText("Filter value")).toBeDisabled();
  });

  it.each(["sm", "md"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <FilterBuilder fields={fields} size={size} />
    );
    expect(
      container.querySelector(`.vf-filter-builder--${size}`)
    ).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <FilterBuilder fields={fields} />
    );
    await expectNoA11yViolations(container);
  });

  it("between operator renders two value inputs", () => {
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "age", operator: "between", value: [18, 65] },
        ]}
      />
    );
    expect(screen.getByLabelText("Filter value lower bound")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter value upper bound")).toBeInTheDocument();
  });

  it("between operator emits [lo, hi] tuple via onValueChange", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "age", operator: "between", value: ["", ""] },
        ]}
        onValueChange={onValueChange}
      />
    );
    const lo = screen.getByLabelText("Filter value lower bound") as HTMLInputElement;
    const hi = screen.getByLabelText("Filter value upper bound") as HTMLInputElement;
    await userEvent.type(lo, "18");
    await userEvent.type(hi, "65");
    const last = onValueChange.mock.calls.at(-1)![0] as FilterRule[];
    expect(last[0]!.value).toEqual(["18", "65"]);
  });

  it("between operator initializes to ['', ''] when user selects operator", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <FilterBuilder
        fields={fields}
        defaultValue={[
          { id: "1", field: "age", operator: "equals", value: "" },
        ]}
        onValueChange={onValueChange}
      />
    );
    const opSelect = screen.getByLabelText("Filter operator");
    await userEvent.selectOptions(opSelect, "between");
    const last = onValueChange.mock.calls.at(-1)![0] as FilterRule[];
    expect(last[0]!.value).toEqual(["", ""]);
  });
});
