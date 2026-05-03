/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { hasAccessibleGridAncestor } from "../hasAccessibleGridAncestor";

describe("hasAccessibleGridAncestor", () => {
  function build(html: string): Element {
    const host = document.createElement("div");
    host.innerHTML = html.trim();
    document.body.appendChild(host);
    return host.querySelector("[data-target]")!;
  }

  it("returns false for null/undefined", () => {
    expect(hasAccessibleGridAncestor(null)).toBe(false);
    expect(hasAccessibleGridAncestor(undefined)).toBe(false);
  });

  it("returns false when no grid-like ancestor exists", () => {
    const target = build('<div><span data-target>x</span></div>');
    expect(hasAccessibleGridAncestor(target)).toBe(false);
  });

  it.each([
    "grid",
    "row",
    "gridcell",
    "rowheader",
    "columnheader",
    "table",
    "treegrid",
    "listbox",
  ])("returns true when ancestor has role=%s", (role) => {
    const target = build(
      `<div role="${role}"><span data-target>x</span></div>`
    );
    expect(hasAccessibleGridAncestor(target)).toBe(true);
  });

  it.each(["table", "tr", "th", "td"])(
    "returns true when wrapped in native <%s>",
    (tag) => {
      // Tables need full structure for valid HTML.
      const html =
        tag === "table"
          ? '<table data-vf-table><tbody><tr><td><span data-target>x</span></td></tr></tbody></table>'
          : tag === "tr"
            ? '<table><tbody data-vf-tbody><tr><td><span data-target>x</span></td></tr></tbody></table>'
            : tag === "th"
              ? '<table><thead><tr><th><span data-target>x</span></th></tr></thead></table>'
              : '<table><tbody><tr><td><span data-target>x</span></td></tr></tbody></table>';
      const target = build(html);
      expect(hasAccessibleGridAncestor(target)).toBe(true);
    }
  );

  it("returns true when the element ITSELF has a grid role", () => {
    const target = build('<div role="gridcell" data-target>x</div>');
    expect(hasAccessibleGridAncestor(target)).toBe(true);
  });
});
