import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandInput } from "../CommandInput";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("CommandInput", () => {
  it("renders with default prompt", () => {
    renderWithTheme(<CommandInput onSubmit={vi.fn()} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders custom prompt", () => {
    renderWithTheme(<CommandInput onSubmit={vi.fn()} prompt=">>>" />);
    expect(screen.getByText(">>>")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} placeholder="Type a command..." />
    );
    expect(screen.getByPlaceholderText("Type a command...")).toBeInTheDocument();
  });

  it("typing updates value", async () => {
    renderWithTheme(<CommandInput onSubmit={vi.fn()} />);
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("controlled value and onValueChange", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <CommandInput
        value="fixed"
        onValueChange={onValueChange}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    expect(input).toHaveValue("fixed");
    await userEvent.type(input, "x");
    expect(onValueChange).toHaveBeenCalled();
  });

  it("Enter submits and clears", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(<CommandInput onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "ls -la{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("ls -la");
    expect(input).toHaveValue("");
  });

  it("Enter adds to internal history", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(<CommandInput onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "first{Enter}");
    await userEvent.type(input, "second{Enter}");
    // ArrowUp should retrieve "second" (most recent)
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("second");
  });

  it("ArrowUp goes to previous history entry", async () => {
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} history={["old", "older"]} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("old");
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("older");
  });

  it("ArrowDown goes to next history entry", async () => {
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} history={["newest", "older"]} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("older");
    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("newest");
  });

  it("Tab auto-completes single suggestion", async () => {
    const suggestions = [
      { value: "deploy", label: "deploy" },
      { value: "build", label: "build" },
    ];
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} suggestions={suggestions} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "dep");
    await userEvent.keyboard("{Tab}");
    expect(input).toHaveValue("deploy");
  });

  it("Tab with multiple matches shows dropdown", async () => {
    const suggestions = [
      { value: "deploy-prod", label: "deploy-prod" },
      { value: "deploy-staging", label: "deploy-staging" },
    ];
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} suggestions={suggestions} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "dep");
    await userEvent.keyboard("{Tab}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("Enter on completion selects it", async () => {
    const suggestions = [
      { value: "deploy-prod", label: "deploy-prod" },
      { value: "deploy-staging", label: "deploy-staging" },
    ];
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} suggestions={suggestions} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "dep");
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("deploy-prod");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("disabled prop prevents interaction", () => {
    const { container } = renderWithTheme(
      <CommandInput onSubmit={vi.fn()} disabled />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    expect(input).toBeDisabled();
    expect(
      container.querySelector(".vf-command-input--disabled")
    ).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { container } = renderWithTheme(
      <CommandInput onSubmit={vi.fn()} size={size} />
    );
    expect(
      container.querySelector(`.vf-command-input--${size}`)
    ).toBeInTheDocument();
  });

  it("autoFocus focuses input", () => {
    renderWithTheme(<CommandInput onSubmit={vi.fn()} autoFocus />);
    const input = screen.getByRole("textbox", { name: "Command input" });
    expect(input).toHaveFocus();
  });

  it("has no a11y violations with combobox role when completions visible", async () => {
    const suggestions = [
      { value: "deploy-prod", label: "deploy-prod" },
      { value: "deploy-staging", label: "deploy-staging" },
    ];
    renderWithTheme(
      <CommandInput onSubmit={vi.fn()} suggestions={suggestions} />
    );
    const input = screen.getByRole("textbox", { name: "Command input" });
    await userEvent.type(input, "dep");
    await userEvent.keyboard("{Tab}");
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    const { container } = renderWithTheme(
      <CommandInput onSubmit={vi.fn()} />
    );
    await expectNoA11yViolations(container);
  });
});
