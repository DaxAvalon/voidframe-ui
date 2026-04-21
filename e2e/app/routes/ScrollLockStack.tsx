import { useState } from "react";
import { Button, Dialog, DrawerV2 } from "voidframe";

/**
 * Fixture for scroll-lock ref-count behaviour:
 *   Drawer open → Dialog open (both lock) → close Dialog (still locked
 *   because Drawer owns the outstanding lock) → close Drawer (unlocks).
 *
 * Both modals lock `document.body.style.overflow = "hidden"` via the shared
 * ScrollLock primitive (src/primitives/ScrollLock.tsx).
 */
export default function ScrollLockStackRoute() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    // Force body to be scrollable so the lock has an observable effect.
    <div style={{ minHeight: "200vh" }}>
      <DrawerV2 open={drawerOpen} onOpenChange={setDrawerOpen} side="right">
        <DrawerV2.Trigger asChild>
          <Button data-testid="open-drawer">Open drawer</Button>
        </DrawerV2.Trigger>
        <DrawerV2.Content size={360}>
          <DrawerV2.Header>
            <DrawerV2.Title>Drawer</DrawerV2.Title>
          </DrawerV2.Header>
          <DrawerV2.Body>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <Button data-testid="open-nested-dialog">
                  Open nested dialog
                </Button>
              </Dialog.Trigger>
              <Dialog.Content size="sm">
                <Dialog.Title>Nested dialog</Dialog.Title>
                <Dialog.Body>
                  <p>Both locks are active while this is open.</p>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button data-testid="nested-dialog-close">Close</Button>
                  </Dialog.Close>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog>
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
