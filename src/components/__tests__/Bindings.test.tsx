import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import {
  assignBinding,
  bindingEquals,
  bindingFromKeyboardEvent,
  bindingKeyshortcut,
  bindingLabel,
  bindingParts,
  codeLabel,
  findBindingOwner,
  matchesKeyboardEvent,
  toBinding,
  type Binding,
} from "../../utils/binding";
import { ShortcutProvider, useShortcut, useShortcutRegistry } from "../../hooks/useShortcuts";
import { Shortcut } from "../NavigationExtended";
import { ShortcutEditor } from "../DevTools";
import { TransportStrip } from "../TransportStrip";
import { ShortcutGuide } from "../ShortcutGuide";

function press(opts: Partial<KeyboardEventInit> & { key: string }) {
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...opts }));
}

describe("binding utils", () => {
  it("matches key bindings by e.key and code bindings by e.code", () => {
    const byKey = toBinding("5");
    const numpad: Binding = { kind: "code", value: "Numpad5" };
    const top = { key: "5", code: "Digit5", metaKey: false, ctrlKey: false, altKey: false, shiftKey: false };
    const pad = { ...top, code: "Numpad5" };
    expect(matchesKeyboardEvent(byKey, top)).toBe(true);
    expect(matchesKeyboardEvent(byKey, pad)).toBe(true);
    expect(matchesKeyboardEvent(numpad, top)).toBe(false);
    expect(matchesKeyboardEvent(numpad, pad)).toBe(true);
    expect(matchesKeyboardEvent({ kind: "code", value: "mod+Numpad5" }, pad)).toBe(false);
    expect(matchesKeyboardEvent({ kind: "code", value: "mod+Numpad5" }, { ...pad, ctrlKey: true })).toBe(true);
    expect(matchesKeyboardEvent({ kind: "pedal", value: "1" }, pad)).toBe(false);
    // Loose: Shift is tolerated when not requested; strict: it is not.
    const q = { key: "?", code: "Slash", metaKey: false, ctrlKey: false, altKey: false, shiftKey: true };
    expect(matchesKeyboardEvent("?", q)).toBe(true);
    expect(matchesKeyboardEvent("?", q, { modifiers: "strict" })).toBe(false);
  });

  it("builds bindings from events by key or by code and ignores bare modifiers", () => {
    const e = { key: "5", code: "Numpad5", metaKey: true, ctrlKey: false, altKey: false, shiftKey: true };
    expect(bindingFromKeyboardEvent(e)).toEqual({ kind: "key", value: "mod+shift+5" });
    expect(bindingFromKeyboardEvent(e, { by: "code" })).toEqual({ kind: "code", value: "mod+shift+Numpad5" });
    expect(bindingFromKeyboardEvent({ ...e, key: "Shift", code: "ShiftLeft" })).toBeNull();
    expect(bindingFromKeyboardEvent({ ...e, key: "ArrowUp", code: "ArrowUp", metaKey: false, shiftKey: false })).toEqual({
      kind: "key",
      value: "up",
    });
  });

  it("labels and parts are platform-aware and describe codes, pedals and MIDI", () => {
    expect(bindingParts("mod+shift+k", "mac")).toEqual(["⌘", "⇧", "K"]);
    expect(bindingLabel("mod+shift+k", "mac")).toBe("⌘⇧K");
    expect(bindingLabel("mod+shift+k", "pc")).toBe("Ctrl+Shift+K");
    expect(bindingLabel({ kind: "code", value: "mod+Numpad5" }, "pc")).toBe("Ctrl+Numpad 5");
    expect(bindingLabel({ kind: "code", value: "KeyA" }, "pc")).toBe("A");
    expect(bindingLabel({ kind: "pedal", value: "1" })).toBe("Pedal 1");
    expect(bindingLabel({ kind: "midi", value: "note:60" })).toBe("MIDI note 60");
    expect(bindingLabel({ kind: "midi", value: "cc:64", label: "Expression" })).toBe("Expression");
    expect(codeLabel("NumpadAdd")).toBe("Numpad +");
    expect(codeLabel("PageDown")).toBe("Page Down");
    expect(bindingKeyshortcut("mod+shift+k")).toBe("Control+Shift+K");
    expect(bindingKeyshortcut({ kind: "code", value: "Numpad0" })).toBe("0");
    expect(bindingKeyshortcut({ kind: "pedal", value: "1" })).toBeUndefined();
  });

  it("assignBinding enforces one action per binding and names the displaced owner", () => {
    const assignments = { record: "mod+r", stop: { kind: "code", value: "Numpad0" } as Binding, marker: null };
    expect(bindingEquals("Mod+R", "mod+r")).toBe(true);
    expect(bindingEquals({ kind: "code", value: "numpad0" }, { kind: "code", value: "Numpad0" })).toBe(true);
    expect(bindingEquals("5", { kind: "code", value: "Digit5" })).toBe(false);
    expect(findBindingOwner(assignments, "mod+r")).toBe("record");
    expect(findBindingOwner(assignments, "mod+r", "record")).toBeUndefined();
    const r = assignBinding(assignments, "marker", { kind: "code", value: "Numpad0" });
    expect(r.displaced).toBe("stop");
    expect(r.assignments.stop).toBeNull();
    expect(r.assignments.marker).toEqual({ kind: "code", value: "Numpad0" });
    expect(assignBinding(assignments, "record", null)).toEqual({ assignments: { ...assignments, record: null } });
  });
});

describe("useShortcut with bindings", () => {
  it("fires for a code binding only on the physical key, and registers the binding", () => {
    const handler = vi.fn();
    const { result } = renderHook(
      () => {
        useShortcut({ kind: "code", value: "Numpad5" }, handler, { description: "Punch" });
        useShortcut({ kind: "pedal", value: "1" }, () => undefined, { description: "Roll" });
        return useShortcutRegistry();
      },
      { wrapper: ShortcutProvider }
    );
    act(() => press({ key: "5", code: "Digit5" }));
    expect(handler).not.toHaveBeenCalled();
    act(() => press({ key: "5", code: "Numpad5" }));
    expect(handler).toHaveBeenCalledTimes(1);
    const list = result.current!.list;
    expect(list.map((e) => e.binding)).toEqual([
      { kind: "code", value: "Numpad5", label: undefined },
      { kind: "pedal", value: "1", label: undefined },
    ]);
  });
});

describe("Shortcut display with bindings", () => {
  it("renders code, pedal and MIDI bindings with kind data", () => {
    renderWithTheme(
      <>
        <Shortcut keys={{ kind: "code", value: "Numpad5" }} platform="pc" data-testid="a" />
        <Shortcut keys={{ kind: "pedal", value: "2" }} data-testid="b" />
        <Shortcut keys="mod+k" platform="mac" data-testid="c" />
      </>
    );
    expect(screen.getByTestId("a")).toHaveTextContent("Numpad 5");
    expect(screen.getByTestId("a")).toHaveAttribute("data-binding-kind", "code");
    expect(screen.getByTestId("b")).toHaveAttribute("aria-label", "Pedal binding: Pedal 2");
    expect(screen.getByTestId("c").querySelectorAll("kbd")).toHaveLength(2);
  });

  it("ShortcutGuide lists registered bindings and still toggles on its trigger", () => {
    function Probe() {
      useShortcut({ kind: "code", value: "Numpad0", label: "Numpad 0" }, () => undefined, { description: "Stop" });
      return null;
    }
    renderWithTheme(
      <ShortcutProvider>
        <Probe />
        <ShortcutGuide />
      </ShortcutProvider>
    );
    act(() => press({ key: "?", code: "Slash", shiftKey: true }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
    expect(screen.getByText("Numpad 0")).toBeInTheDocument();
  });
});

describe("ShortcutEditor bindings", () => {
  it("learns by code and reports the displaced owner", () => {
    const onChange = vi.fn();
    const onDisplace = vi.fn();
    const assignments = { record: { kind: "code", value: "Numpad0" } as Binding, marker: null };
    renderWithTheme(
      <ShortcutEditor
        mode="code"
        value={null}
        onValueChange={onChange}
        assignments={assignments}
        action="marker"
        actionLabels={{ record: "Record" }}
        onDisplace={onDisplace}
      />
    );
    const trigger = screen.getByRole("button", { name: "Edit shortcut" });
    fireEvent.click(trigger);
    expect(screen.getByText("Press the key to bind…")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "0", code: "Numpad0" });
    expect(onChange).toHaveBeenCalledWith({ kind: "code", value: "Numpad0" });
    expect(onDisplace).toHaveBeenCalledWith("record", { kind: "code", value: "Numpad0" });
  });

  it("shows the owning action for a taken binding and clears to null", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ShortcutEditor
        value={{ kind: "code", value: "Numpad0" }}
        onValueChange={onChange}
        assignments={{ record: { kind: "code", value: "Numpad0" }, marker: { kind: "code", value: "Numpad0" } }}
        action="marker"
        actionLabels={{ record: "Record" }}
      />
    );
    expect(screen.getByText("Already assigned to Record")).toBeInTheDocument();
    expect(screen.getByText("Numpad 0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear shortcut" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("keeps the string API for string consumers", () => {
    const onChange = vi.fn();
    renderWithTheme(<ShortcutEditor value="mod+k" onValueChange={onChange} conflicts={["mod+k"]} />);
    expect(screen.getByText("Already assigned")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear shortcut" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});

describe("TransportStrip bindings", () => {
  it("derives the binding text and aria-keyshortcuts from a Binding", () => {
    renderWithTheme(
      <TransportStrip
        state={{ label: "Idle" }}
        onAction={() => undefined}
        actions={[
          { id: "rec", label: "Record", binding: { kind: "code", value: "Numpad0" } },
          { id: "roll", label: "Roll", binding: { kind: "pedal", value: "1" } },
          { id: "stop", label: "Stop", binding: "Esc", keyshortcut: "Escape" },
        ]}
      />
    );
    const rec = screen.getByRole("button", { name: "Record, Numpad 0" });
    expect(rec).toHaveAttribute("aria-keyshortcuts", "0");
    const roll = screen.getByRole("button", { name: "Roll, Pedal 1" });
    expect(roll).not.toHaveAttribute("aria-keyshortcuts");
    expect(screen.getByRole("button", { name: "Stop, Esc" })).toHaveAttribute("aria-keyshortcuts", "Escape");
  });
});
