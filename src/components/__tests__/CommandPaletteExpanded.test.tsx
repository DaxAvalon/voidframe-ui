// Expanded coverage tests for CommandPalette.tsx — shortcuts, registry, Group, dim
// NOTE: Tests avoid mounting CommandPalette.Item to prevent the re-render storm
// documented in the existing CommandPalette.test.tsx.

import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CommandPalette, useCommandRegistry } from "../CommandPalette";

describe("CommandPalette.Group with heading", () => {
  it("renders group without heading when heading is omitted", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input placeholder="search" />
        <CommandPalette.List>
          <CommandPalette.Group data-testid="g">
            <div>child</div>
          </CommandPalette.Group>
        </CommandPalette.List>
      </CommandPalette>
    );
    const group = screen.getByTestId("g");
    expect(group.querySelector(".vf-cmd__group-heading")).not.toBeInTheDocument();
  });
});

describe("CommandPalette global shortcut edge cases", () => {
  it("opens on metaKey+k (macOS)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("custom shortcut works (alt+p)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette shortcut="alt+p" onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "p", altKey: true })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("shift modifier matching (shift+k)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette shortcut="shift+k" onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    // Should not match without shift
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", shiftKey: false })
      );
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    // Should match with shift
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", shiftKey: true })
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("ignores shortcut when key does not match", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <CommandPalette onOpenChange={onOpenChange}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "j", ctrlKey: true })
      );
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("CommandPalette with registry=false", () => {
  it("renders without registry context", () => {
    renderWithTheme(
      <CommandPalette defaultOpen registry={false}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
  });
});

describe("CommandPalette registry context", () => {
  function RegistryConsumer() {
    const registry = useCommandRegistry();
    return (
      <div data-testid="registry-status">
        {registry ? `has-registry:${registry.list.length}` : "no-registry"}
      </div>
    );
  }

  it("useCommandRegistry returns null outside provider", () => {
    renderWithTheme(<RegistryConsumer />);
    expect(screen.getByTestId("registry-status").textContent).toBe("no-registry");
  });
});

describe("CommandPalette Input default placeholder", () => {
  it("uses 'Type a command...' by default", () => {
    renderWithTheme(
      <CommandPalette defaultOpen>
        <CommandPalette.Input />
      </CommandPalette>
    );
    expect(screen.getByPlaceholderText("Type a command…")).toBeInTheDocument();
  });
});

describe("CommandPalette dim=false", () => {
  it("no backdrop rendered and no-dim class added", () => {
    renderWithTheme(
      <CommandPalette defaultOpen dim={false}>
        <CommandPalette.Input placeholder="search" />
      </CommandPalette>
    );
    expect(document.querySelector(".vf-cmd-overlay--no-dim")).toBeInTheDocument();
    expect(document.querySelector(".vf-cmd-overlay__backdrop")).not.toBeInTheDocument();
  });
});
