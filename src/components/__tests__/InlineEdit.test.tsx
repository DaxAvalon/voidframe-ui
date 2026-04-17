import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InlineEdit } from "../InlineEdit";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("InlineEdit", () => {
  it("renders display value as text", () => {
    renderWithTheme(<InlineEdit value="Hello" onSave={vi.fn()} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("click on display enters edit mode with input", async () => {
    renderWithTheme(<InlineEdit value="Hello" onSave={vi.fn()} />);
    await userEvent.click(screen.getByText("Hello"));
    expect(
      screen.getByRole("textbox", { name: "Inline edit input" })
    ).toBeInTheDocument();
  });

  it("input contains current value", async () => {
    renderWithTheme(<InlineEdit value="Hello" onSave={vi.fn()} />);
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", {
      name: "Inline edit input",
    }) as HTMLInputElement;
    expect(input.value).toBe("Hello");
  });

  it("Enter key saves new value and exits edit mode", async () => {
    const onSave = vi.fn();
    renderWithTheme(<InlineEdit value="Hello" onSave={onSave} />);
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    await userEvent.clear(input);
    await userEvent.type(input, "World{Enter}");
    expect(onSave).toHaveBeenCalledWith("World");
    // Should exit edit mode — input gone, display text visible.
    expect(
      screen.queryByRole("textbox", { name: "Inline edit input" })
    ).not.toBeInTheDocument();
  });

  it("Escape key cancels and reverts", async () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <InlineEdit value="Hello" onSave={vi.fn()} onCancel={onCancel} />
    );
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    await userEvent.clear(input);
    await userEvent.type(input, "changed{Escape}");
    expect(onCancel).toHaveBeenCalled();
    expect(
      screen.queryByRole("textbox", { name: "Inline edit input" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("blur saves value when submitOnBlur=true (default)", async () => {
    const onSave = vi.fn();
    renderWithTheme(<InlineEdit value="Hello" onSave={onSave} />);
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    await userEvent.clear(input);
    await userEvent.type(input, "Blurred");
    await userEvent.tab();
    expect(onSave).toHaveBeenCalledWith("Blurred");
  });

  it("blur does NOT save when submitOnBlur=false", async () => {
    const onSave = vi.fn();
    renderWithTheme(
      <InlineEdit value="Hello" onSave={onSave} submitOnBlur={false} />
    );
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    await userEvent.clear(input);
    await userEvent.type(input, "Blurred");
    await userEvent.tab();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("validation: error message shown, save prevented", async () => {
    const onSave = vi.fn();
    renderWithTheme(
      <InlineEdit
        value="Hello"
        onSave={onSave}
        validation={(v) => (v.length < 3 ? "Too short" : undefined)}
      />
    );
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    await userEvent.clear(input);
    await userEvent.type(input, "Hi{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    expect(onSave).not.toHaveBeenCalled();
    // Still in edit mode.
    expect(input).toBeInTheDocument();
  });

  it("successful validation clears error and saves", async () => {
    const onSave = vi.fn();
    renderWithTheme(
      <InlineEdit
        value="Hello"
        onSave={onSave}
        validation={(v) => (v.length < 3 ? "Too short" : undefined)}
      />
    );
    await userEvent.click(screen.getByText("Hello"));
    const input = screen.getByRole("textbox", { name: "Inline edit input" });
    // First trigger an error.
    await userEvent.clear(input);
    await userEvent.type(input, "Hi{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    // Now fix it.
    await userEvent.clear(input);
    await userEvent.type(input, "Valid{Enter}");
    expect(onSave).toHaveBeenCalledWith("Valid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("multiline=true renders textarea instead of input", async () => {
    renderWithTheme(
      <InlineEdit value="Hello" onSave={vi.fn()} multiline />
    );
    await userEvent.click(screen.getByText("Hello"));
    const textarea = screen.getByRole("textbox", {
      name: "Inline edit input",
    });
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("disabled prevents entering edit mode", async () => {
    renderWithTheme(<InlineEdit value="Hello" onSave={vi.fn()} disabled />);
    const display = screen.getByText("Hello");
    await userEvent.click(display);
    expect(
      screen.queryByRole("textbox", { name: "Inline edit input" })
    ).not.toBeInTheDocument();
  });

  it("readOnly prevents entering edit mode", async () => {
    renderWithTheme(<InlineEdit value="Hello" onSave={vi.fn()} readOnly />);
    const display = screen.getByText("Hello");
    await userEvent.click(display);
    expect(
      screen.queryByRole("textbox", { name: "Inline edit input" })
    ).not.toBeInTheDocument();
  });

  it("renderDisplay custom renderer used", () => {
    renderWithTheme(
      <InlineEdit
        value="Hello"
        onSave={vi.fn()}
        renderDisplay={(v) => <strong data-testid="custom">{v}!</strong>}
      />
    );
    const el = screen.getByTestId("custom");
    expect(el).toHaveTextContent("Hello!");
    expect(el.tagName).toBe("STRONG");
  });

  it("placeholder shows when value is empty", () => {
    renderWithTheme(
      <InlineEdit value="" onSave={vi.fn()} placeholder="Click to edit" />
    );
    expect(screen.getByText("Click to edit")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "applies size modifier class for size=%s",
    (size) => {
      const { root } = renderWithTheme(
        <InlineEdit value="X" onSave={vi.fn()} size={size} />
      );
      expect(root().classList.contains(`vf-inline-edit--${size}`)).toBe(true);
    }
  );

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <InlineEdit value="Accessible" onSave={vi.fn()} />
    );
    await expectNoA11yViolations(container);
  });
});
