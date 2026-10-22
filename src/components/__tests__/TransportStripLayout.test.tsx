// keyshortcut vs binding, row layout, target size, labels, bindings size,
// disabledReason.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TransportStrip, type TransportAction } from "../TransportStrip";

const actions: TransportAction[] = [
  { id: "record", label: "Record", binding: "Numpad 0", icon: <span>●</span>, tone: "danger" },
  { id: "punch", label: "Punch", binding: "↓", keyshortcut: "ArrowDown", icon: <span>↓</span> },
  { id: "flag", label: "Flag", binding: "Esc", keyshortcut: "Escape", enabled: false, disabledReason: "Nothing to flag while idle" },
  { id: "stop", label: "Stop", binding: "Pedal 1", icon: <span>■</span> },
];
const state = { label: "Idle" };
const css = readFileSync(resolve(__dirname, "../../css/components/transport-strip.css"), "utf8");

describe("TransportStrip bindings and keyshortcuts", () => {
  it("writes aria-keyshortcuts only from keyshortcut, never from the display binding", () => {
    renderWithTheme(<TransportStrip actions={actions} state={state} onAction={() => {}} />);
    const record = screen.getByRole("button", { name: "Record, Numpad 0" });
    expect(record).not.toHaveAttribute("aria-keyshortcuts");
    const punch = screen.getByRole("button", { name: "Punch, ↓" });
    expect(punch).toHaveAttribute("aria-keyshortcuts", "ArrowDown");
    expect(punch.querySelector("kbd")!.textContent).toBe("↓");
    expect(screen.getByRole("button", { name: "Stop, Pedal 1" })).not.toHaveAttribute("aria-keyshortcuts");
  });

  it("disabledReason is a tooltip and an accessible description on a disabled action", () => {
    renderWithTheme(<TransportStrip actions={actions} state={state} onAction={() => {}} />);
    const flag = screen.getByRole("button", { name: "Flag, Esc" });
    expect(flag).toBeDisabled();
    expect(flag).toHaveAttribute("title", "Nothing to flag while idle");
    expect(flag).toHaveAccessibleDescription("Nothing to flag while idle");
    // An enabled action does not carry its reason.
    const withReason = actions.map((a) => (a.id === "flag" ? { ...a, enabled: true } : a));
    renderWithTheme(<TransportStrip actions={withReason} state={state} onAction={() => {}} />);
    const enabled = screen.getAllByRole("button", { name: "Flag, Esc" })[1]!;
    expect(enabled).not.toHaveAttribute("title");
    expect(enabled).not.toHaveAttribute("aria-describedby");
  });
});

describe("TransportStrip layout", () => {
  it("row layout, targetSize, labels and showBindings map to classes and a CSS variable", () => {
    const { container } = renderWithTheme(
      <TransportStrip
        actions={actions}
        state={state}
        onAction={() => {}}
        layout="row"
        targetSize={56}
        labels="glyphs"
        showBindings="large"
      />
    );
    const root = container.querySelector(".vf-transport") as HTMLElement;
    expect(root).toHaveClass("vf-transport--row", "vf-transport--labels-glyphs", "vf-transport--bindings-large");
    expect(root).toHaveAttribute("data-layout", "row");
    expect(root.style.getPropertyValue("--vf-transport-target")).toBe("56px");
    // Buttons keep their order from the actions array; record first, stop last.
    const ids = Array.from(root.querySelectorAll(".vf-transport__action")).map((b) => b.getAttribute("data-action"));
    expect(ids).toEqual(["record", "punch", "flag", "stop"]);
    // Only actions with an icon can drop their word.
    expect(root.querySelector("[data-action='record']")).toHaveClass("vf-transport__action--has-icon");
    expect(root.querySelector("[data-action='flag']")).not.toHaveClass("vf-transport__action--has-icon");
  });

  it("defaults: wrap layout, auto labels, normal bindings, no target override", () => {
    const { container } = renderWithTheme(
      <TransportStrip actions={actions} state={state} onAction={() => {}} />
    );
    const root = container.querySelector(".vf-transport") as HTMLElement;
    expect(root).toHaveClass("vf-transport--wrap", "vf-transport--labels-auto");
    expect(root).not.toHaveClass("vf-transport--bindings-large");
    expect(root.style.getPropertyValue("--vf-transport-target")).toBe("");
  });

  it("the stylesheet keeps a row from wrapping and shares width equally", () => {
    const row = css.slice(css.indexOf(".vf-transport--row .vf-transport__actions {"));
    expect(row).toMatch(/\.vf-transport--row \.vf-transport__actions \{[^}]*flex-wrap: nowrap;/);
    expect(row).toMatch(/\.vf-transport--row \.vf-transport__action,[\s\S]*?\{[^}]*flex: 1 1 0;[^}]*min-width: 0;/);
    expect(css).toContain("min-height: var(--vf-transport-target);");
    expect(css).toContain("container-type: inline-size;");
    expect(css).toMatch(/@container \(max-width: 480px\)[\s\S]*vf-transport--labels-auto/);
    // In lg + row the 88px min-width must not apply (seven targets at 390px).
    expect(row).toContain(".vf-transport--row.vf-transport--lg .vf-transport__action");
  });
});
