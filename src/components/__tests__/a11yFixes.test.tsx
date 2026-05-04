"use client";

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { FormField, Slider } from "../FormExtended";
import { Combobox } from "../Combobox";

describe("FormField aria-describedby", () => {
  it("error span has an id and role=alert", () => {
    const { container } = renderWithTheme(
      <FormField label="Name" error="Required">
        <input aria-label="Name" />
      </FormField>
    );
    const errorSpan = container.querySelector(".vf-form-field__error");
    expect(errorSpan).toBeTruthy();
    expect(errorSpan!.id).toBeTruthy();
    expect(errorSpan!.getAttribute("role")).toBe("alert");
  });

  it("help span has an id", () => {
    const { container } = renderWithTheme(
      <FormField label="Name" help="Enter your full name">
        <input aria-label="Name" />
      </FormField>
    );
    const helpSpan = container.querySelector(".vf-form-field__help");
    expect(helpSpan).toBeTruthy();
    expect(helpSpan!.id).toBeTruthy();
  });

  it("exposes describedby id via data attribute", () => {
    const { container } = renderWithTheme(
      <FormField label="Name" error="Required">
        <input aria-label="Name" />
      </FormField>
    );
    const field = container.querySelector(".vf-field");
    expect(field!.getAttribute("data-describedby")).toBeTruthy();
  });
});

describe("Slider aria-label fallback", () => {
  it("has aria-label even without label prop", () => {
    const { container } = renderWithTheme(<Slider />);
    const input = container.querySelector('input[type="range"]');
    expect(input!.getAttribute("aria-label")).toBe("Slider");
  });

  it("uses label prop when provided", () => {
    const { container } = renderWithTheme(<Slider label="Volume" />);
    const input = container.querySelector('input[type="range"]');
    expect(input!.getAttribute("aria-label")).toBe("Volume");
  });
});

describe("Combobox Tab key closes dropdown", () => {
  it("closes listbox on Tab", async () => {
    renderWithTheme(
      <Combobox
        label="Country"
        options={[
          { value: "us", label: "United States" },
          { value: "uk", label: "United Kingdom" },
        ]}
      />
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    // Listbox should be open
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    // Tab should close it
    await userEvent.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
