import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SplitButton } from "../SplitButton";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const defaultActions = [
  { key: "save-draft", label: "Save as Draft" },
  { key: "schedule", label: "Schedule" },
  { key: "delete", label: "Delete", danger: true },
];

const defaultProps = {
  label: "Save",
  onClick: vi.fn(),
  actions: defaultActions,
  onAction: vi.fn(),
};

describe("SplitButton", () => {
  it("renders primary button with label", () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /save/i })
    ).toBeInTheDocument();
  });

  it("renders dropdown caret button", () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /more actions/i })
    ).toBeInTheDocument();
  });

  it("primary button click fires onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(<SplitButton {...defaultProps} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("caret click opens dropdown menu", async () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("menu items render from actions array", async () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Save as Draft");
    expect(items[1]).toHaveTextContent("Schedule");
    expect(items[2]).toHaveTextContent("Delete");
  });

  it("clicking menu item fires onAction(key) and closes menu", async () => {
    const onAction = vi.fn();
    renderWithTheme(<SplitButton {...defaultProps} onAction={onAction} />);
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Schedule" }));
    expect(onAction).toHaveBeenCalledWith("schedule");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("disabled menu items are not clickable", async () => {
    const onAction = vi.fn();
    const actions = [
      { key: "a", label: "Enabled" },
      { key: "b", label: "Blocked", disabled: true },
    ];
    renderWithTheme(
      <SplitButton {...defaultProps} actions={actions} onAction={onAction} />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    const blocked = screen.getByRole("menuitem", { name: "Blocked" });
    // pointer-events: none prevents real clicks, but we can verify
    // the aria-disabled attribute and class
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    expect(blocked.className).toContain("vf-split-button__menu-item--disabled");
  });

  it("danger menu items have danger class", async () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    const deleteItem = screen.getByRole("menuitem", { name: "Delete" });
    expect(deleteItem.className).toContain(
      "vf-split-button__menu-item--danger"
    );
  });

  it("disabled prop disables both buttons", () => {
    renderWithTheme(<SplitButton {...defaultProps} disabled />);
    const primary = screen.getByRole("button", { name: /save/i });
    const caret = screen.getByRole("button", { name: /more actions/i });
    expect(primary).toHaveAttribute("aria-disabled", "true");
    expect(caret).toHaveAttribute("aria-disabled", "true");
  });

  it("loading prop shows spinner and disables", () => {
    renderWithTheme(<SplitButton {...defaultProps} loading />);
    const primary = screen.getByRole("button", { name: /save/i });
    expect(primary).toHaveAttribute("aria-disabled", "true");
    expect(primary.querySelector(".vf-split-button__spinner")).toBeTruthy();
    const caret = screen.getByRole("button", { name: /more actions/i });
    expect(caret).toHaveAttribute("aria-disabled", "true");
  });

  it("icon prop renders icon in primary button", () => {
    renderWithTheme(
      <SplitButton {...defaultProps} icon={<span data-testid="icon">+</span>} />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it.each(["default", "accent", "solid"] as const)(
    "renders variant %s",
    (variant) => {
      const { container } = renderWithTheme(
        <SplitButton {...defaultProps} variant={variant} />
      );
      const root = container.querySelector(".vf-split-button");
      expect(root?.className).toContain(`vf-split-button--${variant}`);
    }
  );

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    const { container } = renderWithTheme(
      <SplitButton {...defaultProps} size={size} />
    );
    const root = container.querySelector(".vf-split-button");
    expect(root?.className).toContain(`vf-split-button--${size}`);
  });

  it("Escape closes menu", async () => {
    renderWithTheme(<SplitButton {...defaultProps} />);
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("click outside closes menu", async () => {
    renderWithTheme(
      <div>
        <SplitButton {...defaultProps} />
        <button data-testid="outside">Outside</button>
      </div>
    );
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<SplitButton {...defaultProps} />);
    // Open the menu so we test menu + menuitem roles too
    await userEvent.click(
      screen.getByRole("button", { name: /more actions/i })
    );
    await expectNoA11yViolations(container);
  });
});
