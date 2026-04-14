import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input, Select, Textarea, Toggle } from "../Form";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Input", () => {
  it("renders with placeholder", () => {
    renderWithTheme(<Input placeholder="name" onChange={() => {}} value="" />);
    expect(screen.getByPlaceholderText("name")).toBeInTheDocument();
  });

  it("fires onChange when typed", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Input value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders the label above when given", () => {
    renderWithTheme(
      <Input label="NAME" value="" onChange={() => {}} placeholder="x" />
    );
    expect(screen.getByText("NAME")).toBeInTheDocument();
  });

  it("respects `type` prop", () => {
    renderWithTheme(
      <Input type="email" value="" onChange={() => {}} placeholder="email" />
    );
    expect(screen.getByPlaceholderText("email")).toHaveAttribute(
      "type",
      "email"
    );
  });
});

describe("Textarea", () => {
  it("renders", () => {
    renderWithTheme(
      <Textarea value="" onChange={() => {}} placeholder="notes" />
    );
    expect(screen.getByPlaceholderText("notes")).toBeInTheDocument();
  });

  it("respects `rows`", () => {
    renderWithTheme(<Textarea rows={8} value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });
});

describe("Toggle", () => {
  it("renders with role=switch and aria-checked", () => {
    renderWithTheme(<Toggle checked={false} onChange={() => {}} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("fires onChange on click", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Toggle checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles on Space", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Toggle checked={false} onChange={onChange} />);
    const sw = screen.getByRole("switch");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles on Enter", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Toggle checked={true} onChange={onChange} />);
    const sw = screen.getByRole("switch");
    sw.focus();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe("Select", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("renders all options", () => {
    renderWithTheme(<Select options={options} value="a" onChange={() => {}} />);
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
  });

  it("emits new value from onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Select options={options} value="a" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("renders a visible label when given", () => {
    renderWithTheme(
      <Select label="ENV" options={options} value="a" onChange={() => {}} />
    );
    expect(screen.getByText("ENV")).toBeInTheDocument();
  });

  it("Input has no a11y violations when labeled", async () => {
    const { container } = renderWithTheme(
      <Input
        label="EMAIL"
        value=""
        onChange={() => {}}
        placeholder="you@example.com"
      />
    );
    await expectNoA11yViolations(container);
  });
});
