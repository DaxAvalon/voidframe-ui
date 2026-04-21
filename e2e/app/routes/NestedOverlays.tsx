import { useState } from "react";
import {
  Button,
  ContextMenu,
  Dialog,
  DrawerV2,
  PopoverV2,
  Toaster,
  toast,
} from "voidframe-ui";

/**
 * Composed fixture for Tier D integration coverage:
 *   - Dialog body contains a PopoverV2 trigger (popover-inside-dialog stack).
 *   - Dialog body contains a ContextMenu surface (menu-over-modal stack).
 *   - Dialog body contains a "fire toast" button (toast-above-backdrop).
 *   - A separate DrawerV2 wraps its own ContextMenu surface (menu-over-drawer).
 *
 * The Toaster is mounted at route level so it portals to document.body
 * regardless of which overlay is open.
 */
export default function NestedOverlaysRoute() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toastDuration = 10_000;

  return (
    <>
      <Toaster position="top-right" max={5} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <Button data-testid="open-dialog">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content size="md">
          <Dialog.Title>Nested overlays</Dialog.Title>
          <Dialog.Description>
            Popover, toast, and context menu composed inside a modal.
          </Dialog.Description>
          <Dialog.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <PopoverV2>
                <PopoverV2.Trigger asChild>
                  <Button data-testid="open-popover">Open popover</Button>
                </PopoverV2.Trigger>
                <PopoverV2.Content
                  placement="bottom-start"
                  data-testid="popover-content"
                >
                  <p>Popover inside dialog</p>
                  <input
                    aria-label="popover-field"
                    data-testid="popover-input"
                  />
                </PopoverV2.Content>
              </PopoverV2>

              <Button
                data-testid="fire-toast"
                onClick={() =>
                  toast.success({
                    title: "Saved from dialog",
                    duration: toastDuration,
                  })
                }
              >
                Fire toast
              </Button>

              <ContextMenu
                content={
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="dialog-ctx-copy"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      data-testid="dialog-ctx-paste"
                    >
                      Paste
                    </button>
                  </>
                }
              >
                <div
                  data-testid="dialog-ctx-surface"
                  style={{
                    padding: 16,
                    border: "1px dashed currentColor",
                    userSelect: "none",
                  }}
                >
                  Right-click inside dialog
                </div>
              </ContextMenu>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button data-testid="dialog-close">Close</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <DrawerV2 open={drawerOpen} onOpenChange={setDrawerOpen} side="right">
        <DrawerV2.Trigger asChild>
          <Button data-testid="open-drawer">Open drawer</Button>
        </DrawerV2.Trigger>
        <DrawerV2.Content size={360}>
          <DrawerV2.Header>
            <DrawerV2.Title>Drawer with context menu</DrawerV2.Title>
          </DrawerV2.Header>
          <DrawerV2.Body>
            <ContextMenu
              content={
                <>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="drawer-ctx-rename"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="drawer-ctx-delete"
                  >
                    Delete
                  </button>
                </>
              }
            >
              <div
                data-testid="drawer-ctx-surface"
                style={{
                  padding: 16,
                  border: "1px dashed currentColor",
                  userSelect: "none",
                }}
              >
                Right-click inside drawer
              </div>
            </ContextMenu>
          </DrawerV2.Body>
          <DrawerV2.Footer>
            <DrawerV2.Close asChild>
              <Button data-testid="drawer-close">Close</Button>
            </DrawerV2.Close>
          </DrawerV2.Footer>
        </DrawerV2.Content>
      </DrawerV2>

      <button data-testid="outside">outside</button>
    </>
  );
}
