import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field";
import { Input } from "../Form";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Field compound", () => {
  it("wires label `htmlFor` + input `id` via context", () => {
    renderWithTheme(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input aria-label="Email" />
        </Field.Control>
      </Field>
    );
    const label = screen.getByText("Email");
    const input = screen.getByLabelText("Email");
    expect(label).toHaveAttribute("for", input.id);
    expect(input.id).toBeTruthy();
  });

  it("links aria-describedby to help text", () => {
    renderWithTheme(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input aria-label="Email" />
        </Field.Control>
        <Field.Help>We will not share.</Field.Help>
      </Field>
    );
    const input = screen.getByLabelText("Email");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      "We will not share."
    );
  });

  it("error takes precedence over help (help hidden when error present)", () => {
    renderWithTheme(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input aria-label="Email" />
        </Field.Control>
        <Field.Help>Helper</Field.Help>
        <Field.Error>Required</Field.Error>
      </Field>
    );
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("sets aria-invalid on control when error present", () => {
    renderWithTheme(
      <Field>
        <Field.Label>X</Field.Label>
        <Field.Control>
          <Input aria-label="X" />
        </Field.Control>
        <Field.Error>Bad</Field.Error>
      </Field>
    );
    expect(screen.getByLabelText("X")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders required asterisk + sets aria-required on control", () => {
    renderWithTheme(
      <Field required>
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <Input aria-label="Name" />
        </Field.Control>
      </Field>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-required", "true");
  });

  it("disabled propagates to the control", () => {
    renderWithTheme(
      <Field disabled>
        <Field.Label>X</Field.Label>
        <Field.Control>
          <Input aria-label="X" />
        </Field.Control>
      </Field>
    );
    expect(screen.getByLabelText("X")).toBeDisabled();
  });

  it("data-invalid attribute on root when error present", () => {
    const { container } = renderWithTheme(
      <Field>
        <Field.Label>X</Field.Label>
        <Field.Control>
          <Input aria-label="X" />
        </Field.Control>
        <Field.Error>boom</Field.Error>
      </Field>
    );
    const root = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(root).toHaveAttribute("data-invalid", "true");
  });

  it("throws clear error when subcomponents used outside Field", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Field.Label>x</Field.Label>)).toThrowError(
      /Field\.Label/
    );
    errSpy.mockRestore();
  });

  it("has no a11y violations (help)", async () => {
    const { container } = renderWithTheme(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input aria-label="Email" />
        </Field.Control>
        <Field.Help>We will not share.</Field.Help>
      </Field>
    );
    await expectNoA11yViolations(container);
  });

  it("has no a11y violations (error)", async () => {
    const { container } = renderWithTheme(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control>
          <Input aria-label="Email" />
        </Field.Control>
        <Field.Error>Required</Field.Error>
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
