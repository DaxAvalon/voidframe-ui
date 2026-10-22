import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Menu, ContextMenu } from "../Menu";

const css = readFileSync(resolve(__dirname, "../../css/components/nav-extended.css"), "utf8");

afterEach(() => vi.restoreAllMocks());

describe("Menu.Content positioning", () => {
  it("defaults to bottom/start and exposes side, align and offsets", async () => {
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content side="top" align="end" sideOffset={8} alignOffset={-4} avoidCollisions={false}>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    const menu = screen.getByRole("menu") as HTMLElement;
    expect(menu).toHaveClass("vf-menu__content--side-top", "vf-menu__content--align-end");
    expect(menu).toHaveAttribute("data-side", "top");
    expect(menu).toHaveAttribute("data-align", "end");
    expect(menu.style.getPropertyValue("--vf-menu-side-offset")).toBe("8px");
    expect(menu.style.getPropertyValue("--vf-menu-align-offset")).toBe("-4px");
    expect(css).toContain(".vf-menu__content--side-top { bottom: calc(100% + var(--vf-menu-side-offset)); top: auto; }");
    expect(css).toMatch(/\.vf-menu__content--side-top\.vf-menu__content--align-end \{ inset-inline-end: calc\(-1 \* var\(--vf-menu-align-offset\)\); inset-inline-start: auto; \}/);
  });

  it("flips to the opposite side when the menu would leave the viewport", async () => {
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
    // The menu hangs below the fold with room above.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 700, bottom: 900, left: 10, right: 190, width: 180, height: 200, x: 10, y: 700, toJSON: () => ({}),
    } as DOMRect);
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    const menu = screen.getByRole("menu") as HTMLElement;
    await waitFor(() => expect(menu).toHaveAttribute("data-side", "top"));
    expect(menu).toHaveClass("vf-menu__content--side-top");
  });

  it("shifts along the alignment axis to stay inside the viewport, once per open", async () => {
    Object.defineProperty(window, "innerWidth", { value: 400, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 40, bottom: 140, left: 300, right: 480, width: 180, height: 100, x: 300, y: 40, toJSON: () => ({}),
    } as DOMRect);
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    const menu = screen.getByRole("menu") as HTMLElement;
    await waitFor(() => expect(menu.style.getPropertyValue("--vf-menu-align-offset")).toBe("-88px"));
    expect(menu).toHaveAttribute("data-side", "bottom");
    // A second pass with the same (mocked, unmoved) rect does not stack.
    await new Promise((r) => setTimeout(r, 30));
    expect(menu.style.getPropertyValue("--vf-menu-align-offset")).toBe("-88px");
  });

  it("avoidCollisions=false never flips", async () => {
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 700, bottom: 900, left: 10, right: 190, width: 180, height: 200, x: 10, y: 700, toJSON: () => ({}),
    } as DOMRect);
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content avoidCollisions={false}>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.getByRole("menu")).toHaveAttribute("data-side", "bottom");
  });
});

describe("ContextMenu positioning", () => {
  it("places the menu against the pointer per side/align and clamps inside the viewport", async () => {
    Object.defineProperty(window, "innerWidth", { value: 500, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 500, configurable: true });
    renderWithTheme(
      <ContextMenu content={<Menu.Item>Cut</Menu.Item>} side="right" align="start" sideOffset={10}>
        <div data-testid="area" style={{ width: 300, height: 300 }}>area</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 450, clientY: 100 });
    const menu = screen.getByRole("menu") as HTMLElement;
    expect(menu).toHaveAttribute("data-side", "right");
    vi.spyOn(menu, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 200, left: 460, right: 660, width: 200, height: 100, x: 460, y: 100, toJSON: () => ({}),
    } as DOMRect);
    // Re-open to run placement with the mocked size.
    fireEvent.click(document.body);
    fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 450, clientY: 100 });
    const again = screen.getByRole("menu") as HTMLElement;
    vi.spyOn(again, "getBoundingClientRect").mockReturnValue({
      top: 100, bottom: 200, left: 460, right: 660, width: 200, height: 100, x: 460, y: 100, toJSON: () => ({}),
    } as DOMRect);
    // right side would overflow (450+10+200 > 500) → flips left: 450-200-10 = 240.
    await waitFor(() => expect(again.style.left).toBe("240px"));
    expect(again.style.top).toBe("100px");
  });
});
