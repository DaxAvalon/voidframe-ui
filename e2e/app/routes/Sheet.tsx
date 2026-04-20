import { useState } from "react";
import { Sheet, Button } from "voidframe";

export default function SheetRoute() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ minHeight: "120vh" }}>
      <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.4, 0.9]}>
        <Sheet.Trigger asChild>
          <Button data-testid="trigger">Open sheet</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Handle data-testid="handle" />
          <Sheet.Header>
            <Sheet.Title>Bottom sheet</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>
            <p data-testid="body">Snap drag handle to reposition.</p>
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>
      <button data-testid="outside">outside</button>
    </div>
  );
}
