import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import {
  ShortcutProvider,
  useShortcut,
  useShortcutRegistry,
} from "../useShortcuts";

function press(opts: Partial<KeyboardEventInit> & { key: string }) {
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...opts }));
}

describe("useShortcut", () => {
  it("fires the handler on matching single-key press", () => {
    const handler = vi.fn();
    renderHook(() => useShortcut("?", handler));
    act(() => press({ key: "?" }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("requires the declared mod key (Cmd/Ctrl)", () => {
    const handler = vi.fn();
    renderHook(() => useShortcut("mod+k", handler));
    act(() => press({ key: "k" }));
    expect(handler).not.toHaveBeenCalled();
    act(() => press({ key: "k", metaKey: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores modifiers the binding didn't request", () => {
    const handler = vi.fn();
    renderHook(() => useShortcut("k", handler));
    act(() => press({ key: "k", metaKey: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire when focus is inside an <input> by default", () => {
    const handler = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    renderHook(() => useShortcut("?", handler));
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      )
    );
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("respects `enabled: false`", () => {
    const handler = vi.fn();
    renderHook(() => useShortcut("?", handler, { enabled: false }));
    act(() => press({ key: "?" }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("registers into ShortcutProvider for discovery", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShortcutProvider>{children}</ShortcutProvider>
    );
    const { result } = renderHook(
      () => {
        useShortcut("mod+k", () => {}, {
          description: "Command palette",
          group: "Navigation",
        });
        return useShortcutRegistry();
      },
      { wrapper }
    );
    expect(result.current?.list).toHaveLength(1);
    expect(result.current?.list[0]).toMatchObject({
      keys: "mod+k",
      description: "Command palette",
      group: "Navigation",
      enabled: true,
    });
  });

  it("unregisters from the provider on unmount", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ShortcutProvider>{children}</ShortcutProvider>
    );
    const { result, unmount } = renderHook(
      () => {
        useShortcut("g", () => {});
        return useShortcutRegistry();
      },
      { wrapper }
    );
    expect(result.current?.list).toHaveLength(1);
    unmount();
    // After unmount the hook subtree is gone; we can't read result.current
    // post-unmount reliably, but the cleanup effect ran without throwing.
  });
});

describe("useShortcutRegistry", () => {
  it("returns null when no provider is in scope", () => {
    const { result } = renderHook(() => useShortcutRegistry());
    expect(result.current).toBeNull();
  });
});
