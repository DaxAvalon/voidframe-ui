/**
 * Guards the honest-taxonomy invariants:
 *  - every props.json entry resolves a valid kind;
 *  - subcomponent/compat parents resolve to a documented entry
 *    (known extraction gaps are listed explicitly);
 *  - path-based kinds line up with where the source actually lives;
 *  - non-element entries without a live demo have a usage snippet,
 *    so no page falls back to a fake or missing example.
 */
import { describe, expect, it } from "vitest";
import propsData from "../data/props.json";
import { KINDS, resolveKind, KIND_OVERRIDES } from "../../scripts/docs-kinds.mjs";
import { usageSnippets, LIVE_NON_ELEMENTS } from "../usageSnippets";
import type { ComponentDoc } from "../../src/dev";

const docs = propsData as ComponentDoc[];
const names = new Set(docs.map((d) => d.name));

// Parents react-docgen fails to extract (so they have no props.json
// entry). Their children keep standalone pages instead of folding.
const KNOWN_MISSING_PARENTS = new Set(["InputGroup"]);

describe("docs kinds", () => {
  it("every entry carries a valid kind", () => {
    for (const doc of docs) {
      expect(
        doc.kind,
        `${doc.name} (${doc.file}) has no kind — add @docsKind to its JSDoc ` +
          `or an entry in scripts/docs-kinds.mjs, then re-run docs:extract-props.`,
      ).toBeDefined();
      expect(KINDS, `${doc.name} has invalid kind "${doc.kind}"`).toContain(
        doc.kind,
      );
    }
  });

  it("subcomponent and compat parents resolve", () => {
    for (const doc of docs) {
      if (doc.kind !== "subcomponent" && doc.kind !== "compat") continue;
      if (doc.kind === "compat" && !doc.docsParent) continue; // compat root
      expect(
        doc.docsParent,
        `${doc.name} is a ${doc.kind} but has no docsParent`,
      ).toBeDefined();
      if (KNOWN_MISSING_PARENTS.has(doc.docsParent!)) continue;
      expect(
        names.has(doc.docsParent!),
        `${doc.name} points at parent "${doc.docsParent}" which has no docs entry`,
      ).toBe(true);
    }
  });

  it("path-based kinds match source locations", () => {
    for (const doc of docs) {
      if (!doc.file) continue;
      if (doc.file.startsWith("src/compat/")) {
        expect(doc.kind, `${doc.name} lives in src/compat`).toBe("compat");
      }
      if (doc.kind === "element") {
        expect(
          doc.file.startsWith("src/primitives/") ||
            doc.file.startsWith("src/provider/") ||
            doc.file.startsWith("src/compat/"),
          `${doc.name} is an element but lives in ${doc.file}`,
        ).toBe(false);
      }
    }
  });

  it("non-element entries without a live demo have a usage snippet", () => {
    for (const doc of docs) {
      const kind = doc.kind ?? "element";
      if (kind === "element") continue;
      if (LIVE_NON_ELEMENTS.has(doc.name)) continue;
      // Folded kinds are documented on their parent's page.
      if (kind === "subcomponent" || kind === "compat") continue;
      expect(
        usageSnippets[doc.name],
        `${doc.name} (${kind}) renders code-only docs but has no entry in ` +
          `docs/usageSnippets.ts`,
      ).toBeDefined();
    }
  });

  it("resolveKind is deterministic for representative entries", () => {
    expect(resolveKind("VStack", "src/components/Layout.tsx")).toEqual({
      kind: "layout",
    });
    expect(resolveKind("Portal", "src/primitives/Portal.tsx")).toEqual({
      kind: "primitive",
    });
    expect(resolveKind("Select.Item", "src/components/Form.tsx")).toEqual({
      kind: "subcomponent",
      parent: "Select",
    });
    expect(
      resolveKind("SelectItem", "src/compat/shadcn/Select.tsx"),
    ).toEqual({ kind: "compat", parent: "Select" });
    expect(
      resolveKind("SomeWidget", "src/components/SomeWidget.tsx"),
    ).toEqual({ kind: "element" });
    // JSDoc tag wins over everything.
    expect(
      resolveKind("VStack", "src/components/Layout.tsx", {
        docsKind: "element",
      }),
    ).toEqual({ kind: "element" });
  });

  it("KIND_OVERRIDES names all exist in props.json", () => {
    for (const name of Object.keys(KIND_OVERRIDES)) {
      expect(
        names.has(name),
        `KIND_OVERRIDES contains "${name}" which is not in props.json — stale entry?`,
      ).toBe(true);
    }
  });
});
