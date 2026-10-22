// App frame: provider/shell fill and padding, InspectorPane, Navbar overflow,
// NavItem visibility.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import { AppShell } from "../AppShell";
import { InspectorPane } from "../InspectorPane";
import { Navbar, computeVisibleCount } from "../Navbar";
import { Sidebar } from "../Sidebar";
import { NavItem } from "../Navigation";

const css = (rel: string) => readFileSync(resolve(__dirname, "../../css", rel), "utf8");

describe("fill and padding", () => {
  it("VoidframeProvider fill adds the fill class and the stylesheet defines it", () => {
    render(<VoidframeProvider fill scope="root"><span>x</span></VoidframeProvider>);
    expect(document.querySelector(".vf-root")).toHaveClass("vf-root--fill");
    expect(css("base.css")).toMatch(/\.vf-root--fill \{\n  min-height: 100%;\n  display: flex;\n  flex-direction: column;/);
  });

  it("AppShell fill, padded, mainPadding, mainOverflow and footerPadded", () => {
    renderWithTheme(
      <AppShell fill padded={false} mainOverflow="hidden" footerPadded={false} footer={<span>f</span>}>
        main
      </AppShell>
    );
    const shell = document.querySelector(".vf-appshell") as HTMLElement;
    expect(shell.style.height).toBe("100%");
    expect(shell).toHaveClass("vf-appshell--fill", "vf-appshell--unpadded", "vf-appshell--main-hidden", "vf-appshell--footer-unpadded");
    const s = css("components/shell.css");
    expect(s).toContain(".vf-appshell--unpadded .vf-appshell__main { padding: 0; }");
    expect(s).toContain("padding: var(--vf-appshell-main-padding, var(--vf-sp-5));");
    expect(s).toContain(".vf-appshell--footer-unpadded .vf-appshell__footer { padding: 0; }");
  });

  it("mainPadding sets the CSS variable; defaults keep 100vh and padding", () => {
    const { rerender } = renderWithTheme(<AppShell mainPadding={0}>m</AppShell>);
    const shell = document.querySelector(".vf-appshell") as HTMLElement;
    expect(shell.style.getPropertyValue("--vf-appshell-main-padding")).toBe("0px");
    rerender(<AppShell>m</AppShell>);
    expect(shell.style.height).toBe("100vh");
    expect(shell).not.toHaveClass("vf-appshell--unpadded");
  });
});

describe("InspectorPane", () => {
  it("renders a named complementary region with a heading, actions, close and footer", async () => {
    const onClose = vi.fn();
    renderWithTheme(
      <InspectorPane title="Properties" subtitle="Layer 3" actions={<button>Pin</button>} onClose={onClose} footer={<span>foot</span>} width={320}>
        body
      </InspectorPane>
    );
    const pane = screen.getByRole("complementary", { name: "Properties" });
    expect(pane).toHaveClass("vf-inspector");
    expect((pane as HTMLElement).style.width).toBe("320px");
    expect(screen.getByRole("heading", { level: 2, name: "Properties" })).toBeInTheDocument();
    expect(screen.getByText("Layer 3")).toHaveClass("vf-inspector__subtitle");
    expect(screen.getByRole("button", { name: "Pin" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(pane.querySelector(".vf-inspector__body")).toHaveTextContent("body");
    expect(pane.querySelector(".vf-inspector__footer")).toHaveTextContent("foot");
    expect(css("components/shell.css")).toMatch(/\.vf-inspector__body \{[^}]*overflow-y: auto;/);
  });

  it("titleAs and padded=false, aria-label override", () => {
    renderWithTheme(<InspectorPane title={<b>Rich</b>} titleAs="h3" padded={false} aria-label="Details">x</InspectorPane>);
    expect(screen.getByRole("complementary", { name: "Details" })).toHaveClass("vf-inspector--unpadded");
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});

describe("Navbar overflow", () => {
  it("computeVisibleCount fits items, reserves the trigger and applies hysteresis", () => {
    const w = [100, 100, 100, 100];
    expect(computeVisibleCount(w, 10, 1000, 60, 4)).toBe(4);            // all fit
    expect(computeVisibleCount(w, 10, 330, 60, 4)).toBe(2);             // 330-60-10=260 → two 100s + gap
    expect(computeVisibleCount(w, 10, 330, 60, 2)).toBe(2);             // stable
    // Growing from 2 to 3 needs 24px slack beyond the third item: 3 items = 320; room must be ≥ 344.
    expect(computeVisibleCount(w, 10, 320 + 60 + 10, 60, 2)).toBe(2);
    expect(computeVisibleCount(w, 10, 320 + 60 + 10 + 24, 60, 2)).toBe(3);
    // Shrinking never waits.
    expect(computeVisibleCount(w, 10, 150, 60, 4)).toBe(0);
    expect(computeVisibleCount([], 10, 100, 60, 0)).toBe(0);
  });

  it("menu mode moves overflowed links into a More menu that names the current item and activates the real link", async () => {
    const onThird = vi.fn((e: React.MouseEvent) => e.preventDefault());
    renderWithTheme(
      <Navbar>
        <Navbar.Links overflow="menu" maxVisible={2}>
          <Navbar.Link href="/a">Alpha</Navbar.Link>
          <Navbar.Link href="/b">Beta</Navbar.Link>
          <Navbar.Link href="/c" onClick={onThird} active>Gamma</Navbar.Link>
          <Navbar.Link href="/d">Delta</Navbar.Link>
        </Navbar.Links>
      </Navbar>
    );
    const links = document.querySelector(".vf-navbar__links--menu")!;
    expect(links).toHaveAttribute("data-overflow-count", "2");
    expect(links.querySelectorAll(":scope > .vf-navbar__item").length).toBe(2);
    expect(links.querySelectorAll(".vf-navbar__item--overflow").length).toBe(2);
    const more = screen.getByRole("button", { name: "More, 2 more" });
    await userEvent.click(more);
    const current = screen.getByRole("menuitemradio", { name: "Gamma" });
    expect(current).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Delta" })).toHaveAttribute("aria-checked", "false");
    await userEvent.click(current);
    expect(onThird).toHaveBeenCalledTimes(1);
  });

  it("wrap mode (default) renders children untouched", () => {
    renderWithTheme(
      <Navbar>
        <Navbar.Links>
          <Navbar.Link href="/a">Alpha</Navbar.Link>
        </Navbar.Links>
      </Navbar>
    );
    expect(document.querySelector(".vf-navbar__links--menu")).toBeNull();
    expect(document.querySelector(".vf-navbar__item")).toBeNull();
  });
});

describe("NavItem visible", () => {
  it("hides on false, evaluates predicates against Sidebar navContext", () => {
    renderWithTheme(
      <Sidebar navContext={{ role: "viewer" }}>
        <NavItem href="/a">Shown</NavItem>
        <NavItem href="/b" visible={false}>Hidden</NavItem>
        <NavItem href="/c" visible={(ctx) => (ctx as { role: string }).role === "admin"}>Admin only</NavItem>
        <NavItem href="/d" visible={(ctx) => (ctx as { role: string }).role === "viewer"}>Viewer</NavItem>
      </Sidebar>
    );
    expect(screen.getByRole("link", { name: "Shown" })).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).toBeNull();
    expect(screen.queryByText("Admin only")).toBeNull();
    expect(screen.getByRole("link", { name: "Viewer" })).toBeInTheDocument();
  });
});
