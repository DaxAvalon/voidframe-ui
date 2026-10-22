import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { Select, selectOptionText } from "../Form";
import { Combobox } from "../Combobox";
import { Radio, RadioGroup } from "../FormExtended";

const devices = [
  { value: "in1", label: "Scarlett 2i2", description: "2 channels", badge: "default" },
  { value: "in2", label: "Built-in microphone", description: "1 channel", disabled: true },
];

describe("Select placeholder and option metadata", () => {
  it("renders a disabled placeholder option, starts empty and clears the placeholder style on pick", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Select label="Input" options={devices} placeholder="Choose a device…" onValueChange={onChange} />);
    const select = screen.getByRole("combobox", { name: "Input" }) as HTMLSelectElement;
    expect(select.value).toBe("");
    expect(select).toHaveClass("vf-select--placeholder");
    const placeholder = screen.getByRole("option", { name: "Choose a device…" }) as HTMLOptionElement;
    expect(placeholder.disabled).toBe(true);
    expect(placeholder.value).toBe("");
    await userEvent.selectOptions(select, "in1");
    expect(onChange).toHaveBeenCalledWith("in1");
    expect(select).not.toHaveClass("vf-select--placeholder");
  });

  it("appends description and badge to the native option text and honours disabled", () => {
    expect(selectOptionText(devices[0]!)).toBe("Scarlett 2i2 · default — 2 channels");
    renderWithTheme(<Select label="Input" options={devices} value="in1" onValueChange={() => undefined} />);
    expect(screen.getByRole("option", { name: "Scarlett 2i2 · default — 2 channels" })).toBeInTheDocument();
    const second = screen.getByRole("option", { name: "Built-in microphone — 1 channel" }) as HTMLOptionElement;
    expect(second.disabled).toBe(true);
  });

  it("without a placeholder the first option is still the default", () => {
    renderWithTheme(<Select label="Input" options={devices} />);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("in1");
  });
});

describe("Combobox option metadata", () => {
  it("renders description and badge inside the option row", async () => {
    renderWithTheme(<Combobox label="Input" options={devices} />);
    await userEvent.click(screen.getByRole("combobox"));
    const option = screen.getAllByRole("option")[0]!;
    expect(option.querySelector(".vf-combobox__option-label")?.textContent).toBe("Scarlett 2i2");
    expect(option.querySelector(".vf-combobox__option-description")?.textContent).toBe("2 channels");
    expect(option.querySelector(".vf-combobox__option-badge")?.textContent).toBe("default");
    const plain = screen.getAllByRole("option")[1]!;
    expect(plain.querySelector(".vf-combobox__option-badge")).toBeNull();
  });
});

describe("RadioGroup option metadata", () => {
  it("renders description, badge and disabled per option and describes the radio", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RadioGroup
        label="Quality"
        value="hi"
        onValueChange={onChange}
        options={[
          { value: "hi", label: "High", description: "48 kHz / 24-bit", badge: "recommended" },
          { value: "lo", label: "Low", disabled: true },
        ]}
      />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveClass("vf-radio--described");
    expect(radios[0]).toHaveAttribute("aria-describedby");
    expect(screen.getByText("48 kHz / 24-bit").id).toBe(radios[0]!.getAttribute("aria-describedby"));
    expect(screen.getByText("recommended")).toHaveClass("vf-radio__badge");
    expect(radios[1]).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(radios[1]!);
    expect(onChange).not.toHaveBeenCalled();
    renderWithTheme(<Radio label="Plain" checked={false} onValueChange={() => undefined} />);
    expect(screen.getByRole("radio", { name: "Plain" })).not.toHaveClass("vf-radio--described");
  });
});
