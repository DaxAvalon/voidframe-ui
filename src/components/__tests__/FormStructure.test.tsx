import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldSet, FormActions, InputGroup, Legend } from "../FormStructure";
import { Input } from "../Form";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("FormActions", () => {
  it("defaults to end-alignment", () => {
    const { container } = renderWithTheme(
      <FormActions>
        <button>Cancel</button>
        <button>Save</button>
      </FormActions>
    );
    const root = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(root).toHaveClass("vf-form-actions");
    expect(root).toHaveClass("vf-form-actions--end");
  });

  it.each(["start", "center", "between", "end"] as const)(
    "applies align=%s modifier",
    (align) => {
      const { container } = renderWithTheme(
        <FormActions align={align}>
          <button>x</button>
        </FormActions>
      );
      const root = (container.firstChild as HTMLElement).firstChild as HTMLElement;
      expect(root).toHaveClass(`vf-form-actions--${align}`);
    }
  );

  it("renders children", () => {
    renderWithTheme(
      <FormActions>
        <button>Save</button>
      </FormActions>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

describe("InputGroup", () => {
  it("renders Input + Addon(s)", () => {
    renderWithTheme(
      <InputGroup>
        <InputGroup.Addon>https://</InputGroup.Addon>
        <Input aria-label="url" placeholder="example.com" />
        <InputGroup.Addon>.dev</InputGroup.Addon>
      </InputGroup>
    );
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".dev")).toBeInTheDocument();
    expect(screen.getByLabelText("url")).toBeInTheDocument();
  });

  it("stamps position data attributes on each child", () => {
    const { container } = renderWithTheme(
      <InputGroup>
        <InputGroup.Addon>A</InputGroup.Addon>
        <InputGroup.Addon>B</InputGroup.Addon>
        <InputGroup.Addon>C</InputGroup.Addon>
      </InputGroup>
    );
    const group = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    const children = Array.from(group.children) as HTMLElement[];
    expect(children[0]!.getAttribute("data-vf-group-pos")).toBe("first");
    expect(children[1]!.getAttribute("data-vf-group-pos")).toBe("middle");
    expect(children[2]!.getAttribute("data-vf-group-pos")).toBe("last");
  });

  it("single child is marked as `single`", () => {
    const { container } = renderWithTheme(
      <InputGroup>
        <InputGroup.Addon>only</InputGroup.Addon>
      </InputGroup>
    );
    const group = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(
      (group.firstChild as HTMLElement).getAttribute("data-vf-group-pos")
    ).toBe("single");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <InputGroup>
        <InputGroup.Addon>https://</InputGroup.Addon>
        <Input aria-label="url" />
      </InputGroup>
    );
    await expectNoA11yViolations(container);
  });
});

describe("FieldSet + Legend", () => {
  it("renders native fieldset + legend", () => {
    renderWithTheme(
      <FieldSet>
        <Legend>Account</Legend>
        <Input aria-label="email" />
      </FieldSet>
    );
    // `role=group` is the native role of <fieldset>, labeled by <legend>.
    const group = screen.getByRole("group", { name: "Account" });
    expect(group.tagName).toBe("FIELDSET");
  });

  it("disabled fieldset disables all descendants", () => {
    render(
      <FieldSet disabled>
        <Legend>L</Legend>
        <input aria-label="inner" />
      </FieldSet>
    );
    // Native cascade: disabled on <fieldset> disables every form control inside.
    expect(screen.getByLabelText("inner")).toBeDisabled();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <FieldSet>
        <Legend>Account</Legend>
        <Input aria-label="email" />
      </FieldSet>
    );
    await expectNoA11yViolations(container);
  });
});
