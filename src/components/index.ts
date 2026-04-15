// ── Primitives ──────────────────────────────────────────────
export { Text, Label, Divider, Spacer } from "./Text";
export type { TextProps, LabelProps, DividerProps, SpacerProps } from "./Text";

// ── Layout ──────────────────────────────────────────────────
export {
  Flex,
  HStack,
  VStack,
  Grid,
  Container,
  Center,
  AspectRatio,
  SplitView,
  Stretch,
  Box,
} from "./Layout";
export type {
  FlexProps,
  StackProps,
  GridProps,
  ContainerProps,
  CenterProps,
  AspectRatioProps,
  SplitViewProps,
  StretchProps,
  BoxProps,
} from "./Layout";

// ── Buttons ─────────────────────────────────────────────────
export { Button, ButtonGroup } from "./Button";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonGroupProps,
  ButtonGroupOption,
} from "./Button";

// ── Indicators ──────────────────────────────────────────────
export { Badge, Dots } from "./Badge";
export type {
  BadgeProps,
  BadgeVariant,
  BadgeTone,
  BadgeSize,
  DotsProps,
} from "./Badge";

// ── Containers ──────────────────────────────────────────────
export { Card, ScrollRow, StatusBar, SegmentBar } from "./Card";
export type {
  CardProps,
  ScrollRowProps,
  StatusBarProps,
  StatusBarItem,
  SegmentBarProps,
  SegmentBarSegment,
} from "./Card";

// ── Form Controls (Core) ────────────────────────────────────
export { Input, Textarea, Toggle, Select } from "./Form";
export type {
  InputProps,
  TextareaProps,
  ToggleProps,
  SelectProps,
  SelectOption,
} from "./Form";

// ── Form Controls (Extended) ────────────────────────────────
export {
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  NumberInput,
  SearchInput,
  FormField,
  DropZone,
} from "./FormExtended";
export type {
  CheckboxProps,
  RadioProps,
  RadioGroupProps,
  RadioGroupOption,
  SliderProps,
  NumberInputProps,
  SearchInputProps,
  FormFieldProps,
  DropZoneProps,
} from "./FormExtended";

// ── Data Display (Core) ─────────────────────────────────────
export { Table, Stat, Progress } from "./Data";
export type {
  TableProps,
  TableColumn,
  TableAlign,
  SortDirection,
  StatProps,
  StatTone,
  ProgressProps,
  ProgressVariant,
  ProgressTone,
} from "./Data";

// ── Data Display (Extended) ─────────────────────────────────
export {
  Avatar,
  AvatarGroup,
  Tag,
  Tooltip,
  Code,
  Timeline,
  Skeleton,
  EmptyState,
  List,
  KeyValue,
  Spinner,
} from "./DataExtended";
export type {
  AvatarProps,
  AvatarStatus,
  AvatarGroupProps,
  TagProps,
  TooltipProps,
  CodeProps,
  TimelineProps,
  TimelineEvent,
  TimelineItemProps,
  SkeletonProps,
  SkeletonShape,
  SkeletonAnimation,
  EmptyStateProps,
  ListProps,
  ListItemProps,
  KeyValueProps,
  KeyValueItem,
  SpinnerProps,
} from "./DataExtended";

// ── Navigation ──────────────────────────────────────────────
export {
  Breadcrumb,
  Pagination,
  Stepper,
  NavItem,
  NavGroup,
} from "./Navigation";
export type {
  BreadcrumbProps,
  BreadcrumbItem,
  BreadcrumbItemProps,
  PaginationProps,
  StepperProps,
  StepperStepProps,
  StepperVariant,
  StepperOrientation,
  NavItemProps,
  NavGroupProps,
} from "./Navigation";

// ── Interactive / Feedback ──────────────────────────────────
export { Tabs, Collapsible, Modal, Toast, Kbd } from "./Interactive";
export type {
  TabsProps,
  TabItem,
  CollapsibleProps,
  ModalProps,
  ToastProps,
  KbdProps,
} from "./Interactive";

// ── Overlays ────────────────────────────────────────────────
export {
  Drawer,
  Dropdown,
  Popover,
  Alert,
  ConfirmDialog,
} from "./Overlay";

// ── Phase 7.1: advanced form controls ───────────────────────
export {
  Field,
  FieldLabel,
  FieldControl,
  FieldHelp,
  FieldError,
} from "./Field";
export type {
  FieldProps,
  FieldLabelProps,
  FieldControlProps,
  FieldHelpProps,
  FieldErrorProps,
} from "./Field";

export {
  FormActions,
  InputGroup,
  InputGroupAddon,
  FieldSet,
  Legend,
} from "./FormStructure";
export type {
  FormActionsProps,
  InputGroupProps,
  InputGroupAddonProps,
  FieldSetProps,
  LegendProps,
} from "./FormStructure";

export {
  Switch,
  CheckboxGroup,
  SegmentedControl,
  PasswordInput,
  PinInput,
  TagInput,
} from "./FormAdvanced";
export type {
  SwitchProps,
  CheckboxGroupProps,
  CheckboxGroupOption,
  SegmentedControlProps,
  SegmentedOption,
  PasswordInputProps,
  PinInputProps,
  TagInputProps,
} from "./FormAdvanced";

// ── Phase 9: data display ───────────────────────────────────
export { DataGrid } from "./DataGrid";
export type {
  DataGridColumn,
  DataGridProps,
  DataGridExportProps,
  DataGridExportFormat,
  DataGridRowReorderEvent,
  DataGridColumnReorderEvent,
  RowSelectionMode,
  DataGridDensity,
} from "./DataGrid";

export { TreeTable } from "./TreeTable";
export type { TreeTableProps } from "./TreeTable";

export { TreeView } from "./TreeView";
export type {
  TreeNode as TreeViewNode,
  TreeViewProps,
  TreeViewRenderState,
} from "./TreeView";

export { VirtualList, VirtualGrid, InfiniteScroll } from "./Virtualization";
export type {
  VirtualListProps,
  VirtualGridProps,
  InfiniteScrollProps,
} from "./Virtualization";

export { DataList, DescriptionList } from "./DataList";
export type {
  DataListItem,
  DataListProps,
  DataListItemProps,
  DescriptionListProps,
} from "./DataList";

export {
  StatGroup,
  MetricCard,
  CircularProgress,
  SegmentedProgress,
  Gauge,
  TrendIndicator,
  StatusIndicator,
} from "./Metrics";
export type {
  StatGroupProps,
  MetricCardProps,
  CircularProgressProps,
  SegmentedProgressProps,
  SegmentedProgressSegment,
  GaugeProps,
  GaugeZone,
  TrendIndicatorProps,
  StatusIndicatorProps,
  StatusIndicatorStatus,
} from "./Metrics";

export { Sparkline, Heatmap, ChartContainer } from "./Charts";
export type {
  SparklineProps,
  HeatmapProps,
  HeatmapCell,
  ChartContainerProps,
} from "./Charts";

export {
  CodeBlock,
  JSONViewer,
  DiffViewer,
  LogViewer,
  Terminal,
  MarkdownRenderer,
  escapeCodeHTML,
} from "./Viewers";
export type {
  CodeBlockProps,
  JSONViewerProps,
  DiffViewerProps,
  LogViewerProps,
  LogLevel,
  LogEntry,
  TerminalProps,
  MarkdownRendererProps,
  MarkdownComponentMap,
  MarkdownPlugin,
} from "./Viewers";

export { Calendar } from "./Calendar";
export type {
  CalendarProps,
  CalendarView as CalendarDisplayView,
  CalendarEvent,
  CalendarRange,
} from "./Calendar";

export { Gantt } from "./Gantt";
export type {
  GanttProps,
  GanttTask,
  GanttGranularity,
  GanttUpdate,
} from "./Gantt";

export { Activity } from "./Activity";
export type { ActivityProps, ActivityItemProps } from "./Activity";

export { Kanban } from "./Kanban";
export type {
  KanbanProps,
  KanbanColumn,
  KanbanItem,
  KanbanMoveEvent,
} from "./Kanban";

// ── Phase 8: layout + navigation shell ──────────────────────
export {
  Stack,
  GridItem,
  Sticky,
  SafeArea,
  Section,
  PageHeader,
  EmptyLayout,
} from "./LayoutExtended";
export type {
  GridItemProps,
  StickyProps,
  SafeAreaProps,
  SectionProps,
  PageHeaderProps,
  EmptyLayoutProps,
} from "./LayoutExtended";

export { ScrollArea } from "./ScrollArea";
export type { ScrollAreaProps } from "./ScrollArea";

export { Masonry } from "./Masonry";
export type { MasonryColumns, MasonryProps } from "./Masonry";

export {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from "./Resizable";
export type {
  ResizableDirection,
  ResizableGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
} from "./Resizable";

export { AppShell } from "./AppShell";
export type { AppShellProps } from "./AppShell";

export { default as Menu, ContextMenu, MenuBar, MenuBarMenu } from "./Menu";
export type {
  MenuProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSubProps,
  ContextMenuProps,
  MenuBarProps,
  MenuBarMenuProps,
} from "./Menu";

export { Toolbar } from "./Toolbar";
export type {
  ToolbarProps,
  ToolbarOrientation,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarToggleGroupProps,
  ToolbarToggleItemProps,
} from "./Toolbar";

export { Navbar, TabBar } from "./Navbar";
export type {
  NavbarProps,
  TabBarProps,
  TabBarItemProps,
} from "./Navbar";

export { Sidebar } from "./Sidebar";
export type { SidebarProps, SidebarSectionProps } from "./Sidebar";

export { Wizard } from "./Wizard";
export type { WizardProps, WizardStepProps } from "./Wizard";

export { MegaMenu } from "./MegaMenu";
export type {
  MegaMenuProps,
  MegaMenuTriggerProps,
  MegaMenuContentProps,
  MegaMenuSectionProps,
  MegaMenuLinkProps,
} from "./MegaMenu";

export { BreadcrumbMenu } from "./BreadcrumbMenu";
export type {
  BreadcrumbMenuItem,
  BreadcrumbMenuProps,
  BreadcrumbMenuSibling,
} from "./BreadcrumbMenu";

export { ShortcutGuide } from "./ShortcutGuide";
export type { ShortcutGuideProps } from "./ShortcutGuide";

export {
  CursorPagination,
  ScrollSpy,
  BackToTop,
  Shortcut,
  TreeNav,
  UserMenu,
} from "./NavigationExtended";
export type {
  CursorPaginationProps,
  ScrollSpyProps,
  ScrollSpyItemProps,
  BackToTopProps,
  ShortcutProps,
  TreeNavItem,
  TreeNavProps,
  UserMenuProps,
  UserMenuItemProps,
} from "./NavigationExtended";

// ── Phase 7.5: capture + upload ─────────────────────────────
export { SignaturePad } from "./SignaturePad";
export type {
  SignaturePadHandle,
  SignaturePadProps,
  SignaturePoint,
  SignatureStrokes,
} from "./SignaturePad";
export { ImageCropper } from "./ImageCropper";
export type {
  CropRect,
  CropResult,
  ImageCropperProps,
} from "./ImageCropper";
export { FileUpload } from "./FileUpload";
export type { FileUploadProps, UploadItem, UploadStatus } from "./FileUpload";

// ── Phase 7.4: editors + specialty inputs ───────────────────
export { RichTextEditor } from "./RichTextEditor";
export type {
  RichTextCommand,
  RichTextEditorApi,
  RichTextEditorProps,
} from "./RichTextEditor";
export {
  MarkdownEditor,
  applyMarkdownCommand,
  renderMarkdown,
} from "./MarkdownEditor";
export type { MarkdownCommand, MarkdownEditorProps } from "./MarkdownEditor";
export { CodeEditor } from "./CodeEditor";
export type { CodeEditorProps } from "./CodeEditor";
export { MentionInput, SlashCommandInput } from "./MentionInput";
export type {
  MentionInputProps,
  MentionOption,
  SlashCommandInputProps,
  SlashCommandOption,
} from "./MentionInput";
export {
  ColorPicker,
  hexToRgba,
  rgbaToHex,
  rgbaToHsla,
  hslaToRgba,
} from "./ColorPicker";
export type { ColorPickerProps } from "./ColorPicker";

// ── Phase 7.3: complex form controls ────────────────────────
export { Combobox, MultiSelect } from "./Combobox";
export type {
  ComboboxOption,
  ComboboxProps,
  MultiSelectProps,
} from "./Combobox";
export { TreeSelect } from "./TreeSelect";
export type {
  TreeNode,
  TreeSelectNode,
  TreeSelectProps,
} from "./TreeSelect";
export {
  MaskedInput,
  CurrencyInput,
  PhoneInput,
  applyMask,
  stripMask,
} from "./MaskedInput";
export type {
  MaskedInputProps,
  CurrencyInputProps,
  PhoneInputProps,
} from "./MaskedInput";
export { RatingInput } from "./RatingInput";
export type { RatingInputProps } from "./RatingInput";

// ── Phase 7.2: date/time family ─────────────────────────────
export { DatePicker, DateRangePicker } from "./DatePicker";
export type {
  DatePickerProps,
  DateRange,
  DateRangePickerProps,
  DateRangePreset,
} from "./DatePicker";
export { TimePicker } from "./TimePicker";
export type { TimePickerProps, TimePickerFormat } from "./TimePicker";
export { DateTimePicker } from "./DateTimePicker";
export type { DateTimePickerProps } from "./DateTimePicker";
export type {
  DrawerProps,
  DropdownProps,
  DropdownMenuItem,
  PopoverProps,
  AlertProps,
  ConfirmDialogProps,
} from "./Overlay";
