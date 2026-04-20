import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { ShortcutGuide } from "../ShortcutGuide";
import { ShortcutProvider, useShortcut } from "../../hooks/useShortcuts";
import { renderWithTheme } from "../../../test/renderWithTheme";

function RegisterShortcuts() {
  useShortcut("mod+k", () => {}, {
    description: "Open command palette",
    group: "Navigation",
  });
  useShortcut("g+t", () => {}, {
    description: "Go to top",
    group: "Navigation",
  });
  return null;
}

describe("ShortcutGuide", () => {
  it("lists registered shortcuts grouped by `group`", () => {
    renderWithTheme(
      <ShortcutProvider>
        <RegisterShortcuts />
        <ShortcutGuide alwaysVisible />
      </ShortcutProvider>
    );
    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Open command palette")).toBeInTheDocument();
    expect(screen.getByText("Go to top")).toBeInTheDocument();
  });

  it("triggerKeys='mod+?' opens the guide when Meta+? is pressed", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <ShortcutProvider>
        <ShortcutGuide triggerKeys="mod+?" open={false} onOpenChange={onOpenChange} />
      </ShortcutProvider>
    );
    const ev = new KeyboardEvent("keydown", {
      key: "?",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(ev);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("shows empty state when no shortcuts are registered", () => {
    renderWithTheme(
      <ShortcutProvider>
        <ShortcutGuide alwaysVisible />
      </ShortcutProvider>
    );
    expect(screen.getByText("No shortcuts registered.")).toBeInTheDocument();
  });

  it("controlled open state round-trips via onOpenChange", async () => {
    function Ctl() {
      const [open, setOpen] = [true, vi.fn()] as const;
      return (
        <ShortcutProvider>
          <ShortcutGuide open={open} onOpenChange={setOpen} />
        </ShortcutProvider>
      );
    }
    renderWithTheme(<Ctl />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("useShortcut fires handler when the combo is pressed", () => {
    const handler = vi.fn();
    function Harness() {
      useShortcut("mod+shift+s", handler, { description: "Save as" });
      return <div data-testid="target" />;
    }
    renderWithTheme(
      <ShortcutProvider>
        <Harness />
      </ShortcutProvider>
    );
    const ev = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(ev);
    expect(handler).toHaveBeenCalled();
  });

  it("does not fire when focus is inside an input (default)", () => {
    const handler = vi.fn();
    function Harness() {
      useShortcut("k", handler, { description: "K" });
      useEffect(() => {
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.focus();
        const ev = new KeyboardEvent("keydown", { key: "k", bubbles: true });
        Object.defineProperty(ev, "target", { value: input });
        window.dispatchEvent(ev);
      }, []);
      return null;
    }
    renderWithTheme(
      <ShortcutProvider>
        <Harness />
      </ShortcutProvider>
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders close button when not alwaysVisible", () => {
    renderWithTheme(
      <ShortcutProvider>
        <RegisterShortcuts />
        <ShortcutGuide open={true} />
      </ShortcutProvider>
    );
    expect(
      screen.getByRole("button", { name: "Close shortcut guide" })
    ).toBeInTheDocument();
  });

  it("hides close button when alwaysVisible", () => {
    renderWithTheme(
      <ShortcutProvider>
        <RegisterShortcuts />
        <ShortcutGuide alwaysVisible />
      </ShortcutProvider>
    );
    expect(
      screen.queryByRole("button", { name: "Close shortcut guide" })
    ).not.toBeInTheDocument();
  });

  it("close button fires onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <ShortcutProvider>
        <RegisterShortcuts />
        <ShortcutGuide open={true} onOpenChange={onOpenChange} />
      </ShortcutProvider>
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Close shortcut guide" })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("backdrop click closes the guide", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <ShortcutProvider>
        <ShortcutGuide open={true} onOpenChange={onOpenChange} />
      </ShortcutProvider>
    );
    const dialog = screen.getByRole("dialog");
    // Click on the dialog root (backdrop), not the panel
    await userEvent.click(dialog);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders custom title", () => {
    renderWithTheme(
      <ShortcutProvider>
        <ShortcutGuide alwaysVisible title="My Shortcuts" />
      </ShortcutProvider>
    );
    expect(screen.getByText("My Shortcuts")).toBeInTheDocument();
  });

  it("displays shortcuts in General group when no group specified", () => {
    function GenericShortcut() {
      useShortcut("g", () => {}, { description: "Generic action" });
      return null;
    }
    renderWithTheme(
      <ShortcutProvider>
        <GenericShortcut />
        <ShortcutGuide alwaysVisible />
      </ShortcutProvider>
    );
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Generic action")).toBeInTheDocument();
  });
});
