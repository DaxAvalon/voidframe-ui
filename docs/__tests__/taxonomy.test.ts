import { describe, expect, it } from "vitest";
import { categorize, CATEGORIES } from "../taxonomy";

// Representative file for each curated category. Keep in sync with the
// FILE_MAP / PREFIX_MAP groupings in docs/taxonomy.ts.
const REPRESENTATIVES: Array<[string, string, (typeof CATEGORIES)[number]]> = [
  ["src/primitives/Slot.tsx", "Slot", "Primitives"],
  ["src/components/Button.tsx", "Button", "Core"],
  ["src/components/Layout.tsx", "Layout", "Layout"],
  ["src/components/Menu.tsx", "Menu", "Navigation"],
  ["src/components/Form.tsx", "Form", "Forms"],
  ["src/components/Data.tsx", "Data", "Data"],
  ["src/components/Activity.tsx", "Activity", "Activity"],
  ["src/components/Dialog.tsx", "Dialog", "Overlays"],
  ["src/components/Carousel.tsx", "Carousel", "Media"],
  ["src/components/Animations.tsx", "Animations", "Animation"],
  ["src/charts/Sparkline.tsx", "Sparkline", "Charts"],
  ["src/icons/Icon.tsx", "Icon", "Icons"],
  ["src/components/Chat.tsx", "Chat", "Chat & AI"],
  ["src/components/DevTools.tsx", "DevTools", "Specialty"],
  ["src/components/Interactive.tsx", "Interactive", "Interactive"],
  ["src/dev/Inspector.tsx", "Inspector", "Dev"],
];

describe("docs/taxonomy categorize()", () => {
  for (const [file, name, expected] of REPRESENTATIVES) {
    it(`maps ${file} → ${expected}`, () => {
      expect(categorize(file, name)).toBe(expected);
    });
  }

  it("returns Other for an unknown file path with no matching prefix", () => {
    expect(categorize("src/random/Unmapped.tsx", "Unmapped")).toBe("Other");
  });

  it("returns Other for undefined file", () => {
    expect(categorize(undefined, "Anything")).toBe("Other");
  });

  it("returns Other for an empty string file (falsy)", () => {
    expect(categorize("", "Anything")).toBe("Other");
  });

  it("uses prefix match when no exact entry exists", () => {
    expect(categorize("src/primitives/deeply/nested/Foo.tsx", "Foo")).toBe(
      "Primitives"
    );
    expect(categorize("src/charts/area/Area.tsx", "Area")).toBe("Charts");
    expect(categorize("src/icons/sets/Logo.tsx", "Logo")).toBe("Icons");
    expect(categorize("src/dev/internal/Util.tsx", "Util")).toBe("Dev");
  });

  it("prefers exact map over prefix rules", () => {
    // src/components/Button.tsx is in FILE_MAP as Core; no prefix matches it
    // but ensure the ordering invariant holds for any future overlap.
    expect(categorize("src/components/Button.tsx", "Button")).toBe("Core");
  });

  it("every CATEGORIES entry except Other has at least one representative covered", () => {
    const covered = new Set(REPRESENTATIVES.map(([, , c]) => c));
    for (const cat of CATEGORIES) {
      if (cat === "Other") continue;
      expect(covered.has(cat), `missing representative for ${cat}`).toBe(true);
    }
  });
});
