/* eslint-disable @typescript-eslint/no-explicit-any */

// Canonical name -> subpath table. Names not listed here (and not matching
// the `*Icon` fallback below) are treated as root-only and cause the rule
// to skip autofixing that import.
const NAME_TO_SUBPATH: Record<string, string> = {
  // primitives
  Portal: "primitives",
  FocusScope: "primitives",
  DismissableLayer: "primitives",
  Slot: "primitives",
  Presence: "primitives",
  LiveRegion: "primitives",
  ScrollLock: "primitives",
  RovingFocusGroup: "primitives",
  VisuallyHidden: "primitives",
  AccessibleIcon: "primitives",
  // core
  Button: "core",
  Badge: "core",
  Card: "core",
  Text: "core",
  Label: "core",
  Divider: "core",
  Spacer: "core",
  Loading: "core",
  SplitButton: "core",
  CopyButton: "core",
  Result: "core",
  // layout
  Flex: "layout",
  HStack: "layout",
  VStack: "layout",
  Grid: "layout",
  Container: "layout",
  Center: "layout",
  AspectRatio: "layout",
  SplitView: "layout",
  Stretch: "layout",
  Box: "layout",
  AppShell: "layout",
  Sidebar: "layout",
  Masonry: "layout",
  Resizable: "layout",
  ResizableGroup: "layout",
  ResizablePanel: "layout",
  ResizableHandle: "layout",
  ScrollArea: "layout",
  Show: "layout",
  ResponsiveBox: "layout",
  // navigation
  Menu: "navigation",
  MenuBar: "navigation",
  ContextMenu: "navigation",
  MegaMenu: "navigation",
  Breadcrumb: "navigation",
  BreadcrumbMenu: "navigation",
  CommandPalette: "navigation",
  Navbar: "navigation",
  Toolbar: "navigation",
  Stepper: "navigation",
  Wizard: "navigation",
  NavItem: "navigation",
  Anchor: "navigation",
  FloatingActionButton: "navigation",
  // forms
  Input: "forms",
  Textarea: "forms",
  Select: "forms",
  Checkbox: "forms",
  Radio: "forms",
  RadioGroup: "forms",
  Switch: "forms",
  Slider: "forms",
  Form: "forms",
  Field: "forms",
  FormProvider: "forms",
  Combobox: "forms",
  MultiSelect: "forms",
  DatePicker: "forms",
  DateRangePicker: "forms",
  DateTimePicker: "forms",
  TimePicker: "forms",
  ColorPicker: "forms",
  MaskedInput: "forms",
  MentionInput: "forms",
  MarkdownEditor: "forms",
  CodeEditor: "forms",
  RichTextEditor: "forms",
  FileUpload: "forms",
  SignaturePad: "forms",
  ImageCropper: "forms",
  Transfer: "forms",
  InlineEdit: "forms",
  ToggleGroup: "forms",
  Toggle: "forms",
  NumberStepper: "forms",
  NumberInput: "forms",
  Cascader: "forms",
  CommandInput: "forms",
  RatingInput: "forms",
  TreeSelect: "forms",
  PasswordInput: "forms",
  SearchInput: "forms",
  // data
  DataGrid: "data",
  DataList: "data",
  TreeView: "data",
  TreeTable: "data",
  VirtualList: "data",
  Viewers: "data",
  CodeBlock: "data",
  JSONViewer: "data",
  LogViewer: "data",
  DiffViewer: "data",
  MarkdownRenderer: "data",
  Progress: "data",
  MultiProgress: "data",
  Skeleton: "data",
  SkeletonText: "data",
  SkeletonAvatar: "data",
  SkeletonButton: "data",
  SkeletonCard: "data",
  SkeletonTable: "data",
  SkeletonForm: "data",
  NotificationBadge: "data",
  Descriptions: "data",
  HorizontalTimeline: "data",
  CSVViewer: "data",
  ConfidenceMeter: "data",
  AsyncData: "data",
  Stat: "data",
  StatGroup: "data",
  // activity
  Calendar: "activity",
  Gantt: "activity",
  Kanban: "activity",
  Comment: "activity",
  LiveIndicator: "activity",
  Activity: "activity",
  // overlays
  Dialog: "overlays",
  Drawer: "overlays",
  DrawerV2: "overlays",
  Sheet: "overlays",
  Popover: "overlays",
  PopoverV2: "overlays",
  Tooltip: "overlays",
  TooltipProvider: "overlays",
  HoverCard: "overlays",
  Spotlight: "overlays",
  CoachMark: "overlays",
  Toaster: "overlays",
  Snackbar: "overlays",
  toast: "overlays",
  useToast: "overlays",
  Modal: "overlays",
  Alert: "overlays",
  AlertV2: "overlays",
  BannerAlert: "overlays",
  Callout: "overlays",
  Quote: "overlays",
  Popconfirm: "overlays",
  AlertDialog: "overlays",
  // media
  Carousel: "media",
  Lightbox: "media",
  Image: "media",
  MediaPlayer: "media",
  Embed: "media",
  RichEmbed: "media",
  ImageDiff: "media",
  // animation
  FadeIn: "animation",
  SlideIn: "animation",
  Animations: "animation",
  // icons (explicit names; any trailing `*Icon` also maps to icons via fallback)
  Icon: "icons",
  IconButton: "icons",
  adaptIcon: "icons",
  // chat
  Chat: "chat",
  ChatAgent: "chat",
  ChatComposer: "chat",
  ChatSession: "chat",
  ChatModel: "chat",
  ChatCitations: "chat",
  ChatAttachments: "chat",
  Message: "chat",
  Conversation: "chat",
  ModelCompare: "chat",
  TokenVisualizer: "chat",
  ReactionBar: "chat",
  ReactionPicker: "chat",
  // specialty
  ThemeSelector: "specialty",
  ShortcutGuide: "specialty",
  Print: "specialty",
  ColorTools: "specialty",
  Numeric: "specialty",
  Utility: "specialty",
  TimeDisplays: "specialty",
  DevTools: "specialty",
  Identity: "specialty",
  Encoding: "specialty",
  HelpChangelog: "specialty",
  Widget: "specialty",
  // interactive
  Interactive: "interactive",
  Gestures: "interactive",
  DragDrop: "interactive",
  Accordion: "interactive",
  FilterBuilder: "interactive",
  Collapsible: "interactive",
  Kbd: "interactive",
};

// Root-only names (theming + hooks). These should never trigger a subpath
// suggestion — they're only exported from the monolithic barrel.
const ROOT_ONLY = new Set([
  "VoidframeProvider",
  "useTokens",
  "useThemeScope",
  "ThemeScope",
  "createTheme",
  "lightTheme",
  "darkTheme",
  "midnightTheme",
  "greyTheme",
  "tint",
  "defaultTokens",
]);

function subpathFor(name: string): string | null {
  if (ROOT_ONLY.has(name)) return null;
  if (NAME_TO_SUBPATH[name]) return NAME_TO_SUBPATH[name]!;
  if (/Icon$/.test(name)) return "icons";
  return null;
}

const rule = {
  meta: {
    type: "suggestion" as const,
    fixable: "code" as const,
    docs: {
      description:
        "Prefer subpath imports over the monolithic root import for better tree-shaking.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#prefer-subpath-import",
    },
    messages: {
      preferSubpath:
        "Import `{{name}}` from `voidframe-ui/{{subpath}}` instead of the monolithic root to enable tree-shaking.",
      mixedSubpaths:
        "Imports from `voidframe-ui` span multiple subpaths ({{subpaths}}). Split into separate import statements per subpath for best tree-shaking.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      ImportDeclaration(node: any) {
        if (node.source?.value !== "voidframe-ui") return;
        const specifiers = node.specifiers ?? [];
        if (specifiers.length === 0) return;

        // Collect subpaths per specifier. Skip root-only names and
        // default / namespace specifiers (we only know named members).
        const groups: Record<string, string[]> = {};
        let hasRootOnly = false;
        let hasUnknown = false;
        for (const spec of specifiers) {
          if (spec.type !== "ImportSpecifier") {
            // default or namespace import — never suggest a subpath.
            hasUnknown = true;
            continue;
          }
          const name = spec.imported?.name;
          if (!name) continue;
          if (ROOT_ONLY.has(name)) {
            hasRootOnly = true;
            continue;
          }
          const sub = subpathFor(name);
          if (!sub) {
            hasUnknown = true;
            continue;
          }
          (groups[sub] ??= []).push(name);
        }

        const subpaths = Object.keys(groups);
        if (subpaths.length === 0) return;

        if (subpaths.length === 1 && !hasRootOnly && !hasUnknown) {
          const sub = subpaths[0]!;
          const names = groups[sub]!;
          for (const n of names) {
            context.report({
              node,
              messageId: "preferSubpath",
              data: { name: n, subpath: sub },
              fix(fixer: any) {
                // Rewrite just the string literal — preserves quote style
                // only approximately, but the autofix output is stable.
                const quote = (node.source.raw ?? '"').slice(0, 1);
                return fixer.replaceText(
                  node.source,
                  `${quote}voidframe-ui/${sub}${quote}`
                );
              },
            });
          }
        } else {
          context.report({
            node,
            messageId: "mixedSubpaths",
            data: { subpaths: subpaths.sort().join(", ") },
          });
        }
      },
    };
  },
};
export default rule;
