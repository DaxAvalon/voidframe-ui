import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BreadcrumbMenu, type BreadcrumbMenuItem } from "../BreadcrumbMenu";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("BreadcrumbMenu", () => {
  it("renders segments and marks the last as current", () => {
    const items: BreadcrumbMenuItem[] = [
      { label: "Home", href: "/" },
      { label: "Users", href: "/users" },
      { label: "Alice" },
    ];
    renderWithTheme(<BreadcrumbMenu items={items} />);
    expect(screen.getByText("Alice")).toHaveAttribute("aria-current", "page");
  });

  it("reveals sibling popover when caret is clicked", async () => {
    const onSiblingClick = vi.fn();
    const items: BreadcrumbMenuItem[] = [
      {
        label: "Users",
        href: "/users",
        siblings: [
          { label: "Bob", href: "/users/bob", onClick: onSiblingClick },
        ],
      },
      { label: "Alice" },
    ];
    renderWithTheme(<BreadcrumbMenu items={items} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Sibling pages of Users/ })
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Bob" }));
    expect(onSiblingClick).toHaveBeenCalled();
  });

  it("does not render a caret on the current segment", () => {
    const items: BreadcrumbMenuItem[] = [
      { label: "Home" },
      {
        label: "Alice",
        siblings: [{ label: "Bob" }],
      },
    ];
    renderWithTheme(<BreadcrumbMenu items={items} />);
    expect(
      screen.queryByRole("button", { name: /Sibling pages of Alice/ })
    ).not.toBeInTheDocument();
  });
});
