import { useState } from "react";
import { CommandPalette, Button } from "voidframe-ui";

export default function CommandPaletteRoute() {
  // `shortcut={null}` disables the global cmd+k binding so tests don't
  // depend on OS-specific modifier keys. An explicit Button toggles `open`.
  const [open, setOpen] = useState(false);
  const [lastSelected, setLastSelected] = useState("");
  return (
    <>
      <Button data-testid="open" onClick={() => setOpen((o) => !o)}>
        Open palette
      </Button>
      <span data-testid="last-selected">{lastSelected}</span>
      <CommandPalette open={open} onOpenChange={setOpen} shortcut={null}>
        <CommandPalette.Input placeholder="Type a command…" />
        <CommandPalette.List>
          <CommandPalette.Group heading="Actions">
            <CommandPalette.Item id="open" onSelect={() => setLastSelected("open")}>
              Open file
            </CommandPalette.Item>
            <CommandPalette.Item id="save" onSelect={() => setLastSelected("save")}>
              Save file
            </CommandPalette.Item>
            <CommandPalette.Item id="quit" onSelect={() => setLastSelected("quit")}>
              Quit
            </CommandPalette.Item>
          </CommandPalette.Group>
          <CommandPalette.Empty>No results</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette>
      <button data-testid="outside">outside</button>
    </>
  );
}
