import { Menu, Button } from "voidframe";

export default function MenuRoute() {
  return (
    <>
      <Menu>
        <Menu.Trigger asChild>
          <Button data-testid="trigger">Open menu</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item data-testid="item-first" onSelect={() => {}}>
            First
          </Menu.Item>
          <Menu.Item data-testid="item-second" onSelect={() => {}}>
            Second
          </Menu.Item>
          <Menu.Separator />
          <Menu.Sub>
            <Menu.SubTrigger data-testid="sub-trigger">
              More
            </Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item data-testid="sub-item-one" onSelect={() => {}}>
                Sub one
              </Menu.Item>
              <Menu.Item data-testid="sub-item-two" onSelect={() => {}}>
                Sub two
              </Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
      <button data-testid="outside">outside</button>
    </>
  );
}
