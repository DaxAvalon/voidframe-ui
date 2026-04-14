import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Checkbox,
  DropZone,
  FormField,
  NumberInput,
  Radio,
  RadioGroup,
  SearchInput,
  Slider,
} from "../FormExtended";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Checkbox", () => {
  it("renders with role=checkbox", () => {
    renderWithTheme(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Radio", () => {
  it("renders with role=radio", () => {
    renderWithTheme(<Radio checked onChange={() => {}} />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("fires onChange on click when unchecked", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Radio checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("renders all options", () => {
    renderWithTheme(
      <RadioGroup options={options} value="a" onChange={() => {}} />
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("calls onChange with selected value", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RadioGroup options={options} value="a" onChange={onChange} />
    );
    const [, second] = screen.getAllByRole("radio");
    await userEvent.click(second!);
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Slider", () => {
  it("reflects current value in the range input", () => {
    renderWithTheme(<Slider value={42} onChange={() => {}} />);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("42");
  });

  it("clamps within min/max", () => {
    renderWithTheme(<Slider value={150} onChange={() => {}} max={100} />);
    const el = screen.getByRole("slider") as HTMLInputElement;
    expect(el.max).toBe("100");
  });
});

describe("NumberInput", () => {
  it("renders with value", () => {
    renderWithTheme(<NumberInput value={5} onChange={() => {}} />);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "5"
    );
  });

  it("increments via the + button", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={5} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("decrements via the − button", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={5} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Decrement" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("respects min clamp on decrement", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={0} min={0} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Decrement" }));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});

describe("SearchInput", () => {
  it("renders placeholder", () => {
    renderWithTheme(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("shows a clear button when value is non-empty", () => {
    renderWithTheme(<SearchInput value="q" onChange={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onClear when clear button clicked", async () => {
    const onClear = vi.fn();
    renderWithTheme(
      <SearchInput value="q" onChange={() => {}} onClear={onClear} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("FormField", () => {
  it("shows error when given", () => {
    renderWithTheme(
      <FormField label="NAME" error="Required">
        <input />
      </FormField>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows help when no error", () => {
    renderWithTheme(
      <FormField label="NAME" help="Your full name">
        <input />
      </FormField>
    );
    expect(screen.getByText("Your full name")).toBeInTheDocument();
  });

  it("hides help when error is present", () => {
    renderWithTheme(
      <FormField label="NAME" error="Required" help="Your full name">
        <input />
      </FormField>
    );
    expect(screen.queryByText("Your full name")).not.toBeInTheDocument();
  });

  it("shows required indicator", () => {
    renderWithTheme(
      <FormField label="NAME" required>
        <input />
      </FormField>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});

describe("DropZone", () => {
  it("renders default label", () => {
    renderWithTheme(<DropZone />);
    expect(
      screen.getByText("DROP FILES HERE OR CLICK TO BROWSE")
    ).toBeInTheDocument();
  });

  it("renders custom label when given", () => {
    renderWithTheme(<DropZone label="DROP ASSETS" />);
    expect(screen.getByText("DROP ASSETS")).toBeInTheDocument();
  });
});
