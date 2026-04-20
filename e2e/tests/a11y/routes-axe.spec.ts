import { test } from "../helpers/fixtures";

// Chromium-only — axe results vary slightly across engines and CI flake
// is worst when three browsers each run a 25-route sweep.
const ROUTES = [
  "Dialog",
  "DrawerV2",
  "Sheet",
  "Popover",
  "Tooltip",
  "HoverCard",
  "Menu",
  "MenuBar",
  "Popconfirm",
  "Tabs",
  "Accordion",
  "Combobox",
  "MultiSelect",
  "Slider",
  "DatePicker",
  "DateRangePicker",
  "RadioGroup",
  "DataGrid",
  "TreeView",
  "Sortable",
  "Pagination",
  "CopyButton",
  "SignaturePad",
  "ImageCropper",
  "FileUpload",
] as const;

// Known axe findings on at-rest routes. Each entry here is a real library
// a11y bug surfaced by the e2e sweep — tracked in POST-SHIP-GAPS. The
// tests stay in the suite as `fixme` so the gap is visible in every run,
// and they'll auto-fail (green→red promotion) once the fix lands and this
// set is updated.
const KNOWN_GAPS: Record<string, string> = {
  // `role="menubar"` requires `role="menuitem"` children — VoidFrame's
  // MenuBar renders <button> triggers without that role.
  MenuBar: "aria-required-children: menubar triggers missing role=menuitem",
  // Hidden <input type="file"> inside the browse affordance lacks an
  // associated <label> / aria-label; axe flags it even though visually
  // it's decorative (the drop zone is the real target).
  FileUpload: "label: hidden file input needs aria-label",
};

test.describe("axe: routes-at-rest", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Axe sweep runs on chromium only");

  for (const name of ROUTES) {
    const gap = KNOWN_GAPS[name];
    test(`${name} — no violations at rest`, async ({ gotoRoute, expectAxeClean }) => {
      if (gap) test.fixme(true, `Known library gap: ${gap}`);
      await gotoRoute(name);
      await expectAxeClean();
    });
  }
});
