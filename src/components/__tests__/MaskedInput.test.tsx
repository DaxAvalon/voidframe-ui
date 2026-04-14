import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CurrencyInput,
  MaskedInput,
  PhoneInput,
  applyMask,
  stripMask,
} from "../MaskedInput";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("applyMask", () => {
  it("formats digits into a phone mask", () => {
    expect(applyMask("5551234567", "(###) ###-####")).toBe("(555) 123-4567");
  });

  it("ignores non-matching characters", () => {
    expect(applyMask("abc55dxx51234567", "(###) ###-####")).toBe(
      "(555) 123-4567"
    );
  });

  it("mixes tokens correctly", () => {
    expect(applyMask("CA1234", "AA-####")).toBe("CA-1234");
  });

  it("stripMask removes separators", () => {
    expect(stripMask("(555) 123-4567", "(###) ###-####")).toBe("5551234567");
  });
});

describe("MaskedInput", () => {
  it("applies the mask as the user types", async () => {
    renderWithTheme(<MaskedInput label="Phone" mask="(###) ###-####" />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    await userEvent.type(input, "5551234567");
    expect(input.value).toBe("(555) 123-4567");
  });

  it("emits raw value via onValueChange", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <MaskedInput
        label="Phone"
        mask="(###) ###-####"
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByLabelText("Phone");
    await userEvent.type(input, "5551234567");
    const last = onValueChange.mock.calls.at(-1)![0];
    expect(last.raw).toBe("5551234567");
    expect(last.value).toBe("(555) 123-4567");
  });

  it("controlled value respects external updates", () => {
    renderWithTheme(
      <MaskedInput label="Phone" mask="(###) ###-####" value="5551234567" />
    );
    expect((screen.getByLabelText("Phone") as HTMLInputElement).value).toBe(
      "(555) 123-4567"
    );
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <MaskedInput label="SSN" mask="###-##-####" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("CurrencyInput", () => {
  it("formats numbers using the currency formatter", () => {
    renderWithTheme(
      <CurrencyInput label="Price" currency="USD" locale="en-US" value={1234.5} />
    );
    const input = screen.getByLabelText("Price") as HTMLInputElement;
    // en-US USD: "$1,234.50"
    expect(input.value).toContain("1,234.50");
  });

  it("parses typed digits into a number", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <CurrencyInput
        label="Price"
        currency="USD"
        locale="en-US"
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText("Price") as HTMLInputElement;
    await userEvent.type(input, "1234");
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toBe(1234);
  });

  it("formats the value on blur", async () => {
    renderWithTheme(
      <CurrencyInput label="Price" currency="USD" locale="en-US" />
    );
    const input = screen.getByLabelText("Price") as HTMLInputElement;
    await userEvent.type(input, "1234");
    await userEvent.tab();
    expect(input.value).toContain("1,234.00");
  });

  it("empty input produces null", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <CurrencyInput
        label="Price"
        currency="USD"
        locale="en-US"
        defaultValue={5}
        onChange={onChange}
      />
    );
    const input = screen.getByLabelText("Price") as HTMLInputElement;
    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <CurrencyInput label="Price" currency="USD" locale="en-US" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("PhoneInput", () => {
  it("defaults to US mask", async () => {
    renderWithTheme(<PhoneInput label="Phone" />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    await userEvent.type(input, "5551234567");
    expect(input.value).toBe("(555) 123-4567");
  });

  it("supports country overrides", async () => {
    renderWithTheme(<PhoneInput label="Phone" country="JP" />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    await userEvent.type(input, "09012345678");
    // JP mask "###-####-####" → "090-1234-5678"
    expect(input.value).toBe("090-1234-5678");
  });

  it("accepts explicit mask override", async () => {
    renderWithTheme(<PhoneInput label="Phone" mask="##-##-##" />);
    const input = screen.getByLabelText("Phone") as HTMLInputElement;
    await userEvent.type(input, "123456");
    expect(input.value).toBe("12-34-56");
  });
});
