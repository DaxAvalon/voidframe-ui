// Expanded coverage tests for NavigationExtended.tsx — ScrollSpy, BackToTop, TreeNav, UserMenu

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  BackToTop,
  CursorPagination,
  ScrollSpy,
  Shortcut,
  TreeNav,
  UserMenu,
  type TreeNavItem,
} from "../NavigationExtended";

describe("CursorPagination extended", () => {
  it("disables buttons when loading", () => {
    renderWithTheme(
      <CursorPagination hasPrev hasNext loading />
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("supports custom labels", () => {
    renderWithTheme(
      <CursorPagination prevLabel="Back" nextLabel="Forward" />
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <CursorPagination className="custom-pg" />
    );
    expect(container.querySelector(".custom-pg")).toBeInTheDocument();
  });
});

describe("ScrollSpy", () => {
  it("renders list with scrollspy class", () => {
    const { container } = renderWithTheme(
      <ScrollSpy>
        <ScrollSpy.List>
          <ScrollSpy.Item target="section1">Section 1</ScrollSpy.Item>
          <ScrollSpy.Item target="section2">Section 2</ScrollSpy.Item>
        </ScrollSpy.List>
      </ScrollSpy>
    );
    expect(container.querySelector(".vf-scrollspy")).toBeInTheDocument();
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  it("Item click scrolls to target", () => {
    // Create a target element
    const target = document.createElement("div");
    target.id = "test-target";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    renderWithTheme(
      <ScrollSpy>
        <ScrollSpy.List>
          <ScrollSpy.Item target="test-target">Go</ScrollSpy.Item>
        </ScrollSpy.List>
      </ScrollSpy>
    );
    fireEvent.click(screen.getByText("Go"));
    expect(target.scrollIntoView).toHaveBeenCalled();
    document.body.removeChild(target);
  });

  it("renders scrollspy list with correct class", () => {
    const { container } = renderWithTheme(
      <ScrollSpy>
        <ScrollSpy.List data-testid="list">
          <ScrollSpy.Item target="x">X</ScrollSpy.Item>
        </ScrollSpy.List>
      </ScrollSpy>
    );
    expect(container.querySelector(".vf-scrollspy__list")).toBeInTheDocument();
  });
});

describe("BackToTop extended", () => {
  it("bottom-left position class", () => {
    const { container } = renderWithTheme(
      <BackToTop position="bottom-left" />
    );
    expect(container.querySelector(".vf-back-to-top--bottom-left")).toBeInTheDocument();
  });

  it("default position is bottom-right", () => {
    const { container } = renderWithTheme(<BackToTop />);
    expect(container.querySelector(".vf-back-to-top--bottom-right")).toBeInTheDocument();
  });

  it("custom label is applied as aria-label", () => {
    const { container } = renderWithTheme(<BackToTop label="Scroll up" />);
    const btn = container.querySelector(".vf-back-to-top");
    expect(btn).toHaveAttribute("aria-label", "Scroll up");
  });
});

describe("Shortcut extended", () => {
  it("renders multiple key segments", () => {
    renderWithTheme(<Shortcut keys="ctrl+shift+p" />);
    const kbds = document.querySelectorAll(".vf-kbd");
    expect(kbds.length).toBe(3);
  });

  it("has aria-label with key combo", () => {
    renderWithTheme(<Shortcut keys="mod+k" data-testid="sc" />);
    const el = screen.getByTestId("sc");
    expect(el.getAttribute("aria-label")).toBe("Keyboard shortcut: mod+k");
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Shortcut keys="mod+k" className="my-shortcut" />
    );
    expect(container.querySelector(".my-shortcut")).toBeInTheDocument();
  });
});

describe("TreeNav extended", () => {
  const items: TreeNavItem[] = [
    {
      id: "docs",
      label: "Docs",
      children: [
        { id: "api", label: "API" },
        {
          id: "guides",
          label: "Guides",
          children: [{ id: "quick", label: "Quick Start" }],
        },
      ],
    },
    { id: "blog", label: "Blog" },
  ];

  it("deeply nested children render when expanded", async () => {
    renderWithTheme(<TreeNav items={items} defaultExpanded={["docs", "guides"]} />);
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
  });

  it("nested nodes can be collapsed independently", async () => {
    renderWithTheme(<TreeNav items={items} defaultExpanded={["docs", "guides"]} />);
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    // Find the collapse button for "guides" — the second collapse button
    const collapseButtons = screen.getAllByRole("button", { name: "Collapse" });
    await userEvent.click(collapseButtons[1]!);
    expect(screen.queryByText("Quick Start")).not.toBeInTheDocument();
    // "API" should still be visible
    expect(screen.getByText("API")).toBeInTheDocument();
  });

  it("leaf nodes have no expand button", () => {
    renderWithTheme(<TreeNav items={[{ id: "leaf", label: "Leaf" }]} />);
    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
  });

  it("active node on link item uses aria-current=page", () => {
    const linkItems: TreeNavItem[] = [
      { id: "p", label: "Page", href: "/page" },
    ];
    renderWithTheme(<TreeNav items={linkItems} activeId="p" />);
    const link = screen.getByRole("link", { name: "Page" });
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("link item onClick with onSelect prevents default and calls onSelect", async () => {
    const onSelect = vi.fn();
    const linkItems: TreeNavItem[] = [
      { id: "p", label: "Page", href: "/page" },
    ];
    renderWithTheme(<TreeNav items={linkItems} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("link", { name: "Page" }));
    expect(onSelect).toHaveBeenCalledWith("p");
  });
});

describe("UserMenu extended", () => {
  it("renders avatar when provided", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Bob", avatar: <span data-testid="av">B</span> }}>
        <UserMenu.Item>Settings</UserMenu.Item>
      </UserMenu>
    );
    expect(screen.getByTestId("av")).toBeInTheDocument();
  });

  it("does not show email when not provided", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Bob" }}>
        <UserMenu.Item>Settings</UserMenu.Item>
      </UserMenu>
    );
    await userEvent.click(screen.getByRole("button", { name: /Bob/ }));
    expect(document.querySelector(".vf-user-menu__email")).not.toBeInTheDocument();
  });

  it("UserMenu.Separator renders with role=separator", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Bob" }}>
        <UserMenu.Item>Settings</UserMenu.Item>
        <UserMenu.Separator data-testid="sep" />
        <UserMenu.Item>Logout</UserMenu.Item>
      </UserMenu>
    );
    await userEvent.click(screen.getByRole("button", { name: /Bob/ }));
    expect(screen.getByTestId("sep").getAttribute("role")).toBe("separator");
  });

  it("aria-expanded reflects open state", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Alice" }}>
        <UserMenu.Item>Profile</UserMenu.Item>
      </UserMenu>
    );
    const trigger = screen.getByRole("button", { name: /Alice/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
