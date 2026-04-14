import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell } from "../AppShell";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("AppShell", () => {
  it("renders all provided regions", () => {
    renderWithTheme(
      <AppShell
        header={<div data-testid="header">H</div>}
        sidebar={<div data-testid="sidebar">S</div>}
        rightPanel={<div data-testid="right">R</div>}
        footer={<div data-testid="footer">F</div>}
      >
        <div data-testid="main">M</div>
      </AppShell>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
  });

  it("sidebar collapse toggle hides the sidebar", async () => {
    renderWithTheme(
      <AppShell
        header={<span>H</span>}
        sidebar={<div data-testid="sidebar">S</div>}
        sidebarCollapsible
      >
        main
      </AppShell>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hide sidebar" }));
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });

  it("respects controlled sidebarCollapsed prop", () => {
    renderWithTheme(
      <AppShell
        header={<span>H</span>}
        sidebar={<div data-testid="sidebar">S</div>}
        sidebarCollapsible
        sidebarCollapsed
      >
        main
      </AppShell>
    );
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });
});
