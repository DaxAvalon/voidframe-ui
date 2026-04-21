import { MenuBar, MenuBarMenu, Menu } from "voidframe-ui";

export default function MenuBarRoute() {
  return (
    <>
      <MenuBar>
        <MenuBarMenu trigger="File">
          <Menu.Item data-testid="file-new" onSelect={() => {}}>
            New
          </Menu.Item>
          <Menu.Item data-testid="file-open" onSelect={() => {}}>
            Open
          </Menu.Item>
        </MenuBarMenu>
        <MenuBarMenu trigger="Edit">
          <Menu.Item data-testid="edit-undo" onSelect={() => {}}>
            Undo
          </Menu.Item>
          <Menu.Item data-testid="edit-redo" onSelect={() => {}}>
            Redo
          </Menu.Item>
        </MenuBarMenu>
        <MenuBarMenu trigger="View">
          <Menu.Item data-testid="view-zoom" onSelect={() => {}}>
            Zoom
          </Menu.Item>
        </MenuBarMenu>
      </MenuBar>
      <button data-testid="outside">outside</button>
    </>
  );
}
