// Component taxonomy — maps a component's source file path to a human
// category shown in the sidebar. Categories are ordered as they should
// appear in the nav.
//
// Keep this curated rather than derived so related components stay
// grouped even as files move.

export const CATEGORIES = [
  "Primitives",
  "Core",
  "Layout",
  "Navigation",
  "Forms",
  "Data",
  "Activity",
  "Overlays",
  "Media",
  "Animation",
  "Charts",
  "Icons",
  "Chat & AI",
  "Specialty",
  "Dev",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

interface Rule {
  test: (file: string, name: string) => boolean;
  category: Category;
}

const RULES: Rule[] = [
  { test: (f) => f.startsWith("src/primitives/"), category: "Primitives" },
  { test: (f) => f.startsWith("src/charts/"), category: "Charts" },
  { test: (f) => f.startsWith("src/icons/"), category: "Icons" },
  { test: (f) => f.startsWith("src/dev/"), category: "Dev" },
  { test: (f) => /\/Chat.*\.tsx$/.test(f), category: "Chat & AI" },
  {
    test: (f) =>
      [
        "Button.tsx",
        "Badge.tsx",
        "Card.tsx",
        "Text.tsx",
        "Loading.tsx",
        "Tag.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Core",
  },
  {
    test: (f) =>
      [
        "Layout.tsx",
        "LayoutExtended.tsx",
        "Masonry.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Layout",
  },
  {
    test: (f) =>
      [
        "AppShell.tsx",
        "Sidebar.tsx",
        "Menu.tsx",
        "MegaMenu.tsx",
        "BreadcrumbMenu.tsx",
        "CommandPalette.tsx",
        "Navigation.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Navigation",
  },
  {
    test: (f) =>
      [
        "Form.tsx",
        "FormAdvanced.tsx",
        "FormExtended.tsx",
        "FormStructure.tsx",
        "Field.tsx",
        "Combobox.tsx",
        "DatePicker.tsx",
        "DateTimePicker.tsx",
        "ColorPicker.tsx",
        "MaskedInput.tsx",
        "MentionInput.tsx",
        "MarkdownEditor.tsx",
        "CodeEditor.tsx",
        "FileUpload.tsx",
        "SignaturePad.tsx",
        "ImageCropper.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Forms",
  },
  {
    test: (f) =>
      [
        "Data.tsx",
        "DataExtended.tsx",
        "DataList.tsx",
        "DataGrid.tsx",
        "Table.tsx",
        "TreeView.tsx",
        "TreeTable.tsx",
        "Virtualization.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Data",
  },
  {
    test: (f) =>
      [
        "Activity.tsx",
        "Calendar.tsx",
        "Gantt.tsx",
        "Kanban.tsx",
        "Timeline.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Activity",
  },
  {
    test: (f) =>
      [
        "Dialog.tsx",
        "DrawerCompound.tsx",
        "Popovers.tsx",
        "Spotlight.tsx",
        "ToastSystem.tsx",
        "Network.tsx",
        "Feedback.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Overlays",
  },
  {
    test: (f) =>
      [
        "Carousel.tsx",
        "Lightbox.tsx",
        "Image.tsx",
        "MediaPlayer.tsx",
        "Embed.tsx",
        "Gestures.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Media",
  },
  {
    test: (f) =>
      [
        "Animations.tsx",
        "Transitions.tsx",
        "Interactive.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Animation",
  },
  {
    test: (f) =>
      [
        "DevTools.tsx",
        "Identity.tsx",
        "Encoding.tsx",
        "HelpChangelog.tsx",
        "Widget.tsx",
        "Accordion.tsx",
        "ColorTools.tsx",
      ].some((s) => f.endsWith("/" + s)),
    category: "Specialty",
  },
];

export function categorize(file: string | undefined, name: string): Category {
  if (!file) return "Other";
  for (const rule of RULES) {
    if (rule.test(file, name)) return rule.category;
  }
  return "Other";
}
