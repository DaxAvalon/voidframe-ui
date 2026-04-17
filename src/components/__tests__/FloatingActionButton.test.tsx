import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloatingActionButton } from "../FloatingActionButton";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("FloatingActionButton", () => {
  const icon = <span data-testid="fab-icon">+</span>;
  const actions = [
    { key: "a", label: "Add", icon: <span>A</span>, onClick: vi.fn() },
    { key: "b", label: "Edit", icon: <span>E</span>, onClick: vi.fn() },
  ];

  it("renders button with icon", () => {
    renderWithTheme(<FloatingActionButton icon={icon} />);
    expect(screen.getByTestId("fab-icon")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders extended label", () => {
    renderWithTheme(<FloatingActionButton icon={icon} label="Create" />);
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("simple click fires onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(<FloatingActionButton icon={icon} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("speed dial opens on click", async () => {
    renderWithTheme(<FloatingActionButton icon={icon} actions={actions} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Floating action" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("action buttons fire onClick", async () => {
    const handler = vi.fn();
    const testActions = [
      { key: "x", label: "Do thing", icon: <span>X</span>, onClick: handler },
    ];
    renderWithTheme(<FloatingActionButton icon={icon} actions={testActions} />);
    await userEvent.click(screen.getByRole("button", { name: "Floating action" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Do thing" }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("speed dial closes after action", async () => {
    const testActions = [
      { key: "x", label: "Do thing", icon: <span>X</span>, onClick: vi.fn() },
    ];
    renderWithTheme(<FloatingActionButton icon={icon} actions={testActions} />);
    await userEvent.click(screen.getByRole("button", { name: "Floating action" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Do thing" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Escape closes speed dial", async () => {
    renderWithTheme(<FloatingActionButton icon={icon} actions={actions} />);
    await userEvent.click(screen.getByRole("button", { name: "Floating action" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("click-outside closes speed dial", async () => {
    renderWithTheme(
      <div>
        <div data-testid="outside">outside</div>
        <FloatingActionButton icon={icon} actions={actions} />
      </div>
    );
    await userEvent.click(screen.getByRole("button", { name: "Floating action" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it.each(["bottom-right", "bottom-left", "bottom-center"] as const)(
    "applies position class %s",
    (position) => {
      const { container } = renderWithTheme(
        <FloatingActionButton icon={icon} position={position} />
      );
      expect(container.querySelector(`.vf-fab--${position}`)).toBeInTheDocument();
    }
  );

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { container } = renderWithTheme(
      <FloatingActionButton icon={icon} size={size} />
    );
    expect(container.querySelector(`.vf-fab--${size}`)).toBeInTheDocument();
  });

  it.each(["default", "accent"] as const)(
    "applies variant class %s",
    (variant) => {
      const { container } = renderWithTheme(
        <FloatingActionButton icon={icon} variant={variant} />
      );
      expect(
        container.querySelector(`.vf-fab--${variant}`)
      ).toBeInTheDocument();
    }
  );

  it("uses fixed positioning via class", () => {
    const { container } = renderWithTheme(
      <FloatingActionButton icon={icon} />
    );
    expect(container.querySelector(".vf-fab")).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <FloatingActionButton icon={icon} label="Create" />
    );
    await expectNoA11yViolations(container);
  });
});
