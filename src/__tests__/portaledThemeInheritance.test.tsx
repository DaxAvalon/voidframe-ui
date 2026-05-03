import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { VoidframeProvider, Dialog } from "../index";

// Phase A.1 integration check — VoidframeProvider writes the active theme
// attributes to <html>, so any portaled child cascades from those tokens
// regardless of where in the DOM the portal mounts. One representative
// overlay (Dialog) is enough; per-overlay regressions live in each
// component's own test file and the unit-level provider tests in
// `documentElement.test.tsx`.

describe("Portaled overlays inherit provider theme via <html>", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.removeAttribute("data-vf-theme");
  });

  it("Dialog (portal) inherits the provider's theme through documentElement", () => {
    render(
      <VoidframeProvider themeName="midnight">
        <Dialog defaultOpen>
          <Dialog.Content>body</Dialog.Content>
        </Dialog>
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("midnight");
  });

  it("scope='root' opts the provider out of writing to documentElement", () => {
    render(
      <VoidframeProvider themeName="light" scope="root">
        <Dialog defaultOpen>
          <Dialog.Content>body</Dialog.Content>
        </Dialog>
      </VoidframeProvider>
    );
    expect(document.documentElement.hasAttribute("data-vf-theme")).toBe(false);
  });
});
