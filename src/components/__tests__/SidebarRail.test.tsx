// Rail mode: a collapsed Sidebar hides labels through CSS, so NavItem must
// supply the label another way (tooltip + aria-label), items must stay real
// buttons/links, and AppShell can keep the column as a rail.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRef } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Sidebar } from "../Sidebar";
import { NavItem } from "../Navigation";
import { AppShell } from "../AppShell";

const css = (rel: string) =>
  readFileSync(resolve(__dirname, "../../css", rel), "utf8");

describe("Sidebar rail mode", () => {
  it("hides item labels, badges and section labels in CSS under --collapsed", () => {
    const nav = css("components/nav-extended.css");
    const rail = nav.slice(nav.indexOf(".vf-sidebar--collapsed {"));
    expect(rail).toMatch(/\.vf-sidebar--collapsed \.vf-nav-item__content,[\s\S]*display: none;/);
    expect(rail).toContain(".vf-sidebar--collapsed .vf-nav-item__badge");
    expect(rail).toContain(".vf-sidebar--collapsed .vf-sidebar__section-label");
    expect(rail).toMatch(/\.vf-sidebar--collapsed \.vf-nav-item \{[^}]*justify-content: center/);
    expect(nav).toContain(".vf-sidebar--labels-vertical .vf-nav-item__content");
    // The adaptive media query hides the same things.
    const resp = css("components/responsive.css");
    expect(resp).toContain(".vf-sidebar--adaptive:not(.vf-sidebar--collapsed) .vf-nav-item__content");
  });

  it("marks the aside and gives NavItem the label as aria-label and tooltip", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Sidebar collapsed>
        <Sidebar.Brand icon={<span data-testid="mark">V</span>}>Voidframe</Sidebar.Brand>
        <Sidebar.Section label="Main">
          <NavItem href="/inbox" icon={<span>✉</span>} badge={3}>
            Inbox
          </NavItem>
          <NavItem onClick={() => {}} icon={<span>⚙</span>} indent={2}>
            Settings
          </NavItem>
          <NavItem href="/x" aria-label="Custom name">
            <b>Rich</b>
          </NavItem>
        </Sidebar.Section>
      </Sidebar>
    );
    const aside = screen.getByRole("complementary", { name: "Sidebar" });
    expect(aside).toHaveClass("vf-sidebar--collapsed");
    expect(aside).toHaveAttribute("data-collapsed", "true");
    // Brand keeps text in DOM, adds the icon with the has-icon hook.
    const brand = aside.querySelector(".vf-sidebar__brand")!;
    expect(brand).toHaveClass("vf-sidebar__brand--collapsed", "vf-sidebar__brand--has-icon");
    expect(brand.querySelector(".vf-sidebar__brand-text")!.textContent).toBe("Voidframe");
    expect(screen.getByTestId("mark")).toBeInTheDocument();

    const inbox = screen.getByRole("link", { name: "Inbox" });
    expect(inbox).toHaveAttribute("aria-label", "Inbox");
    const settings = screen.getByRole("button", { name: "Settings" });
    expect(settings).toHaveAttribute("aria-label", "Settings");
    // indent is ignored in a rail so icons stay centred.
    expect(settings.style.paddingInlineStart).toBe("");
    // A consumer-supplied aria-label is left alone.
    expect(screen.getByRole("link", { name: "Custom name" })).toBeInTheDocument();

    // Tooltip shows the label on hover.
    await user.hover(inbox);
    await waitFor(() =>
      expect(document.querySelector("[role='tooltip']")?.textContent).toBe("Inbox")
    );
  });

  it("tooltip={false} suppresses the rail tooltip; a node shows in every mode", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <>
        <Sidebar collapsed>
          <NavItem href="/a" tooltip={false}>Alpha</NavItem>
        </Sidebar>
        <Sidebar>
          <NavItem href="/b" tooltip="Beta details">Beta</NavItem>
        </Sidebar>
      </>
    );
    await user.hover(screen.getByRole("link", { name: "Alpha" }));
    await new Promise((r) => setTimeout(r, 400));
    expect(document.querySelector("[role='tooltip']")).toBeNull();
    await user.hover(screen.getByRole("link", { name: "Beta" }));
    await waitFor(() =>
      expect(document.querySelector("[role='tooltip']")?.textContent).toBe("Beta details")
    );
  });

  it("expanded sidebar adds no aria-label or tooltip and keeps indent", () => {
    renderWithTheme(
      <Sidebar>
        <NavItem href="/a" indent={1}>Alpha</NavItem>
      </Sidebar>
    );
    const a = screen.getByRole("link", { name: "Alpha" });
    expect(a).not.toHaveAttribute("aria-label");
    expect(a.style.paddingInlineStart).toContain("14px");
  });

  it("labels='vertical' adds the modifier class", () => {
    renderWithTheme(<Sidebar collapsed labels="vertical">x</Sidebar>);
    expect(screen.getByRole("complementary")).toHaveClass("vf-sidebar--labels-vertical");
  });
});

describe("NavItem element and activeStyle", () => {
  it("renders a native button with onClick, forwards the ref, keeps className", async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();
    renderWithTheme(
      <NavItem ref={ref} onClick={onClick} className="mine">
        Run
      </NavItem>
    );
    const btn = screen.getByRole("button", { name: "Run" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("vf-nav-item", "mine");
    expect(ref.current).toBe(btn);
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("the stylesheet resets button chrome on .vf-nav-item", () => {
    const nav = css("components/navigation.css");
    const rule = nav.slice(nav.indexOf(".vf-nav-item {"), nav.indexOf("button.vf-nav-item"));
    expect(rule).toContain("appearance: none;");
    expect(rule).toContain("border: 0;");
    expect(rule).toContain("font: inherit;");
    expect(rule).toContain("text-align: start;");
    expect(nav).toContain("button.vf-nav-item {\n  width: 100%;");
    expect(nav).toContain('.vf-nav-item[data-active="true"][data-active-style="edge"]');
  });

  it("activeStyle comes from the prop or the Sidebar default", () => {
    renderWithTheme(
      <Sidebar activeStyle="edge">
        <NavItem href="/a" active>A</NavItem>
        <NavItem href="/b" active activeStyle="fill">B</NavItem>
      </Sidebar>
    );
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute("data-active-style", "edge");
    expect(screen.getByRole("link", { name: "B" })).toHaveAttribute("data-active-style", "fill");
  });
});

describe("AppShell sidebarCollapseMode", () => {
  it("'rail' keeps the sidebar column and collapses a Sidebar inside", async () => {
    renderWithTheme(
      <AppShell
        header={<span>H</span>}
        sidebarCollapsible
        sidebarDefaultCollapsed
        sidebarCollapseMode="rail"
        sidebarRailWidth={64}
        sidebar={
          <Sidebar>
            <NavItem href="/a" icon={<span>•</span>}>Alpha</NavItem>
          </Sidebar>
        }
      >
        main
      </AppShell>
    );
    const shell = document.querySelector(".vf-appshell") as HTMLElement;
    expect(shell.style.gridTemplateColumns.startsWith("64px")).toBe(true);
    expect(shell).toHaveAttribute("data-sidebar-collapsed", "true");
    const aside = shell.querySelector(".vf-appshell__sidebar")!;
    expect(aside).toHaveClass("vf-appshell__sidebar--rail");
    expect(screen.getByRole("complementary", { name: "Sidebar" })).toHaveClass("vf-sidebar--collapsed");
    expect(screen.getByRole("link", { name: "Alpha" })).toHaveAttribute("aria-label", "Alpha");
    const toggle = screen.getByRole("button", { name: "Expand sidebar" });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Sidebar" })).not.toHaveClass("vf-sidebar--collapsed");
    expect(shell.style.gridTemplateColumns.startsWith("240px")).toBe(true);
  });

  it("'hide' (default) still removes the sidebar", () => {
    renderWithTheme(
      <AppShell header={<span>H</span>} sidebarCollapsible sidebarCollapsed sidebar={<div data-testid="sb">S</div>}>
        main
      </AppShell>
    );
    expect(screen.queryByTestId("sb")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show sidebar" })).toBeInTheDocument();
  });

  it("a Sidebar's own collapsed prop wins over the shell", () => {
    renderWithTheme(
      <AppShell sidebarDefaultCollapsed sidebarCollapseMode="rail" sidebar={<Sidebar collapsed={false}>x</Sidebar>}>
        main
      </AppShell>
    );
    expect(screen.getByRole("complementary", { name: "Sidebar" })).not.toHaveClass("vf-sidebar--collapsed");
  });
});
