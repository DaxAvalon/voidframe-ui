// Component taxonomy — maps a component's source file path to a human
// category shown in the sidebar. Categories are ordered as they should
// appear in the nav.
//
// Keep this curated rather than derived so related components stay
// grouped even as files move. Every file under src/components/ should
// have an explicit mapping here to avoid the "Other" bucket.

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
  "Interactive",
  "Dev",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// File → category. Prefer the exact source file so moves are loud.
const FILE_MAP: Record<string, Category> = {
  // Core
  "src/components/Button.tsx": "Core",
  "src/components/Badge.tsx": "Core",
  "src/components/Card.tsx": "Core",
  "src/components/Text.tsx": "Core",
  "src/components/Loading.tsx": "Core",

  // Layout
  "src/components/Layout.tsx": "Layout",
  "src/components/LayoutExtended.tsx": "Layout",
  "src/components/Masonry.tsx": "Layout",
  "src/components/AppShell.tsx": "Layout",
  "src/components/Sidebar.tsx": "Layout",

  // Navigation
  "src/components/Menu.tsx": "Navigation",
  "src/components/MegaMenu.tsx": "Navigation",
  "src/components/BreadcrumbMenu.tsx": "Navigation",
  "src/components/CommandPalette.tsx": "Navigation",
  "src/components/Navigation.tsx": "Navigation",
  "src/components/NavigationExtended.tsx": "Navigation",

  // Forms
  "src/components/Form.tsx": "Forms",
  "src/components/FormAdvanced.tsx": "Forms",
  "src/components/FormExtended.tsx": "Forms",
  "src/components/FormStructure.tsx": "Forms",
  "src/components/Field.tsx": "Forms",
  "src/components/Combobox.tsx": "Forms",
  "src/components/DatePicker.tsx": "Forms",
  "src/components/DateTimePicker.tsx": "Forms",
  "src/components/ColorPicker.tsx": "Forms",
  "src/components/MaskedInput.tsx": "Forms",
  "src/components/MentionInput.tsx": "Forms",
  "src/components/MarkdownEditor.tsx": "Forms",
  "src/components/CodeEditor.tsx": "Forms",
  "src/components/FileUpload.tsx": "Forms",
  "src/components/SignaturePad.tsx": "Forms",
  "src/components/ImageCropper.tsx": "Forms",

  // Data
  "src/components/Data.tsx": "Data",
  "src/components/DataExtended.tsx": "Data",
  "src/components/DataList.tsx": "Data",
  "src/components/DataGrid.tsx": "Data",
  "src/components/TreeView.tsx": "Data",
  "src/components/TreeTable.tsx": "Data",
  "src/components/Virtualization.tsx": "Data",
  "src/components/Viewers.tsx": "Data",
  "src/components/Metrics.tsx": "Data",

  // Activity
  "src/components/Activity.tsx": "Activity",
  "src/components/Calendar.tsx": "Activity",
  "src/components/Gantt.tsx": "Activity",
  "src/components/Kanban.tsx": "Activity",

  // Overlays
  "src/components/Dialog.tsx": "Overlays",
  "src/components/DrawerCompound.tsx": "Overlays",
  "src/components/Popovers.tsx": "Overlays",
  "src/components/Spotlight.tsx": "Overlays",
  "src/components/ToastSystem.tsx": "Overlays",
  "src/components/Overlay.tsx": "Overlays",
  "src/components/Notifications.tsx": "Overlays",
  "src/components/Network.tsx": "Overlays",

  // Media
  "src/components/Carousel.tsx": "Media",
  "src/components/Lightbox.tsx": "Media",
  "src/components/Image.tsx": "Media",
  "src/components/MediaPlayer.tsx": "Media",
  "src/components/Embed.tsx": "Media",

  // Animation / Interactive
  "src/components/Animations.tsx": "Animation",
  "src/components/Interactive.tsx": "Interactive",
  "src/components/Gestures.tsx": "Interactive",
  "src/components/DragDrop.tsx": "Interactive",
  "src/components/Accordion.tsx": "Interactive",

  // Specialty
  "src/components/DevTools.tsx": "Specialty",
  "src/components/Identity.tsx": "Specialty",
  "src/components/Encoding.tsx": "Specialty",
  "src/components/HelpChangelog.tsx": "Specialty",
  "src/components/Widget.tsx": "Specialty",
  "src/components/ColorTools.tsx": "Specialty",

  // Chat & AI — all Chat*.tsx
  "src/components/Chat.tsx": "Chat & AI",
  "src/components/ChatAgent.tsx": "Chat & AI",
  "src/components/ChatAttachments.tsx": "Chat & AI",
  "src/components/ChatCitations.tsx": "Chat & AI",
  "src/components/ChatComposer.tsx": "Chat & AI",
  "src/components/ChatModel.tsx": "Chat & AI",
  "src/components/ChatSession.tsx": "Chat & AI",

  // Extended / remaining surface
  "src/components/Numeric.tsx": "Specialty",
  "src/components/Utility.tsx": "Specialty",
  "src/components/TimeDisplays.tsx": "Specialty",
  "src/components/ShortcutGuide.tsx": "Specialty",
  "src/components/ThemeSelector.tsx": "Specialty",
  "src/components/Print.tsx": "Specialty",
  "src/components/Resizable.tsx": "Layout",
  "src/components/ScrollArea.tsx": "Layout",
  "src/components/Navbar.tsx": "Navigation",
  "src/components/Toolbar.tsx": "Navigation",
  "src/components/Wizard.tsx": "Navigation",
  "src/components/RichEmbed.tsx": "Media",
  "src/components/RichTextEditor.tsx": "Forms",
  "src/components/RatingInput.tsx": "Forms",
  "src/components/TimePicker.tsx": "Forms",
  "src/components/TreeSelect.tsx": "Forms",

  // Framework providers (theming, i18n, shortcuts) — kept under "Dev"
  // so the section nav surfaces them without cluttering Overlays.
  "src/provider/VoidframeProvider.tsx": "Dev",
  "src/provider/ThemeScope.tsx": "Dev",
  "src/i18n/MessagesProvider.tsx": "Dev",
  "src/hooks/useShortcuts.tsx": "Dev",

  // Phase 1 new components
  "src/components/Transfer.tsx": "Forms",
  "src/components/Popconfirm.tsx": "Overlays",
  "src/components/SplitButton.tsx": "Core",
  "src/components/InlineEdit.tsx": "Forms",
  "src/components/NotificationBadge.tsx": "Data",
  "src/components/ToggleGroup.tsx": "Forms",
  "src/components/NumberStepper.tsx": "Forms",
  "src/components/Anchor.tsx": "Navigation",
  "src/components/CopyButton.tsx": "Core",
  "src/components/SkeletonComposites.tsx": "Data",
  "src/components/Cascader.tsx": "Forms",
  "src/components/HorizontalTimeline.tsx": "Data",
  "src/components/Comment.tsx": "Activity",
  "src/components/Result.tsx": "Core",
  "src/components/Descriptions.tsx": "Data",
  "src/components/FloatingActionButton.tsx": "Navigation",
  "src/components/CommandInput.tsx": "Forms",
  "src/components/LiveIndicator.tsx": "Activity",
  "src/components/MultiProgress.tsx": "Data",
  "src/components/HexDump.tsx": "Dev",
  "src/components/CronBuilder.tsx": "Dev",
  "src/components/EnvironmentVars.tsx": "Dev",
  "src/components/FilterBuilder.tsx": "Interactive",
  "src/components/CSVViewer.tsx": "Data",
  "src/components/ImageDiff.tsx": "Media",
  "src/components/ColorContrast.tsx": "Dev",
  "src/components/RegExpTester.tsx": "Dev",
  "src/components/ModelCompare.tsx": "Chat & AI",
  "src/components/TokenVisualizer.tsx": "Chat & AI",
  "src/components/ConfidenceMeter.tsx": "Data",

  // Responsive system
  "src/responsive/Show.tsx": "Layout",
  "src/responsive/ResponsiveBox.tsx": "Layout",

  // Data — split out of the former Viewers.tsx bundle
  "src/components/Viewers/CodeBlock.tsx": "Data",
  "src/components/Viewers/DiffViewer.tsx": "Data",
  "src/components/Viewers/JSONViewer.tsx": "Data",
  "src/components/Viewers/LogViewer.tsx": "Data",
  "src/components/Viewers/MarkdownRenderer.tsx": "Data",

  // Chat — split out of the former Chat.tsx bundle
  "src/components/Chat/Actions.tsx": "Chat & AI",
  "src/components/Chat/Conversation.tsx": "Chat & AI",
  "src/components/Chat/Edit.tsx": "Chat & AI",
  "src/components/Chat/Indicators.tsx": "Chat & AI",
  "src/components/Chat/Message.tsx": "Chat & AI",
  "src/components/Chat/Reactions.tsx": "Chat & AI",

  // Misc surface additions
  "src/components/AsyncData.tsx": "Data",
  "src/components/FormProvider.tsx": "Forms",
};

// Prefix rules — matched after the exact map misses. Order matters.
const PREFIX_MAP: Array<[string, Category]> = [
  ["src/primitives/", "Primitives"],
  ["src/charts/", "Charts"],
  ["src/icons/", "Icons"],
  ["src/dev/", "Dev"],
];

export function categorize(file: string | undefined, _name: string): Category {
  if (!file) return "Other";
  const exact = FILE_MAP[file];
  if (exact) return exact;
  for (const [prefix, cat] of PREFIX_MAP) {
    if (file.startsWith(prefix)) return cat;
  }
  return "Other";
}
