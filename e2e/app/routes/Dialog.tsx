import { useState } from "react";
import { Dialog, Button } from "voidframe";

export default function DialogRoute() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button data-testid="trigger">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content size="md">
          <Dialog.Title>Ship it?</Dialog.Title>
          <Dialog.Description>
            This will push to the remote.
          </Dialog.Description>
          <Dialog.Body>
            <input aria-label="reason" data-testid="reason-input" />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button data-testid="cancel">Cancel</Button>
            </Dialog.Close>
            <Dialog.Action asChild>
              <Button variant="solid" data-testid="confirm">
                Confirm
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      <button data-testid="outside">outside</button>
    </>
  );
}
