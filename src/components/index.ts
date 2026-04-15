// ── Primitives ──────────────────────────────────────────────
export { Text, Label, Divider, Spacer } from "./Text";
export {
  RESPONSIVE_SIZE_PRESETS,
} from "./Text";
export type {
  TextProps,
  TextSize,
  ResponsiveSizePreset,
  LabelProps,
  DividerProps,
  SpacerProps,
} from "./Text";

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

// ── Phase 11: interactive + media ───────────────────────────
export { Carousel, CarouselImageGallery } from "./Carousel";
export type {
  CarouselProps,
  CarouselAlign,
  CarouselControls,
  CarouselImage,
  CarouselImageProps,
} from "./Carousel";

export { Lightbox, ImageGallery } from "./Lightbox";
export type {
  LightboxProps,
  LightboxImage,
  ImageGalleryProps,
} from "./Lightbox";

export { Accordion } from "./Accordion";
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionType,
} from "./Accordion";

export { Swipeable, SwipeActions, Zoomable } from "./Gestures";
export type {
  SwipeableProps,
  SwipeActionsProps,
  SwipeActionProps,
  ZoomableProps,
} from "./Gestures";

export {
  DragDropContext,
  Droppable,
  Draggable,
  Sortable,
  ReorderList,
} from "./DragDrop";
export type {
  DragDropContextProps,
  DraggableProps,
  DraggableRenderProps,
  DroppableProps,
  DroppableRenderProps,
  DragEndEvent,
  SortableProps,
  SortableRenderProps,
  SortStrategy,
} from "./DragDrop";

export { Marquee, Typewriter, Ticker } from "./Animations";
export type {
  MarqueeProps,
  MarqueeDirection,
  TypewriterProps,
  TickerProps,
} from "./Animations";

export { Image } from "./Image";
export type { ImageProps, ImagePlaceholder } from "./Image";

export { VideoPlayer, AudioPlayer, VoiceWaveform } from "./MediaPlayer";
export type {
  VideoPlayerProps,
  AudioPlayerProps,
  VoiceWaveformProps,
  CaptionTrack,
} from "./MediaPlayer";

export { IFrame, DocumentPreview } from "./Embed";
export type {
  IFrameProps,
  DocumentPreviewProps,
  DocumentKind,
} from "./Embed";

export {
  Clipboard,
  ShareButton,
  ScrollIndicator,
  ReactionPicker,
} from "./Utility";
export type {
  ClipboardProps,
  ClipboardRenderProps,
  ShareButtonProps,
  ScrollIndicatorProps,
  Reaction,
  ReactionPickerProps,
} from "./Utility";

// ── Phase 10: feedback + overlays ───────────────────────────
export {
  Dialog,
  AlertDialog,
  ConfirmDialogV2,
  ConfirmProvider,
  useConfirm,
} from "./Dialog";
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogCloseProps,
  DialogSize,
  AlertDialogProps,
  ConfirmDialogPropsV2,
  ConfirmProviderProps,
} from "./Dialog";

export { DrawerV2, Sheet } from "./DrawerCompound";
export type {
  DrawerV2Props,
  DrawerV2ContentProps,
  DrawerSide,
  SheetProps,
} from "./DrawerCompound";

export {
  PopoverV2,
  Tooltip as TooltipV2,
  TooltipProvider,
  HoverCard,
  Backdrop,
} from "./Popovers";
export type {
  PopoverV2Props,
  PopoverTriggerProps,
  PopoverContentProps,
  TooltipProps as TooltipV2Props,
  TooltipProviderProps,
  HoverCardProps,
  HoverCardContentProps,
  BackdropProps,
  Placement,
} from "./Popovers";

export {
  CommandPalette,
  useCommand,
  useCommandRegistry,
} from "./CommandPalette";
export type {
  CommandPaletteProps,
  CommandPaletteInputProps,
  CommandPaletteGroupProps,
  CommandPaletteItemProps,
  RegisteredCommand,
  UseCommandOptions,
} from "./CommandPalette";

export { Spotlight, CoachMark } from "./Spotlight";
export type {
  SpotlightProps,
  SpotlightStep,
  CoachMarkProps,
} from "./Spotlight";

export { Toaster, Snackbar, toast, useToast } from "./ToastSystem";
export type {
  ToastApi,
  ToasterProps,
  SnackbarProps,
  ToastEntry,
  ToastV2Options,
  ToastTone,
  ToasterPosition,
} from "./ToastSystem";

export {
  NotificationCenter,
  BannerAlert,
  Callout,
  Quote,
  AlertV2,
} from "./Notifications";
export type {
  NotificationCenterProps,
  NotificationItem,
  BannerAlertProps,
  CalloutProps,
  QuoteProps,
  AlertV2Props,
  AlertTone,
} from "./Notifications";

export {
  LoadingOverlay,
  SpinnerV2,
  Shimmer,
  ErrorState,
} from "./Loading";
export type {
  LoadingOverlayProps,
  SpinnerV2Props,
  SpinnerVariant,
  ShimmerProps,
  ErrorStateProps,
} from "./Loading";

export { OfflineBanner, ConnectionStatus } from "./Network";
export type {
  OfflineBannerProps,
  ConnectionStatusProps,
  ConnectionState,
} from "./Network";

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

// Legacy Sparkline / Heatmap / ChartContainer removed in Phase 22. The
// new implementations live under `src/charts/` and are exported via the
// "Phase 21: chart foundations" block below.

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
  ResizableBox,
} from "./Resizable";
export type {
  ResizableDirection,
  ResizableGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
  ResizableAxis,
  ResizableBoxProps,
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

// ── Phase 12: chat & AI ─────────────────────────────────────
export {
  Conversation,
  MessageList,
  MessageGroup,
  Message,
  MessageContent,
  StreamingText,
  ThinkingIndicator,
  TypingIndicator,
  ReasoningTrace,
  MessageActions,
  MessageFeedback,
  ReactionBar,
  MessageReactions,
  MessageEdit,
  useConversation,
} from "./Chat";
export type {
  ConversationProps,
  ConversationStatus,
  MessageListProps,
  MessageGroupProps,
  MessageProps,
  MessageRole,
  MessageStatus,
  MessageAuthor,
  MessagePart,
  MessageContentProps,
  StreamingTextProps,
  ThinkingIndicatorProps,
  ReasoningTraceProps,
  MessageActionsProps,
  MessageActionButtonProps,
  MessageFeedbackProps,
  FeedbackValue,
  FeedbackReason,
  ReactionBarProps,
  MessageReactionEntry,
  MessageEditProps,
} from "./Chat";

export {
  Attachment,
  AttachmentList,
  ImageAttachment,
  FileAttachment,
  CodeAttachment,
  AudioAttachment,
} from "./ChatAttachments";
export type {
  AttachmentKind,
  AttachmentProps,
  AttachmentListProps,
  ImageAttachmentProps,
  FileAttachmentProps,
  CodeAttachmentProps,
  AudioAttachmentProps,
} from "./ChatAttachments";

export {
  ToolCall,
  ToolCallGroup,
  AgentStep,
  AgentTrace,
  PlanDisplay,
} from "./ChatAgent";
export type {
  ToolStatus,
  ToolCallProps,
  ToolCallGroupProps,
  AgentStepProps,
  AgentTraceProps,
  AgentTraceTokens,
  PlanDisplayProps,
  PlanStep,
  PlanStepStatus,
} from "./ChatAgent";

export {
  Citation,
  CitationList,
  SourceCard,
  SourceGrid,
  RAGContext,
} from "./ChatCitations";
export type {
  SourceRef,
  CitationProps,
  CitationListProps,
  SourceCardProps,
  SourceGridProps,
  RAGChunk,
  RAGContextProps,
} from "./ChatCitations";

export {
  Composer,
  ComposerAttachment,
  ComposerMicButton,
  SubmitButton,
  StopButton,
  RegenerateButton,
  SuggestionChips,
  QuickReplies,
  PromptTemplateList,
  PromptTemplateEditor,
  SlashCommandPicker,
  Mention,
} from "./ChatComposer";
export type {
  ComposerProps,
  ComposerInputProps,
  ComposerAttachmentProps,
  ComposerMicButtonProps,
  SubmitButtonProps,
  StopButtonProps,
  RegenerateButtonProps,
  SuggestionChipsProps,
  SuggestionItem,
  PromptTemplate,
  PromptTemplateListProps,
  PromptTemplateEditorProps,
  SlashCommand,
  SlashCommandPickerProps,
  MentionProps,
} from "./ChatComposer";

export {
  SessionList,
  SessionListItem,
  ConversationHeader,
  ConversationEmptyState,
} from "./ChatSession";
export type {
  ChatSessionEntry,
  SessionGroupBy,
  SessionListProps,
  SessionListItemProps,
  ConversationHeaderProps,
  ConversationEmptyStateProps,
  ConversationEmptyStateSuggestion,
} from "./ChatSession";

export {
  ModelSelector,
  SystemPromptEditor,
  TokenCounter as ChatTokenCounter,
  ContextWindow,
  CostDisplay,
  LatencyIndicator,
  DebugPanel,
  TraceViewer,
  UnreadBadge,
  ChatLayout,
  SimpleChat,
  AgentRunner,
} from "./ChatModel";

// ── Phase 13: specialty ─────────────────────────────────────
export {
  CommitGraph,
  NetworkInspector,
  ConsoleOutput,
  DebugTree,
  toYaml,
  KeyValueEditor,
  QueryBuilder,
  ShortcutEditor,
} from "./DevTools";
export type {
  CommitNode,
  CommitGraphProps,
  NetworkRequest,
  NetworkRequestStatus,
  NetworkInspectorProps,
  ConsoleLevel,
  ConsoleEntry,
  ConsoleOutputProps,
  DebugTreeFormat,
  DebugTreeProps,
  KeyValuePair,
  KeyValueEditorProps,
  QueryOperator,
  QueryFieldDef,
  QueryRule,
  QueryGroup,
  QueryBuilderProps,
  ShortcutEditorProps,
} from "./DevTools";

export {
  UserCard,
  TeamCard,
  OrganizationCard,
  Identicon,
  PresenceList,
} from "./Identity";
export type {
  UserCardUser,
  UserCardProps,
  TeamCardTeam,
  TeamCardProps,
  OrganizationCardOrg,
  OrganizationCardProps,
  IdenticonProps,
  PresenceStatus,
  PresenceUser,
  PresenceListProps,
} from "./Identity";

export {
  NumberDisplay,
  CurrencyDisplay,
  PercentDisplay,
  BigNumber,
} from "./Numeric";
export type {
  NumberDisplayProps,
  CurrencyDisplayProps,
  PercentDisplayProps,
  BigNumberProps,
} from "./Numeric";

export {
  TimeZoneSelect,
  RelativeTime,
  DurationDisplay,
  Countdown,
} from "./TimeDisplays";
export type {
  TimeZoneSelectProps,
  RelativeTimeProps,
  DurationDisplayProps,
  CountdownProps,
} from "./TimeDisplays";

export {
  HelpTooltip,
  ContextHelp,
  Changelog,
  WhatsNewPopover,
} from "./HelpChangelog";
export type {
  HelpTooltipProps,
  ContextHelpProps,
  ChangelogChange,
  ChangelogChangeKind,
  ChangelogEntry,
  ChangelogProps,
  WhatsNewFeature,
  WhatsNewPopoverProps,
} from "./HelpChangelog";

export { QRCode, Barcode } from "./Encoding";
export type {
  QRErrorCorrection,
  QRCodeProps,
  BarcodeFormat,
  BarcodeProps,
} from "./Encoding";

export { ColorSwatch, Palette } from "./ColorTools";
export type {
  ColorSwatchProps,
  PaletteColor,
  PaletteProps,
} from "./ColorTools";

export { LegalText, Mermaid } from "./RichEmbed";
export type { LegalTextProps, MermaidProps } from "./RichEmbed";

export {
  WidgetShell,
  DashboardGrid,
  packLayout,
  usePackedLayout,
} from "./Widget";
export type {
  WidgetShellProps,
  DashboardLayoutItem,
  DashboardGridProps,
} from "./Widget";

export { PrintLayout, PrintButton } from "./Print";
export type { PrintLayoutProps, PrintButtonProps } from "./Print";

// ── Phase 21: chart foundations ──────────────────────────────
export * from "../charts";

// ── Phase 15: theming ────────────────────────────────────────
export { ThemeSelector } from "./ThemeSelector";
export type {
  ThemeSelectorProps,
  ThemeSelectorOption,
} from "./ThemeSelector";
export type {
  ChatModelOption,
  ModelSelectorProps,
  SystemPromptTemplate,
  SystemPromptEditorProps,
  TokenCounterProps,
  ContextWindowProps,
  CostDisplayProps,
  LatencyIndicatorProps,
  DebugEvent,
  DebugPanelProps,
  TraceSpan,
  TraceViewerProps,
  UnreadBadgeProps,
  ChatLayoutProps,
  SimpleChatProps,
  AgentRunnerProps,
} from "./ChatModel";
