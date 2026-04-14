import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Menu, { ContextMenu, MenuBar, MenuBarMenu } from "../Menu";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Menu", () => {
  it("opens the menu on trigger click", async () => {
    renderWithTheme(
      <Menu>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Copy</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeInTheDocument();
  });

  it("Item onSelect fires and closes the menu", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <Menu>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Copy</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("CheckboxItem emits onCheckedChange", async () => {
    function Ctl() {
      const [checked, setChecked] = useState(false);
      return (
        <Menu defaultOpen>
          <Menu.Trigger>Toggle</Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
              Show bar
            </Menu.CheckboxItem>
          </Menu.Content>
        </Menu>
      );
    }
    renderWithTheme(<Ctl />);
    const item = screen.getByRole("menuitemcheckbox", { name: "Show bar" });
    await userEvent.click(item);
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Show bar" })
    ).toHaveAttribute("aria-checked", "true");
  });

  it("RadioGroup / RadioItem round-trip", async () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>Choose</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup value="a" onValueChange={onValueChange}>
            <Menu.RadioItem value="a">A</Menu.RadioItem>
            <Menu.RadioItem value="b">B</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>
    );
    await userEvent.click(screen.getByRole("menuitemradio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("Separator renders with role=separator", () => {
    renderWithTheme(
      <Menu defaultOpen>
        <Menu.Trigger>x</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>A</Menu.Item>
          <Menu.Separator />
          <Menu.Item>B</Menu.Item>
        </Menu.Content>
      </Menu>
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});

describe("ContextMenu", () => {
  it("opens on contextmenu event", () => {
    renderWithTheme(
      <ContextMenu
        content={
          <button role="menuitem">Open</button>
        }
      >
        <div data-testid="target">right-click me</div>
      </ContextMenu>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target);
    expect(screen.queryByRole("menuitem", { name: "Open" })).toBeInTheDocument();
  });
});

describe("MenuBar", () => {
  it("renders a menubar with MenuBarMenu triggers", async () => {
    renderWithTheme(
      <MenuBar>
        <MenuBarMenu trigger="File">
          <Menu.Item>New</Menu.Item>
        </MenuBarMenu>
      </MenuBar>
    );
    expect(screen.getByRole("menubar")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menuitem", { name: "New" })).toBeInTheDocument();
  });
});
