export interface HookRelation {
  /** Hooks the component uses internally (imported in source) */
  internal: string[];
  /** Hooks recommended for users to pair with this component */
  recommended: Array<{ hook: string; reason: string }>;
}

export const componentHooks: Record<string, HookRelation> = {
  // ── Forms ────────────────────────────────────────────────
  Input: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation and submission" },
      { hook: "useDebounce", reason: "Debounce search input" },
      { hook: "useLocalStorage", reason: "Persist draft values" },
    ],
  },
  Textarea: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useDebounce", reason: "Auto-save on typing pause" },
      { hook: "useLocalStorage", reason: "Persist drafts" },
    ],
  },
  Select: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useAsync", reason: "Load options from API" },
    ],
  },
  Toggle: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist preference" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
    ],
  },
  Checkbox: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Form state management" },
    ],
  },
  RadioGroup: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useKeyboardShortcut", reason: "Custom arrow key behavior" },
    ],
  },
  Slider: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce expensive updates" },
      { hook: "useLocalStorage", reason: "Remember setting" },
    ],
  },
  SearchInput: {
    internal: [],
    recommended: [
      { hook: "useDebounce", reason: "Debounce search queries" },
      { hook: "useAsync", reason: "Search API calls" },
    ],
  },
  DatePicker: {
    internal: ["useClickOutside"],
    recommended: [
      { hook: "useForm", reason: "Date validation in forms" },
      { hook: "useLocalStorage", reason: "Remember last date" },
    ],
  },
  ColorPicker: {
    internal: ["useControllableState", "useId"],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy hex/rgb value" },
      { hook: "useLocalStorage", reason: "Recent colors" },
    ],
  },
  Combobox: {
    internal: ["useClickOutside", "useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce search" },
      { hook: "useAsync", reason: "Load options from API" },
    ],
  },
  Transfer: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce panel search" },
      { hook: "useLocalStorage", reason: "Remember selections" },
    ],
  },
  InlineEdit: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Cancel on Escape" },
      { hook: "useFocusReturn", reason: "Restore focus after edit" },
    ],
  },
  NumberStepper: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLongPress", reason: "Hold to increment" },
      { hook: "useKeyboardShortcut", reason: "Arrow key control" },
    ],
  },
  CommandInput: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist command history" },
      { hook: "useDebounce", reason: "Debounce suggestions" },
    ],
  },
  FilterBuilder: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce filter changes" },
      { hook: "useLocalStorage", reason: "Save filter presets" },
    ],
  },
  CronBuilder: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember last expression" },
    ],
  },
  ToggleGroup: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist selection" },
      { hook: "useKeyboardShortcut", reason: "Arrow navigation" },
    ],
  },
  Form: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Full form state management" },
      { hook: "useFieldArray", reason: "Dynamic field lists" },
    ],
  },
  TagInput: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce tag suggestions" },
      { hook: "useAsync", reason: "Load tag options from API" },
    ],
  },

  // ── Data Display ─────────────────────────────────────────
  DataGrid: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load table data from API" },
      { hook: "useDebounce", reason: "Debounce filter/search" },
      { hook: "useLocalStorage", reason: "Persist column widths and sort" },
      { hook: "usePrevious", reason: "Detect data changes" },
    ],
  },
  Table: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load data" },
    ],
  },
  CSVViewer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load CSV from URL" },
    ],
  },
  Calendar: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled date selection" },
      { hook: "useAsync", reason: "Load events from API" },
    ],
  },
  TreeView: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember expanded nodes" },
      { hook: "useAsync", reason: "Lazy-load children" },
    ],
  },

  // ── Navigation ───────────────────────────────────────────
  Tabs: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist active tab" },
      { hook: "useKeyboardShortcut", reason: "Custom tab hotkeys" },
    ],
  },
  Accordion: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember open panels" },
    ],
  },
  Pagination: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load paginated data" },
      { hook: "useScrollPosition", reason: "Infinite scroll alternative" },
    ],
  },
  Stepper: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Save progress" },
      { hook: "useUndoRedo", reason: "Step back/forward" },
    ],
  },
  Anchor: {
    internal: [],
    recommended: [
      { hook: "useIntersectionObserver", reason: "Scrollspy active section" },
      { hook: "useScrollPosition", reason: "Scroll offset tracking" },
    ],
  },

  // ── Overlays ─────────────────────────────────────────────
  Dialog: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close on Escape" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
    ],
  },
  Modal: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close on Escape" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
    ],
  },
  Popconfirm: {
    internal: ["useControllableState", "useEscapeKey"],
    recommended: [
      { hook: "useClickOutside", reason: "Close on outside click" },
    ],
  },
  CommandPalette: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Cmd+K to open" },
      { hook: "useDebounce", reason: "Debounce search" },
    ],
  },
  SplitButton: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Close dropdown on outside click" },
    ],
  },

  // ── Media ────────────────────────────────────────────────
  VideoPlayer: {
    internal: [],
    recommended: [
      { hook: "useFullscreen", reason: "Fullscreen mode" },
      { hook: "useKeyboardShortcut", reason: "Play/pause, volume keys" },
    ],
  },
  ImageDiff: {
    internal: [],
    recommended: [
      { hook: "useFullscreen", reason: "Fullscreen comparison" },
      { hook: "useKeyboardShortcut", reason: "Toggle modes" },
    ],
  },

  // ── Chat & AI ────────────────────────────────────────────
  ModelCompare: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useWebSocket", reason: "Streaming model responses" },
      { hook: "useAsync", reason: "Submit prompts" },
    ],
  },
  Conversation: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time messages" },
      { hook: "useEventSource", reason: "Server-sent events streaming" },
      { hook: "useAsync", reason: "Load message history" },
      { hook: "useLocalStorage", reason: "Persist session" },
    ],
  },

  // ── Layout ───────────────────────────────────────────────
  AppShell: {
    internal: ["useMediaQuery"],
    recommended: [
      { hook: "useBreakpoint", reason: "Responsive sidebar collapse" },
      { hook: "useLocalStorage", reason: "Remember sidebar state" },
    ],
  },
  ResponsiveBox: {
    internal: [],
    recommended: [
      { hook: "useBreakpoint", reason: "Responsive layout decisions" },
      { hook: "useContainerQuery", reason: "Container-size responsive" },
    ],
  },

  // ── Utility Components ───────────────────────────────────
  CopyButton: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Core clipboard functionality" },
    ],
  },
  ThemeSelector: {
    internal: [],
    recommended: [
      { hook: "useThemePersistence", reason: "Persist theme choice" },
      { hook: "usePrefersColorScheme", reason: "Detect OS preference" },
    ],
  },
  HexDump: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load binary data" },
    ],
  },
  EnvironmentVars: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load variables from API" },
      { hook: "useCopyToClipboard", reason: "Copy values" },
    ],
  },
  RegExpTester: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce pattern matching" },
      { hook: "useLocalStorage", reason: "Save recent patterns" },
    ],
  },
  ConfidenceMeter: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load prediction scores" },
    ],
  },
  TokenVisualizer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load token data from API" },
    ],
  },
};

/**
 * Reverse lookup: for a hook, which components use or recommend it?
 */
export function getComponentsForHook(hookName: string): { usedBy: string[]; recommendedFor: string[] } {
  const usedBy: string[] = [];
  const recommendedFor: string[] = [];

  for (const [component, relation] of Object.entries(componentHooks)) {
    if (relation.internal.includes(hookName)) {
      usedBy.push(component);
    }
    if (relation.recommended.some(r => r.hook === hookName)) {
      recommendedFor.push(component);
    }
  }

  return { usedBy, recommendedFor };
}
