import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
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
    renderWithTheme(<Checkbox checked={false} onValueChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} disabled onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled Checkbox is skipped in tab order and reports aria-disabled", () => {
    renderWithTheme(<Checkbox checked={false} disabled onValueChange={() => {}} />);
    const cb = screen.getByRole("checkbox");
    expect(cb.getAttribute("tabindex")).toBe("-1");
    expect(cb.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("Radio", () => {
  it("renders with role=radio", () => {
    renderWithTheme(<Radio checked onValueChange={() => {}} />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("fires onChange on click when unchecked", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Radio checked={false} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("disabled Radio is skipped in tab order and reports aria-disabled", () => {
    renderWithTheme(<Radio checked={false} disabled onValueChange={() => {}} />);
    const rb = screen.getByRole("radio");
    expect(rb.getAttribute("tabindex")).toBe("-1");
    expect(rb.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("renders all options", () => {
    renderWithTheme(
      <RadioGroup options={options} value="a" onValueChange={() => {}} />
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("calls onChange with selected value", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RadioGroup options={options} value="a" onValueChange={onChange} />
    );
    const [, second] = screen.getAllByRole("radio");
    await userEvent.click(second!);
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Slider", () => {
  it("reflects current value in the range input", () => {
    renderWithTheme(<Slider value={42} onValueChange={() => {}} />);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("42");
  });

  it("clamps within min/max", () => {
    renderWithTheme(<Slider value={150} onValueChange={() => {}} max={100} />);
    const el = screen.getByRole("slider") as HTMLInputElement;
    expect(el.max).toBe("100");
  });
});

describe("NumberInput", () => {
  it("renders with value", () => {
    renderWithTheme(<NumberInput value={5} onValueChange={() => {}} />);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "5"
    );
  });

  it("increments via the + button", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={5} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("decrements via the − button", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={5} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Decrement" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("respects min clamp on decrement", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={0} min={0} onValueChange={onChange} />);
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

describe("NumberInput — extended", () => {
  it("respects max clamp on increment", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={10} max={10} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("uses custom step", async () => {
    const onChange = vi.fn();
    renderWithTheme(<NumberInput value={5} step={5} onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("renders label", () => {
    renderWithTheme(<NumberInput value={0} label="Count" onValueChange={() => {}} />);
    expect(screen.getByText("Count")).toBeInTheDocument();
  });
});

describe("RadioGroup — extended", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("renders horizontal direction class", () => {
    const { container } = renderWithTheme(
      <RadioGroup options={options} value="a" onValueChange={() => {}} direction="horizontal" />
    );
    expect(
      container.querySelector(".vf-radio-group__items--horizontal")
    ).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    renderWithTheme(
      <RadioGroup options={options} value="a" onValueChange={() => {}} label="Choice" />
    );
    expect(screen.getByText("Choice")).toBeInTheDocument();
  });

  it("renders with defaultValue (uncontrolled)", () => {
    renderWithTheme(
      <RadioGroup options={options} defaultValue="b" onValueChange={() => {}} />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("Checkbox — keyboard", () => {
  it("toggles on Space key", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} onValueChange={onChange} />);
    const cb = screen.getByRole("checkbox");
    cb.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles on Enter key", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} onValueChange={onChange} />);
    const cb = screen.getByRole("checkbox");
    cb.focus();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders label", () => {
    renderWithTheme(<Checkbox label="Accept" onValueChange={() => {}} />);
    expect(screen.getByText("Accept")).toBeInTheDocument();
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

  it("has button role and is keyboard-activatable", () => {
    renderWithTheme(<DropZone />);
    const zone = screen.getByRole("button", { name: "DROP FILES HERE OR CLICK TO BROWSE" });
    expect(zone).toBeInTheDocument();
    expect(zone.getAttribute("tabindex")).toBe("0");
  });

  it("fires onFiles when files are dropped", () => {
    const onFiles = vi.fn();
    renderWithTheme(<DropZone onFiles={onFiles} />);
    const zone = screen.getByRole("button", { name: "DROP FILES HERE OR CLICK TO BROWSE" });
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const dataTransfer = { files: [file] };
    fireEvent.drop(zone, { dataTransfer });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });
});
