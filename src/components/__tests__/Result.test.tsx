import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Result, type ResultStatus } from "../Result";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Result", () => {
  it("renders title", () => {
    renderWithTheme(<Result status="success" title="Operation Complete" />);
    expect(screen.getByText("Operation Complete")).toBeInTheDocument();
  });

  it("renders description", () => {
    renderWithTheme(
      <Result
        status="error"
        title="Failed"
        description="Something went wrong"
      />
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it.each([
    "success",
    "error",
    "warning",
    "info",
    "403",
    "404",
    "500",
  ] as ResultStatus[])("status=%s applies modifier class", (status) => {
    const { container } = renderWithTheme(
      <Result status={status} title="Test" />
    );
    expect(
      container.querySelector(`.vf-result--${status}`)
    ).toBeInTheDocument();
  });

  it("renders default icon per status", () => {
    const { container } = renderWithTheme(
      <Result status="success" title="OK" />
    );
    const iconEl = container.querySelector(".vf-result__default-icon");
    expect(iconEl).toBeInTheDocument();
    expect(iconEl!.textContent).toBeTruthy();
  });

  it("custom icon overrides default", () => {
    renderWithTheme(
      <Result
        status="success"
        title="OK"
        icon={<span data-testid="custom-icon">!</span>}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders extra content", () => {
    renderWithTheme(
      <Result
        status="error"
        title="Oops"
        extra={<button>Retry</button>}
      />
    );
    expect(
      screen.getByRole("button", { name: "Retry" })
    ).toBeInTheDocument();
  });

  it("renders children", () => {
    renderWithTheme(
      <Result status="info" title="Details">
        <p>Extra info here</p>
      </Result>
    );
    expect(screen.getByText("Extra info here")).toBeInTheDocument();
  });

  it("applies status color via class", () => {
    const { container } = renderWithTheme(
      <Result status="warning" title="Caution" />
    );
    expect(
      container.querySelector(".vf-result--warning")
    ).toBeInTheDocument();
  });

  it("has no a11y violations with role=status", async () => {
    const { container } = renderWithTheme(
      <Result status="success" title="Done" description="All good" />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
