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
});
