import { describe, expect, it } from "vitest";
import {
  Button,
  Badge,
  Dots,
  Divider,
  Label,
  Spacer,
  Spinner,
  Kbd,
  Icon,
  // lazy exports
  LazyModal,
  LazyDialog,
  LazyDrawer,
  LazyLightbox,
  LazyDataGrid,
  LazyTreeTable,
  LazyGantt,
  LazyKanban,
  LazyCodeEditor,
  LazyMarkdownEditor,
  LazyRichTextEditor,
  LazyDatePicker,
  LazyDateRangePicker,
  LazyCalendar,
  LazySparkline,
  LazyHeatmap,
  LazySignaturePad,
  LazyImageCropper,
  LazyVideoPlayer,
} from "..";

type MaybeMemo = {
  $$typeof?: symbol;
  type?: unknown;
  displayName?: string;
};

describe("Phase 20 — memoization on leaf components", () => {
  const leaves = [
    { name: "Button", Comp: Button },
    { name: "Badge", Comp: Badge },
    { name: "Dots", Comp: Dots },
    { name: "Label", Comp: Label },
    { name: "Divider", Comp: Divider },
    { name: "Spacer", Comp: Spacer },
    { name: "Spinner", Comp: Spinner },
    { name: "Kbd", Comp: Kbd },
    { name: "Icon", Comp: Icon },
  ];

  it.each(leaves)(
    "$name is a React.memo wrapper with its displayName set",
    ({ name, Comp }) => {
      const c = Comp as unknown as MaybeMemo;
      // React.memo sets $$typeof to Symbol.for("react.memo").
      expect(typeof c.$$typeof).toBe("symbol");
      expect(String(c.$$typeof)).toContain("react.memo");
      expect(c.displayName).toBe(name);
    }
  );
});

describe("Phase 20 — lazy wrappers are code-split boundaries", () => {
  const lazies = [
    { name: "LazyModal", Comp: LazyModal },
    { name: "LazyDialog", Comp: LazyDialog },
    { name: "LazyDrawer", Comp: LazyDrawer },
    { name: "LazyLightbox", Comp: LazyLightbox },
    { name: "LazyDataGrid", Comp: LazyDataGrid },
    { name: "LazyTreeTable", Comp: LazyTreeTable },
    { name: "LazyGantt", Comp: LazyGantt },
    { name: "LazyKanban", Comp: LazyKanban },
    { name: "LazyCodeEditor", Comp: LazyCodeEditor },
    { name: "LazyMarkdownEditor", Comp: LazyMarkdownEditor },
    { name: "LazyRichTextEditor", Comp: LazyRichTextEditor },
    { name: "LazyDatePicker", Comp: LazyDatePicker },
    { name: "LazyDateRangePicker", Comp: LazyDateRangePicker },
    { name: "LazyCalendar", Comp: LazyCalendar },
    { name: "LazySparkline", Comp: LazySparkline },
    { name: "LazyHeatmap", Comp: LazyHeatmap },
    { name: "LazySignaturePad", Comp: LazySignaturePad },
    { name: "LazyImageCropper", Comp: LazyImageCropper },
    { name: "LazyVideoPlayer", Comp: LazyVideoPlayer },
  ];

  it.each(lazies)("$name is a React.lazy exotic component", ({ Comp }) => {
    const c = Comp as unknown as MaybeMemo;
    expect(typeof c.$$typeof).toBe("symbol");
    expect(String(c.$$typeof)).toContain("react.lazy");
  });
});
