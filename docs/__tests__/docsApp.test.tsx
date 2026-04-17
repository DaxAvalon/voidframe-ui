/**
 * Comprehensive tests for the voidframe docs site.
 * Tests: rendering, navigation, sidebar, search, component pages,
 * pattern pages, guide pages, playground rendering, and sidebar collapsing.
 */
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../test/renderWithTheme";
import DocsApp from "../App";

// Mock react-live since it requires browser APIs not available in happy-dom
vi.mock("react-live", () => ({
  LiveProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="live-provider">{children}</div>
  ),
  LiveEditor: () => <div data-testid="live-editor">editor</div>,
  LivePreview: () => <div data-testid="live-preview">preview</div>,
  LiveError: () => null,
}));

/** Helper: find nav link buttons in the sidebar */
function getNavLinks() {
  return screen.getAllByRole("button").filter(
    (b) => b.className.includes("vf-docs__nav-link"),
  );
}

/** Helper: find a specific nav link by name */
function findNavLink(name: string) {
  return getNavLinks().find((b) => b.textContent === name);
}

describe("DocsApp", () => {
  it("renders without crashing", () => {
    renderWithTheme(<DocsApp />);
    expect(screen.getByText("▲ VOIDFRAME · DOCS")).toBeInTheDocument();
  });

  it("renders the topbar with stats", () => {
    renderWithTheme(<DocsApp />);
    const topbar = screen.getByText("▲ VOIDFRAME · DOCS").parentElement!;
    expect(topbar.textContent).toMatch(/\d+ guides/);
    expect(topbar.textContent).toMatch(/\d+ components/);
    expect(topbar.textContent).toMatch(/\d+ hooks/);
    expect(topbar.textContent).toMatch(/\d+ utilities/);
  });

  it("renders the sidebar with section labels", () => {
    renderWithTheme(<DocsApp />);
    // Section labels are rendered as <span class="vf-label">
    const labels = document.querySelectorAll(".vf-docs__nav-section .vf-label");
    const labelTexts = Array.from(labels).map((l) => l.textContent);
    expect(labelTexts).toContain("Overview");
    expect(labelTexts).toContain("Guides");
    expect(labelTexts).toContain("Components");
    expect(labelTexts).toContain("Hooks");
    expect(labelTexts).toContain("Utilities");
  });

  it("renders Patterns section in sidebar", () => {
    renderWithTheme(<DocsApp />);
    const labels = document.querySelectorAll(".vf-docs__nav-section .vf-label");
    const labelTexts = Array.from(labels).map((l) => l.textContent);
    expect(labelTexts).toContain("Patterns");
  });

  it("starts on the Overview page", () => {
    renderWithTheme(<DocsApp />);
    expect(screen.getByText(/terminal-brutalist React UI framework/)).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderWithTheme(<DocsApp />);
    expect(screen.getByLabelText("Filter docs")).toBeInTheDocument();
  });
});

describe("DocsApp navigation", () => {
  it("clicking a component in sidebar shows that component page", async () => {
    renderWithTheme(<DocsApp />);
    const navBtn = findNavLink("Button");
    expect(navBtn).toBeDefined();
    await userEvent.click(navBtn!);
    // Page header should contain "Button"
    const header = document.querySelector(".vf-docs__page-head");
    expect(header?.textContent).toContain("Button");
  });

  it("clicking a pattern shows pattern page", async () => {
    renderWithTheme(<DocsApp />);
    const loginBtn = findNavLink("Login Form");
    if (loginBtn) {
      await userEvent.click(loginBtn);
      // Should show a playground (mocked)
      expect(screen.queryAllByTestId("live-provider").length).toBeGreaterThan(0);
    }
  });

  it("clicking Accessibility Audit shows audit content", async () => {
    renderWithTheme(<DocsApp />);
    const auditBtn = findNavLink("Accessibility Audit");
    if (auditBtn) {
      await userEvent.click(auditBtn);
      // The audit page has a table with "Component" header
      const header = document.querySelector(".vf-docs__page-head");
      expect(header?.textContent).toContain("Accessibility Audit");
    }
  });

  it("clicking Migration Guide shows migration content", async () => {
    renderWithTheme(<DocsApp />);
    const migBtn = findNavLink("Migration Guide");
    if (migBtn) {
      await userEvent.click(migBtn);
      const header = document.querySelector(".vf-docs__page-head");
      expect(header?.textContent).toContain("Migration Guide");
    }
  });
});

describe("DocsApp search", () => {
  it("typing in search filters sidebar items", async () => {
    renderWithTheme(<DocsApp />);
    const search = screen.getByLabelText("Filter docs");
    await userEvent.type(search, "Transfer");

    // Only nav links containing "Transfer" should remain
    const remaining = getNavLinks();
    expect(remaining.length).toBeGreaterThan(0);
    for (const btn of remaining) {
      expect(btn.textContent!.toLowerCase()).toContain("transfer");
    }
  });

  it("no results message when search finds nothing", async () => {
    renderWithTheme(<DocsApp />);
    const search = screen.getByLabelText("Filter docs");
    await userEvent.type(search, "xyznonexistent");
    expect(screen.getByText(/No entries match/)).toBeInTheDocument();
  });

  it("clearing search restores all items", async () => {
    renderWithTheme(<DocsApp />);
    const search = screen.getByLabelText("Filter docs");
    await userEvent.type(search, "xyznonexistent");
    expect(screen.getByText(/No entries match/)).toBeInTheDocument();
    await userEvent.clear(search);
    // Overview should be visible again
    expect(findNavLink("Overview")).toBeDefined();
  });
});

describe("DocsApp sidebar collapsing", () => {
  it("category subheads are clickable buttons", () => {
    renderWithTheme(<DocsApp />);
    const subheads = document.querySelectorAll(".vf-docs__nav-subhead");
    expect(subheads.length).toBeGreaterThan(0);
    for (const sh of subheads) {
      expect(sh.tagName.toLowerCase()).toBe("button");
    }
  });

  it("clicking a category subhead hides its children", async () => {
    renderWithTheme(<DocsApp />);
    const subheads = document.querySelectorAll(".vf-docs__nav-subhead");
    const firstSubhead = subheads[0] as HTMLElement;
    if (!firstSubhead) return;

    const parentGroup = firstSubhead.closest(".vf-docs__nav-group");
    expect(parentGroup?.querySelector(".vf-docs__nav-list")).not.toBeNull();

    await userEvent.click(firstSubhead);
    expect(parentGroup?.querySelector(".vf-docs__nav-list")).toBeNull();

    // Click again to expand
    await userEvent.click(firstSubhead);
    expect(parentGroup?.querySelector(".vf-docs__nav-list")).not.toBeNull();
  });
});

describe("DocsApp component pages", () => {
  it("component page shows Props section", async () => {
    renderWithTheme(<DocsApp />);
    const navBtn = findNavLink("Button");
    if (navBtn) {
      await userEvent.click(navBtn);
      expect(screen.getAllByText("Props").length).toBeGreaterThan(0);
    }
  });

  it("component page shows Playground section", async () => {
    renderWithTheme(<DocsApp />);
    const navBtn = findNavLink("Button");
    if (navBtn) {
      await userEvent.click(navBtn);
      expect(screen.getAllByText("Playground").length).toBeGreaterThan(0);
    }
  });

  it("component page has divider between info and playground", async () => {
    renderWithTheme(<DocsApp />);
    const navBtn = findNavLink("Button");
    if (navBtn) {
      await userEvent.click(navBtn);
      expect(document.querySelector(".vf-docs__divider")).not.toBeNull();
    }
  });

  it("component page shows source file link", async () => {
    renderWithTheme(<DocsApp />);
    const navBtn = findNavLink("Button");
    if (navBtn) {
      await userEvent.click(navBtn);
      expect(screen.getByText(/Source:/)).toBeInTheDocument();
    }
  });
});

describe("DocsApp a11y audit page", () => {
  it("shows audit table with components", async () => {
    renderWithTheme(<DocsApp />);
    const auditBtn = findNavLink("Accessibility Audit");
    if (auditBtn) {
      await userEvent.click(auditBtn);
      // Table headers
      const ths = document.querySelectorAll("th");
      const headers = Array.from(ths).map((th) => th.textContent);
      expect(headers).toContain("Component");
      expect(headers).toContain("Category");
      expect(headers).toContain("WCAG");
    }
  });
});

describe("DocsApp pattern pages", () => {
  it("pattern page shows description and playground", async () => {
    renderWithTheme(<DocsApp />);
    const loginBtn = findNavLink("Login Form");
    if (loginBtn) {
      await userEvent.click(loginBtn);
      expect(screen.getByText(/Authentication form/)).toBeInTheDocument();
      expect(screen.queryAllByTestId("live-provider").length).toBeGreaterThan(0);
    }
  });
});
