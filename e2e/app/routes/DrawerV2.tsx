import { useState } from "react";
import { DrawerV2, Button } from "voidframe";

export default function DrawerV2Route() {
  const [open, setOpen] = useState(false);
  // Force body to be scrollable so ScrollLock tests have something to lock.
  return (
    <div style={{ minHeight: "200vh" }}>
      <DrawerV2 open={open} onOpenChange={setOpen} side="right">
        <DrawerV2.Trigger asChild>
          <Button data-testid="trigger">Open drawer</Button>
        </DrawerV2.Trigger>
        <DrawerV2.Content size={360}>
          <DrawerV2.Header>
            <DrawerV2.Title>Right drawer</DrawerV2.Title>
          </DrawerV2.Header>
          <DrawerV2.Body>
            <p>Drawer body</p>
            <input aria-label="field" data-testid="drawer-input" />
          </DrawerV2.Body>
          <DrawerV2.Footer>
            <DrawerV2.Close asChild>
              <Button data-testid="drawer-close">Close</Button>
            </DrawerV2.Close>
          </DrawerV2.Footer>
        </DrawerV2.Content>
      </DrawerV2>
      <button data-testid="outside">outside</button>
    </div>
  );
}
