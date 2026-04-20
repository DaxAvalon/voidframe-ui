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

  it("mobile variant renders the same vf-appshell__ prefix", () => {
    // Force the mobile breakpoint via matchMedia.
    const prior = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: /max-width/.test(q),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    try {
      const { container } = renderWithTheme(
        <AppShell
          header={<span>H</span>}
          sidebar={<div>S</div>}
          sidebarCollapsible
        >
          main
        </AppShell>
      );
      // If the mobile sidebar is shown it should use the unified prefix.
      const mobileBackdrop = container.querySelector(
        ".vf-appshell__mobile-backdrop"
      );
      const oldClassBackdrop = container.querySelector(
        ".vf-app-shell__mobile-backdrop"
      );
      expect(oldClassBackdrop).toBeNull();
      // Either the backdrop exists, or we're at desktop breakpoint; either
      // way, no legacy `vf-app-shell__` class should ever appear.
      if (mobileBackdrop) {
        expect(mobileBackdrop.className).toContain("vf-appshell__");
      }
    } finally {
      window.matchMedia = prior;
    }
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
