import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  BackToTop,
  CursorPagination,
  Shortcut,
  TreeNav,
  UserMenu,
  type TreeNavItem,
} from "../NavigationExtended";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("CursorPagination", () => {
  it("prev/next buttons respect has* flags and fire callbacks", async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    renderWithTheme(
      <CursorPagination hasPrev hasNext onPrev={onPrev} onNext={onNext} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPrev).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });

  it("disables prev/next when flags are false", () => {
    renderWithTheme(<CursorPagination />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});

describe("Shortcut", () => {
  it("renders kbd elements for each key", () => {
    renderWithTheme(<Shortcut keys="mod+k" />);
    const kbds = document.querySelectorAll(".vf-kbd");
    expect(kbds.length).toBe(2);
  });
});

describe("BackToTop", () => {
  it("is hidden until scroll threshold is met", () => {
    const { container } = renderWithTheme(<BackToTop threshold={300} />);
    expect(container.querySelector(".vf-back-to-top")).toHaveAttribute("hidden");
  });
});

describe("TreeNav", () => {
  const items: TreeNavItem[] = [
    {
      id: "a",
      label: "A",
      children: [
        { id: "a1", label: "A1" },
        { id: "a2", label: "A2" },
      ],
    },
    { id: "b", label: "B" },
  ];

  it("root nodes render; children hidden until expanded", async () => {
    renderWithTheme(<TreeNav items={items} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("A1")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  it("onSelect fires with the clicked id", async () => {
    const onSelect = vi.fn();
    renderWithTheme(<TreeNav items={items} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("activeId highlights the row", () => {
    const { container } = renderWithTheme(
      <TreeNav items={items} activeId="b" />
    );
    const active = container.querySelector(".vf-treenav__row--active");
    expect(active).toBeInTheDocument();
    expect(active!.textContent).toContain("B");
  });

  it("defaultExpanded opens specified nodes", () => {
    renderWithTheme(<TreeNav items={items} defaultExpanded={["a"]} />);
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
  });

  it("collapse button hides children", async () => {
    renderWithTheme(<TreeNav items={items} defaultExpanded={["a"]} />);
    expect(screen.getByText("A1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Collapse" }));
    expect(screen.queryByText("A1")).not.toBeInTheDocument();
  });

  it("renders links with href when provided", () => {
    const linkItems: TreeNavItem[] = [
      { id: "link", label: "Link Item", href: "/page" },
    ];
    renderWithTheme(<TreeNav items={linkItems} />);
    const link = screen.getByRole("link", { name: "Link Item" });
    expect(link).toHaveAttribute("href", "/page");
  });

  it("has tree role", () => {
    renderWithTheme(<TreeNav items={items} />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });
});

describe("UserMenu", () => {
  it("opens the menu on trigger click", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Alice", email: "a@b.co" }}>
        <UserMenu.Item>Profile</UserMenu.Item>
      </UserMenu>
    );
    await userEvent.click(screen.getByRole("button", { name: /Alice/ }));
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("a@b.co")).toBeInTheDocument();
  });

  it("clicking a menu item closes the menu", async () => {
    renderWithTheme(
      <UserMenu user={{ name: "Alice" }}>
        <UserMenu.Item>Profile</UserMenu.Item>
      </UserMenu>
    );
    await userEvent.click(screen.getByRole("button", { name: /Alice/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Profile" }));
    expect(screen.queryByRole("menuitem", { name: "Profile" })).not.toBeInTheDocument();
  });
});
