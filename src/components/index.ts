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
export type { BadgeProps, DotsProps } from "./Badge";

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
  StatProps,
  ProgressProps,
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
  AvatarGroupProps,
  TagProps,
  TooltipProps,
  CodeProps,
  TimelineProps,
  TimelineEvent,
  SkeletonProps,
  EmptyStateProps,
  ListProps,
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
  PaginationProps,
  StepperProps,
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
