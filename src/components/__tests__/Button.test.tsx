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

  it.each(["default", "ghost", "accent", "solid"] as const)(
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
        onChange={() => {}}
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
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
