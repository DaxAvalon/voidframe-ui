// Verifies that accessibility dev-warnings fire for missing labels on
// form controls and overlays. Warnings are suppressed in production builds
// via the NODE_ENV guard in utils/warn.ts.

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Input, Select, Textarea, Toggle } from "../Form";
import { Modal } from "../Interactive";
import { Drawer } from "../Overlay";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { _resetWarnings, getLogger, setLogger } from "../../utils/warn";

let logged: unknown[][];
const original = getLogger();

beforeEach(() => {
  logged = [];
  setLogger({ warn: (...args) => logged.push(args) });
  _resetWarnings();
});

afterEach(() => {
  setLogger(original);
});

describe("Form dev-warnings", () => {
  it("Input warns when no label/aria-label", () => {
    renderWithTheme(<Input value="" onChange={() => {}} />);
    expect(logged.some((l) => String(l[0]).includes("<Input>"))).toBe(true);
  });

  it("Input does not warn when label is provided", () => {
    renderWithTheme(<Input label="NAME" value="" onChange={() => {}} />);
    expect(logged.some((l) => String(l[0]).includes("<Input>"))).toBe(false);
  });

  it("Input does not warn when aria-label is provided", () => {
    renderWithTheme(<Input aria-label="Search" value="" onChange={() => {}} />);
    expect(logged.some((l) => String(l[0]).includes("<Input>"))).toBe(false);
  });

  it("Textarea warns when no label/aria-label", () => {
    renderWithTheme(<Textarea value="" onChange={() => {}} />);
    expect(logged.some((l) => String(l[0]).includes("<Textarea>"))).toBe(true);
  });

  it("Select warns when no label/aria-label", () => {
    renderWithTheme(
      <Select options={[{ value: "a", label: "A" }]} value="a" onChange={() => {}} />
    );
    expect(logged.some((l) => String(l[0]).includes("<Select>"))).toBe(true);
  });

  it("Toggle warns when no label/aria-label", () => {
    renderWithTheme(<Toggle defaultChecked={false} />);
    expect(logged.some((l) => String(l[0]).includes("<Toggle>"))).toBe(true);
  });

  it("Toggle does not warn with aria-label", () => {
    renderWithTheme(<Toggle aria-label="Dark mode" defaultChecked={false} />);
    expect(logged.some((l) => String(l[0]).includes("<Toggle>"))).toBe(false);
  });
});

describe("Overlay dev-warnings", () => {
  it("Modal warns when no title/aria-label", () => {
    // Modal renders nothing when closed, so open=true for the warning to fire.
    render(
      <Modal open onDismiss={() => {}}>
        content
      </Modal>
    );
    expect(logged.some((l) => String(l[0]).includes("<Modal>"))).toBe(true);
  });

  it("Modal does not warn with title", () => {
    render(
      <Modal open onDismiss={() => {}} title="Confirm">
        content
      </Modal>
    );
    expect(logged.some((l) => String(l[0]).includes("<Modal>"))).toBe(false);
  });

  it("Drawer warns when no title/aria-label", () => {
    render(
      <Drawer open onDismiss={() => {}}>
        content
      </Drawer>
    );
    expect(
      logged.some(
        (l) =>
          String(l[0]).includes("<Drawer>") &&
          String(l[0]).includes("title")
      )
    ).toBe(true);
  });

  it("Drawer does not warn about title when title is provided", () => {
    render(
      <Drawer open onDismiss={() => {}} title="Settings">
        content
      </Drawer>
    );
    // The deprecation warning fires (expected), but the title a11y
    // warning should NOT fire when title is provided.
    expect(
      logged.some(
        (l) =>
          String(l[0]).includes("<Drawer>") &&
          String(l[0]).includes("title") &&
          !String(l[0]).includes("deprecated")
      )
    ).toBe(false);
  });
});
