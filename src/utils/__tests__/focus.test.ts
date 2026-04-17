import { describe, expect, it, beforeEach } from "vitest";
import {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
  isFocusable,
  isTabbable,
} from "../focus";

/**
 * Build a container with child elements for testing.
 * Uses safe DOM APIs instead of innerHTML.
 */
function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, v);
  }
  if (text) node.textContent = text;
  return node;
}

function wrap(...children: HTMLElement[]): HTMLElement {
  const div = document.createElement("div");
  for (const child of children) div.appendChild(child);
  document.body.appendChild(div);
  return div;
}

let container: HTMLElement;

beforeEach(() => {
  document.body.textContent = "";
});

// ── FOCUSABLE_SELECTOR ────────────────────────────────────────

describe("FOCUSABLE_SELECTOR", () => {
  it("is a non-empty string", () => {
    expect(typeof FOCUSABLE_SELECTOR).toBe("string");
    expect(FOCUSABLE_SELECTOR.length).toBeGreaterThan(0);
  });
});

// ── getFocusableElements ──────────────────────────────────────

describe("getFocusableElements", () => {
  it("finds buttons, links, and inputs", () => {
    container = wrap(
      el("button", {}, "Click"),
      el("a", { href: "/test" }, "Link"),
      el("input", { type: "text" }),
      el("div", {}, "Not focusable")
    );
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(3);
  });

  it("excludes disabled elements by default", () => {
    container = wrap(
      el("button", {}, "Enabled"),
      el("button", { disabled: "" }, "Disabled")
    );
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it("includes disabled elements when includeDisabled is true", () => {
    container = wrap(
      el("button", {}, "Enabled"),
      el("button", { disabled: "" }, "Disabled")
    );
    const elements = getFocusableElements(container, { includeDisabled: true });
    expect(elements).toHaveLength(2);
  });

  it("excludes hidden elements", () => {
    container = wrap(
      el("button", {}, "Visible"),
      el("button", { hidden: "" }, "Hidden")
    );
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it("excludes elements inside aria-hidden subtrees", () => {
    const hiddenParent = el("div", { "aria-hidden": "true" });
    hiddenParent.appendChild(el("button", {}, "Hidden"));
    container = wrap(
      el("button", {}, "Visible"),
      hiddenParent
    );
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it("excludes tabindex=-1 from tabbableOnly results", () => {
    container = wrap(
      el("button", { tabindex: "-1" }, "Not tabbable"),
      el("button", { tabindex: "0" }, "Tabbable")
    );
    const elements = getFocusableElements(container, { tabbableOnly: true });
    expect(elements).toHaveLength(1);
    expect(elements[0].textContent).toBe("Tabbable");
  });

  it("includes tabindex=-1 when tabbableOnly is false", () => {
    container = wrap(
      el("button", { tabindex: "-1" }, "Focus only"),
      el("button", {}, "Normal")
    );
    const elements = getFocusableElements(container, { tabbableOnly: false });
    expect(elements).toHaveLength(2);
  });

  it("sorts by tabindex (positive indices first)", () => {
    container = wrap(
      el("button", { tabindex: "0" }, "Zero"),
      el("button", { tabindex: "2" }, "Two"),
      el("button", { tabindex: "1" }, "One")
    );
    const elements = getFocusableElements(container);
    expect(elements[0].textContent).toBe("One");
    expect(elements[1].textContent).toBe("Two");
    expect(elements[2].textContent).toBe("Zero");
  });

  it("returns empty array for container with no focusable children", () => {
    container = wrap(el("span", {}, "Text"));
    expect(getFocusableElements(container)).toHaveLength(0);
  });

  it("finds contenteditable elements", () => {
    container = wrap(el("div", { contenteditable: "true" }, "Editable"));
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it("finds details > summary", () => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Toggle";
    details.appendChild(summary);
    details.appendChild(el("p", {}, "Content"));
    container = wrap(details);
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
  });

  it("excludes elements inside inert subtrees", () => {
    const inertDiv = el("div", { inert: "" });
    inertDiv.appendChild(el("button", {}, "Inert"));
    container = wrap(
      el("button", {}, "Active"),
      inertDiv
    );
    const elements = getFocusableElements(container);
    expect(elements).toHaveLength(1);
    expect(elements[0].textContent).toBe("Active");
  });
});

// ── getFirstFocusable / getLastFocusable ──────────────────────

describe("getFirstFocusable", () => {
  it("returns the first focusable element", () => {
    container = wrap(
      el("span", {}, "Text"),
      el("button", {}, "First"),
      el("button", {}, "Second")
    );
    expect(getFirstFocusable(container)?.textContent).toBe("First");
  });

  it("returns null for empty container", () => {
    container = wrap(el("div"));
    expect(getFirstFocusable(container)).toBeNull();
  });
});

describe("getLastFocusable", () => {
  it("returns the last focusable element", () => {
    container = wrap(
      el("button", {}, "First"),
      el("button", {}, "Last")
    );
    expect(getLastFocusable(container)?.textContent).toBe("Last");
  });
});

// ── isFocusable / isTabbable ──────────────────────────────────

describe("isFocusable", () => {
  it("returns true for a button", () => {
    container = wrap(el("button", {}, "Click"));
    expect(isFocusable(container.querySelector("button")!)).toBe(true);
  });

  it("returns false for a plain div", () => {
    container = wrap(el("div", {}, "Text"));
    expect(isFocusable(container.querySelector("div")!)).toBe(false);
  });
});

describe("isTabbable", () => {
  it("returns true for tabindex=0", () => {
    container = wrap(el("button", { tabindex: "0" }, "Click"));
    expect(isTabbable(container.querySelector("button")!)).toBe(true);
  });

  it("returns false for tabindex=-1", () => {
    container = wrap(el("button", { tabindex: "-1" }, "Click"));
    expect(isTabbable(container.querySelector("button")!)).toBe(false);
  });
});
