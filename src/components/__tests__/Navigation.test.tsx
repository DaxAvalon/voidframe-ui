import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Breadcrumb,
  NavGroup,
  NavItem,
  Pagination,
  Stepper,
} from "../Navigation";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Breadcrumb", () => {
  it("renders every label", () => {
    renderWithTheme(
      <Breadcrumb
        items={[{ label: "Home" }, { label: "Users" }, { label: "Alice" }]}
      />
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("calls onClick for intermediate items only", async () => {
    const onHome = vi.fn();
    const onLast = vi.fn();
    renderWithTheme(
      <Breadcrumb
        items={[
          { label: "Home", onClick: onHome },
          { label: "Alice", onClick: onLast },
        ]}
      />
    );
    await userEvent.click(screen.getByText("Home"));
    await userEvent.click(screen.getByText("Alice"));
    expect(onHome).toHaveBeenCalledTimes(1);
    expect(onLast).not.toHaveBeenCalled();
  });
});

describe("Pagination", () => {
  it("renders pages 1..N with ellipsis when spread", () => {
    renderWithTheme(<Pagination page={5} total={20} onChange={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  it("fires onChange for page click", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination page={2} total={5} onChange={onChange} />);
    await userEvent.click(screen.getByText("3"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("disables previous at page 1", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Pagination page={1} total={5} onChange={onChange} />);
    await userEvent.click(screen.getByText("◂"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Stepper", () => {
  it("renders all steps", () => {
    renderWithTheme(
      <Stepper steps={["Alpha", "Beta", "Gamma"]} current={1} />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("marks done steps with ✓", () => {
    renderWithTheme(<Stepper steps={["A", "B"]} current={1} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});

describe("NavItem", () => {
  it("renders children", () => {
    renderWithTheme(<NavItem>Home</NavItem>);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(<NavItem onClick={onClick}>Go</NavItem>);
    await userEvent.click(screen.getByText("Go"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders icon when given", () => {
    renderWithTheme(<NavItem icon={<span data-testid="icn">I</span>}>X</NavItem>);
    expect(screen.getByTestId("icn")).toBeInTheDocument();
  });
});

// ───────────────────────────────────────────────────────────────
// Regression: NavGroup must not crash from missing `useState` import.
// The original .jsx source was broken — it used `useState` without
// importing it. During TS migration we fixed the import; these tests
// lock in that fix.
// ───────────────────────────────────────────────────────────────
describe("NavGroup (regression for missing useState import)", () => {
  it("renders without throwing", () => {
    expect(() =>
      renderWithTheme(
        <NavGroup title="MAIN">
          <NavItem>Home</NavItem>
        </NavGroup>
      )
    ).not.toThrow();
  });

  it("is open by default (defaultOpen=true)", () => {
    renderWithTheme(
      <NavGroup title="MAIN">
        <NavItem>Visible</NavItem>
      </NavGroup>
    );
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("toggles children visibility on header click", async () => {
    renderWithTheme(
      <NavGroup title="GROUP">
        <NavItem>Child</NavItem>
      </NavGroup>
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
    await userEvent.click(screen.getByText("GROUP"));
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("GROUP"));
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("respects defaultOpen=false", () => {
    renderWithTheme(
      <NavGroup title="G" defaultOpen={false}>
        <NavItem>Hidden</NavItem>
      </NavGroup>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
