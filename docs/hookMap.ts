export interface HookRelation {
  /** Hooks the component uses internally (imported in source) */
  internal: string[];
  /** Hooks recommended for users to pair with this component */
  recommended: Array<{ hook: string; reason: string }>;
}

export const componentHooks: Record<string, HookRelation> = {
  // ════════════════════════════════════════════════════════════
  // FORM CONTROLS (Core)
  // ════════════════════════════════════════════════════════════

  Input: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation and submission" },
      { hook: "useDebounce", reason: "Debounce search or filter input" },
      { hook: "useDebouncedCallback", reason: "Debounce onChange handler" },
      { hook: "useLocalStorage", reason: "Persist draft values" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useCopyToClipboard", reason: "Copy input value" },
      { hook: "useFocusVisible", reason: "Keyboard-only focus ring" },
    ],
  },
  Textarea: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useDebounce", reason: "Auto-save on typing pause" },
      { hook: "useDebouncedCallback", reason: "Debounce onChange for auto-save" },
      { hook: "useLocalStorage", reason: "Persist drafts" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useResizeObserver", reason: "Auto-resize to content height" },
      { hook: "useUndoRedo", reason: "Undo/redo text changes" },
    ],
  },
  Select: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useAsync", reason: "Load options from API" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useLocalStorage", reason: "Persist last selection" },
      { hook: "useKeyboardShortcut", reason: "Open with custom hotkey" },
    ],
  },
  Toggle: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist preference" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useForm", reason: "Form state management" },
      { hook: "useKeyboardShortcut", reason: "Toggle with hotkey" },
    ],
  },
  Checkbox: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Form state management" },
      { hook: "useLocalStorage", reason: "Persist checked state" },
    ],
  },
  CheckboxGroup: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled selection set" },
      { hook: "useLocalStorage", reason: "Persist selections" },
      { hook: "useSet", reason: "Manage checked items as a Set" },
    ],
  },
  Radio: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
    ],
  },
  RadioGroup: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useKeyboardShortcut", reason: "Custom arrow key behavior" },
      { hook: "useLocalStorage", reason: "Persist selection" },
    ],
  },
  Switch: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useLocalStorage", reason: "Persist toggle preference" },
      { hook: "useForm", reason: "Form state management" },
    ],
  },
  Slider: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce expensive updates" },
      { hook: "useLocalStorage", reason: "Remember setting" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useThrottledCallback", reason: "Throttle continuous drag updates" },
    ],
  },
  NumberInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled/uncontrolled pattern" },
      { hook: "useDebounce", reason: "Debounce value updates" },
      { hook: "useLocalStorage", reason: "Persist value" },
    ],
  },
  NumberStepper: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLongPress", reason: "Hold to increment/decrement" },
      { hook: "useKeyboardShortcut", reason: "Arrow key control" },
      { hook: "useForm", reason: "Form state management" },
      { hook: "useInterval", reason: "Repeat increment while holding" },
    ],
  },
  SearchInput: {
    internal: [],
    recommended: [
      { hook: "useDebounce", reason: "Debounce search queries" },
      { hook: "useDebouncedCallback", reason: "Debounce search handler" },
      { hook: "useAsync", reason: "Search API calls" },
      { hook: "useKeyboardShortcut", reason: "Focus search with hotkey" },
      { hook: "useLocalStorage", reason: "Recent searches" },
      { hook: "useAbortController", reason: "Cancel in-flight search requests" },
    ],
  },
  PasswordInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useToggle", reason: "Show/hide password" },
      { hook: "useCopyToClipboard", reason: "Copy generated password" },
    ],
  },
  PinInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled pin value" },
      { hook: "useTimeout", reason: "Auto-submit after completion" },
    ],
  },
  TagInput: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce tag suggestions" },
      { hook: "useAsync", reason: "Load tag options from API" },
      { hook: "useForm", reason: "Form state management" },
      { hook: "useList", reason: "Manage tag array" },
      { hook: "useLocalStorage", reason: "Persist tags" },
    ],
  },
  MaskedInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled value" },
    ],
  },
  CurrencyInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled value" },
      { hook: "useLocalStorage", reason: "Remember currency preference" },
    ],
  },
  PhoneInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled value" },
    ],
  },

  // ── Date/Time Controls ──────────────────────────────────────

  DatePicker: {
    internal: ["useClickOutside"],
    recommended: [
      { hook: "useForm", reason: "Date validation in forms" },
      { hook: "useLocalStorage", reason: "Remember last date" },
      { hook: "useControllableState", reason: "Controlled date value" },
      { hook: "useEscapeKey", reason: "Close calendar dropdown" },
    ],
  },
  DateRangePicker: {
    internal: ["useClickOutside"],
    recommended: [
      { hook: "useForm", reason: "Date range validation" },
      { hook: "useLocalStorage", reason: "Remember last range" },
      { hook: "useControllableState", reason: "Controlled range value" },
      { hook: "useEscapeKey", reason: "Close calendar dropdown" },
    ],
  },
  TimePicker: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Time validation in forms" },
      { hook: "useControllableState", reason: "Controlled time value" },
      { hook: "useLocalStorage", reason: "Remember last time" },
    ],
  },
  DateTimePicker: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "DateTime validation" },
      { hook: "useControllableState", reason: "Controlled datetime" },
      { hook: "useLocalStorage", reason: "Remember last datetime" },
      { hook: "useEscapeKey", reason: "Close picker dropdown" },
    ],
  },

  // ── Complex Form Controls ───────────────────────────────────

  ColorPicker: {
    internal: ["useControllableState", "useId"],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy hex/rgb value" },
      { hook: "useLocalStorage", reason: "Recent colors" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useEscapeKey", reason: "Close picker popup" },
    ],
  },
  Combobox: {
    internal: ["useClickOutside", "useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce search" },
      { hook: "useAsync", reason: "Load options from API" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useKeyboardShortcut", reason: "Open with hotkey" },
      { hook: "useAbortController", reason: "Cancel in-flight option fetches" },
    ],
  },
  MultiSelect: {
    internal: ["useClickOutside", "useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce search" },
      { hook: "useAsync", reason: "Load options from API" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useSet", reason: "Manage selected values" },
      { hook: "useLocalStorage", reason: "Persist selections" },
    ],
  },
  TreeSelect: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Lazy-load tree nodes" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useLocalStorage", reason: "Remember expanded nodes" },
      { hook: "useControllableState", reason: "Controlled selection" },
    ],
  },
  Cascader: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Lazy-load cascade levels" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled value" },
      { hook: "useLocalStorage", reason: "Persist selection" },
      { hook: "useEscapeKey", reason: "Close cascade dropdown" },
    ],
  },
  Transfer: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce panel search" },
      { hook: "useLocalStorage", reason: "Remember selections" },
      { hook: "useAsync", reason: "Load transfer items from API" },
      { hook: "useSet", reason: "Manage selected keys" },
    ],
  },
  RatingInput: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled rating" },
      { hook: "useHover", reason: "Highlight stars on hover" },
    ],
  },
  InlineEdit: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Cancel on Escape" },
      { hook: "useFocusReturn", reason: "Restore focus after edit" },
      { hook: "useAsync", reason: "Save edit to API" },
      { hook: "useControllableState", reason: "Controlled value" },
    ],
  },
  SegmentedControl: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled selection" },
      { hook: "useLocalStorage", reason: "Persist selection" },
      { hook: "useKeyboardShortcut", reason: "Arrow navigation" },
    ],
  },
  ToggleGroup: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist selection" },
      { hook: "useKeyboardShortcut", reason: "Arrow navigation" },
      { hook: "useForm", reason: "Form state management" },
    ],
  },

  // ── File/Media Inputs ────────────────────────────────────────

  DropZone: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Upload files to API" },
      { hook: "useAsyncCallback", reason: "Handle upload with loading state" },
      { hook: "useForm", reason: "Form file validation" },
      { hook: "useList", reason: "Manage file list" },
    ],
  },
  FileUpload: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Upload files to API" },
      { hook: "useAsyncCallback", reason: "Handle upload progress" },
      { hook: "useAbortController", reason: "Cancel uploads" },
      { hook: "useList", reason: "Manage upload queue" },
    ],
  },
  SignaturePad: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form signature validation" },
      { hook: "useResizeObserver", reason: "Resize canvas with container" },
      { hook: "usePrefersReducedMotion", reason: "Disable stroke animations" },
    ],
  },
  ImageCropper: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled crop rect" },
      { hook: "useKeyboardShortcut", reason: "Nudge crop with arrow keys" },
      { hook: "useResizeObserver", reason: "Responsive crop area" },
    ],
  },

  // ── Editor Controls ──────────────────────────────────────────

  RichTextEditor: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useLocalStorage", reason: "Auto-save drafts" },
      { hook: "useDebouncedCallback", reason: "Debounce auto-save" },
      { hook: "useKeyboardShortcut", reason: "Custom formatting hotkeys" },
      { hook: "useControllableState", reason: "Controlled content" },
      { hook: "useUndoRedo", reason: "Track content history" },
    ],
  },
  MarkdownEditor: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useLocalStorage", reason: "Auto-save drafts" },
      { hook: "useDebouncedCallback", reason: "Debounce preview rendering" },
      { hook: "useKeyboardShortcut", reason: "Formatting shortcuts" },
      { hook: "useControllableState", reason: "Controlled content" },
      { hook: "useCopyToClipboard", reason: "Copy markdown source" },
    ],
  },
  CodeEditor: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useLocalStorage", reason: "Persist code drafts" },
      { hook: "useDebouncedCallback", reason: "Debounce syntax checks" },
      { hook: "useKeyboardShortcut", reason: "Run/save shortcuts" },
      { hook: "useControllableState", reason: "Controlled code value" },
      { hook: "useResizeObserver", reason: "Responsive editor size" },
      { hook: "useCopyToClipboard", reason: "Copy code" },
    ],
  },
  MentionInput: {
    internal: [],
    recommended: [
      { hook: "useDebounce", reason: "Debounce mention search" },
      { hook: "useAsync", reason: "Load mention candidates from API" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled value" },
    ],
  },
  SlashCommandInput: {
    internal: [],
    recommended: [
      { hook: "useDebounce", reason: "Debounce command search" },
      { hook: "useAsync", reason: "Load command options from API" },
      { hook: "useControllableState", reason: "Controlled value" },
    ],
  },

  // ── Specialty Form Controls ─────────────────────────────────

  CommandInput: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist command history" },
      { hook: "useDebounce", reason: "Debounce suggestions" },
      { hook: "useList", reason: "Manage command history array" },
    ],
  },
  FilterBuilder: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce filter changes" },
      { hook: "useLocalStorage", reason: "Save filter presets" },
      { hook: "useAsync", reason: "Load filter field options from API" },
      { hook: "useUndoRedo", reason: "Undo filter changes" },
    ],
  },
  QueryBuilder: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled query state" },
      { hook: "useLocalStorage", reason: "Save query presets" },
      { hook: "useDebounce", reason: "Debounce query updates" },
      { hook: "useUndoRedo", reason: "Undo query changes" },
      { hook: "useCopyToClipboard", reason: "Copy generated query" },
    ],
  },
  CronBuilder: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember last expression" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useCopyToClipboard", reason: "Copy cron expression" },
    ],
  },
  RegExpTester: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useDebounce", reason: "Debounce pattern matching" },
      { hook: "useLocalStorage", reason: "Save recent patterns" },
      { hook: "useCopyToClipboard", reason: "Copy regex pattern" },
    ],
  },
  KeyValueEditor: {
    internal: [],
    recommended: [
      { hook: "useFieldArray", reason: "Dynamic key-value rows" },
      { hook: "useForm", reason: "Form validation" },
      { hook: "useLocalStorage", reason: "Persist pairs" },
      { hook: "useCopyToClipboard", reason: "Copy values" },
    ],
  },
  ShortcutEditor: {
    internal: [],
    recommended: [
      { hook: "useKeyPress", reason: "Capture key combinations" },
      { hook: "useLocalStorage", reason: "Persist shortcut bindings" },
      { hook: "useForm", reason: "Validate shortcut conflicts" },
    ],
  },
  EnvironmentVars: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load variables from API" },
      { hook: "useCopyToClipboard", reason: "Copy variable values" },
      { hook: "useLocalStorage", reason: "Persist variable state" },
      { hook: "useFieldArray", reason: "Dynamic variable rows" },
    ],
  },
  TimeZoneSelect: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Form validation" },
      { hook: "useControllableState", reason: "Controlled timezone" },
      { hook: "useLocalStorage", reason: "Remember timezone preference" },
      { hook: "useGeolocation", reason: "Detect timezone from location" },
    ],
  },

  // ── Form System ─────────────────────────────────────────────

  Form: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useForm", reason: "Full form state management" },
      { hook: "useFieldArray", reason: "Dynamic field lists" },
      { hook: "useLocalStorage", reason: "Auto-save form drafts" },
      { hook: "useAsync", reason: "Submit form data to API" },
      { hook: "useAsyncCallback", reason: "Handle submit with loading state" },
    ],
  },
  FormField: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Connect to form context" },
      { hook: "useId", reason: "Generate unique field IDs" },
    ],
  },
  Field: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Connect to form context" },
      { hook: "useId", reason: "Generate accessible IDs" },
    ],
  },
  FormActions: {
    internal: [],
    recommended: [
      { hook: "useAsyncCallback", reason: "Handle submit with loading state" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // DATA DISPLAY
  // ════════════════════════════════════════════════════════════

  Table: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load table data" },
      { hook: "useDebounce", reason: "Debounce filter/search" },
      { hook: "useLocalStorage", reason: "Persist sort order" },
      { hook: "usePrevious", reason: "Detect data changes" },
    ],
  },
  DataGrid: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load table data from API" },
      { hook: "useDebounce", reason: "Debounce filter/search" },
      { hook: "useLocalStorage", reason: "Persist column widths, sort, and density" },
      { hook: "usePrevious", reason: "Detect data changes" },
      { hook: "useResizeObserver", reason: "Responsive column layout" },
      { hook: "useKeyboardShortcut", reason: "Grid navigation shortcuts" },
      { hook: "useSet", reason: "Manage row selection" },
    ],
  },
  DataList: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load list data" },
      { hook: "useDebounce", reason: "Debounce filter" },
      { hook: "useLocalStorage", reason: "Persist view preferences" },
      { hook: "useIntersectionObserver", reason: "Lazy load items" },
    ],
  },
  DescriptionList: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load description data" },
      { hook: "useCopyToClipboard", reason: "Copy values" },
    ],
  },
  TreeView: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember expanded nodes" },
      { hook: "useAsync", reason: "Lazy-load children" },
      { hook: "useKeyboardShortcut", reason: "Expand/collapse hotkeys" },
      { hook: "useControllableState", reason: "Controlled expansion state" },
    ],
  },
  TreeTable: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load tree data" },
      { hook: "useLocalStorage", reason: "Persist expanded rows and sort" },
      { hook: "useDebounce", reason: "Debounce filter" },
      { hook: "useResizeObserver", reason: "Responsive layout" },
    ],
  },
  VirtualList: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load list data" },
      { hook: "useResizeObserver", reason: "Responsive item sizing" },
      { hook: "useScrollPosition", reason: "Track scroll for infinite load" },
      { hook: "useThrottledCallback", reason: "Throttle scroll handlers" },
    ],
  },
  VirtualGrid: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load grid data" },
      { hook: "useResizeObserver", reason: "Responsive cell sizing" },
      { hook: "useScrollPosition", reason: "Track scroll position" },
      { hook: "useThrottledCallback", reason: "Throttle scroll handlers" },
    ],
  },
  InfiniteScroll: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load next page" },
      { hook: "useIntersectionObserver", reason: "Detect scroll to bottom" },
      { hook: "useThrottledCallback", reason: "Throttle load triggers" },
    ],
  },

  // ── Metrics/Stats ───────────────────────────────────────────

  Stat: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load stat value from API" },
      { hook: "usePrevious", reason: "Detect value changes for animation" },
      { hook: "useInterval", reason: "Poll for updated values" },
    ],
  },
  StatGroup: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load all stats from API" },
      { hook: "useMediaQuery", reason: "Responsive stat grid layout" },
    ],
  },
  MetricCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load metric data" },
      { hook: "usePrevious", reason: "Detect change for trend indicator" },
      { hook: "useInterval", reason: "Refresh metric periodically" },
    ],
  },
  Progress: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Animate progress" },
      { hook: "usePrevious", reason: "Detect value changes" },
      { hook: "useAnnouncer", reason: "Announce progress to screen readers" },
    ],
  },
  CircularProgress: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Animate progress" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
      { hook: "useAnnouncer", reason: "Announce progress to screen readers" },
    ],
  },
  SegmentedProgress: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Detect segment changes" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  MultiProgress: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load progress data" },
      { hook: "useInterval", reason: "Poll for progress updates" },
    ],
  },
  Gauge: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load gauge value" },
      { hook: "usePrevious", reason: "Animate value transitions" },
      { hook: "usePrefersReducedMotion", reason: "Disable needle animation" },
      { hook: "useResizeObserver", reason: "Responsive gauge sizing" },
    ],
  },
  TrendIndicator: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load trend data" },
      { hook: "usePrevious", reason: "Detect trend direction change" },
    ],
  },
  StatusIndicator: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Poll status endpoint" },
      { hook: "useWebSocket", reason: "Real-time status updates" },
      { hook: "usePrefersReducedMotion", reason: "Disable pulse animation" },
    ],
  },
  LiveIndicator: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Heartbeat check" },
      { hook: "usePrefersReducedMotion", reason: "Disable pulse animation" },
    ],
  },
  ConfidenceMeter: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load prediction scores" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },

  // ── Numeric Displays ────────────────────────────────────────

  NumberDisplay: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Animate value transitions" },
      { hook: "useAsync", reason: "Load number from API" },
    ],
  },
  CurrencyDisplay: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Animate currency changes" },
      { hook: "usePreferredLanguage", reason: "Locale-aware formatting" },
    ],
  },
  PercentDisplay: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Animate percent changes" },
    ],
  },
  BigNumber: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Animate number transitions" },
      { hook: "useAsync", reason: "Load value from API" },
      { hook: "useInterval", reason: "Poll for updates" },
    ],
  },

  // ── Time Displays ───────────────────────────────────────────

  RelativeTime: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Update relative time string" },
    ],
  },
  DurationDisplay: {
    internal: [],
    recommended: [
      { hook: "useStopwatch", reason: "Live duration counting" },
    ],
  },
  Countdown: {
    internal: [],
    recommended: [
      { hook: "useCountdown", reason: "Core countdown logic" },
      { hook: "usePrefersReducedMotion", reason: "Disable countdown animations" },
    ],
  },

  // ── Visual Indicators ───────────────────────────────────────

  Avatar: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load avatar image URL" },
      { hook: "useIntersectionObserver", reason: "Lazy load avatar image" },
    ],
  },
  AvatarGroup: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive avatar count" },
    ],
  },
  Tag: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy tag value" },
    ],
  },
  Badge: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Animate count changes" },
    ],
  },
  NotificationBadge: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time notification count" },
      { hook: "useInterval", reason: "Poll for new notifications" },
      { hook: "usePrevious", reason: "Animate count change" },
    ],
  },
  Dots: {
    internal: [],
    recommended: [],
  },
  Tooltip: {
    internal: [],
    recommended: [
      { hook: "useHover", reason: "Custom hover trigger delay" },
    ],
  },
  HoverCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load card content on hover" },
      { hook: "useHover", reason: "Custom hover delay" },
    ],
  },
  Code: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy code snippet" },
    ],
  },
  Kbd: {
    internal: [],
    recommended: [],
  },

  // ── Viewers ─────────────────────────────────────────────────

  CodeBlock: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy code to clipboard" },
      { hook: "useAsync", reason: "Load code from URL" },
      { hook: "useLocalStorage", reason: "Persist syntax theme preference" },
    ],
  },
  JSONViewer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load JSON from API" },
      { hook: "useCopyToClipboard", reason: "Copy JSON paths/values" },
      { hook: "useLocalStorage", reason: "Persist expanded state" },
      { hook: "useDebounce", reason: "Debounce search/filter" },
    ],
  },
  DiffViewer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load diff data" },
      { hook: "useLocalStorage", reason: "Persist view mode (side-by-side/inline)" },
      { hook: "useKeyboardShortcut", reason: "Navigate hunks with hotkeys" },
    ],
  },
  LogViewer: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Stream logs in real-time" },
      { hook: "useEventSource", reason: "Stream logs via SSE" },
      { hook: "useLocalStorage", reason: "Persist log level filter" },
      { hook: "useDebounce", reason: "Debounce log search" },
      { hook: "useScrollPosition", reason: "Auto-scroll to bottom" },
      { hook: "useCopyToClipboard", reason: "Copy log entries" },
    ],
  },
  Terminal: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Terminal session via WebSocket" },
      { hook: "useLocalStorage", reason: "Persist command history" },
      { hook: "useResizeObserver", reason: "Resize terminal dimensions" },
      { hook: "useCopyToClipboard", reason: "Copy terminal output" },
      { hook: "useKeyboardShortcut", reason: "Custom terminal shortcuts" },
    ],
  },
  MarkdownRenderer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load markdown content from URL" },
      { hook: "useCopyToClipboard", reason: "Copy code blocks" },
    ],
  },
  CSVViewer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load CSV from URL" },
      { hook: "useDebounce", reason: "Debounce search/filter" },
      { hook: "useLocalStorage", reason: "Persist column preferences" },
      { hook: "useResizeObserver", reason: "Responsive column widths" },
    ],
  },
  HexDump: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load binary data" },
      { hook: "useCopyToClipboard", reason: "Copy hex values" },
      { hook: "useScrollPosition", reason: "Track offset in large files" },
    ],
  },

  // ── Timeline/Activity ───────────────────────────────────────

  Timeline: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load timeline events" },
      { hook: "useIntersectionObserver", reason: "Lazy load timeline entries" },
      { hook: "usePrefersReducedMotion", reason: "Disable entry animations" },
    ],
  },
  HorizontalTimeline: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load timeline data" },
      { hook: "useScrollPosition", reason: "Horizontal scroll tracking" },
      { hook: "useResizeObserver", reason: "Responsive timeline layout" },
    ],
  },
  Activity: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load activity feed" },
      { hook: "useWebSocket", reason: "Real-time activity updates" },
      { hook: "useIntersectionObserver", reason: "Lazy load older activities" },
      { hook: "useInterval", reason: "Poll for new activities" },
    ],
  },

  // ── Info Display ────────────────────────────────────────────

  KeyValue: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy values" },
    ],
  },
  Descriptions: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load description data" },
      { hook: "useMediaQuery", reason: "Responsive column layout" },
    ],
  },
  List: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load list items" },
      { hook: "useList", reason: "Manage list data" },
      { hook: "useIntersectionObserver", reason: "Lazy load items" },
    ],
  },

  // ── Loading States ──────────────────────────────────────────

  Skeleton: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonText: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonAvatar: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonButton: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonCard: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonTable: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  SkeletonForm: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  Spinner: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable spin animation" },
    ],
  },
  Shimmer: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable shimmer animation" },
    ],
  },
  EmptyState: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Retry loading data" },
    ],
  },
  ErrorState: {
    internal: [],
    recommended: [
      { hook: "useAsyncCallback", reason: "Retry failed operation" },
    ],
  },
  LoadingOverlay: {
    internal: [],
    recommended: [
      { hook: "useLockBodyScroll", reason: "Prevent scrolling under overlay" },
      { hook: "usePrefersReducedMotion", reason: "Disable spinner animation" },
    ],
  },
  AsyncData: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Core data fetching" },
      { hook: "useInterval", reason: "Auto-refresh data" },
      { hook: "useAbortController", reason: "Cancel in-flight requests" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════

  Tabs: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist active tab" },
      { hook: "useKeyboardShortcut", reason: "Custom tab hotkeys" },
      { hook: "useControllableState", reason: "Controlled active tab" },
      { hook: "useMediaQuery", reason: "Collapse tabs on mobile" },
    ],
  },
  Accordion: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember open panels" },
      { hook: "usePrefersReducedMotion", reason: "Disable open/close animation" },
    ],
  },
  Collapsible: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled open state" },
      { hook: "useLocalStorage", reason: "Persist open/closed state" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  Breadcrumb: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Collapse breadcrumbs on mobile" },
    ],
  },
  BreadcrumbMenu: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive breadcrumb display" },
      { hook: "useClickOutside", reason: "Close sibling menu" },
    ],
  },
  Pagination: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load paginated data" },
      { hook: "useScrollPosition", reason: "Infinite scroll alternative" },
      { hook: "useLocalStorage", reason: "Persist page size preference" },
      { hook: "useControllableState", reason: "Controlled page number" },
    ],
  },
  CursorPagination: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load cursor-paginated data" },
      { hook: "useLocalStorage", reason: "Persist page size" },
    ],
  },
  Stepper: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Save progress" },
      { hook: "useUndoRedo", reason: "Step back/forward" },
      { hook: "useControllableState", reason: "Controlled step" },
      { hook: "useKeyboardShortcut", reason: "Next/prev step hotkeys" },
    ],
  },
  Wizard: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist wizard progress" },
      { hook: "useForm", reason: "Per-step form validation" },
      { hook: "useControllableState", reason: "Controlled step index" },
      { hook: "useKeyboardShortcut", reason: "Step navigation hotkeys" },
    ],
  },
  Anchor: {
    internal: [],
    recommended: [
      { hook: "useIntersectionObserver", reason: "Scrollspy active section" },
      { hook: "useScrollPosition", reason: "Scroll offset tracking" },
    ],
  },
  ScrollSpy: {
    internal: [],
    recommended: [
      { hook: "useIntersectionObserver", reason: "Detect active section" },
      { hook: "useScrollPosition", reason: "Track scroll offset" },
    ],
  },
  BackToTop: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Show/hide based on scroll" },
      { hook: "useScrollDirection", reason: "Show on scroll-up only" },
      { hook: "usePrefersReducedMotion", reason: "Disable smooth scroll" },
    ],
  },
  NavItem: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Navigation hotkey" },
    ],
  },
  NavGroup: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled expanded state" },
      { hook: "useLocalStorage", reason: "Persist expanded groups" },
    ],
  },
  TreeNav: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist expanded nodes" },
      { hook: "useKeyboardShortcut", reason: "Navigation hotkeys" },
      { hook: "useControllableState", reason: "Controlled expansion" },
    ],
  },
  Navbar: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive mobile menu / collapse at breakpoint" },
      { hook: "useScrollDirection", reason: "Hide navbar on scroll down" },
      { hook: "useLocalStorage", reason: "Persist mobile menu state" },
    ],
  },
  TabBar: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled active tab" },
      { hook: "useMediaQuery", reason: "Responsive tab display" },
    ],
  },
  Sidebar: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Auto-collapse on mobile / responsive sidebar mode" },
      { hook: "useLocalStorage", reason: "Persist collapsed state" },
      { hook: "useKeyboardShortcut", reason: "Toggle sidebar hotkey" },
    ],
  },
  Menu: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close menu" },
      { hook: "useClickOutside", reason: "Dismiss on outside click" },
      { hook: "useKeyboardShortcut", reason: "Menu hotkey" },
    ],
  },
  ContextMenu: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close context menu" },
      { hook: "useClickOutside", reason: "Dismiss on outside click" },
    ],
  },
  MenuBar: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Menu bar hotkeys" },
      { hook: "useEscapeKey", reason: "Close active menu" },
    ],
  },
  MegaMenu: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close mega menu" },
      { hook: "useClickOutside", reason: "Dismiss on outside click" },
      { hook: "useMediaQuery", reason: "Responsive mega menu layout" },
      { hook: "useHover", reason: "Open on hover with delay" },
    ],
  },
  CommandPalette: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Cmd+K to open" },
      { hook: "useDebounce", reason: "Debounce command search" },
      { hook: "useEscapeKey", reason: "Close palette" },
      { hook: "useFocusReturn", reason: "Restore focus on close" },
      { hook: "useLocalStorage", reason: "Recent commands" },
    ],
  },
  Toolbar: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Toolbar action hotkeys" },
      { hook: "useMediaQuery", reason: "Responsive toolbar overflow" },
    ],
  },
  FloatingActionButton: {
    internal: [],
    recommended: [
      { hook: "useScrollDirection", reason: "Hide on scroll down" },
      { hook: "useKeyboardShortcut", reason: "Quick action hotkey" },
      { hook: "usePrefersReducedMotion", reason: "Disable entrance animation" },
    ],
  },
  UserMenu: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Close on outside click" },
      { hook: "useEscapeKey", reason: "Close menu" },
    ],
  },
  ShortcutGuide: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Toggle guide with ? key" },
      { hook: "useEscapeKey", reason: "Close guide" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // OVERLAYS
  // ════════════════════════════════════════════════════════════

  Modal: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close on Escape" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useKeyboardShortcut", reason: "Open modal with hotkey" },
      { hook: "usePrefersReducedMotion", reason: "Disable enter/exit animation" },
    ],
  },
  Dialog: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close on Escape" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useKeyboardShortcut", reason: "Open dialog with hotkey" },
    ],
  },
  AlertDialog: {
    internal: [],
    recommended: [
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
    ],
  },
  ConfirmDialog: {
    internal: [],
    recommended: [
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useAsyncCallback", reason: "Handle confirm action with loading" },
    ],
  },
  ConfirmDialogV2: {
    internal: [],
    recommended: [
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useAsyncCallback", reason: "Handle confirm with loading state" },
    ],
  },
  Drawer: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close drawer" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useMediaQuery", reason: "Full-screen on mobile" },
    ],
  },
  DrawerV2: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close drawer" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useMediaQuery", reason: "Full-screen on mobile" },
      { hook: "usePrefersReducedMotion", reason: "Disable slide animation" },
    ],
  },
  Sheet: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close sheet" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useMediaQuery", reason: "Responsive sheet sizing" },
    ],
  },
  Popover: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Dismiss on outside click" },
      { hook: "useEscapeKey", reason: "Close popover" },
    ],
  },
  PopoverV2: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Dismiss on outside click" },
      { hook: "useEscapeKey", reason: "Close popover" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
    ],
  },
  Popconfirm: {
    internal: ["useControllableState", "useEscapeKey"],
    recommended: [
      { hook: "useClickOutside", reason: "Close on outside click" },
      { hook: "useAsyncCallback", reason: "Handle confirm with loading" },
    ],
  },
  Dropdown: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Close on outside click" },
      { hook: "useEscapeKey", reason: "Close dropdown" },
      { hook: "useKeyboardShortcut", reason: "Open with hotkey" },
    ],
  },
  Spotlight: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Dismiss spotlight" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useLocalStorage", reason: "Track seen tours" },
      { hook: "useKeyboardShortcut", reason: "Next/prev step" },
    ],
  },
  CoachMark: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember dismissed coach marks" },
      { hook: "useEscapeKey", reason: "Dismiss coach mark" },
    ],
  },
  Lightbox: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Close lightbox" },
      { hook: "useLockBodyScroll", reason: "Prevent background scroll" },
      { hook: "useKeyboardShortcut", reason: "Navigate images with arrows" },
      { hook: "useFocusReturn", reason: "Return focus on close" },
      { hook: "useFullscreen", reason: "Fullscreen image view" },
    ],
  },
  ImageGallery: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Navigate with arrow keys" },
      { hook: "useIntersectionObserver", reason: "Lazy load gallery images" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // FEEDBACK / NOTIFICATIONS
  // ════════════════════════════════════════════════════════════

  Toast: {
    internal: [],
    recommended: [
      { hook: "useTimeout", reason: "Auto-dismiss after duration" },
      { hook: "usePrefersReducedMotion", reason: "Disable enter/exit animation" },
    ],
  },
  Toaster: {
    internal: [],
    recommended: [
      { hook: "useTimeout", reason: "Control auto-dismiss timing" },
    ],
  },
  Snackbar: {
    internal: [],
    recommended: [
      { hook: "useTimeout", reason: "Auto-dismiss" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  Alert: {
    internal: [],
    recommended: [
      { hook: "useTimeout", reason: "Auto-dismiss alert" },
    ],
  },
  AlertV2: {
    internal: [],
    recommended: [
      { hook: "useTimeout", reason: "Auto-dismiss alert" },
    ],
  },
  BannerAlert: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember dismissed banners" },
      { hook: "useTimeout", reason: "Auto-dismiss" },
    ],
  },
  Callout: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Dismiss permanently" },
    ],
  },
  NotificationCenter: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time notifications" },
      { hook: "useAsync", reason: "Load notification history" },
      { hook: "useLocalStorage", reason: "Track read/unread state" },
      { hook: "useInterval", reason: "Poll for new notifications" },
      { hook: "useEscapeKey", reason: "Close notification panel" },
    ],
  },
  Result: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Retry operation" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // LAYOUT
  // ════════════════════════════════════════════════════════════

  Flex: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive flex direction" },
      { hook: "useResizeObserver", reason: "Dynamic sizing" },
    ],
  },
  HStack: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Switch to vertical on mobile" },
    ],
  },
  VStack: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive spacing" },
    ],
  },
  Stack: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive direction and spacing" },
    ],
  },
  Grid: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive column count" },
      { hook: "useResizeObserver", reason: "Dynamic grid sizing / container-aware columns" },
    ],
  },
  GridItem: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive span" },
    ],
  },
  Container: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive max-width" },
    ],
  },
  Center: {
    internal: [],
    recommended: [],
  },
  Box: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Track box dimensions" },
      { hook: "useMediaQuery", reason: "Container query responsive" },
    ],
  },
  AspectRatio: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Track container size" },
    ],
  },
  SplitView: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist panel sizes" },
      { hook: "useResizeObserver", reason: "Responsive split layout" },
      { hook: "useMediaQuery", reason: "Stack panels on mobile" },
    ],
  },
  Stretch: {
    internal: [],
    recommended: [],
  },
  Section: {
    internal: [],
    recommended: [],
  },
  PageHeader: {
    internal: [],
    recommended: [
      { hook: "useDocumentTitle", reason: "Set page title from header" },
      { hook: "useMediaQuery", reason: "Responsive header layout" },
    ],
  },
  Sticky: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Track stuck state" },
      { hook: "useIntersectionObserver", reason: "Detect when sticky activates" },
    ],
  },
  SafeArea: {
    internal: [],
    recommended: [],
  },

  // ── Scrollable Containers ───────────────────────────────────

  ScrollArea: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Track scroll position" },
      { hook: "useScrollDirection", reason: "Detect scroll direction" },
      { hook: "useResizeObserver", reason: "Track scrollable area size" },
    ],
  },
  Masonry: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive column count" },
      { hook: "useIntersectionObserver", reason: "Lazy load masonry items" },
      { hook: "useMediaQuery", reason: "Responsive columns" },
    ],
  },

  // ── Resizable ───────────────────────────────────────────────

  ResizableGroup: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist panel sizes" },
      { hook: "useMediaQuery", reason: "Responsive panel layout" },
    ],
  },
  ResizablePanel: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Track panel dimensions" },
    ],
  },
  ResizableBox: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist box dimensions" },
      { hook: "useResizeObserver", reason: "Track size changes" },
    ],
  },

  // ── App Shell ───────────────────────────────────────────────

  AppShell: {
    internal: ["useMediaQuery"],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive sidebar collapse" },
      { hook: "useLocalStorage", reason: "Remember sidebar state" },
      { hook: "useKeyboardShortcut", reason: "Toggle sidebar with hotkey" },
    ],
  },

  // ── Widget/Dashboard ────────────────────────────────────────

  WidgetShell: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Track widget dimensions" },
      { hook: "useAsync", reason: "Load widget data" },
      { hook: "useInterval", reason: "Refresh widget periodically" },
    ],
  },
  DashboardGrid: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist dashboard layout" },
      { hook: "useMediaQuery", reason: "Responsive grid columns" },
      { hook: "useResizeObserver", reason: "Track grid dimensions" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // BUTTONS / ACTIONS
  // ════════════════════════════════════════════════════════════

  Button: {
    internal: [],
    recommended: [
      { hook: "useAsyncCallback", reason: "Loading state for async actions" },
      { hook: "useKeyboardShortcut", reason: "Button hotkey" },
      { hook: "useLongPress", reason: "Long press for secondary action" },
    ],
  },
  ButtonGroup: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled active button" },
    ],
  },
  SplitButton: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Close dropdown on outside click" },
      { hook: "useKeyboardShortcut", reason: "Action hotkey" },
    ],
  },
  CopyButton: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Core clipboard functionality" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // MEDIA
  // ════════════════════════════════════════════════════════════

  Image: {
    internal: [],
    recommended: [
      { hook: "useIntersectionObserver", reason: "Lazy load image" },
      { hook: "useAsync", reason: "Load image URL from API" },
    ],
  },
  VideoPlayer: {
    internal: [],
    recommended: [
      { hook: "useFullscreen", reason: "Fullscreen mode" },
      { hook: "useKeyboardShortcut", reason: "Play/pause, volume keys" },
      { hook: "usePrefersReducedMotion", reason: "Disable autoplay" },
      { hook: "useMediaQuery", reason: "Responsive player size" },
    ],
  },
  AudioPlayer: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Play/pause, seek keys" },
      { hook: "useMediaQuery", reason: "Responsive player layout" },
    ],
  },
  VoiceWaveform: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive waveform width" },
      { hook: "usePrefersReducedMotion", reason: "Disable waveform animation" },
    ],
  },
  ImageDiff: {
    internal: [],
    recommended: [
      { hook: "useFullscreen", reason: "Fullscreen comparison" },
      { hook: "useKeyboardShortcut", reason: "Toggle comparison modes" },
      { hook: "useControllableState", reason: "Controlled slider position" },
    ],
  },

  // ── Embed ───────────────────────────────────────────────────

  IFrame: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive iframe sizing" },
      { hook: "useIntersectionObserver", reason: "Lazy load iframe" },
    ],
  },
  DocumentPreview: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load document data" },
      { hook: "useFullscreen", reason: "Fullscreen preview" },
    ],
  },

  // ── Animations ──────────────────────────────────────────────

  Marquee: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable marquee animation" },
      { hook: "usePageVisibility", reason: "Pause when tab hidden" },
    ],
  },
  Typewriter: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Show text instantly" },
      { hook: "useIntersectionObserver", reason: "Start when visible" },
    ],
  },
  Ticker: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable ticker animation" },
      { hook: "useInterval", reason: "Update ticker data" },
      { hook: "usePageVisibility", reason: "Pause when tab hidden" },
    ],
  },
  ScrollIndicator: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Track page scroll progress" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // INTERACTIVE / DRAG & DROP
  // ════════════════════════════════════════════════════════════

  Carousel: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Arrow key navigation" },
      { hook: "usePrefersReducedMotion", reason: "Disable slide animation" },
      { hook: "useInterval", reason: "Auto-play slides" },
      { hook: "useResizeObserver", reason: "Responsive slide sizing" },
      { hook: "useControllableState", reason: "Controlled active slide" },
    ],
  },
  CarouselImageGallery: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Navigate images" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
      { hook: "useIntersectionObserver", reason: "Lazy load gallery images" },
    ],
  },
  Swipeable: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable swipe animation" },
    ],
  },
  SwipeActions: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  Zoomable: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Zoom in/out with +/-" },
      { hook: "usePrefersReducedMotion", reason: "Disable zoom animation" },
      { hook: "useControllableState", reason: "Controlled zoom level" },
    ],
  },
  DragDropContext: {
    internal: [],
    recommended: [
      { hook: "useAnnouncer", reason: "Announce drag events for screen readers" },
    ],
  },
  Sortable: {
    internal: [],
    recommended: [
      { hook: "useList", reason: "Manage sortable items" },
      { hook: "useLocalStorage", reason: "Persist sort order" },
    ],
  },
  ReorderList: {
    internal: [],
    recommended: [
      { hook: "useList", reason: "Manage reorderable items" },
      { hook: "useLocalStorage", reason: "Persist order" },
      { hook: "useAnnouncer", reason: "Announce reorder for a11y" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // CALENDAR / SCHEDULING
  // ════════════════════════════════════════════════════════════

  Calendar: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled date selection" },
      { hook: "useAsync", reason: "Load events from API" },
      { hook: "useLocalStorage", reason: "Persist view preferences" },
      { hook: "useKeyboardShortcut", reason: "Navigate dates with arrows" },
      { hook: "useMediaQuery", reason: "Responsive calendar view" },
    ],
  },
  Gantt: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load tasks from API" },
      { hook: "useResizeObserver", reason: "Responsive timeline width" },
      { hook: "useLocalStorage", reason: "Persist zoom/granularity" },
      { hook: "useKeyboardShortcut", reason: "Navigate timeline" },
      { hook: "useScrollPosition", reason: "Sync timeline scroll" },
    ],
  },
  Kanban: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load board data from API" },
      { hook: "useLocalStorage", reason: "Persist board layout" },
      { hook: "useKeyboardShortcut", reason: "Column navigation" },
      { hook: "usePrefersReducedMotion", reason: "Disable drag animations" },
      { hook: "useWebSocket", reason: "Real-time board updates" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // CHAT & AI
  // ════════════════════════════════════════════════════════════

  Conversation: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time messages" },
      { hook: "useEventSource", reason: "Server-sent events streaming" },
      { hook: "useAsync", reason: "Load message history" },
      { hook: "useLocalStorage", reason: "Persist session" },
      { hook: "useScrollPosition", reason: "Auto-scroll to latest message" },
    ],
  },
  MessageList: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Auto-scroll to bottom" },
      { hook: "useIntersectionObserver", reason: "Load more on scroll up" },
      { hook: "useList", reason: "Manage message array" },
    ],
  },
  Message: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy message text" },
      { hook: "useHover", reason: "Show actions on hover" },
    ],
  },
  MessageContent: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy content" },
    ],
  },
  StreamingText: {
    internal: [],
    recommended: [
      { hook: "useEventSource", reason: "Stream text via SSE" },
      { hook: "usePrefersReducedMotion", reason: "Disable typing animation" },
    ],
  },
  ThinkingIndicator: {
    internal: [],
    recommended: [
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
      { hook: "useTimeout", reason: "Show only after delay" },
    ],
  },
  ReasoningTrace: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist expanded state" },
      { hook: "useControllableState", reason: "Controlled collapsed state" },
    ],
  },
  MessageActions: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy message" },
      { hook: "useAsyncCallback", reason: "Handle async actions" },
    ],
  },
  MessageFeedback: {
    internal: [],
    recommended: [
      { hook: "useAsyncCallback", reason: "Submit feedback to API" },
    ],
  },
  MessageEdit: {
    internal: [],
    recommended: [
      { hook: "useEscapeKey", reason: "Cancel edit on Escape" },
      { hook: "useFocusReturn", reason: "Return focus after edit" },
    ],
  },
  Composer: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Submit with Cmd+Enter" },
      { hook: "useLocalStorage", reason: "Persist draft message" },
      { hook: "useAsyncCallback", reason: "Submit message with loading" },
      { hook: "useResizeObserver", reason: "Auto-resize textarea" },
      { hook: "useAbortController", reason: "Cancel in-flight submission" },
    ],
  },
  SuggestionChips: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive chip layout" },
    ],
  },
  PromptTemplateList: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist favorite templates" },
      { hook: "useDebounce", reason: "Debounce template search" },
    ],
  },
  PromptTemplateEditor: {
    internal: [],
    recommended: [
      { hook: "useForm", reason: "Template form validation" },
      { hook: "useLocalStorage", reason: "Auto-save draft" },
    ],
  },
  SessionList: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chat sessions" },
      { hook: "useLocalStorage", reason: "Persist active session" },
      { hook: "useDebounce", reason: "Debounce session search" },
    ],
  },
  ConversationHeader: {
    internal: [],
    recommended: [
      { hook: "useDocumentTitle", reason: "Set page title from conversation" },
    ],
  },
  ConversationEmptyState: {
    internal: [],
    recommended: [],
  },

  // ── Chat AI/Model Components ─────────────────────────────────

  ModelSelector: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist model preference" },
      { hook: "useControllableState", reason: "Controlled model selection" },
    ],
  },
  ModelPicker: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Remember last model" },
      { hook: "useAsync", reason: "Load available models from API" },
    ],
  },
  ModelCompare: {
    internal: ["useControllableState"],
    recommended: [
      { hook: "useWebSocket", reason: "Streaming model responses" },
      { hook: "useEventSource", reason: "SSE streaming" },
      { hook: "useAsync", reason: "Submit prompts" },
      { hook: "useLocalStorage", reason: "Persist comparison settings" },
    ],
  },
  SystemPromptEditor: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist prompt drafts" },
      { hook: "useDebouncedCallback", reason: "Debounce auto-save" },
      { hook: "useForm", reason: "Prompt validation" },
    ],
  },
  TokenVisualizer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load token data from API" },
      { hook: "useCopyToClipboard", reason: "Copy token text" },
    ],
  },
  ContextWindow: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Track context usage changes" },
    ],
  },
  CostDisplay: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Update cost in real-time" },
      { hook: "usePrevious", reason: "Track cost changes" },
    ],
  },
  LatencyIndicator: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Measure latency periodically" },
    ],
  },
  DebugPanel: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist debug panel state" },
      { hook: "useKeyboardShortcut", reason: "Toggle debug panel" },
    ],
  },
  TraceViewer: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load trace data" },
      { hook: "useLocalStorage", reason: "Persist viewer settings" },
    ],
  },
  SimpleChat: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time messaging" },
      { hook: "useEventSource", reason: "SSE streaming" },
      { hook: "useLocalStorage", reason: "Persist conversation" },
      { hook: "useKeyboardShortcut", reason: "Submit shortcut" },
    ],
  },
  AgentRunner: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Stream agent output" },
      { hook: "useEventSource", reason: "SSE agent events" },
      { hook: "useAbortController", reason: "Cancel agent execution" },
      { hook: "useAsync", reason: "Start/stop agent runs" },
    ],
  },
  ChatLayout: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive chat layout" },
      { hook: "useLocalStorage", reason: "Persist layout preferences" },
    ],
  },

  // ── Agent Display ────────────────────────────────────────────

  ToolCall: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy tool call payload" },
    ],
  },
  ToolCallGroup: {
    internal: [],
    recommended: [
      { hook: "useControllableState", reason: "Controlled expanded state" },
    ],
  },
  AgentStep: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Track step status changes" },
    ],
  },
  AgentTrace: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist expanded trace state" },
    ],
  },
  PlanDisplay: {
    internal: [],
    recommended: [
      { hook: "usePrevious", reason: "Track plan step completion" },
    ],
  },

  // ── Citations ────────────────────────────────────────────────

  Citation: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy citation" },
    ],
  },
  SourceCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load source preview" },
    ],
  },
  SourceGrid: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Responsive source grid" },
    ],
  },
  RAGContext: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load RAG chunks from API" },
    ],
  },

  // ── Attachments ──────────────────────────────────────────────

  Attachment: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load attachment metadata" },
    ],
  },
  AttachmentList: {
    internal: [],
    recommended: [
      { hook: "useList", reason: "Manage attachment list" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // DEVTOOLS / SPECIALTY
  // ════════════════════════════════════════════════════════════

  CommitGraph: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load commit data" },
      { hook: "useResizeObserver", reason: "Responsive graph width" },
      { hook: "useScrollPosition", reason: "Lazy render visible commits" },
    ],
  },
  NetworkInspector: {
    internal: [],
    recommended: [
      { hook: "useList", reason: "Manage request list" },
      { hook: "useDebounce", reason: "Debounce request filter" },
      { hook: "useLocalStorage", reason: "Persist filter settings" },
    ],
  },
  ConsoleOutput: {
    internal: [],
    recommended: [
      { hook: "useList", reason: "Manage console entries" },
      { hook: "useLocalStorage", reason: "Persist log level filter" },
      { hook: "useScrollPosition", reason: "Auto-scroll to bottom" },
    ],
  },
  DebugTree: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Persist expanded nodes" },
      { hook: "useCopyToClipboard", reason: "Copy serialized data" },
    ],
  },
  ColorContrast: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy contrast ratio" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // IDENTITY
  // ════════════════════════════════════════════════════════════

  UserCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load user data" },
    ],
  },
  TeamCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load team data" },
    ],
  },
  OrganizationCard: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load org data" },
    ],
  },
  Identicon: {
    internal: [],
    recommended: [],
  },
  PresenceList: {
    internal: [],
    recommended: [
      { hook: "useWebSocket", reason: "Real-time presence updates" },
      { hook: "useInterval", reason: "Poll presence status" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // UTILITY COMPONENTS
  // ════════════════════════════════════════════════════════════

  Clipboard: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Core clipboard access" },
      { hook: "useClipboardRead", reason: "Read from clipboard" },
    ],
  },
  ShareButton: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy share link" },
      { hook: "useAsync", reason: "Generate share link" },
    ],
  },
  PrintButton: {
    internal: [],
    recommended: [],
  },
  PrintLayout: {
    internal: [],
    recommended: [
      { hook: "useMediaQuery", reason: "Detect print media" },
    ],
  },
  ReactionPicker: {
    internal: [],
    recommended: [
      { hook: "useClickOutside", reason: "Close picker" },
      { hook: "useEscapeKey", reason: "Close on Escape" },
    ],
  },
  Comment: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load/submit comments" },
      { hook: "useCopyToClipboard", reason: "Copy comment text" },
    ],
  },
  CommentList: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load comments" },
      { hook: "useIntersectionObserver", reason: "Load more comments" },
      { hook: "useWebSocket", reason: "Real-time new comments" },
    ],
  },

  // ── Theme ───────────────────────────────────────────────────

  ThemeSelector: {
    internal: [],
    recommended: [
      { hook: "useThemePersistence", reason: "Persist theme choice" },
      { hook: "usePrefersColorScheme", reason: "Detect OS preference" },
      { hook: "useColorScheme", reason: "Control color scheme" },
    ],
  },

  // ── Encoding ────────────────────────────────────────────────

  QRCode: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive QR code size" },
    ],
  },
  Barcode: {
    internal: [],
    recommended: [
      { hook: "useResizeObserver", reason: "Responsive barcode size" },
    ],
  },

  // ── Color Tools ─────────────────────────────────────────────

  ColorSwatch: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy color value" },
    ],
  },
  Palette: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy palette colors" },
      { hook: "useLocalStorage", reason: "Save custom palettes" },
    ],
  },

  // ── Rich Embed ──────────────────────────────────────────────

  LegalText: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Track acceptance" },
    ],
  },
  Mermaid: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load diagram definition" },
      { hook: "useResizeObserver", reason: "Responsive diagram sizing" },
      { hook: "useFullscreen", reason: "Fullscreen diagram view" },
    ],
  },

  // ── Help/Changelog ──────────────────────────────────────────

  HelpTooltip: {
    internal: [],
    recommended: [],
  },
  ContextHelp: {
    internal: [],
    recommended: [
      { hook: "useKeyboardShortcut", reason: "Toggle help mode" },
    ],
  },
  Changelog: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load changelog data" },
      { hook: "useLocalStorage", reason: "Track last seen version" },
    ],
  },
  WhatsNewPopover: {
    internal: [],
    recommended: [
      { hook: "useLocalStorage", reason: "Track last seen version" },
      { hook: "useEscapeKey", reason: "Dismiss popover" },
    ],
  },

  // ── Network ─────────────────────────────────────────────────

  OfflineBanner: {
    internal: [],
    recommended: [
      { hook: "useOnlineStatus", reason: "Detect online/offline" },
      { hook: "useNetworkStatus", reason: "Network quality info" },
    ],
  },
  ConnectionStatus: {
    internal: [],
    recommended: [
      { hook: "useOnlineStatus", reason: "Track connection state" },
      { hook: "useNetworkStatus", reason: "Network quality details" },
      { hook: "useInterval", reason: "Ping health endpoint" },
    ],
  },

  // ── Primitives ──────────────────────────────────────────────

  Text: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy text content" },
    ],
  },
  Label: {
    internal: [],
    recommended: [
      { hook: "useId", reason: "Generate accessible htmlFor ID" },
    ],
  },
  Divider: {
    internal: [],
    recommended: [],
  },
  Spacer: {
    internal: [],
    recommended: [],
  },
  Card: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load card content" },
      { hook: "useIntersectionObserver", reason: "Lazy load card content" },
    ],
  },
  ScrollRow: {
    internal: [],
    recommended: [
      { hook: "useScrollPosition", reason: "Track horizontal scroll" },
      { hook: "useResizeObserver", reason: "Responsive row layout" },
    ],
  },
  StatusBar: {
    internal: [],
    recommended: [
      { hook: "useInterval", reason: "Refresh status items" },
      { hook: "useWebSocket", reason: "Real-time status updates" },
    ],
  },
  SegmentBar: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load segment data" },
      { hook: "usePrevious", reason: "Animate segment changes" },
    ],
  },
  Quote: {
    internal: [],
    recommended: [
      { hook: "useCopyToClipboard", reason: "Copy quote text" },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // CHARTS (from src/charts/)
  // ════════════════════════════════════════════════════════════

  BarChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data from API" },
      { hook: "useResizeObserver", reason: "Responsive chart sizing" },
      { hook: "useElementSize", reason: "Track container dimensions" },
      { hook: "usePrefersReducedMotion", reason: "Disable bar animations" },
      { hook: "useThrottledCallback", reason: "Throttle tooltip on hover" },
    ],
  },
  LineChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data from API" },
      { hook: "useResizeObserver", reason: "Responsive chart sizing" },
      { hook: "useElementSize", reason: "Track container dimensions" },
      { hook: "usePrefersReducedMotion", reason: "Disable line draw animation" },
      { hook: "useThrottledCallback", reason: "Throttle crosshair movement" },
    ],
  },
  AreaChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data" },
      { hook: "useResizeObserver", reason: "Responsive chart sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable fill animation" },
    ],
  },
  PieChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data" },
      { hook: "useResizeObserver", reason: "Responsive chart sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable slice animation" },
    ],
  },
  ScatterPlot: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load plot data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useThrottledCallback", reason: "Throttle hover tooltip" },
    ],
  },
  RadarChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  Heatmap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load heatmap data" },
      { hook: "useResizeObserver", reason: "Responsive cell sizing" },
      { hook: "useThrottledCallback", reason: "Throttle cell hover" },
    ],
  },
  CalendarHeatmap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load activity data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  Sparkline: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load sparkline data" },
      { hook: "useResizeObserver", reason: "Fit to container" },
    ],
  },
  FunnelChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load funnel data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  Histogram: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load histogram data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  BoxPlot: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load statistical data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  ViolinPlot: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load distribution data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  CandlestickChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load OHLC data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useWebSocket", reason: "Real-time price updates" },
      { hook: "useInterval", reason: "Poll for price updates" },
    ],
  },
  WaterfallChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load waterfall data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
    ],
  },
  TreeMap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load hierarchical data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useThrottledCallback", reason: "Throttle hover" },
    ],
  },
  Sunburst: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load hierarchical data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable zoom animation" },
    ],
  },
  Sankey: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load flow data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useThrottledCallback", reason: "Throttle hover highlight" },
    ],
  },
  ChordDiagram: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load relationship data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  NetworkGraph: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load graph data" },
      { hook: "useResizeObserver", reason: "Responsive graph area" },
      { hook: "useFullscreen", reason: "Fullscreen graph view" },
      { hook: "useKeyboardShortcut", reason: "Zoom/pan controls" },
    ],
  },
  DependencyGraph: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load dependency data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useFullscreen", reason: "Fullscreen view" },
    ],
  },
  OrgChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load org data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useFullscreen", reason: "Fullscreen view" },
    ],
  },
  BubbleMap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load geographic data" },
      { hook: "useResizeObserver", reason: "Responsive map sizing" },
    ],
  },
  ChoroplethMap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load geographic data" },
      { hook: "useResizeObserver", reason: "Responsive map sizing" },
    ],
  },
  TileGridMap: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load tile data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  ParallelCoordinates: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load multivariate data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  ScatterMatrix: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load multivariate data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  ComposedChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load chart data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "useThrottledCallback", reason: "Throttle tooltip" },
    ],
  },
  SmallMultiples: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load faceted data" },
      { hook: "useResizeObserver", reason: "Responsive grid sizing" },
      { hook: "useMediaQuery", reason: "Responsive column count" },
    ],
  },
  HorizonChart: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load time series data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
    ],
  },
  StreamGraph: {
    internal: [],
    recommended: [
      { hook: "useAsync", reason: "Load stream data" },
      { hook: "useResizeObserver", reason: "Responsive sizing" },
      { hook: "usePrefersReducedMotion", reason: "Disable animation" },
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
