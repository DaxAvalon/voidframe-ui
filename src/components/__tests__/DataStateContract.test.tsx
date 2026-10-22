import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { Card } from "../Card";
import { Progress } from "../Data";
import { DashboardGrid } from "../Widget";
import { Badge } from "../Badge";

describe("data-state contract", () => {
  it("rest data-* props land on the root element", () => {
    renderWithTheme(<Badge data-testid="b" data-kind="x">Hi</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("data-kind", "x");
    renderWithTheme(<Progress value={10} data-testid="p" data-row="3" />);
    expect(screen.getByTestId("p")).toHaveAttribute("data-row", "3");
  });

  it("Progress exposes active / complete / indeterminate", () => {
    renderWithTheme(<Progress value={10} data-testid="a" />);
    expect(screen.getByTestId("a")).toHaveAttribute("data-state", "active");
    renderWithTheme(<Progress value={100} data-testid="c" />);
    expect(screen.getByTestId("c")).toHaveAttribute("data-state", "complete");
    renderWithTheme(<Progress indeterminate data-testid="i" />);
    expect(screen.getByTestId("i")).toHaveAttribute("data-state", "indeterminate");
  });

  it("collapsible Card exposes open / closed", () => {
    renderWithTheme(
      <Card title="Panel" collapsible defaultOpen data-testid="card">
        body
      </Card>
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("data-state", "open");
    fireEvent.click(screen.getByRole("button", { expanded: true }));
    expect(card).toHaveAttribute("data-state", "closed");
    renderWithTheme(<Card title="Plain" data-testid="plain">x</Card>);
    expect(screen.getByTestId("plain")).not.toHaveAttribute("data-state");
  });

  it("DashboardGrid cells expose idle by default", () => {
    const { container } = renderWithTheme(
      <DashboardGrid items={[{ id: "a", x: 0, y: 0, w: 4, h: 2 }]} renderItem={(id) => <span>{id}</span>} />
    );
    expect(container.querySelector(".vf-dashboard-grid__cell")).toHaveAttribute("data-state", "idle");
  });
});
