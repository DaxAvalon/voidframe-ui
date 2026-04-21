import { useState } from "react";
import { Button, Dialog } from "voidframe-ui";

/**
 * Fixture for "change theme while a modal is open":
 *   - Open dialog.
 *   - Click `set-light` / `set-dark`: updates the `?theme=` hash portion
 *     and fires a hashchange. The harness (e2e/app/Harness.tsx) re-reads
 *     the query on every render, so VoidframeProvider's `themeName` prop
 *     updates and `data-vf-theme` flips on `.vf-root`.
 *   - Dialog must stay open (controlled state is independent of theme).
 */
export default function ThemeSwitchLiveRoute() {
  const [open, setOpen] = useState(false);

  const setTheme = (theme: "dark" | "light") => {
    const hash = window.location.hash;
    const [path] = hash.split("?");
    const nextHash = `${path || "#/ThemeSwitchLive"}?theme=${theme}`;
    window.location.hash = nextHash;
    // `window.location.hash = …` fires `hashchange` automatically; no
    // manual dispatch needed.
  };

  return (
    <>
      <div style={{ display: "flex", gap: 12 }}>
        <Button data-testid="set-dark" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button data-testid="set-light" onClick={() => setTheme("light")}>
          Light
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button data-testid="open-dialog">Open dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content size="md">
          <Dialog.Title>Theme-switch dialog</Dialog.Title>
          <Dialog.Description>
            The theme buttons stay usable while this is open.
          </Dialog.Description>
          <Dialog.Body>
            <p data-testid="dialog-body">
              Content stays visible across theme toggles.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                data-testid="set-light-inside"
                onClick={() => setTheme("light")}
              >
                Light (from inside)
              </Button>
              <Button
                data-testid="set-dark-inside"
                onClick={() => setTheme("dark")}
              >
                Dark (from inside)
              </Button>
            </div>
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
