import { useState } from "react";
import { Button, Dialog, PopoverV2 } from "voidframe-ui";

/**
 * Fixture for focus-restore and Escape-unwind chains:
 *   top-trigger → opens Dialog → inner-trigger → opens Popover
 *
 * Used to verify:
 *   - Closing Popover returns focus to `inner-trigger` (inside the Dialog),
 *     not to `top-trigger`.
 *   - Closing Dialog (with Popover already closed) returns focus to
 *     `top-trigger`.
 *   - First Escape closes Popover, Dialog stays open; second Escape closes
 *     Dialog.
 */
export default function FocusChainRoute() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <Button data-testid="top-trigger">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content size="md">
          <Dialog.Title>Focus chain</Dialog.Title>
          <Dialog.Body>
            <PopoverV2>
              <PopoverV2.Trigger asChild>
                <Button data-testid="inner-trigger">Open popover</Button>
              </PopoverV2.Trigger>
              <PopoverV2.Content
                placement="bottom-start"
                modal
                data-testid="popover-content"
              >
                <input
                  aria-label="popover-input"
                  data-testid="inside-popover"
                />
              </PopoverV2.Content>
            </PopoverV2>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button data-testid="dialog-close">Close</Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      <button data-testid="outside">outside</button>
    </>
  );
}
