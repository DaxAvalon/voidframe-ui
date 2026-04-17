# Phase 1: Missing Components

## Context

Voidframe has 200+ components but is missing several common UI patterns that production applications regularly need. This phase adds 16 new components across 3 priority tiers. Every component follows voidframe conventions: BEM CSS (`.vf-component--variant`), `useControllableState` for stateful components, polymorphic `as` prop where appropriate, `forwardRef` with `displayName`, exported `{Component}Props` type, a11y-first with ARIA roles and keyboard navigation, and i18n messages for user-facing strings.

**Test requirement:** Every component gets a dedicated `{Component}.test.tsx` file in `src/components/__tests__/` with 100% code coverage. Every test file must include: rendering tests, interaction tests, controlled/uncontrolled tests (if stateful), keyboard navigation tests (if interactive), edge case tests, and an `expectNoA11yViolations` a11y audit.

---

## Tier 1 — High Priority Components

### 1.1 Transfer (Shuttle)

**Files to create:**
- `src/components/Transfer.tsx`
- `src/components/__tests__/Transfer.test.tsx`
- `src/css/components/transfer.css`

**Description:** Dual-list component for moving items between "available" and "selected" panels. Used in permission assignment, bulk selection, role configuration.

**Component API:**
```typescript
export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps extends BaseProps {
  items: TransferItem[];
  value?: string[];                    // controlled: selected keys
  defaultValue?: string[];             // uncontrolled initial
  onChange?: (selectedKeys: string[]) => void;
  onValueChange?: (selectedKeys: string[]) => void;
  titles?: [string, string];           // ["Available", "Selected"]
  searchable?: boolean;                // filter input on each panel
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}
```

**Compound sub-components:**
- `Transfer` — root container (flex row)
- `Transfer.Panel` — single panel with title, search, item list
- `Transfer.Actions` — center column with move buttons (>, >>, <, <<)

**Behavior:**
- Select items via checkbox click or Shift+click for range select
- Move selected items between panels via arrow buttons or keyboard Enter
- Double-click item to move it immediately
- Search input filters items within each panel (case-insensitive)
- "Move all" buttons (>>, <<) for bulk operations
- Keyboard: Tab between panels, Arrow keys within panel, Space to select, Enter to move

**CSS classes:**
- `.vf-transfer` — root flex container
- `.vf-transfer__panel` — individual panel
- `.vf-transfer__panel-header` — title + count
- `.vf-transfer__search` — filter input
- `.vf-transfer__list` — scrollable item list
- `.vf-transfer__item`, `.vf-transfer__item--selected`, `.vf-transfer__item--disabled`
- `.vf-transfer__actions` — center button column
- `.vf-transfer--sm`, `.vf-transfer--lg` — size variants

**Reuse:** `Checkbox` for item selection, `SearchInput` for filtering, `Button` for move actions, `useControllableState` for value management, `ScrollArea` for panel scrolling.

**Test plan (Transfer.test.tsx):**
1. Renders both panels with correct item distribution
2. Renders custom titles via `titles` prop
3. Uncontrolled: items move between panels on button click
4. Controlled: `value` prop determines selected panel contents, `onChange` fires
5. Select item via checkbox click, verify visual selection state
6. Shift+click selects range of items
7. Double-click moves item immediately
8. Search input filters items (case-insensitive match)
9. Search clears when items move
10. "Move all" buttons transfer entire panel contents
11. Disabled items cannot be selected or moved
12. `disabled` prop disables entire component
13. Keyboard: Tab cycles focus between panels and action buttons
14. Keyboard: Arrow keys navigate within panel item list
15. Keyboard: Space toggles item selection
16. Keyboard: Enter moves selected items
17. Size variants render correct CSS classes (sm, md, lg)
18. Empty panel shows empty state text
19. `it.each` for size variants rendering
20. a11y: `expectNoA11yViolations` — both panels have `role="listbox"`, items have `role="option"`

---

### 1.2 Popconfirm

**Files to create:**
- `src/components/Popconfirm.tsx`
- `src/components/__tests__/Popconfirm.test.tsx`
- `src/css/components/popconfirm.css`

**Description:** Lightweight inline confirmation popover attached to a trigger element. Lighter than ConfirmDialog for quick "are you sure?" prompts on delete buttons, status toggles, etc.

**Component API:**
```typescript
export interface PopconfirmProps extends BaseProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;             // default: "Confirm"
  cancelLabel?: string;              // default: "Cancel"
  confirmVariant?: "default" | "accent" | "danger";
  icon?: ReactNode;
  placement?: Placement;             // reuse from PopoverV2
  open?: boolean;                    // controlled
  defaultOpen?: boolean;             // uncontrolled
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: ReactElement;            // trigger element
}
```

**Behavior:**
- Click trigger to open confirmation popover
- Popover contains: optional icon, title, optional description, cancel + confirm buttons
- Confirm button fires `onConfirm` and closes
- Cancel button fires `onCancel` and closes
- Escape key closes (via DismissableLayer)
- Click outside closes
- Focus traps within popover when open
- Confirm button receives focus on open (or cancel for danger variants)

**CSS classes:**
- `.vf-popconfirm` — popover container
- `.vf-popconfirm__icon` — optional icon
- `.vf-popconfirm__title` — title text
- `.vf-popconfirm__description` — description text
- `.vf-popconfirm__actions` — button row
- `.vf-popconfirm--danger` — danger variant styling

**Reuse:** `PopoverV2` for positioning/portal, `Button` for actions, `DismissableLayer` for escape/outside-click, `FocusScope` for focus trapping, `useControllableState` for open state.

**Test plan (Popconfirm.test.tsx):**
1. Renders trigger element (children)
2. Click trigger opens popover with title
3. Renders description when provided
4. Renders icon when provided
5. Confirm button fires `onConfirm` and closes popover
6. Cancel button fires `onCancel` and closes popover
7. Custom `confirmLabel` and `cancelLabel` render correctly
8. Escape key closes popover
9. Click outside closes popover
10. Controlled: `open` prop controls visibility, `onOpenChange` fires
11. Uncontrolled: `defaultOpen` sets initial state
12. `disabled` prop prevents trigger from opening
13. Danger variant: confirm button has danger styling
14. Focus moves to confirm button on open
15. Tab key cycles between cancel and confirm buttons
16. Popover respects `placement` prop
17. Multiple rapid open/close cycles don't break state
18. a11y: `expectNoA11yViolations` — popover has `role="dialog"`, `aria-labelledby`

---

### 1.3 SplitButton

**Files to create:**
- `src/components/SplitButton.tsx`
- `src/components/__tests__/SplitButton.test.tsx`
- `src/css/components/split-button.css`

**Description:** Button with attached dropdown for alternative actions. Primary action on the main button, secondary actions in the dropdown (e.g., Save / Save As / Save Draft).

**Component API:**
```typescript
export interface SplitButtonAction {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface SplitButtonProps extends BaseProps {
  label: string;                      // primary button label
  onClick: () => void;                // primary action
  actions: SplitButtonAction[];       // dropdown actions
  onAction: (key: string) => void;    // dropdown action handler
  variant?: "default" | "accent" | "solid";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;                   // primary button icon
}
```

**Behavior:**
- Main button area triggers primary `onClick`
- Dropdown caret button opens action menu
- Menu items trigger `onAction(key)`
- Menu closes after selection
- Keyboard: Enter/Space on main button fires primary action
- Keyboard: Enter/Space on caret opens menu
- Keyboard: Arrow keys navigate menu items
- Keyboard: Escape closes menu
- Loading state disables both button and caret

**CSS classes:**
- `.vf-split-button` — wrapper flex container
- `.vf-split-button__primary` — main button (left)
- `.vf-split-button__caret` — dropdown trigger (right, separated by border)
- `.vf-split-button__menu` — dropdown menu container
- `.vf-split-button__menu-item`, `.vf-split-button__menu-item--danger`
- Size and variant modifiers

**Reuse:** `Button` for both sections, `Menu` compound for dropdown, `useControllableState` for menu open state.

**Test plan (SplitButton.test.tsx):**
1. Renders primary button with label
2. Renders dropdown caret button
3. Primary button click fires `onClick`
4. Caret click opens dropdown menu
5. Menu items render from `actions` array
6. Clicking menu item fires `onAction(key)` and closes menu
7. Disabled menu items are not clickable
8. Danger menu items render with danger styling
9. `disabled` prop disables both primary and caret buttons
10. `loading` prop shows spinner and disables interaction
11. `icon` prop renders icon in primary button
12. `it.each` for variant rendering (default, accent, solid)
13. `it.each` for size rendering (sm, md, lg)
14. Keyboard: Enter on primary fires onClick
15. Keyboard: Enter on caret opens menu
16. Keyboard: ArrowDown/ArrowUp navigate menu items
17. Keyboard: Escape closes menu, returns focus to caret
18. Menu closes when clicking outside
19. a11y: `expectNoA11yViolations` — menu has `role="menu"`, items have `role="menuitem"`

---

### 1.4 InlineEdit

**Files to create:**
- `src/components/InlineEdit.tsx`
- `src/components/__tests__/InlineEdit.test.tsx`
- `src/css/components/inline-edit.css`

**Description:** Click-to-edit component that toggles between a display value and an input field. Used in dashboards, Kanban card titles, editable table cells.

**Component API:**
```typescript
export interface InlineEditProps extends BaseProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  validation?: (value: string) => string | undefined;  // return error message
  size?: "sm" | "md" | "lg";
  multiline?: boolean;                // use textarea instead of input
  disabled?: boolean;
  readOnly?: boolean;
  renderDisplay?: (value: string) => ReactNode;  // custom display renderer
  maxLength?: number;
  autoSelect?: boolean;               // select all text on edit (default: true)
  submitOnBlur?: boolean;             // save on blur (default: true)
  submitOnEnter?: boolean;            // save on Enter (default: true)
}
```

**Behavior:**
- Display mode: shows value as text (or custom render via `renderDisplay`)
- Click or Enter on display text enters edit mode
- Edit mode: shows input/textarea with current value
- Text is auto-selected on entering edit mode (default)
- Save: Enter key (if `submitOnEnter`), blur (if `submitOnBlur`), or explicit save
- Cancel: Escape key reverts to original value
- Validation runs on save attempt; error shown inline if validation fails
- Saving with empty value and no placeholder shows original value

**CSS classes:**
- `.vf-inline-edit` — root container
- `.vf-inline-edit__display` — display mode text (with hover underline hint)
- `.vf-inline-edit__input` — edit mode input/textarea
- `.vf-inline-edit__error` — validation error message
- `.vf-inline-edit--editing` — active edit state
- `.vf-inline-edit--disabled`, `.vf-inline-edit--readonly`

**Reuse:** `Input` or `Textarea` for edit mode, `Text` for display mode, `useControllableState` internally for editing state.

**Test plan (InlineEdit.test.tsx):**
1. Renders display value as text
2. Click on display enters edit mode with input
3. Input contains current value
4. Text is auto-selected on edit mode entry
5. `autoSelect={false}` skips text selection
6. Enter key saves new value and exits edit mode
7. `onSave` fires with new value on Enter
8. Escape key cancels edit and reverts to original value
9. `onCancel` fires on Escape
10. Blur saves value when `submitOnBlur={true}` (default)
11. Blur does NOT save when `submitOnBlur={false}`
12. Validation function runs on save; error prevents save and shows message
13. Successful validation clears error and saves
14. `multiline={true}` renders textarea instead of input
15. `disabled` prop prevents entering edit mode
16. `readOnly` prop prevents entering edit mode
17. `renderDisplay` custom renderer is used for display mode
18. `placeholder` shows when value is empty
19. `maxLength` limits input characters
20. `it.each` for size variants (sm, md, lg)
21. Keyboard: Enter on display text enters edit mode
22. Keyboard: Tab from input saves (blur behavior)
23. a11y: `expectNoA11yViolations` — display has `role="button"`, `aria-label`

---

### 1.5 Badge (Notification Overlay)

**Files to create:**
- `src/components/Badge.tsx`
- `src/components/__tests__/Badge.test.tsx`
- `src/css/components/badge.css`

**Description:** Notification count badge overlaid on icons, avatars, or any element. Shows a red dot, a count, or a max-exceeded indicator (99+).

**Component API:**
```typescript
export interface BadgeProps extends BaseProps {
  count?: number;
  max?: number;                       // default: 99, shows "99+" when exceeded
  dot?: boolean;                      // show dot instead of count
  showZero?: boolean;                 // show badge when count is 0 (default: false)
  offset?: [number, number];          // [x, y] pixel offset from default position
  color?: string;                     // override badge color (default: red accent)
  variant?: "standard" | "dot";
  size?: "sm" | "md";
  overflowCount?: number;             // alias for max
  children: ReactNode;                // wrapped element
}
```

**Behavior:**
- Wraps children in a positioned container
- Badge renders at top-right corner (adjustable via `offset`)
- Count of 0 hides badge unless `showZero={true}`
- Counts exceeding `max` display as "{max}+" (e.g., "99+")
- `dot` variant shows a small circle with no text
- Badge animates in/out with scale transition
- Standalone (no children): renders as inline badge

**CSS classes:**
- `.vf-badge` — positioned container (relative)
- `.vf-badge__indicator` — the badge circle (absolute positioned)
- `.vf-badge__indicator--dot` — dot variant (smaller, no text)
- `.vf-badge__indicator--hidden` — when count is 0 and showZero is false
- `.vf-badge--sm`, `.vf-badge--md`

**Test plan (Badge.test.tsx):**
1. Renders children element
2. Renders badge with count number
3. Count of 0 hides badge by default
4. `showZero={true}` shows badge with 0
5. Count exceeding `max` shows "99+"
6. Custom `max` value works (e.g., max=9 shows "9+")
7. `dot` variant renders dot without text
8. `offset` prop adjusts badge position via CSS custom properties
9. Custom `color` prop applies to badge background
10. `it.each` for size variants (sm, md)
11. Badge without children renders inline
12. Negative count treated as 0
13. Badge has scale animation class on count change
14. a11y: badge has `aria-label` describing count (e.g., "5 notifications")

---

### 1.6 ToggleGroup

**Files to create:**
- `src/components/ToggleGroup.tsx`
- `src/components/__tests__/ToggleGroup.test.tsx`
- `src/css/components/toggle-group.css`

**Description:** Multi-select toggle button group. Unlike ButtonGroup (single-select), ToggleGroup allows multiple buttons to be active simultaneously. Used for filter controls, feature flags, tag selection.

**Component API:**
```typescript
export interface ToggleGroupItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps extends BaseProps {
  items: ToggleGroupItem[];
  value?: string[];                    // controlled: active keys
  defaultValue?: string[];             // uncontrolled initial
  onValueChange?: (keys: string[]) => void;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  allowEmpty?: boolean;                // allow deselecting all (default: true)
}
```

**Behavior:**
- Click toggle to activate/deactivate it
- Multiple toggles can be active simultaneously
- `allowEmpty={false}` prevents deselecting the last active toggle
- Keyboard: Tab to group, Arrow keys between items, Space/Enter to toggle
- Uses `RovingFocusGroup` for keyboard navigation

**CSS classes:**
- `.vf-toggle-group` — flex container
- `.vf-toggle-group__item`, `.vf-toggle-group__item--active`
- `.vf-toggle-group--vertical`
- Size and variant modifiers

**Reuse:** `Button` styling, `RovingFocusGroup` + `RovingFocusItem` for keyboard nav, `useControllableState`.

**Test plan (ToggleGroup.test.tsx):**
1. Renders all items as toggle buttons
2. Uncontrolled: clicking item toggles its active state
3. Multiple items can be active simultaneously
4. Controlled: `value` determines active items, `onValueChange` fires
5. `defaultValue` sets initial active items
6. Clicking active item deselects it
7. `allowEmpty={false}` prevents deselecting last active item
8. Disabled items cannot be toggled
9. `disabled` prop disables entire group
10. `it.each` for variant rendering (default, ghost, accent)
11. `it.each` for size rendering (sm, md, lg)
12. `orientation="vertical"` adds vertical CSS class
13. Keyboard: Tab focuses first active item (or first item)
14. Keyboard: ArrowRight/ArrowLeft navigates between items
15. Keyboard: Space/Enter toggles focused item
16. Keyboard: ArrowDown/ArrowUp in vertical orientation
17. Icon renders within toggle item
18. a11y: `expectNoA11yViolations` — group has `role="group"`, items have `aria-pressed`

---

### 1.7 NumberStepper

**Files to create:**
- `src/components/NumberStepper.tsx`
- `src/components/__tests__/NumberStepper.test.tsx`
- `src/css/components/number-stepper.css`

**Description:** Standalone +/- stepper for quantity selection. More touch-friendly and visually distinct than NumberInput's spinners. Used in e-commerce quantity selectors, settings counters.

**Component API:**
```typescript
export interface NumberStepperProps extends BaseProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;                       // default: 1
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  formatValue?: (value: number) => string;  // custom display formatting
  label?: string;
  hideInput?: boolean;                 // show only buttons + value display
}
```

**Behavior:**
- Decrement button (-), value display, increment button (+)
- Value clamped between `min` and `max`
- Buttons disable when at min/max bounds
- Long-press on buttons for continuous increment/decrement
- Optional text input for direct value entry (validated on blur)
- `formatValue` for display (e.g., showing "$5" instead of "5")

**CSS classes:**
- `.vf-number-stepper` — flex container
- `.vf-number-stepper__decrement`, `.vf-number-stepper__increment`
- `.vf-number-stepper__value` — center display/input
- `.vf-number-stepper--disabled`
- Size modifiers

**Reuse:** `Button` or `IconButton` for +/-, `useControllableState`, `useLongPress` for hold-to-repeat.

**Test plan (NumberStepper.test.tsx):**
1. Renders with default value
2. Increment button increases value by `step`
3. Decrement button decreases value by `step`
4. Value clamped at `max` — increment button disabled at max
5. Value clamped at `min` — decrement button disabled at min
6. Custom `step` value works (e.g., step=5)
7. Controlled: `value` prop drives display, `onValueChange` fires
8. Uncontrolled: `defaultValue` sets initial, internal state updates
9. `disabled` prop disables both buttons and input
10. `readOnly` prevents value changes
11. Direct input: typing a number updates value on blur
12. Direct input: invalid input reverts to previous value
13. `formatValue` customizes display text
14. `label` prop renders accessible label
15. `hideInput` shows value as text only (no input field)
16. Long-press on increment button fires continuous increments
17. Long-press stops when button is released
18. `it.each` for size variants (sm, md, lg)
19. Keyboard: ArrowUp increments, ArrowDown decrements when input focused
20. a11y: `expectNoA11yViolations` — input has `role="spinbutton"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`

---

### 1.8 Anchor (Table of Contents)

**Files to create:**
- `src/components/Anchor.tsx`
- `src/components/__tests__/Anchor.test.tsx`
- `src/css/components/anchor.css`

**Description:** Scrollspy-driven table of contents sidebar that highlights the currently visible section. Used in documentation pages, long-form content, settings pages.

**Component API:**
```typescript
export interface AnchorItem {
  key: string;
  label: string;
  href: string;                        // #section-id
  children?: AnchorItem[];             // nested sections
}

export interface AnchorProps extends BaseProps {
  items: AnchorItem[];
  activeKey?: string;                  // controlled active section
  defaultActiveKey?: string;
  onActiveChange?: (key: string) => void;
  offset?: number;                     // scroll offset for activation (default: 80)
  smooth?: boolean;                    // smooth scroll on click (default: true)
  affix?: boolean;                     // sticky positioning (default: false)
  affixOffset?: number;                // top offset when affixed
  orientation?: "vertical" | "horizontal";
  indicator?: "line" | "dot" | "none"; // active indicator style
}
```

**Behavior:**
- Renders as vertical (default) or horizontal list of links
- Automatically tracks which section is in viewport using IntersectionObserver
- Clicking a link smooth-scrolls to the target section
- Active indicator (line or dot) animates to current section
- Nested items indent under parent
- Affix mode: sticks to viewport when scrolled past
- `offset` accounts for fixed headers

**CSS classes:**
- `.vf-anchor` — root container
- `.vf-anchor__list` — link list
- `.vf-anchor__item`, `.vf-anchor__item--active`
- `.vf-anchor__item--nested` — indented child item
- `.vf-anchor__indicator` — animated line/dot marker
- `.vf-anchor--horizontal`, `.vf-anchor--affix`

**Reuse:** `useIntersectionObserver` for scrollspy, `useScrollPosition`, `useControllableState`, `Sticky` component for affix mode.

**Test plan (Anchor.test.tsx):**
1. Renders all items as links
2. Items have correct `href` attributes
3. Nested items render indented under parent
4. Click on item fires `onActiveChange` with key
5. Controlled: `activeKey` determines which item has active class
6. Uncontrolled: `defaultActiveKey` sets initial active
7. Active indicator renders with correct style (line, dot, none)
8. `orientation="horizontal"` renders horizontal layout
9. `affix={true}` applies affix CSS class
10. `offset` prop is passed to scroll calculation
11. Keyboard: Tab navigates between links
12. Keyboard: Enter on link triggers navigation
13. Renders nested structure correctly (2 levels)
14. Empty items array renders nothing
15. a11y: `expectNoA11yViolations` — `role="navigation"`, `aria-label="Table of Contents"`

---

### 1.9 CopyButton

**Files to create:**
- `src/components/CopyButton.tsx`
- `src/components/__tests__/CopyButton.test.tsx`
- `src/css/components/copy-button.css`

**Description:** Standalone copy-to-clipboard button with visual feedback. Shows a checkmark icon and "Copied!" state for a configurable duration after copying.

**Component API:**
```typescript
export interface CopyButtonProps extends BaseProps {
  text: string;                        // text to copy
  label?: string;                      // button label (default: icon only)
  copiedLabel?: string;                // label after copy (default: "Copied")
  copiedDuration?: number;             // ms to show copied state (default: 2000)
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onCopy?: (text: string) => void;     // callback after copy
  onError?: (error: Error) => void;    // callback on copy failure
}
```

**Behavior:**
- Click copies `text` to clipboard via Clipboard API
- Button transitions to "copied" state with checkmark icon
- Returns to default state after `copiedDuration` ms
- `onCopy` fires on successful copy
- `onError` fires if clipboard write fails
- Rapid clicks don't stack timeouts

**CSS classes:**
- `.vf-copy-button`
- `.vf-copy-button--copied` — success state
- `.vf-copy-button__icon` — icon container with cross-fade transition

**Reuse:** `Button`, `useCopyToClipboard` hook, `useTimeout`.

**Test plan (CopyButton.test.tsx):**
1. Renders button with copy icon
2. Renders custom `label` text
3. Click copies text to clipboard (mock navigator.clipboard.writeText)
4. Button shows copied state after click
5. `copiedLabel` text appears in copied state
6. Button returns to default state after `copiedDuration`
7. `onCopy` fires with text after successful copy
8. `onError` fires when clipboard write fails
9. `disabled` prop prevents copying
10. Rapid clicks don't cause state glitches (timeout reset)
11. `it.each` for variant rendering (default, ghost, accent)
12. `it.each` for size rendering (sm, md, lg)
13. a11y: `expectNoA11yViolations` — button has descriptive `aria-label`

---

### 1.10 Skeleton Composites

**Files to create:**
- `src/components/SkeletonComposites.tsx`
- `src/components/__tests__/SkeletonComposites.test.tsx`
- `src/css/components/skeleton-composites.css`

**Description:** Pre-composed skeleton loading placeholders for common UI patterns. Reduces boilerplate when building loading states.

**Component API:**
```typescript
export interface SkeletonTextProps extends BaseProps {
  lines?: number;                      // default: 3
  lastLineWidth?: string;             // default: "60%"
  spacing?: string;                    // gap between lines
  size?: "sm" | "md" | "lg";
}

export interface SkeletonAvatarProps extends BaseProps {
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";         // default: "circle"
}

export interface SkeletonButtonProps extends BaseProps {
  size?: "sm" | "md" | "lg";
  width?: string;
}

export interface SkeletonCardProps extends BaseProps {
  hasImage?: boolean;
  imageHeight?: string;
  lines?: number;
  hasActions?: boolean;
}

export interface SkeletonTableProps extends BaseProps {
  rows?: number;                       // default: 5
  columns?: number;                    // default: 4
  hasHeader?: boolean;                 // default: true
}

export interface SkeletonFormProps extends BaseProps {
  fields?: number;                     // default: 3
  hasSubmit?: boolean;                 // default: true
}
```

**Components:**
- `SkeletonText` — Multiple text lines with last-line truncation
- `SkeletonAvatar` — Circle or square avatar placeholder
- `SkeletonButton` — Button-shaped placeholder
- `SkeletonCard` — Card with optional image, text, actions
- `SkeletonTable` — Table with header and body rows
- `SkeletonForm` — Form fields with optional submit button

**CSS classes:**
- `.vf-skeleton-text`, `.vf-skeleton-text__line`
- `.vf-skeleton-avatar`, `.vf-skeleton-avatar--circle`, `.vf-skeleton-avatar--square`
- `.vf-skeleton-button`
- `.vf-skeleton-card`, `.vf-skeleton-card__image`, `.vf-skeleton-card__body`
- `.vf-skeleton-table`, `.vf-skeleton-table__header`, `.vf-skeleton-table__row`
- `.vf-skeleton-form`, `.vf-skeleton-form__field`

**Reuse:** Existing `Skeleton` primitive with `shape` and `animation` props, `VStack`/`HStack` for layout.

**Test plan (SkeletonComposites.test.tsx):**
1. `SkeletonText`: renders correct number of lines (default 3)
2. `SkeletonText`: last line has reduced width
3. `SkeletonText`: custom `lines` count works
4. `SkeletonText`: `it.each` for sizes (sm, md, lg)
5. `SkeletonAvatar`: renders circle shape by default
6. `SkeletonAvatar`: `shape="square"` applies correct class
7. `SkeletonAvatar`: `it.each` for sizes
8. `SkeletonButton`: renders button-shaped skeleton
9. `SkeletonButton`: custom `width` applies
10. `SkeletonCard`: renders with text lines
11. `SkeletonCard`: `hasImage` adds image placeholder
12. `SkeletonCard`: `hasActions` adds action placeholders
13. `SkeletonTable`: renders correct row and column counts
14. `SkeletonTable`: `hasHeader` adds header row
15. `SkeletonForm`: renders correct number of field placeholders
16. `SkeletonForm`: `hasSubmit` adds button placeholder
17. All composites use shimmer animation class
18. a11y: all composites have `aria-busy="true"` and `aria-label`

---

## Tier 2 — Medium Priority Components

### 1.11 Cascader

**Files to create:**
- `src/components/Cascader.tsx`
- `src/components/__tests__/Cascader.test.tsx`
- `src/css/components/cascader.css`

**Description:** Multi-level drill-down dropdown for hierarchical selection (country > state > city). Each selection opens the next level as a nested panel.

**Component API:**
```typescript
export interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;                    // marks terminal node
}

export interface CascaderProps extends BaseProps {
  options: CascaderOption[];
  value?: string[];                    // controlled: path of selected values
  defaultValue?: string[];
  onValueChange?: (path: string[], selectedOptions: CascaderOption[]) => void;
  placeholder?: string;
  searchable?: boolean;                // search across all levels
  expandTrigger?: "click" | "hover";   // how to expand levels (default: "click")
  displayRender?: (labels: string[]) => string;  // custom display format
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
  allowClear?: boolean;
  loadData?: (option: CascaderOption) => Promise<CascaderOption[]>;  // async loading
}
```

**Behavior:**
- Trigger button shows current selection path (e.g., "USA / California / San Francisco")
- Click opens first-level panel
- Selecting an item with children opens next panel beside it
- Selecting a leaf node completes selection and closes
- Search mode: flattened search across all levels showing full paths
- `loadData` supports async loading of children on expand
- `displayRender` customizes how the path is shown in the trigger

**CSS classes:**
- `.vf-cascader` — root trigger
- `.vf-cascader__dropdown` — popover container
- `.vf-cascader__panel` — single level panel
- `.vf-cascader__option`, `.vf-cascader__option--active`, `.vf-cascader__option--disabled`
- `.vf-cascader__option-arrow` — expand indicator for non-leaf nodes
- `.vf-cascader__search` — search input
- `.vf-cascader__path` — search result showing full path

**Reuse:** `PopoverV2` for dropdown, `ScrollArea` for panels, `SearchInput` for search, `useControllableState`.

**Test plan (Cascader.test.tsx):**
1. Renders trigger with placeholder
2. Click trigger opens first-level panel
3. Renders first-level options correctly
4. Click non-leaf option opens next-level panel
5. Click leaf option completes selection and closes dropdown
6. Selected path displayed in trigger (joined with separator)
7. Controlled: `value` determines display, `onValueChange` fires with path array
8. Uncontrolled: `defaultValue` sets initial path
9. `expandTrigger="hover"` opens next level on hover
10. Disabled options cannot be selected or expanded
11. `disabled` prop disables entire cascader
12. `allowClear` shows clear button that resets selection
13. `displayRender` custom function formats trigger text
14. `searchable` mode: typing filters all levels, shows full paths
15. Search results highlight matching text
16. `loadData` fires on expand, shows loading state, renders loaded children
17. `it.each` for size variants
18. Keyboard: Enter opens dropdown, ArrowDown/Up in panel, ArrowRight opens child, ArrowLeft goes back, Escape closes
19. Multiple panels visible simultaneously (not stacked)
20. a11y: `expectNoA11yViolations` — trigger has `role="combobox"`, panels have `role="listbox"`

---

### 1.12 HorizontalTimeline

**Files to create:**
- `src/components/HorizontalTimeline.tsx`
- `src/components/__tests__/HorizontalTimeline.test.tsx`
- `src/css/components/horizontal-timeline.css`

**Description:** Horizontal variant of Timeline with scroll support. Used for project milestones, sprint phases, version history.

**Component API:**
```typescript
export interface HorizontalTimelineEvent {
  key: string;
  label: string;
  date?: string;
  description?: string;
  icon?: ReactNode;
  status?: "completed" | "active" | "pending" | "error";
}

export interface HorizontalTimelineProps extends BaseProps {
  events: HorizontalTimelineEvent[];
  activeKey?: string;
  onEventClick?: (key: string) => void;
  scrollable?: boolean;                // default: true
  connector?: "line" | "arrow" | "dots";
  size?: "sm" | "md";
}
```

**Behavior:**
- Events arranged horizontally with connecting lines
- Active event highlighted with accent color
- Completed events show checkmark, pending show dot, error show X
- Horizontal scroll when events overflow container
- Click on event fires `onEventClick`
- Responsive: wraps to vertical on small screens

**CSS classes:**
- `.vf-htimeline` — horizontal flex container
- `.vf-htimeline__event`, `.vf-htimeline__event--completed`, `--active`, `--pending`, `--error`
- `.vf-htimeline__connector` — line between events
- `.vf-htimeline__dot` — event marker
- `.vf-htimeline__label`, `.vf-htimeline__date`, `.vf-htimeline__description`
- `.vf-htimeline--scrollable`

**Reuse:** `ScrollArea` for horizontal scrolling, `StatusIndicator` for event dots, existing `Timeline` patterns.

**Test plan (HorizontalTimeline.test.tsx):**
1. Renders all events horizontally
2. Events display label and optional date
3. Active event has active CSS class
4. `it.each` for status variants (completed, active, pending, error)
5. Connectors render between events (not after last)
6. Click on event fires `onEventClick` with key
7. `scrollable` adds scroll container
8. Custom icon renders in event marker
9. Description renders below label when provided
10. `it.each` for connector variants (line, arrow, dots)
11. `it.each` for size variants (sm, md)
12. Empty events array renders nothing
13. Single event renders without connector
14. a11y: `expectNoA11yViolations` — events have `role="listitem"`, container has `role="list"`

---

### 1.13 Comment

**Files to create:**
- `src/components/Comment.tsx`
- `src/components/__tests__/Comment.test.tsx`
- `src/css/components/comment.css`

**Description:** Comment thread component with avatar, author, content, actions, and nested replies. Standalone comment pattern for reviews, discussions, annotations.

**Component API:**
```typescript
export interface CommentProps extends BaseProps {
  author: string;
  avatar?: string | ReactNode;
  content: ReactNode;
  datetime?: string;
  actions?: ReactNode;                 // reply, like, edit, delete buttons
  children?: ReactNode;                // nested replies
}

export interface CommentListProps extends BaseProps {
  children: ReactNode;                 // Comment elements
}
```

**Behavior:**
- Displays avatar, author name, timestamp, content body
- Action buttons (reply, like, etc.) below content
- Nested `Comment` children render indented as replies
- Supports arbitrary nesting depth

**CSS classes:**
- `.vf-comment` — root container
- `.vf-comment__avatar` — avatar area
- `.vf-comment__body` — content area
- `.vf-comment__author` — author name
- `.vf-comment__datetime` — timestamp
- `.vf-comment__content` — comment text
- `.vf-comment__actions` — action buttons
- `.vf-comment__replies` — nested reply container (indented)
- `.vf-comment-list` — list wrapper

**Reuse:** `Avatar` for avatar display, `Text` for content, `timeAgo` utility for datetime.

**Test plan (Comment.test.tsx):**
1. Renders author name
2. Renders avatar image when `avatar` is string URL
3. Renders custom avatar ReactNode
4. Renders content body
5. Renders datetime string
6. Renders action buttons
7. Nested Comment children render indented
8. Multiple nesting levels render correctly (3 deep)
9. CommentList wraps multiple comments
10. Missing optional props (avatar, datetime, actions) render cleanly
11. a11y: `expectNoA11yViolations` — `role="article"` on each comment

---

### 1.14 Result

**Files to create:**
- `src/components/Result.tsx`
- `src/components/__tests__/Result.test.tsx`
- `src/css/components/result.css`

**Description:** Full-page result display for post-action states. Success confirmation, error page, 404, permission denied, etc.

**Component API:**
```typescript
export interface ResultProps extends BaseProps {
  status: "success" | "error" | "warning" | "info" | "403" | "404" | "500";
  title: string;
  description?: string;
  icon?: ReactNode;                    // override default status icon
  extra?: ReactNode;                   // action buttons below description
  children?: ReactNode;               // additional content
}
```

**Behavior:**
- Centered layout with large status icon, title, description
- Default icons per status (checkmark, X, warning triangle, info circle, error codes)
- `extra` slot for action buttons (e.g., "Back Home", "Try Again")
- `children` for additional content below actions

**CSS classes:**
- `.vf-result` — centered flex container
- `.vf-result__icon` — large status icon with status-specific color
- `.vf-result__title` — heading
- `.vf-result__description` — body text
- `.vf-result__extra` — action buttons
- `.vf-result--success`, `--error`, `--warning`, `--info`, `--403`, `--404`, `--500`

**Reuse:** `EmptyState` layout patterns, `Icon`, `Button` for actions.

**Test plan (Result.test.tsx):**
1. Renders title text
2. Renders description when provided
3. `it.each` for all status variants — correct CSS class applied
4. Default icon renders per status type
5. Custom `icon` overrides default
6. `extra` slot renders action buttons
7. `children` render below actions
8. Status-specific colors applied to icon
9. a11y: `expectNoA11yViolations` — `role="status"` on container

---

### 1.15 Descriptions (DetailList)

**Files to create:**
- `src/components/Descriptions.tsx`
- `src/components/__tests__/Descriptions.test.tsx`
- `src/css/components/descriptions.css`

**Description:** Structured label-value layout with responsive column control and grouping. Enhanced version of KeyValue with responsive columns and section headers.

**Component API:**
```typescript
export interface DescriptionItem {
  key: string;
  label: string;
  value: ReactNode;
  span?: number;                       // column span (default: 1)
}

export interface DescriptionsProps extends BaseProps {
  title?: string;
  items: DescriptionItem[];
  columns?: Responsive<number>;        // default: { base: 1, md: 2, lg: 3 }
  layout?: "horizontal" | "vertical";  // label-value arrangement
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
  colon?: boolean;                     // show colon after labels (default: true)
}
```

**Behavior:**
- Grid layout with configurable responsive columns
- Labels styled differently from values (muted text, uppercase)
- `span` allows items to span multiple columns
- `bordered` variant adds borders between cells
- `layout="vertical"` stacks label above value; `horizontal` puts them side-by-side
- Responsive: columns collapse on smaller screens

**CSS classes:**
- `.vf-descriptions` — grid container
- `.vf-descriptions__title` — section heading
- `.vf-descriptions__item` — single label-value pair
- `.vf-descriptions__label`, `.vf-descriptions__value`
- `.vf-descriptions--bordered`, `.vf-descriptions--vertical`
- Size modifiers

**Reuse:** `Grid` for layout, `Text` for labels/values, `useResponsive` for responsive columns.

**Test plan (Descriptions.test.tsx):**
1. Renders all items with labels and values
2. Title renders when provided
3. `columns` controls grid column count
4. `span` on item makes it span multiple columns
5. `bordered` variant adds border styling
6. `layout="vertical"` stacks label above value
7. `layout="horizontal"` places label and value side-by-side
8. `colon={false}` removes colon after labels
9. `it.each` for size variants (sm, md, lg)
10. Responsive columns: different column counts at different breakpoints (mock matchMedia)
11. ReactNode values render correctly (not just strings)
12. a11y: `expectNoA11yViolations` — uses `<dl>`, `<dt>`, `<dd>` elements

---

## Tier 3 — Lower Priority Components

### 1.16 FloatingActionButton

**Files to create:**
- `src/components/FloatingActionButton.tsx`
- `src/components/__tests__/FloatingActionButton.test.tsx`
- `src/css/components/floating-action-button.css`

**Description:** Fixed-position floating button with optional expandable speed dial actions. Mobile-first pattern for primary actions.

**Component API:**
```typescript
export interface FABAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface FloatingActionButtonProps extends BaseProps {
  icon: ReactNode;
  label?: string;                      // extended FAB with text
  onClick?: () => void;                // if no actions, simple FAB
  actions?: FABAction[];               // speed dial actions
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "accent";
  offset?: { bottom?: number; right?: number; left?: number };
}
```

**Behavior:**
- Fixed-position button at screen corner
- Without `actions`: simple click button
- With `actions`: click opens speed dial (fan of action buttons)
- Speed dial actions animate in/out with stagger
- Click outside or Escape closes speed dial
- Tooltip labels on speed dial items

**CSS classes:**
- `.vf-fab` — fixed position button
- `.vf-fab__speed-dial` — action container
- `.vf-fab__action` — individual speed dial button
- `.vf-fab__action-label` — tooltip for action
- Position, size, variant modifiers

**Reuse:** `Button`, `Tooltip`, `DismissableLayer`, `Transition`.

**Test plan (FloatingActionButton.test.tsx):**
1. Renders floating button with icon
2. Extended FAB renders with label text
3. Simple FAB: click fires `onClick`
4. Speed dial: click opens action buttons
5. Speed dial actions fire `onClick` when clicked
6. Speed dial closes after action click
7. Speed dial closes on Escape
8. Speed dial closes on click outside
9. Action labels render as tooltips
10. `it.each` for position variants
11. `it.each` for size variants
12. `it.each` for variant styling (default, accent)
13. Fixed positioning CSS applied
14. a11y: `expectNoA11yViolations` — FAB has `aria-label`, speed dial has `role="menu"`

---

## Tier 1 — Additional High Priority (Terminal/CLI & Developer Tools)

### 1.17 CommandInput

**Files to create:**
- `src/components/CommandInput.tsx`
- `src/components/__tests__/CommandInput.test.tsx`
- `src/css/components/command-input.css`

**Description:** Shell-like text input with command history, tab-completion, and inline suggestions. Distinct from CommandPalette (which is a modal search overlay) — this is an embedded CLI-style input widget. Perfect for voidframe's terminal-brutalist aesthetic. Used in admin consoles, REPL interfaces, DevTools panels, and anywhere users type structured commands.

**Component API:**
```typescript
export interface CommandInputSuggestion {
  value: string;
  label?: string;
  description?: string;
  icon?: ReactNode;
}

export interface CommandInputProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit: (command: string) => void;
  history?: string[];                    // external history (controlled)
  maxHistory?: number;                   // internal history limit (default: 100)
  suggestions?: CommandInputSuggestion[] | ((partial: string) => CommandInputSuggestion[]);
  placeholder?: string;                  // default: ">"
  prompt?: string | ReactNode;           // left-side prompt (default: "$")
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  onHistoryNavigate?: (direction: "up" | "down", index: number) => void;
}
```

**Behavior:**
- Monospace input field with a left-side prompt indicator (`$`, `>`, or custom)
- **History navigation:** ArrowUp/ArrowDown cycle through previously submitted commands
- History maintained internally (uncontrolled) or via `history` prop (controlled)
- **Tab completion:** Tab key triggers suggestion matching from `suggestions` prop
  - If one match: auto-complete inline
  - If multiple matches: show dropdown list of completions
  - Shift+Tab cycles backwards through completions
- **Inline suggestion:** Ghost text showing top suggestion match as user types (dimmed, completes on Tab or ArrowRight)
- Submit on Enter — fires `onSubmit` with trimmed command, clears input, adds to history
- Ctrl+C clears current input without submitting
- Ctrl+L fires a "clear" event (consumer can use for terminal clear)
- Ctrl+A / Ctrl+E for home/end (shell-style keybindings alongside standard Home/End)

**CSS classes:**
- `.vf-command-input` — root container (flex row)
- `.vf-command-input__prompt` — left prompt indicator
- `.vf-command-input__input` — actual input field
- `.vf-command-input__suggestion` — ghost text overlay
- `.vf-command-input__completions` — tab-completion dropdown
- `.vf-command-input__completion-item`, `.vf-command-input__completion-item--active`
- `.vf-command-input--sm`, `.vf-command-input--lg`
- `.vf-command-input--disabled`

**Reuse:** `Input` internal patterns, `useControllableState` for value, `useKeyPress` for shortcuts, `ScrollArea` for completion dropdown, `cx()` for class composition.

**Test plan (CommandInput.test.tsx):**
1. Renders input with default `$` prompt
2. Custom `prompt` prop renders custom prompt element
3. Custom `placeholder` renders in empty state
4. Typing updates input value
5. Controlled: `value` + `onValueChange` control input
6. Uncontrolled: `defaultValue` sets initial text
7. Enter key fires `onSubmit` with trimmed command
8. Enter key clears input after submit
9. Enter key adds command to internal history
10. ArrowUp navigates to previous history entry
11. ArrowDown navigates to next history entry
12. ArrowUp at oldest history entry stays at oldest
13. ArrowDown past newest restores current input
14. External `history` prop controls history list (controlled)
15. `maxHistory` limits internal history size
16. Tab key with single suggestion auto-completes
17. Tab key with multiple suggestions opens completion dropdown
18. ArrowDown/ArrowUp navigate completion dropdown items
19. Enter on completion item selects it and closes dropdown
20. Shift+Tab cycles backwards through completions
21. Inline ghost text shows top suggestion while typing
22. ArrowRight accepts ghost text suggestion
23. Ctrl+C clears input without submitting
24. `disabled` prop disables input
25. `readOnly` prevents editing but allows history navigation
26. `it.each` for size variants (sm, md, lg)
27. `autoFocus` focuses input on mount
28. Empty string submit is ignored (no empty commands in history)
29. Function-based `suggestions` called with current partial text
30. a11y: `expectNoA11yViolations` — input has `role="combobox"` when completions visible, `aria-autocomplete="list"`, completions have `role="listbox"`

---

### 1.18 LiveIndicator

**Files to create:**
- `src/components/LiveIndicator.tsx`
- `src/components/__tests__/LiveIndicator.test.tsx`
- `src/css/components/live-indicator.css`

**Description:** "User is typing" or "recording" animated indicator. Companion to the existing `ThinkingIndicator` (which shows AI is processing). Used in chat UIs, collaboration features, and real-time status displays. Small component, high value.

**Component API:**
```typescript
export interface LiveIndicatorProps extends BaseProps {
  variant?: "typing" | "recording" | "active" | "live";
  label?: string;                        // e.g., "Alice is typing..."
  avatar?: string | ReactNode;           // optional user avatar
  size?: "sm" | "md";
  animated?: boolean;                    // default: true (respects prefers-reduced-motion)
}
```

**Behavior:**
- `typing`: Three animated bouncing dots (standard chat typing indicator)
- `recording`: Pulsing red dot with optional waveform
- `active`: Steady green dot with "active" label
- `live`: Pulsing red dot with "LIVE" badge (broadcast/streaming indicator)
- Optional avatar + label (e.g., avatar + "Alice is typing...")
- Animation respects `prefers-reduced-motion` — static dots/dot when motion disabled
- Compact: fits inline in message lists without disrupting layout

**CSS classes:**
- `.vf-live-indicator` — root flex container
- `.vf-live-indicator__avatar` — optional avatar
- `.vf-live-indicator__dots` — typing dots container
- `.vf-live-indicator__dot` — individual dot (animated with stagger)
- `.vf-live-indicator__pulse` — recording/live pulsing dot
- `.vf-live-indicator__label` — text label
- `.vf-live-indicator--typing`, `--recording`, `--active`, `--live`
- `.vf-live-indicator--sm`

**Reuse:** `Avatar` for avatar display, existing `vf-pulse` keyframe animation, `Text` for label.

**Test plan (LiveIndicator.test.tsx):**
1. Renders with default "typing" variant
2. `it.each` for variant rendering (typing, recording, active, live)
3. "typing" variant renders three dots
4. "recording" variant renders pulsing dot
5. "active" variant renders steady green dot
6. "live" variant renders pulsing red dot with LIVE text
7. `label` prop renders label text
8. `avatar` as string URL renders Avatar component
9. `avatar` as ReactNode renders custom element
10. `it.each` for size variants (sm, md)
11. `animated={false}` disables animations (static dots)
12. Reduced motion media query applies static variant
13. Missing label/avatar renders dots only
14. a11y: `expectNoA11yViolations` — has `role="status"`, `aria-live="polite"`, `aria-label`

---

### 1.19 MultiProgress

**Files to create:**
- `src/components/MultiProgress.tsx`
- `src/components/__tests__/MultiProgress.test.tsx`
- `src/css/components/multi-progress.css`

**Description:** Multiple concurrent progress bars displayed vertically with labels, values, and status indicators. Think build output, file uploads, parallel task execution, CI pipeline stages. Extremely on-brand for voidframe's terminal aesthetic.

**Component API:**
```typescript
export interface MultiProgressItem {
  key: string;
  label: string;
  value: number;                         // 0-100
  max?: number;                          // default: 100
  status?: "active" | "success" | "error" | "paused" | "pending";
  description?: string;                  // e.g., "3.2 MB / 10 MB"
  tone?: "default" | "success" | "danger" | "warning" | "info";
}

export interface MultiProgressProps extends BaseProps {
  items: MultiProgressItem[];
  size?: "sm" | "md" | "lg";
  showValues?: boolean;                  // show percentage (default: true)
  animated?: boolean;                    // animate bar fill (default: true)
  striped?: boolean;                     // striped bars for active items
  onCancel?: (key: string) => void;      // cancel button per item
  compact?: boolean;                     // tighter spacing (default: false)
}
```

**Behavior:**
- Vertical stack of progress bars, each with label, bar, value, and optional description
- Status determines bar color and optional icon (checkmark for success, X for error, pause icon for paused)
- `pending` status shows empty bar with dimmed label
- `active` status shows animated striped fill (when `striped` is true)
- `onCancel` shows a cancel/X button per item
- Bar animations respect `prefers-reduced-motion`
- Compact mode reduces vertical spacing for dense displays

**CSS classes:**
- `.vf-multi-progress` — root vertical stack
- `.vf-multi-progress__item` — single progress row
- `.vf-multi-progress__label` — item label
- `.vf-multi-progress__bar` — progress bar container
- `.vf-multi-progress__fill` — filled portion
- `.vf-multi-progress__fill--striped` — animated stripes
- `.vf-multi-progress__value` — percentage/description text
- `.vf-multi-progress__status` — status icon
- `.vf-multi-progress__cancel` — cancel button
- Status modifiers: `--active`, `--success`, `--error`, `--paused`, `--pending`
- `.vf-multi-progress--compact`

**Reuse:** `Progress` bar rendering patterns, `StatusIndicator` for status icons, `IconButton` for cancel, `VStack` layout.

**Test plan (MultiProgress.test.tsx):**
1. Renders all items as progress rows
2. Each item displays label text
3. Progress bar fill width matches `value / max` ratio
4. Custom `max` value works (value=50, max=200 = 25% fill)
5. `showValues` displays percentage text
6. `showValues={false}` hides percentage
7. `description` renders below/beside progress bar
8. `it.each` for status variants (active, success, error, paused, pending)
9. Success status shows checkmark icon
10. Error status shows X icon and danger color
11. Paused status shows pause icon
12. Pending status shows empty/dimmed bar
13. `it.each` for tone variants (default, success, danger, warning, info)
14. `striped` adds striped animation to active items
15. `onCancel` renders cancel button per item
16. Cancel button click fires `onCancel` with item key
17. `compact` mode adds compact CSS class
18. `animated` controls bar fill animation
19. `it.each` for size variants (sm, md, lg)
20. Empty items array renders nothing
21. Item with value > max is clamped to 100%
22. Item with value < 0 is clamped to 0%
23. a11y: `expectNoA11yViolations` — each bar has `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

---

## Tier 2 — Additional Medium Priority (Developer Tools & Content)

### 1.20 HexDump

**Files to create:**
- `src/components/HexDump.tsx`
- `src/components/__tests__/HexDump.test.tsx`
- `src/css/components/hex-dump.css`

**Description:** Binary data viewer with hex/ASCII column layout, byte offsets, and highlighting. Displays data in the classic hexdump format: offset column, hex byte columns, ASCII representation column. Extremely on-brand for voidframe's monospace-first, data-dense aesthetic. Used in debuggers, protocol analyzers, file inspectors, and low-level data tools.

**Component API:**
```typescript
export interface HexDumpProps extends BaseProps {
  data: ArrayBuffer | Uint8Array | number[];
  bytesPerRow?: number;                  // default: 16
  showOffset?: boolean;                  // default: true
  showAscii?: boolean;                   // default: true
  offsetBase?: "hex" | "decimal";        // default: "hex"
  highlightRanges?: HexHighlight[];      // byte ranges to highlight
  onByteClick?: (offset: number) => void;
  onByteHover?: (offset: number | null) => void;
  selectedRange?: [number, number];      // selected byte range [start, end)
  groupSize?: 1 | 2 | 4 | 8;           // group bytes (default: 1 — no grouping)
  maxRows?: number;                      // virtualize if data exceeds this
  size?: "sm" | "md";
}

export interface HexHighlight {
  start: number;
  end: number;                           // exclusive
  color?: string;                        // accent color token name or CSS color
  label?: string;                        // tooltip label for highlighted range
}
```

**Behavior:**
- Three-column layout: offset | hex bytes | ASCII representation
- Each row shows `bytesPerRow` bytes (default 16)
- Offset column shows byte offset (hex `0x0000` or decimal)
- Hex column shows bytes as two-character hex values, optionally grouped
- ASCII column shows printable characters (32-126), non-printable shown as `.`
- `highlightRanges` color specific byte ranges (useful for protocol field highlighting)
- Click on a byte fires `onByteClick(offset)` — corresponding hex and ASCII cells highlight
- Hover on a byte highlights corresponding hex/ASCII pair
- `selectedRange` highlights a range of bytes (for selection feedback)
- `groupSize` groups bytes (e.g., 4 shows as 32-bit words separated by wider gaps)
- Large data virtualized via `maxRows` or internal threshold

**CSS classes:**
- `.vf-hex-dump` — root container (monospace, grid layout)
- `.vf-hex-dump__header` — column headers (Offset | Hex | ASCII)
- `.vf-hex-dump__row` — single row
- `.vf-hex-dump__offset` — offset cell
- `.vf-hex-dump__hex` — hex bytes cell
- `.vf-hex-dump__byte` — individual hex byte
- `.vf-hex-dump__byte--highlighted` — highlighted byte (with color custom property)
- `.vf-hex-dump__byte--selected` — selected range
- `.vf-hex-dump__byte--hovered` — hover pairing
- `.vf-hex-dump__ascii` — ASCII cell
- `.vf-hex-dump__char` — individual ASCII character
- `.vf-hex-dump__char--nonprintable` — dimmed non-printable
- `.vf-hex-dump--sm`

**Reuse:** `VirtualList` for large data virtualization, `Tooltip` for highlight range labels, monospace font from theme tokens.

**Test plan (HexDump.test.tsx):**
1. Renders hex dump from Uint8Array
2. Renders hex dump from ArrayBuffer
3. Renders hex dump from number array
4. Default 16 bytes per row
5. Custom `bytesPerRow` changes column count
6. Offset column shows hex offsets by default
7. `offsetBase="decimal"` shows decimal offsets
8. `showOffset={false}` hides offset column
9. ASCII column shows printable characters
10. Non-printable bytes shown as `.` in ASCII column
11. `showAscii={false}` hides ASCII column
12. `highlightRanges` applies highlight classes to specified byte ranges
13. Highlight with `color` prop applies custom color via CSS variable
14. Highlight with `label` shows tooltip on hover
15. `onByteClick` fires with correct offset
16. `onByteHover` fires on hover, fires `null` on mouse leave
17. Hover highlights corresponding hex+ASCII pair
18. `selectedRange` highlights byte range
19. `groupSize=4` groups bytes with wider gaps
20. Empty data renders empty state
21. Single byte renders correctly
22. `it.each` for size variants (sm, md)
23. a11y: `expectNoA11yViolations` — has `role="grid"`, rows have `role="row"`, cells have `role="gridcell"`

---

### 1.21 CronBuilder

**Files to create:**
- `src/components/CronBuilder.tsx`
- `src/components/__tests__/CronBuilder.test.tsx`
- `src/css/components/cron-builder.css`

**Description:** Visual cron expression builder and previewer. Converts between human-readable schedule descriptions and cron syntax. Users can build expressions via dropdowns/toggles or type raw cron syntax with live validation. Used in admin panels, scheduler UIs, CI/CD configuration, and DevOps tooling.

**Component API:**
```typescript
export interface CronBuilderProps extends BaseProps {
  value?: string;                        // controlled: cron expression (e.g., "0 */6 * * *")
  defaultValue?: string;                 // uncontrolled initial
  onValueChange?: (expression: string) => void;
  mode?: "visual" | "raw" | "both";     // default: "both"
  presets?: CronPreset[];                // quick-select presets
  showPreview?: boolean;                 // show next N run times (default: true)
  previewCount?: number;                 // number of preview times (default: 5)
  size?: "sm" | "md";
  disabled?: boolean;
  fields?: 5 | 6 | 7;                   // 5: standard, 6: +seconds, 7: +seconds+year
}

export interface CronPreset {
  label: string;
  value: string;                         // cron expression
}
```

**Default presets:**
- "Every minute" → `* * * * *`
- "Every hour" → `0 * * * *`
- "Every day at midnight" → `0 0 * * *`
- "Every Monday at 9am" → `0 9 * * 1`
- "Every month on the 1st" → `0 0 1 * *`
- "Weekdays at 6am" → `0 6 * * 1-5`

**Behavior:**
- **Visual mode:** Five rows of selectors (minute, hour, day-of-month, month, day-of-week). Each field has: "every", "specific values" (multi-select), "range" (from-to), "interval" (every N starting at X) options.
- **Raw mode:** Text input for typing cron expression directly with live syntax validation
- **Both mode (default):** Visual and raw panels in sync — editing one updates the other
- **Preview panel:** Shows next N scheduled run times based on current expression
- Validation: Invalid expressions show error message, preview shows "Invalid expression"
- Presets: Quick-select buttons that set a common expression

**CSS classes:**
- `.vf-cron-builder` — root container
- `.vf-cron-builder__mode-toggle` — visual/raw mode toggle
- `.vf-cron-builder__visual` — visual field selectors container
- `.vf-cron-builder__field` — single cron field row (label + selector)
- `.vf-cron-builder__field-label` — field name (Minute, Hour, etc.)
- `.vf-cron-builder__field-type` — type selector (every, specific, range, interval)
- `.vf-cron-builder__field-values` — value multi-select or range inputs
- `.vf-cron-builder__raw` — raw text input area
- `.vf-cron-builder__raw-input` — the actual input
- `.vf-cron-builder__raw-error` — validation error text
- `.vf-cron-builder__presets` — preset buttons row
- `.vf-cron-builder__preview` — next run times panel
- `.vf-cron-builder__preview-time` — individual run time

**Reuse:** `Select` for field type dropdowns, `ButtonGroup` for presets, `Input` for raw mode, `useControllableState` for value, `SegmentedControl` for mode toggle, `Text` and `VStack` for layout.

**Test plan (CronBuilder.test.tsx):**
1. Renders in "both" mode by default (visual + raw)
2. `mode="visual"` shows only visual selectors
3. `mode="raw"` shows only text input
4. Visual: selecting "every" for minute field produces `* * * * *` pattern
5. Visual: selecting specific minutes (0, 30) produces `0,30 * * * *`
6. Visual: selecting range (9-17 for hour) produces `* 9-17 * * *`
7. Visual: selecting interval (every 6 hours) produces `0 */6 * * *`
8. Raw: typing valid expression updates visual fields
9. Raw: typing invalid expression shows error
10. Visual and raw stay in sync when editing either
11. Controlled: `value` determines expression, `onValueChange` fires
12. Uncontrolled: `defaultValue` sets initial expression
13. Preset buttons set corresponding expression
14. Custom `presets` prop renders custom preset buttons
15. Preview shows next N run times (mock Date for deterministic output)
16. `previewCount` controls number of preview times
17. `showPreview={false}` hides preview panel
18. Invalid expression shows "Invalid expression" in preview
19. `disabled` disables all interactions
20. `it.each` for size variants (sm, md)
21. 5-field mode handles standard cron (minute through day-of-week)
22. 6-field mode adds seconds field
23. All 12 months selectable in month field
24. All 7 days selectable in day-of-week field (0=Sun through 6=Sat)
25. a11y: `expectNoA11yViolations` — fieldsets have labels, selectors have `aria-label`

---

### 1.22 EnvironmentVars

**Files to create:**
- `src/components/EnvironmentVars.tsx`
- `src/components/__tests__/EnvironmentVars.test.tsx`
- `src/css/components/environment-vars.css`

**Description:** Environment variable editor with secret masking, type indicators, and group/environment filtering. A specialized key-value editor optimized for environment configuration management. Used in deployment dashboards, CI/CD settings, application configuration panels.

**Component API:**
```typescript
export interface EnvVar {
  key: string;
  value: string;
  secret?: boolean;                      // mask value by default
  type?: "string" | "number" | "boolean" | "json" | "url";
  description?: string;
  group?: string;                        // grouping (e.g., "Database", "Auth", "API")
  source?: string;                       // where this var comes from (e.g., ".env.local")
  inherited?: boolean;                   // inherited from parent environment
}

export interface EnvironmentVarsProps extends BaseProps {
  variables: EnvVar[];
  onChange?: (variables: EnvVar[]) => void;
  onAdd?: (variable: EnvVar) => void;
  onRemove?: (key: string) => void;
  readOnly?: boolean;
  searchable?: boolean;                  // default: true
  groupBy?: "group" | "type" | "source" | "none";  // default: "group"
  showTypes?: boolean;                   // show type badges (default: true)
  showSource?: boolean;                  // show source column (default: false)
  size?: "sm" | "md";
  addable?: boolean;                     // show "Add Variable" button (default: true)
  copyable?: boolean;                    // show copy button per value (default: true)
}
```

**Behavior:**
- Table-like layout: Key | Value | Type | Actions
- Secret values masked with `•••••` — click eye icon to reveal temporarily (auto-hides after 5s)
- Copy button copies value to clipboard (even when masked — copies actual value)
- Inline editing: click value to edit, Enter/blur to save, Escape to cancel
- "Add Variable" row at bottom with key + value inputs
- Search filters by key or value (doesn't search masked secret content)
- Group headers when `groupBy` is set — collapsible sections
- Type badges: colored indicators for string, number, boolean, json, url
- Inherited variables shown dimmed with "inherited" badge (not editable)
- Validation: duplicate key warning, JSON validation for `type="json"`, URL validation for `type="url"`

**CSS classes:**
- `.vf-env-vars` — root table container
- `.vf-env-vars__header` — column headers
- `.vf-env-vars__search` — search input
- `.vf-env-vars__group` — group section
- `.vf-env-vars__group-header` — collapsible group header
- `.vf-env-vars__row` — single variable row
- `.vf-env-vars__key` — key cell
- `.vf-env-vars__value` — value cell
- `.vf-env-vars__value--masked` — masked secret value
- `.vf-env-vars__type-badge` — type indicator badge
- `.vf-env-vars__actions` — action buttons (copy, reveal, delete)
- `.vf-env-vars__add-row` — add variable row
- `.vf-env-vars__row--inherited` — dimmed inherited row
- `.vf-env-vars--sm`

**Reuse:** `Input` for editing, `SearchInput` for filtering, `Tag` for type badges, `IconButton` for actions, `Collapsible` for groups, `CopyButton` (new from 1.9) for copy, `Tooltip` for descriptions, `InlineEdit` (new from 1.4) for value editing.

**Test plan (EnvironmentVars.test.tsx):**
1. Renders all variables as rows with key and value
2. Secret values display masked (`•••••`)
3. Click reveal icon shows secret value temporarily
4. Secret value auto-hides after timeout
5. Copy button copies actual value (even when masked)
6. `onChange` fires when editing a value inline
7. `onAdd` fires when adding new variable via add row
8. `onRemove` fires when clicking delete button
9. `readOnly` prevents editing, hides add/delete
10. Search filters variables by key name
11. Search filters by value (non-secret values only)
12. `groupBy="group"` renders group headers
13. Group sections are collapsible
14. `groupBy="none"` renders flat list
15. Type badges render with correct colors per type
16. `showTypes={false}` hides type badges
17. `showSource` renders source column
18. Inherited variables have dimmed styling and "inherited" badge
19. Inherited variables are not editable
20. Duplicate key shows warning indicator
21. `addable={false}` hides add row
22. `copyable={false}` hides copy buttons
23. `it.each` for size variants (sm, md)
24. a11y: `expectNoA11yViolations` — table has `role="table"`, rows have `role="row"`, secret toggle has `aria-label`

---

### 1.23 FilterBuilder

**Files to create:**
- `src/components/FilterBuilder.tsx`
- `src/components/__tests__/FilterBuilder.test.tsx`
- `src/css/components/filter-builder.css`

**Description:** Visual filter/query builder for constructing data filters. Lighter than the existing QueryBuilder (which is SQL-focused with AND/OR logic groups) — FilterBuilder is for simple field-operator-value filter chains with add/remove. Used as DataGrid filter toolbar, API query builder, search refinement UI.

**Component API:**
```typescript
export interface FilterField {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "enum";
  operators?: FilterOperator[];          // override default operators for this field
  enumValues?: { value: string; label: string }[];  // for enum type
}

export type FilterOperator =
  | "equals" | "not_equals"
  | "contains" | "not_contains" | "starts_with" | "ends_with"
  | "greater_than" | "less_than" | "greater_equal" | "less_equal"
  | "between"
  | "is_empty" | "is_not_empty"
  | "in" | "not_in";

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterBuilderProps extends BaseProps {
  fields: FilterField[];
  value?: FilterRule[];                  // controlled
  defaultValue?: FilterRule[];           // uncontrolled
  onValueChange?: (rules: FilterRule[]) => void;
  maxRules?: number;                     // limit number of filter rules
  size?: "sm" | "md";
  disabled?: boolean;
  addLabel?: string;                     // default: "Add filter"
  orientation?: "horizontal" | "vertical";  // default: "vertical"
  showClearAll?: boolean;                // default: true
}
```

**Default operators by type:**
- `string`: equals, not_equals, contains, not_contains, starts_with, ends_with, is_empty, is_not_empty
- `number`: equals, not_equals, greater_than, less_than, greater_equal, less_equal, between
- `date`: equals, not_equals, greater_than, less_than, between
- `boolean`: equals (true/false toggle)
- `enum`: equals, not_equals, in, not_in

**Behavior:**
- Each filter rule rendered as: [Field Select] [Operator Select] [Value Input] [Remove Button]
- Field select shows available fields from `fields` prop
- Operator select updates based on selected field's type
- Value input adapts to type: text input for string, number input for number, date picker for date, toggle for boolean, multi-select for enum
- "Add filter" button appends a new empty rule
- Remove (X) button removes a rule
- "Clear all" button removes all rules
- `maxRules` disables "Add filter" when limit reached

**CSS classes:**
- `.vf-filter-builder` — root container
- `.vf-filter-builder__rules` — rules stack
- `.vf-filter-builder__rule` — single rule row (flex)
- `.vf-filter-builder__field-select` — field dropdown
- `.vf-filter-builder__operator-select` — operator dropdown
- `.vf-filter-builder__value-input` — value input (adapts per type)
- `.vf-filter-builder__remove` — remove rule button
- `.vf-filter-builder__add` — add filter button
- `.vf-filter-builder__clear` — clear all button
- `.vf-filter-builder--horizontal` — horizontal layout
- `.vf-filter-builder--sm`

**Reuse:** `Select` for field/operator dropdowns, `Input` / `NumberInput` / `DatePicker` / `Toggle` for values, `Button` for add/clear, `IconButton` for remove, `useControllableState`.

**Test plan (FilterBuilder.test.tsx):**
1. Renders empty state with "Add filter" button
2. Click "Add filter" adds a new empty rule row
3. Field select shows all field options
4. Selecting a string field shows string operators
5. Selecting a number field shows number operators
6. Selecting a date field shows date operators
7. Selecting a boolean field shows equals only
8. Selecting an enum field shows in/not_in with enum values
9. Operator select updates when field changes
10. String value input renders text input
11. Number value input renders number input
12. Date value input renders date picker
13. Boolean value renders toggle
14. "between" operator renders two value inputs (from/to)
15. Remove button removes the rule
16. "Clear all" removes all rules
17. Controlled: `value` determines rules, `onValueChange` fires on changes
18. Uncontrolled: `defaultValue` sets initial rules
19. `maxRules` disables "Add filter" when limit reached
20. `disabled` disables all interactions
21. Custom field `operators` overrides defaults
22. `showClearAll={false}` hides clear button
23. `it.each` for size variants (sm, md)
24. `orientation="horizontal"` applies horizontal layout
25. a11y: `expectNoA11yViolations` — selects and inputs have labels, remove button has `aria-label`

---

### 1.24 CSVViewer

**Files to create:**
- `src/components/CSVViewer.tsx`
- `src/components/__tests__/CSVViewer.test.tsx`
- `src/css/components/csv-viewer.css`

**Description:** Read-only spreadsheet-style viewer for tabular CSV/TSV data. Lighter than DataGrid — no editing, no sorting, no column configuration. Just clean, fast, styled data display with optional column type detection and cell formatting. Useful for data preview, file inspection, import preview, and log analysis.

**Component API:**
```typescript
export interface CSVViewerProps extends BaseProps {
  data: string | string[][];             // raw CSV string or pre-parsed 2D array
  delimiter?: string;                    // default: "," (auto-detected if not specified)
  hasHeader?: boolean;                   // first row is header (default: true)
  maxRows?: number;                      // limit displayed rows (default: 1000)
  maxColumns?: number;                   // limit displayed columns
  columnTypes?: ("string" | "number" | "date" | "boolean")[];  // per-column type hints
  highlightRow?: number;                 // highlight specific row
  highlightColumn?: number;              // highlight specific column
  highlightCell?: [number, number];      // [row, col] highlight
  onCellClick?: (row: number, col: number, value: string) => void;
  stickyHeader?: boolean;               // sticky header row (default: true)
  stickyFirstColumn?: boolean;          // sticky first column (default: false)
  striped?: boolean;                     // alternating row colors (default: true)
  compact?: boolean;                     // tighter cell padding
  showRowNumbers?: boolean;              // show row number column (default: true)
  showStats?: boolean;                   // show row/column count footer (default: true)
  size?: "sm" | "md";
}
```

**Behavior:**
- Parses CSV string into rows/columns (or accepts pre-parsed 2D array)
- Auto-detects delimiter if not specified (`,`, `\t`, `|`, `;`)
- Header row sticky at top when scrolling
- Row numbers in left column
- Numbers right-aligned, strings left-aligned (based on `columnTypes` or auto-detection)
- Click cell fires `onCellClick` with row, column, value
- `highlightRow` / `highlightColumn` / `highlightCell` for visual emphasis
- Footer shows: "X rows x Y columns" summary
- Large datasets virtualized when exceeding `maxRows`
- Handles quoted fields, escaped delimiters, and multiline values

**CSS classes:**
- `.vf-csv-viewer` — root container (overflow scroll)
- `.vf-csv-viewer__table` — table element
- `.vf-csv-viewer__header` — thead
- `.vf-csv-viewer__header-cell` — th
- `.vf-csv-viewer__body` — tbody
- `.vf-csv-viewer__row`, `.vf-csv-viewer__row--striped`, `.vf-csv-viewer__row--highlighted`
- `.vf-csv-viewer__cell`, `.vf-csv-viewer__cell--number`, `.vf-csv-viewer__cell--highlighted`
- `.vf-csv-viewer__row-number` — row number cell
- `.vf-csv-viewer__footer` — stats footer
- `.vf-csv-viewer--compact`, `.vf-csv-viewer--sm`

**Reuse:** `ScrollArea` for scrollable container, `Text` for footer stats, monospace font tokens.

**Test plan (CSVViewer.test.tsx):**
1. Renders table from CSV string
2. Renders table from pre-parsed 2D array
3. First row used as header when `hasHeader={true}`
4. `hasHeader={false}` uses auto-generated column headers (A, B, C...)
5. Auto-detects comma delimiter
6. Auto-detects tab delimiter
7. Custom `delimiter` used when specified
8. Handles quoted fields with commas inside
9. Handles escaped quotes within fields
10. Numbers right-aligned, strings left-aligned
11. `columnTypes` applies correct alignment per column
12. Row numbers display when `showRowNumbers={true}`
13. `showRowNumbers={false}` hides row numbers
14. `highlightRow` adds highlighted class to row
15. `highlightColumn` adds highlighted class to column cells
16. `highlightCell` adds highlighted class to specific cell
17. `onCellClick` fires with correct row, column, value
18. `stickyHeader` applies sticky positioning to header
19. `stickyFirstColumn` applies sticky positioning to first column
20. `striped` applies alternating row background
21. `compact` applies tighter cell padding
22. `showStats` renders row/column count footer
23. `maxRows` limits displayed rows with "showing X of Y" in footer
24. Empty data shows empty state
25. `it.each` for size variants (sm, md)
26. a11y: `expectNoA11yViolations` — `<table>` with `<thead>`, `<tbody>`, proper `scope` on th elements

---

### 1.25 ImageDiff

**Files to create:**
- `src/components/ImageDiff.tsx`
- `src/components/__tests__/ImageDiff.test.tsx`
- `src/css/components/image-diff.css`

**Description:** Pixel-level image comparison viewer. Extends the content viewer family alongside DiffViewer (text). Supports side-by-side, overlay, slider, and difference map modes. Used in visual regression testing, design review, before/after comparison, screenshot diffing.

**Component API:**
```typescript
export interface ImageDiffProps extends BaseProps {
  before: string;                        // src URL or data URI for "before" image
  after: string;                         // src URL or data URI for "after" image
  beforeLabel?: string;                  // default: "Before"
  afterLabel?: string;                   // default: "After"
  mode?: "side-by-side" | "overlay" | "slider" | "diff-map";  // default: "slider"
  overlayOpacity?: number;               // overlay mode opacity (0-1, default: 0.5)
  diffColor?: string;                    // diff-map highlight color (default: red accent)
  diffThreshold?: number;               // pixel difference threshold (0-255, default: 10)
  zoom?: number;                         // zoom level (default: 1)
  onZoomChange?: (zoom: number) => void;
  showZoomControls?: boolean;            // default: true
  fit?: "contain" | "cover" | "actual";  // default: "contain"
  size?: "sm" | "md" | "lg";
}
```

**Behavior:**
- **Side-by-side:** Two images side by side with labels, synchronized zoom/pan
- **Overlay:** After image overlaid on before with adjustable opacity (slider control)
- **Slider:** Draggable vertical divider that reveals before (left) / after (right)
- **Diff map:** Computed pixel difference image — identical pixels shown dark, differences highlighted in `diffColor`
- Zoom controls: +/- buttons, scroll-to-zoom, fit-to-container button
- Pan: click-and-drag to pan when zoomed in (both images sync)
- Diff map computation: compare each pixel, highlight where RGB difference exceeds `diffThreshold`
- Image loading states with Skeleton placeholders

**CSS classes:**
- `.vf-image-diff` — root container
- `.vf-image-diff__toolbar` — mode selector + zoom controls
- `.vf-image-diff__viewport` — image display area
- `.vf-image-diff__before`, `.vf-image-diff__after` — image containers
- `.vf-image-diff__label` — before/after labels
- `.vf-image-diff__slider` — draggable divider line (slider mode)
- `.vf-image-diff__slider-handle` — grab handle on divider
- `.vf-image-diff__overlay-control` — opacity slider (overlay mode)
- `.vf-image-diff__diff-canvas` — canvas for diff map rendering
- `.vf-image-diff__zoom-controls` — +/- zoom buttons
- Mode modifiers: `--side-by-side`, `--overlay`, `--slider`, `--diff-map`
- Size modifiers

**Reuse:** `SegmentedControl` for mode selection, `Slider` for overlay opacity, `IconButton` for zoom controls, `Skeleton` for loading states, `Image` component patterns.

**Test plan (ImageDiff.test.tsx):**
1. Renders with before and after images
2. Default mode is "slider"
3. `it.each` for mode variants (side-by-side, overlay, slider, diff-map)
4. Side-by-side: both images visible with labels
5. Custom `beforeLabel` and `afterLabel` render correctly
6. Overlay mode: after image has opacity control
7. `overlayOpacity` sets initial opacity
8. Slider mode: draggable divider renders
9. Slider drag changes visible area (mouse event simulation)
10. Diff map mode: renders canvas element
11. Zoom controls: + increases zoom, - decreases
12. `zoom` prop controls initial zoom level
13. `onZoomChange` fires when zoom changes
14. `showZoomControls={false}` hides zoom buttons
15. `fit="actual"` shows images at native resolution
16. Loading state: skeleton shown while images load
17. Error state: shows error when image fails to load
18. `it.each` for size variants (sm, md, lg)
19. `diffThreshold` affects diff-map sensitivity
20. `diffColor` changes highlight color in diff map
21. a11y: `expectNoA11yViolations` — images have `alt` text, slider has `role="slider"`, `aria-valuenow`

---

### 1.26 ColorContrast

**Files to create:**
- `src/components/ColorContrast.tsx`
- `src/components/__tests__/ColorContrast.test.tsx`
- `src/css/components/color-contrast.css`

**Description:** WCAG contrast ratio checker component. Visual tool showing the contrast ratio between two colors with pass/fail indicators for AA and AAA compliance at normal and large text sizes. Leverages the Phase 3 color utilities (`contrastRatio`, `isAccessible`). Used in design tools, theme builders, style guide pages, and accessibility auditing.

**Component API:**
```typescript
export interface ColorContrastProps extends BaseProps {
  foreground: string;                    // hex, rgb(), hsl(), or named color
  background: string;
  onForegroundChange?: (color: string) => void;
  onBackgroundChange?: (color: string) => void;
  editable?: boolean;                    // allow color editing (default: false)
  showPreview?: boolean;                 // show text preview with colors (default: true)
  showDetails?: boolean;                 // show AA/AAA breakdown (default: true)
  previewText?: string;                  // custom preview text
  size?: "sm" | "md";
}
```

**Behavior:**
- Displays two color swatches (foreground + background) with hex values
- Large contrast ratio number (e.g., "7.4:1") with pass/fail color
- Breakdown table: AA Normal (4.5:1), AA Large (3:1), AAA Normal (7:1), AAA Large (4.5:1)
- Each criterion shows checkmark (pass) or X (fail)
- Preview panel shows sample text rendered in the actual colors
- `editable` mode: clicking color swatch opens ColorPicker inline
- Swap button to exchange foreground and background
- Ratio updates live as colors change

**CSS classes:**
- `.vf-color-contrast` — root container
- `.vf-color-contrast__swatches` — foreground + background swatches row
- `.vf-color-contrast__swatch` — individual color swatch
- `.vf-color-contrast__swatch-label` — hex value under swatch
- `.vf-color-contrast__swap` — swap button between swatches
- `.vf-color-contrast__ratio` — large ratio display
- `.vf-color-contrast__ratio--pass`, `.vf-color-contrast__ratio--fail`
- `.vf-color-contrast__details` — AA/AAA breakdown table
- `.vf-color-contrast__criterion` — single criterion row
- `.vf-color-contrast__criterion--pass`, `.vf-color-contrast__criterion--fail`
- `.vf-color-contrast__preview` — text preview panel

**Reuse:** Phase 3 `contrastRatio()`, `isAccessible()`, `parseColor()` from `src/utils/color.ts`, `ColorPicker` for editable mode, `ColorSwatch` for swatch display, `Tag` for pass/fail badges.

**Test plan (ColorContrast.test.tsx):**
1. Renders foreground and background swatches
2. Displays correct contrast ratio for black/white (21:1)
3. Displays correct contrast ratio for low-contrast pair
4. AA Normal: passes for ratio >= 4.5, fails below
5. AA Large: passes for ratio >= 3, fails below
6. AAA Normal: passes for ratio >= 7, fails below
7. AAA Large: passes for ratio >= 4.5, fails below
8. Pass criteria show checkmark, fail show X
9. Ratio display has "pass" class for >= 4.5, "fail" below
10. Preview panel renders text in foreground color on background color
11. Custom `previewText` renders in preview
12. `showPreview={false}` hides preview
13. `showDetails={false}` hides breakdown table
14. Swap button exchanges foreground and background
15. `editable` mode: click swatch opens color picker
16. `onForegroundChange` fires when foreground color edited
17. `onBackgroundChange` fires when background color edited
18. Handles various color formats (hex, rgb, hsl, named)
19. Invalid color shows error state
20. `it.each` for size variants (sm, md)
21. a11y: `expectNoA11yViolations` — ratio has `aria-label`, pass/fail has text alternative

---

### 1.27 RegExpTester

**Files to create:**
- `src/components/RegExpTester.tsx`
- `src/components/__tests__/RegExpTester.test.tsx`
- `src/css/components/regexp-tester.css`

**Description:** Live regular expression testing tool with match highlighting, capture group display, and flag toggles. Developer tool that fits perfectly with voidframe's monospace aesthetic. Used in debugging, data validation setup, log analysis, and learning regex.

**Component API:**
```typescript
export interface RegExpTesterProps extends BaseProps {
  pattern?: string;                      // controlled regex pattern
  defaultPattern?: string;
  onPatternChange?: (pattern: string) => void;
  testString?: string;                   // controlled test string
  defaultTestString?: string;
  onTestStringChange?: (text: string) => void;
  flags?: string;                        // controlled flags (e.g., "gi")
  defaultFlags?: string;                 // default: "g"
  onFlagsChange?: (flags: string) => void;
  showFlags?: boolean;                   // show flag toggles (default: true)
  showMatches?: boolean;                 // show match info panel (default: true)
  showCaptures?: boolean;                // show capture groups (default: true)
  showReplace?: boolean;                 // show replace input + result (default: false)
  size?: "sm" | "md";
  readOnly?: boolean;
}
```

**Behavior:**
- **Pattern input:** Text input for regex pattern with live syntax error display
- **Flag toggles:** Toggle buttons for g (global), i (ignoreCase), m (multiline), s (dotAll), u (unicode), y (sticky)
- **Test string area:** Textarea where matches are highlighted inline with colored backgrounds
- **Match info panel:** Shows match count, match list with index positions
- **Capture groups:** For each match, shows numbered capture groups ($1, $2, ...) and named groups
- **Replace mode (optional):** Replace input + live replacement result preview
- Syntax errors in pattern shown inline (e.g., "Unterminated group")
- Empty pattern clears all highlights
- Matches highlighted with alternating colors for overlapping clarity

**CSS classes:**
- `.vf-regexp-tester` — root container
- `.vf-regexp-tester__pattern` — pattern input row
- `.vf-regexp-tester__pattern-input` — the regex input
- `.vf-regexp-tester__pattern-error` — syntax error message
- `.vf-regexp-tester__flags` — flag toggle buttons
- `.vf-regexp-tester__flag`, `.vf-regexp-tester__flag--active`
- `.vf-regexp-tester__test-string` — test textarea with overlay
- `.vf-regexp-tester__highlight` — match highlight overlay
- `.vf-regexp-tester__match-info` — match count + list panel
- `.vf-regexp-tester__match-item` — individual match entry
- `.vf-regexp-tester__captures` — capture group display
- `.vf-regexp-tester__capture-group` — individual group
- `.vf-regexp-tester__replace` — replace input row
- `.vf-regexp-tester__replace-result` — replacement preview
- `.vf-regexp-tester--sm`

**Reuse:** `Input` for pattern, `Textarea` for test string, `ToggleGroup` (new from 1.6) for flags, `useControllableState` for all three inputs, `Code` for match display.

**Test plan (RegExpTester.test.tsx):**
1. Renders pattern input, test string area, and match info
2. Valid pattern: matches highlighted in test string
3. Pattern `\d+` matches all numbers in test string
4. Match count displays correctly
5. Match info shows each match with start/end index
6. Capture groups display for patterns with groups
7. Named capture groups display with names
8. Invalid pattern shows syntax error message
9. Empty pattern clears highlights
10. Flag toggles: clicking 'i' adds case-insensitive matching
11. Flag toggles: clicking 'g' toggles global matching
12. Flag toggles: clicking 'm' enables multiline mode
13. `showFlags={false}` hides flag toggles
14. `showMatches={false}` hides match info panel
15. `showCaptures={false}` hides capture groups
16. `showReplace={true}` shows replace input and preview
17. Replace preview applies replacement to test string
18. Controlled: `pattern` + `onPatternChange` control pattern
19. Controlled: `testString` + `onTestStringChange` control test text
20. Controlled: `flags` + `onFlagsChange` control flags
21. Uncontrolled: `defaultPattern`, `defaultTestString`, `defaultFlags` set initial values
22. `readOnly` prevents editing
23. `it.each` for size variants (sm, md)
24. Multiple matches with alternating highlight colors
25. a11y: `expectNoA11yViolations` — inputs have labels, flag toggles have `aria-pressed`

---

## Tier 2 — Additional AI/ML Components

### 1.28 ModelCompare

**Files to create:**
- `src/components/ModelCompare.tsx`
- `src/components/__tests__/ModelCompare.test.tsx`
- `src/css/components/model-compare.css`

**Description:** Side-by-side model output comparison panel. Two synchronized conversation panels with a shared input — user types a prompt and sees responses from two different models side-by-side. Natural extension of voidframe's existing Chat/AI component suite. Used in model evaluation, prompt engineering, and A/B testing AI outputs.

**Component API:**
```typescript
export interface ModelCompareModel {
  id: string;
  name: string;
  icon?: ReactNode;
  metadata?: Record<string, string>;     // e.g., { temperature: "0.7", tokens: "4096" }
}

export interface ModelCompareResponse {
  modelId: string;
  content: string;
  tokens?: { input: number; output: number };
  latency?: number;                      // ms
  status: "idle" | "streaming" | "complete" | "error";
  error?: string;
}

export interface ModelCompareProps extends BaseProps {
  models: [ModelCompareModel, ModelCompareModel];  // exactly two models
  responses?: ModelCompareResponse[];    // controlled responses
  onSubmit?: (prompt: string) => void;   // user submits prompt
  prompt?: string;                       // controlled prompt input
  defaultPrompt?: string;
  onPromptChange?: (prompt: string) => void;
  showMetrics?: boolean;                 // show token/latency comparison (default: true)
  showDiff?: boolean;                    // highlight differences in responses (default: false)
  syncScroll?: boolean;                  // synchronized scrolling (default: true)
  maxHeight?: string;                    // response panel max height
  size?: "sm" | "md";
}
```

**Behavior:**
- Shared prompt input at top — user types prompt and submits
- Two response panels below, side by side, each labeled with model name/icon
- Each panel shows response content (supports markdown rendering)
- Streaming responses shown with typing animation (StreamingText)
- Metrics row below each response: token count, latency, cost (when provided)
- `showDiff` mode: word-level diff highlighting between the two responses
- Synchronized scroll: scrolling one panel scrolls the other
- Error state: if one model errors, show error in that panel, other continues
- "idle" state: empty panel with model name/icon
- Submit button disabled while either model is streaming

**CSS classes:**
- `.vf-model-compare` — root container
- `.vf-model-compare__prompt` — shared prompt input area
- `.vf-model-compare__panels` — side-by-side panel container
- `.vf-model-compare__panel` — individual model panel
- `.vf-model-compare__panel-header` — model name + icon
- `.vf-model-compare__panel-content` — response content area
- `.vf-model-compare__panel-metrics` — token/latency/cost row
- `.vf-model-compare__panel--streaming` — active streaming state
- `.vf-model-compare__panel--error` — error state
- `.vf-model-compare__diff-add`, `.vf-model-compare__diff-remove` — diff highlights
- `.vf-model-compare--sm`

**Reuse:** `Composer.Input` for prompt input, `MarkdownRenderer` for response content, `StreamingText` for streaming, `TokenCounter` / `LatencyIndicator` for metrics, `SplitView` or `ResizableGroup` for panel layout, `ScrollArea` with sync for `syncScroll`.

**Test plan (ModelCompare.test.tsx):**
1. Renders two model panels with names
2. Renders shared prompt input
3. Model icons render when provided
4. Submit fires `onSubmit` with prompt text
5. Controlled: `prompt` + `onPromptChange` control input
6. Uncontrolled: `defaultPrompt` sets initial prompt
7. Response content renders in correct panel (matched by modelId)
8. Streaming status shows animation in panel
9. Complete status shows full response
10. Error status shows error message in panel
11. `showMetrics` displays token count and latency
12. Token/latency comparison highlights "winner" (faster/fewer tokens)
13. `showDiff` highlights word-level differences between responses
14. `syncScroll` synchronizes panel scrolling
15. `syncScroll={false}` allows independent scrolling
16. Submit disabled while either model is streaming
17. Both models idle: panels show model name in empty state
18. One model errors, other succeeds: both states shown correctly
19. `it.each` for size variants (sm, md)
20. `maxHeight` constrains panel height with scroll
21. a11y: `expectNoA11yViolations` — panels have `aria-label` with model names, prompt input has label

---

### 1.29 TokenVisualizer

**Files to create:**
- `src/components/TokenVisualizer.tsx`
- `src/components/__tests__/TokenVisualizer.test.tsx`
- `src/css/components/token-visualizer.css`

**Description:** Displays token boundaries in text by wrapping each token in a visually distinct span. Used for understanding how tokenizers split text, debugging prompt engineering, and teaching LLM concepts. Tokens can be provided externally (from a tokenizer API) or as pre-split arrays.

**Component API:**
```typescript
export interface Token {
  text: string;
  id?: number;                           // token ID from vocabulary
  logprob?: number;                      // log probability (-inf to 0)
  special?: boolean;                     // special token (BOS, EOS, PAD)
}

export interface TokenVisualizerProps extends BaseProps {
  tokens: Token[] | string[];            // pre-tokenized array
  colorMode?: "alternating" | "logprob" | "type" | "none";
  showIds?: boolean;                     // show token IDs on hover (default: false)
  showLogprobs?: boolean;                // show logprob intensity (default: false)
  showBoundaries?: boolean;              // show border between tokens (default: true)
  onTokenClick?: (token: Token, index: number) => void;
  onTokenHover?: (token: Token | null, index: number) => void;
  selectedTokens?: number[];             // highlighted token indices
  wrap?: boolean;                        // word-wrap tokens (default: true)
  size?: "sm" | "md" | "lg";
}
```

**Behavior:**
- Each token rendered as an inline span with visual boundary (border or background)
- **Alternating colors:** Tokens alternate between two background tints for easy boundary identification
- **Logprob coloring:** Tokens colored by probability — high confidence (green), low confidence (red/amber)
- **Type coloring:** Different colors for words, spaces, punctuation, numbers, special tokens
- Hover on token shows tooltip: token text, ID, logprob, index
- Click on token fires `onTokenClick`
- Special tokens (BOS, EOS) shown with distinct styling and label
- Whitespace tokens visible via background color / dotted underline
- `selectedTokens` highlights specific tokens (e.g., for showing attention patterns)
- Token count summary below text

**CSS classes:**
- `.vf-token-viz` — root container (monospace, inline-flex wrap)
- `.vf-token-viz__token` — individual token span
- `.vf-token-viz__token--even`, `.vf-token-viz__token--odd` — alternating colors
- `.vf-token-viz__token--special` — special token styling
- `.vf-token-viz__token--whitespace` — whitespace token (visible)
- `.vf-token-viz__token--selected` — highlighted token
- `.vf-token-viz__token--high-prob`, `--medium-prob`, `--low-prob` — logprob coloring
- `.vf-token-viz__tooltip` — hover tooltip
- `.vf-token-viz__summary` — token count footer
- `.vf-token-viz--no-boundaries` — borderless mode
- Size modifiers

**Reuse:** `Tooltip` for token details, `cx()` for class composition, accent color tokens for probability coloring.

**Test plan (TokenVisualizer.test.tsx):**
1. Renders tokens from string array
2. Renders tokens from Token object array
3. Each token rendered as individual span
4. Alternating color mode: even/odd classes alternate
5. Logprob color mode: high probability tokens get green tint
6. Logprob color mode: low probability tokens get red/amber tint
7. Type color mode: punctuation gets different color than words
8. `showBoundaries` adds border between tokens
9. `showBoundaries={false}` removes borders
10. `showIds` shows token IDs in tooltip on hover
11. `showLogprobs` shows logprob values in tooltip
12. `onTokenClick` fires with token and index
13. `onTokenHover` fires on hover and null on leave
14. `selectedTokens` highlights specified indices
15. Special tokens have distinct styling and label
16. Whitespace tokens rendered with visible indicator
17. `wrap` controls word wrapping
18. Token count summary renders
19. `it.each` for size variants (sm, md, lg)
20. `colorMode="none"` renders without color coding
21. Empty tokens array renders empty state
22. a11y: `expectNoA11yViolations` — tokens are non-interactive spans by default, interactive mode adds `role="button"` when `onTokenClick` provided

---

### 1.30 ConfidenceMeter

**Files to create:**
- `src/components/ConfidenceMeter.tsx`
- `src/components/__tests__/ConfidenceMeter.test.tsx`
- `src/css/components/confidence-meter.css`

**Description:** Visual confidence/probability score display. A thin wrapper around existing gauge/progress patterns but semantically designed for AI confidence scores, prediction probabilities, and model certainty indicators. Shows a value 0–1 (or 0–100%) with color gradient from low (red/amber) to high (green) confidence and configurable threshold zones.

**Component API:**
```typescript
export interface ConfidenceZone {
  min: number;                           // 0-1
  max: number;                           // 0-1
  label: string;                         // e.g., "Low", "Medium", "High"
  color?: string;                        // override zone color
}

export interface ConfidenceMeterProps extends BaseProps {
  value: number;                         // 0-1 (probability) or 0-100 (percentage)
  max?: number;                          // default: 1 (probabilities) or 100 (percentages)
  label?: string;                        // e.g., "Confidence", "Certainty"
  variant?: "bar" | "gauge" | "ring" | "text-only";  // default: "bar"
  zones?: ConfidenceZone[];              // custom threshold zones
  showLabel?: boolean;                   // show zone label (default: true)
  showValue?: boolean;                   // show numeric value (default: true)
  valueFormat?: (value: number) => string;  // custom value formatting
  size?: "sm" | "md" | "lg";
  animate?: boolean;                     // animate value changes (default: true)
}
```

**Default zones (when `zones` not specified):**
- 0.0–0.3: "Low" (red)
- 0.3–0.7: "Medium" (amber)
- 0.7–1.0: "High" (green)

**Behavior:**
- **Bar variant:** Horizontal bar filled to value, colored by zone
- **Gauge variant:** Semi-circular arc gauge (reuse Gauge component patterns)
- **Ring variant:** Circular ring (donut) with percentage
- **Text-only variant:** Just the number with zone color and label
- Color transitions smoothly across zones (not abrupt changes)
- Zone label shows which zone the value falls in (e.g., "High confidence")
- Value animates when changing (transitions via CSS)
- `valueFormat` customizes display (e.g., show as "87%" or "0.87" or "High")

**CSS classes:**
- `.vf-confidence-meter` — root container
- `.vf-confidence-meter__bar` — bar variant container
- `.vf-confidence-meter__bar-fill` — filled portion (colored by zone)
- `.vf-confidence-meter__gauge` — gauge variant SVG container
- `.vf-confidence-meter__ring` — ring variant SVG container
- `.vf-confidence-meter__value` — numeric value display
- `.vf-confidence-meter__label` — zone label text
- `.vf-confidence-meter--low`, `--medium`, `--high` — zone color classes
- Size modifiers

**Reuse:** `Progress` bar patterns for bar variant, `Gauge` patterns for gauge variant, `CircularProgress` patterns for ring variant, `useControllableState` if needed, `cx()`.

**Test plan (ConfidenceMeter.test.tsx):**
1. Renders with value displayed
2. Bar variant: fill width matches value
3. Gauge variant: arc length matches value
4. Ring variant: ring fill matches value
5. Text-only variant: shows value without visual bar
6. `it.each` for variant rendering (bar, gauge, ring, text-only)
7. Default zones: value 0.1 shows "Low" with red color
8. Default zones: value 0.5 shows "Medium" with amber color
9. Default zones: value 0.9 shows "High" with green color
10. Custom zones override defaults
11. Zone label displays current zone name
12. `showLabel={false}` hides zone label
13. `showValue={false}` hides numeric value
14. Custom `valueFormat` formats display value
15. `max=100` treats value as percentage
16. `label` prop renders descriptive label
17. `animate` applies transition CSS
18. `animate={false}` disables transitions
19. `it.each` for size variants (sm, md, lg)
20. Value clamped to 0–max range
21. a11y: `expectNoA11yViolations` — has `role="meter"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

---

### 1.31 OrgChart

**Files to create:**
- `src/charts/OrgChart.tsx`
- `src/charts/__tests__/OrgChart.test.tsx`
- `src/css/components/org-chart.css`

**Note:** Lives in `src/charts/` alongside other visualization components, exported from `voidframe/charts` entry point.

**Description:** Hierarchical organization/tree chart visualization. Fills the gap between TreeView (interactive navigation tree) and NetworkGraph (force-directed, unstructured). OrgChart is a structured, top-down (or left-to-right) tree layout with cards at each node. Used for organization hierarchies, reporting structures, dependency trees, taxonomy visualization.

**Component API:**
```typescript
export interface OrgChartNode {
  id: string;
  label: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, string>;     // e.g., { title: "CEO", department: "Executive" }
  children?: OrgChartNode[];
}

export interface OrgChartProps extends BaseProps {
  data: OrgChartNode;                    // root node
  direction?: "top-down" | "left-right" | "bottom-up" | "right-left";  // default: "top-down"
  nodeWidth?: number;                    // default: 180
  nodeHeight?: number;                   // default: 80
  horizontalGap?: number;               // default: 40
  verticalGap?: number;                 // default: 60
  renderNode?: (node: OrgChartNode, depth: number) => ReactNode;  // custom node renderer
  onNodeClick?: (node: OrgChartNode) => void;
  onNodeHover?: (node: OrgChartNode | null) => void;
  expandedIds?: string[];                // controlled expanded nodes
  defaultExpandedIds?: string[];         // uncontrolled initial
  onExpandChange?: (ids: string[]) => void;
  collapsible?: boolean;                 // nodes can collapse children (default: true)
  maxDepth?: number;                     // limit visible depth
  pannable?: boolean;                    // click-drag to pan (default: true)
  zoomable?: boolean;                    // scroll to zoom (default: true)
  zoom?: number;                         // controlled zoom
  onZoomChange?: (zoom: number) => void;
  fitOnMount?: boolean;                  // auto-fit to container (default: true)
  connectorStyle?: "straight" | "curved" | "step";  // default: "step"
  size?: "sm" | "md";
}
```

**Behavior:**
- SVG-based tree layout with rectangular cards at each node
- Default node card: avatar + label + description
- Custom `renderNode` for rich node content
- Connector lines between parent and children (step/curved/straight)
- Collapse/expand: click node toggle button to hide/show children, subtree collapses with animation
- Pan: click-drag empty space to pan viewport
- Zoom: scroll wheel or +/- controls
- `fitOnMount`: auto-calculate zoom to fit entire tree in viewport
- Node click fires `onNodeClick`
- Large trees: collapse deep subtrees by default

**CSS classes:**
- `.vf-org-chart` — root SVG container
- `.vf-org-chart__node` — individual node group
- `.vf-org-chart__node-card` — node card background
- `.vf-org-chart__node-avatar` — avatar in node
- `.vf-org-chart__node-label` — label text
- `.vf-org-chart__node-description` — description text
- `.vf-org-chart__connector` — line between nodes
- `.vf-org-chart__collapse-toggle` — expand/collapse button
- `.vf-org-chart__controls` — zoom +/- controls
- Direction modifiers, size modifiers

**Reuse:** D3-hierarchy for tree layout calculations (already a peer dep), existing chart primitives (`ChartFrame`, `useChart`), `Avatar` for node avatars, `useControllableState` for expand state and zoom.

**Test plan (OrgChart.test.tsx):**
1. Renders root node with label
2. Renders child nodes connected to root
3. Multi-level hierarchy renders correctly (3+ levels)
4. Default "top-down" direction: root at top
5. `direction="left-right"`: root at left
6. Custom `renderNode` replaces default card
7. `onNodeClick` fires when clicking a node
8. Collapsible: clicking collapse toggle hides children
9. Collapse animates subtree away
10. Expand reveals hidden children
11. Controlled: `expandedIds` determines visible subtrees
12. Uncontrolled: `defaultExpandedIds` sets initial state
13. `collapsible={false}` hides collapse toggles
14. `maxDepth` limits visible tree depth
15. `it.each` for connector styles (straight, curved, step)
16. Zoom controls: + increases, - decreases
17. `fitOnMount` auto-zooms to fit content
18. `onNodeHover` fires on hover and null on leave
19. Node card shows avatar when provided
20. Node card shows metadata when provided
21. `it.each` for size variants (sm, md)
22. Empty children array renders leaf node (no connector)
23. a11y: `expectNoA11yViolations` — SVG has `role="tree"`, nodes have `role="treeitem"`, `aria-expanded` for collapsible

---

## Integration with Existing Codebase

**Files to update after each component:**
1. `src/index.ts` — add export to barrel file (or `src/charts/index.ts` for OrgChart)
2. `src/css/index.css` — import new component CSS
3. `docs/taxonomy.ts` — add to component taxonomy for docs site
4. `docs/scope.ts` — add to available exports list
5. Run `scripts/extract-props.mjs` to generate prop docs

**Conventions to follow (from CONVENTIONS.md):**
- Export `{Component}Props` type alongside component
- Use `forwardRef` + `displayName` on all components
- Support `className` and `style` on root element
- Use `useControllableState` for all controlled/uncontrolled duality
- Use `cx()` for class name composition
- All event handlers: `onValueChange` for primary, `onChange` for secondary
- BEM CSS naming: `.vf-{component}`, `.vf-{component}__{element}`, `.vf-{component}--{modifier}`

---

## Verification

After implementing all components:
1. Run `vitest run` — all tests pass
2. Run `vitest run --coverage` — 100% coverage on new files
3. Run `vitest run src/components/__tests__/a11yAxe.test.tsx` — add new components to a11y audit
4. Run `tsc --noEmit` — no type errors
5. Run `vite build` — bundle size within limits
6. Verify each component renders in the docs site
7. Keyboard-test every interactive component manually
8. Screen reader test critical components (Transfer, Cascader, SplitButton, CommandInput, FilterBuilder)
