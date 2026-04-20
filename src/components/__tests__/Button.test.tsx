import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonGroup } from "../Button";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Button", () => {
  it("renders children", () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Button disabled onClick={onClick}>
        Go
      </Button>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["solid", "outline", "ghost", "subtle"] as const)(
    "renders variant %s",
    (variant) => {
      renderWithTheme(
        <Button variant={variant} accent="#4ade80">
          {variant}
        </Button>
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    }
  );

  it("asChild renders iconLeft/iconRight/spinner and suppresses onClick while loading", async () => {
    const onClick = vi.fn();
    const { container, rerender } = renderWithTheme(
      <Button
        asChild
        iconLeft={<span data-testid="left">L</span>}
        iconRight={<span data-testid="right">R</span>}
        onClick={onClick}
      >
        <a href="#x">Go</a>
      </Button>
    );
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();

    rerender(
      <Button
        asChild
        loading
        iconLeft={<span data-testid="left">L</span>}
        onClick={onClick}
      >
        <a href="#x">Go</a>
      </Button>
    );
    expect(container.querySelector(".vf-button__spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("left")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("link"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<Button>Accessible</Button>);
    await expectNoA11yViolations(container);
  });
});

describe("ButtonGroup", () => {
  it("renders all options", () => {
    renderWithTheme(
      <ButtonGroup
        options={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ]}
        value="a"
        onValueChange={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
  });

  it("calls onChange with clicked option key", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ButtonGroup
        options={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ]}
        value="a"
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
