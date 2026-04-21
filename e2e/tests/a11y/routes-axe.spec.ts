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
  "ContextMenu",
  "Popconfirm",
  "Spotlight",
  "CommandPalette",
  "ToastSystem",
  "Tabs",
  "Accordion",
  "Collapsible",
  "Toolbar",
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
  "Stepper",
  "CopyButton",
  "SignaturePad",
  "ImageCropper",
  "FileUpload",
  "Carousel",
  "ScrollArea",
  "Resizable",
  "Calendar",
  "ColorPicker",
  "NumberStepper",
  "Wizard",
  "NestedOverlays",
  "FocusChain",
  "ScrollLockStack",
  "ThemeSwitchLive",
] as const;

test.describe("axe: routes-at-rest", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Axe sweep runs on chromium only");

  for (const name of ROUTES) {
    test(`${name} — no violations at rest`, async ({ gotoRoute, expectAxeClean }) => {
      await gotoRoute(name);
      await expectAxeClean();
    });
  }
});
