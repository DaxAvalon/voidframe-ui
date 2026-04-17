import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cascader, type CascaderOption } from "../Cascader";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const options: CascaderOption[] = [
  {
    value: "usa",
    label: "USA",
    children: [
      {
        value: "ca",
        label: "California",
        children: [
          { value: "sf", label: "San Francisco" },
          { value: "la", label: "Los Angeles" },
        ],
      },
      { value: "ny", label: "New York" },
    ],
  },
  { value: "uk", label: "UK", disabled: true },
  { value: "jp", label: "Japan" },
];

describe("Cascader", () => {
  it("renders trigger with placeholder", () => {
    renderWithTheme(<Cascader options={options} placeholder="Pick a place" />);
    expect(screen.getByText("Pick a place")).toBeInTheDocument();
  });

  it("click opens first panel", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} />);
    await user.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("first-level options render", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByText("UK")).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
  });

  it("click non-leaf opens next panel", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("USA"));
    expect(screen.getByText("California")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("click leaf completes selection and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <Cascader options={options} onValueChange={onChange} />
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("USA"));
    await user.click(screen.getByText("California"));
    await user.click(screen.getByText("San Francisco"));
    expect(onChange).toHaveBeenCalledWith(
      ["usa", "ca", "sf"],
      expect.any(Array)
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("path displayed in trigger after selection", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("USA"));
    await user.click(screen.getByText("California"));
    await user.click(screen.getByText("San Francisco"));
    expect(
      screen.getByText("USA / California / San Francisco")
    ).toBeInTheDocument();
  });

  it("controlled value and onValueChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Cascader
        options={options}
        value={["usa", "ca", "sf"]}
        onValueChange={onChange}
      />
    );
    expect(
      screen.getByText("USA / California / San Francisco")
    ).toBeInTheDocument();
  });

  it("uncontrolled defaultValue", () => {
    renderWithTheme(
      <Cascader options={options} defaultValue={["usa", "ny"]} />
    );
    expect(screen.getByText("USA / New York")).toBeInTheDocument();
  });

  it("disabled options not selectable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <Cascader options={options} onValueChange={onChange} />
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("UK"));
    // Should still be open — UK is disabled
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled prop prevents opening", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} disabled />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <Cascader options={options} size={size} />
    );
    expect(
      container.querySelector(`.vf-cascader--${size}`)
    ).toBeInTheDocument();
  });

  it("escape closes dropdown", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Cascader options={options} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Cascader options={options} label="Location" />
    );
    await expectNoA11yViolations(container);
  });
});
