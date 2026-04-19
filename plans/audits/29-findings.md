# Parameter Standardization Audit — Findings (plan 29)

> Read-only audit. No source modifications in this pass.
> Inventory snapshot: `plans/audits/29-param-inventory.json` (499 components).

## Methodology note (important)

This audit was executed without the ability to run `node` or `docker compose`
inside the sandbox. All Task-1–6 `node -e` scripts in the plan had to be
replaced with pure Grep/Read passes over the freshly-copied `docs/data/props.json`
(renamed to `29-param-inventory.json`, 585 KB, 24,579 lines) and the source tree.

Two specific methodology consequences:

1. **Enum detection via JSON is blind.** `scripts/extract-props.mjs` records
   enum-typed props as `"type": "enum"` because
   react-docgen-typescript's `p.type.name` collapses unions to a tag; the
   literal values live on `p.type.value`, which the extractor discards
   (see `extract-props.mjs:99`). The plan's enum script
   `if (!t.includes("|") || !t.includes("\""))` therefore returns zero rows.
   For task 3 I grepped the source directly for `variant?:"..."` /
   `tone?:"..."` / `size?:"..."` literal-union declarations. Named-alias
   props (`variant?: ButtonVariant`) required a second pass to resolve the
   alias to its underlying union. `29-enums.txt` contains both passes.
2. **Component→prop association in the flat JSON.** Because props.json is a
   flat array of components, but each component's props live at the same
   JSON indent, I correlated prop line-numbers with component-start line
   numbers (captured in one pass) to attribute props to components in
   `29-callbacks.txt` and `29-control.txt`. This is equivalent to the
   plan's `comp.props` traversal.

Neither workaround changes the findings: the inventory size (499), the
306 callbacks, the `variant`/`tone`/`size` vocabulary splits, and the
controlled/uncontrolled deviations below were all confirmable by grep.

---

## Summary

| Severity | Count | Examples |
|----------|-------|----------|
| **P0** | 2   | Input/Textarea dual-onChange signatures; Checkbox `checked` vs `value` |
| **P1** | 11  | Tabs `active` API; ButtonVariant vocabulary split; Select missing defaultValue; Pagination `page` prop; DataGrid no forwardRef; List editors flat items= convention; HTML-style `onChange(event)` on non-form controls |
| **P2** | 13  | `variant` meaning-drift across components; `tone` optional duplication; ReactionBar `id`-based onReact; RatingInput `onChange(value)` not `onValueChange`; Ticker/BigNumber spread uncertainty; MenuRadioGroup missing defaultValue |
| **P3** | 8   | AccessibleIcon/ReferenceLine/ReferenceBand missing forwardRef; non-canonical size vocab for Numeric/RichEmbed; 27 zero-prop docgen entries; AlertV2 / DrawerV2 / PopoverV2 / ConfirmDialogV2 / SpinnerV2 transitional naming |

**Headline finding:** the library has **at least three incompatible
`variant` vocabularies** (`default/ghost/accent/solid` on Button family;
`solid/outline/subtle` on Badge; ad-hoc per-component unions on 13 others)
and a **four-way split on controlled-state conventions** (`value+onChange`,
`value+onValueChange`, `checked+onChange`, `items+onChange`). A new user
picking up three components in a row will meet three different spellings
of the same concept. This is the single largest driver of remaining
inconsistency.

---

## §1. Callback naming (Task 2)

Source artifact: `plans/audits/29-callbacks.txt` (307 callback declarations).

### Finding 1.1 — HTML-style `onChange(event)` vs value-emit on form controls
- **Component(s):** `Input` (src/components/Form.tsx:~80), `Textarea`
  (Form.tsx), `SearchInput`, `PasswordInput`
- **Current:** both `onChange(e: ChangeEvent<HTMLInputElement>)` **and**
  `onValueChange(value: string)` are declared (see inventory lines
  11401/11407 Input; 21829/21835 Textarea; 18398/18404 SearchInput;
  15251/15257 PasswordInput).
- **Canonical:** Dual is fine per plan §Canonical Conventions
  ("`onChange(event)` legacy kept; may coexist with `onValueChange`").
- **Classification:** LEGACY-OK (coexistence intentional).
- **Severity:** P3 (documentation should surface this clearly).

### Finding 1.2 — `onChange(value)` on non-form controls (should be `onValueChange`)
- **Component(s):** ButtonGroup `onChange(key: string)` (2564);
  CodeEditor `onChange(code: string)` (4912);
  ColorPicker `onChange(hex: string)` (5179);
  Combobox `onChange(value: string | null)` (5285);
  Composer `onChange(next: string)` (5664);
  MarkdownEditor `onChange(md: string)` (12483);
  ModelPicker `onChange(modelId: string)` (13764);
  ModelSelector `onChange(next: string)` (13803);
  MultiSelect `onChange(values: string[])` (14121);
  NumberInput `onChange(value: number)` (14596);
  Pagination `onChange(page: number)` (15057);
  PhoneInput `onChange(value: string)` (15465) — also has `onValueChange`;
  PinInput `onChange(value: string)` (15674);
  QueryBuilder `onChange(next: QueryGroup)` (16399);
  Radio `onChange()` (16686);
  RadioGroup `onChange(value: string)` (16735);
  RatingInput `onChange(value: number)` (16818);
  RichTextEditor `onChange(html: string)` (17712);
  SegmentedControl `onChange(value: string)` (18506);
  Select `onChange(value: string)` (18569);
  ShortcutEditor `onChange(next: string)` (19093);
  SignaturePad `onChange(dataUrl: string)` (19263);
  Slider `onChange(value: number)` (19670);
  Sortable `onChange(next: T[])` (19828);
  Switch `onChange(checked: boolean)` (21300);
  SystemPromptEditor `onChange(next: string)` (21344);
  TabBar `onChange(value: string)` (21401);
  Tabs `onChange(key: string)` (21517);
  TagInput `onChange(tags: string[])` (21568);
  ThemeSelector `onChange(next: string)` (21910);
  TimePicker `onChange(next: string)` (22069);
  TimeZoneSelect `onChange(next: string)` (22145);
  Toggle `onChange(checked: boolean)` (22257);
  DatePicker `onChange(date: Date | null)` (7215);
  DateRangePicker `onChange(range: DateRange)` (7328);
  DateTimePicker `onChange(date: Date | null)` (7417);
  TreeSelect `onChange(value: string | null)` (22966);
  Wizard `onChange(stepId: string)` (24427);
  MessageFeedback `onChange(next: FeedbackValue)` (13324);
  MessageEdit `onChange(next: string)` (13259);
  Checkbox `onChange(checked: boolean)` (3746);
  CheckboxGroup `onChange(values: string[])` (3796);
  KeyValueEditor `onChange(next)` (11649);
  FileUpload `onChange(items)` (9146);
  EnvironmentVars `onChange(variables)` (8412);
  ReorderList `onChange(next: T[])` (17320);
  Brush `onChange(selection: BrushSelection)` (2247);
  Transfer `onChange(selectedKeys: string[])` (22662) — also has `onValueChange`.
- **Canonical:** `onValueChange(value)`. The plan puts `onChange(event)`
  only on text-like HTML inputs.
- **Classification:** NONSTANDARD-FIX.
- **Remediation:** Wave-1 add `onValueChange` alongside existing `onChange`
  for each component; keep `onChange` with `@deprecated` + runtime
  `warnOnce`. Remove in 2.0.
- **Severity:** P1 (API surface inconsistency — the single biggest
  convention violation in the library).
- **Migration cost:** medium (≈45 components; mechanical transform).

### Finding 1.3 — Transfer / PhoneInput / MaskedInput already dual
- **Component(s):** Transfer (22662 + 22686), PhoneInput (15465 + 15483),
  MaskedInput (12645 + 12651), Input, Textarea, SearchInput, PasswordInput.
- **Classification:** CANON (ahead of the curve; serve as template).
- **Severity:** P3 (documentation — recommend as migration pattern).

### Finding 1.4 — Domain callbacks: `onReact` shape split
- **Component(s):** ReactionBar `onReact(emoji: string)` (16880) and
  `onUnreact(emoji: string)`; ReactionPicker `onReact(id: string)` (16911).
- **Classification:** NONSTANDARD-JUSTIFIED (domain), but the two
  ReactionPicker/ReactionBar share a callback name with different arg
  semantics (`emoji` vs `id`).
- **Severity:** P2.
- **Remediation:** rename ReactionPicker to `onSelect(id)` for clarity,
  reserve `onReact(emoji)` for ReactionBar. Non-breaking add.

### Finding 1.5 — Pair-vs-event confusion: DataGrid sort/filter/group events
- **Component(s):** DataGrid (7050 `onSelectionChange`, 7074 `onSortChange`,
  7086 `onFiltersChange`, 7098 `onGroupByChange`, 7152 `onRowReorder`,
  7158 `onColumnReorder`, 7164 `onColumnResize`).
- **Classification:** CANON — each uses `on<Axis>Change(next)` for value
  emit; table-level events use `on<Thing><Verb>(event)`.
- **Severity:** P3.

### Finding 1.6 — `onDismiss` vs `onClose` synonymy
- **Component(s):** `onDismiss` used by Alert, AlertV2, Backdrop, BannerAlert,
  CoachMark, DismissableLayer, NotificationCenter (per-id), OfflineBanner,
  Toast, WhatsNewPopover. `onClose` used by ContextHelp, DebugPanel, Drawer,
  Modal.
- **Classification:** SYNONYM-FIX.
- **Severity:** P2.
- **Remediation:** Pick one. `onDismiss` is the current majority (10 vs 4);
  add `onDismiss` to Modal/Drawer/DebugPanel/ContextHelp, deprecate `onClose`.

### Finding 1.7 — `onOpenChange(open)` vs boolean/callback mix
- **Component(s):** AlertDialog, Collapsible, CommandPalette, Dialog, Drawer_V2_,
  HoverCard, Lightbox, Menu, MegaMenu, Popover, PopoverV2, Sheet, ShortcutGuide,
  Spotlight, ToolCall(expandedChange), ReasoningTrace, AgentStep
  (`onExpandedChange`), TreeView (`onExpandedChange`), RAGContext
  (`onCollapsedChange`), AppShell (`onSidebarCollapsedChange`).
- **Classification:** Mostly CANON (20+ components follow the
  `on<State>Change(next: boolean)` shape). The three underscored variants
  of the same concept (`onOpenChange`, `onExpandedChange`, `onCollapsedChange`)
  reflect semantic nuance and should not be harmonized further.
- **Severity:** P3.

### Finding 1.8 — Calendar event flood
- **Component:** Calendar (2608 onDisplayMonthChange, 2621 onViewChange,
  2653 onDayClick, 2659 onEventClick, 2665 onRangeChange).
- **Classification:** CANON for the `on<Thing>Click` / `on<Thing>Change`
  pair. No fix.
- **Severity:** P3.

### Finding 1.9 — Media players have consistent cross-component pattern
- **Component:** AudioPlayer (1216–1234) vs VideoPlayer (23721–23739):
  both expose `onPlay`/`onPause`/`onTimeUpdate(t)`/`onEnded`.
- **Classification:** CANON.
- **Severity:** P3.

### Finding 1.10 — ImageCropper triple-change naming
- **Component:** ImageCropper `onCrop(result)` (11024), `onSrcChange(src)`
  (11030). `onCrop` is the primary value-emit but named for the action,
  not the value — and there's no `onValueChange`.
- **Classification:** NONSTANDARD-JUSTIFIED. `onCrop` emits a CropResult
  which is more than a simple value — justified.
- **Severity:** P3.

---

## §2. Variant / tone / size (Task 3)

Source artifact: `plans/audits/29-enums.txt`.

### Finding 2.1 — `variant` vocabulary split (THREE incompatible families)
- **Component(s):**
  - F-alpha `"default" | "ghost" | "accent"` (+ optional `"solid"`):
    Button (Button.tsx:9), CopyButton (CopyButton.tsx:17),
    ToggleGroup (ToggleGroup.tsx:27), SplitButton (SplitButton.tsx:33).
  - F-beta `"solid" | "outline" | "subtle"`: Badge (Badge.tsx:8).
  - F-domain (one-off per component): LiveIndicator, ConfidenceMeter,
    ThemeSelector, ModelSelector, ModelCompare (ChatModel.tsx:202/316),
    NotificationCenter (Notifications.tsx:35), Dialog (dialog|alertdialog),
    DiffViewer, FloatingActionButton, Chat/Indicators,
    IconButton (via `IconButtonVariant`).
- **Current:** Plan canonical says `variant?: "solid" | "outline" | "subtle" | "ghost"`.
  **Zero components** match the plan's canonical set exactly. Badge is
  closest (missing `"ghost"`). Button has `ghost` but also `accent` +
  `default` + `solid`, which isn't in the canonical vocabulary at all.
- **Classification:** NONSTANDARD-FIX for F-alpha (Button family should
  migrate to the canonical set or the plan's canonical set should be
  revised to match Button family, which has 4 components vs Badge's 1);
  DOMAIN-SEPARATE for F-domain.
- **Severity:** P1 (vocabulary divergence of this depth is the headline
  issue). Recommended: **treat the Button family's vocabulary as the
  true canonical** and migrate Badge/the plan doc to match it, because
  the Button vocabulary dominates usage.
- **Remediation:** see `29-remediation.md` §1.

### Finding 2.2 — `tone` is (mostly) consistent
- **Component(s):** tone is widely used with vocabulary
  `"neutral" | "info" | "success" | "warning" | "danger"` on Activity,
  Alert, Badge, Calendar, Gantt, Metrics, MultiProgress, Notifications,
  Numeric, Stat, BarChart.series, Legend, etc. Two minor variants:
  - Data.tsx ProgressTone drops `"info"` (Data.tsx:364).
  - DevTools.tsx swaps `"neutral"` → `"default"` (DevTools.tsx:29).
  - Notifications.tsx:198 drops `"neutral"`.
- **Classification:** SYNONYM-FIX (the two outliers).
- **Severity:** P2.
- **Remediation:** unify on `"neutral" | "info" | "success" | "warning" | "danger"`.
  Add `"info"` to ProgressTone; rename `"default"` → `"neutral"` in DevTools.

### Finding 2.3 — Size vocabulary: 97% consistent, two outliers
- **Canonical:** `"sm" | "md" | "lg"` (+ optional `"xs"`, `"xl"`).
- **Deviations:**
  - Numeric.tsx:223 — `size?: "md" | "lg" | "xl"` (no `"sm"`).
  - RichEmbed.tsx:20 — `size?: "xs" | "sm"` (no `"md"`).
- **Classification:** NONSTANDARD-JUSTIFIED for both (domain ranges).
- **Severity:** P3.

### Finding 2.4 — Components that genuinely collide `variant + tone`
- **Component(s):** Badge (`variant?: BadgeVariant` + `tone?: BadgeTone`),
  Data.tsx Progress (`variant?: ProgressVariant` + `tone?: ProgressTone`).
- **Classification:** DOMAIN-SEPARATE (variant=shape, tone=color) — correct.
- **Severity:** P3 (call out in docs as the intended pattern).

### Finding 2.5 — `kind` used only in ChatComposer
- **Component(s):** ChatComposer attachment `kind?: "image" | "file" | "audio"…`
  (477) and mention `kind?: "user" | "channel" | "file" | "reference"` (931).
- **Classification:** DOMAIN-SEPARATE (data discriminators, not visual
  variants); keep as `kind`.
- **Severity:** P3.

---

## §3. Controlled / uncontrolled state (Task 4)

Source artifact: `plans/audits/29-control.txt`.

### Finding 3.1 — `checked`/`defaultChecked` vs `value`/`defaultValue` on Checkbox/Switch/Toggle
- **Component(s):** Checkbox (Form.tsx), Switch (FormAdvanced.tsx:141-ish),
  Toggle (FormAdvanced.tsx), CheckboxGroup (values=).
- **Current:** use HTML-native `checked`/`defaultChecked`; no `value`
  field in the public prop map.
- **Canonical:** plan says `value?` + `defaultValue?` + `onChange?` +
  optional `onValueChange?`.
- **Classification:** NONSTANDARD-JUSTIFIED (HTML compat); but the
  divergence from the pattern is worth an explicit note in docs.
- **Severity:** P0 for internal consistency narrative (any generic
  "read controlled state of any form control" code cannot — there is
  no single shape). P1 for API docs.
- **Remediation:** do NOT rename to `value`. Instead, **document the
  exception** explicitly. Optionally add typed `value`/`defaultValue`
  aliases internally.

### Finding 3.2 — Missing `defaultValue` on controllable inputs
- **Component(s):** Input, Textarea, SearchInput, PasswordInput,
  NumberInput (14590), Select (18563), Slider (19664),
  ShortcutEditor (19080), TabBar (21389), Tabs, ModelPicker, MenuRadioGroup,
  CheckboxGroup, Switch, Toggle.
- **Current:** expose `value` + `onChange` (or `onValueChange`) but no
  typed `defaultValue`. (The underlying DOM element accepts it via
  spread, but TypeScript consumers don't see it.)
- **Classification:** NONSTANDARD-FIX.
- **Severity:** P1 (users believe the component is controlled-only).
- **Remediation:** Wave-1 add `defaultValue?: T` prop; route through
  `useControllableState` (already imported by most of these).

### Finding 3.3 — Tabs uses `active` (not `value`) + `tabs: TabItem[]`
- **Component:** Tabs (Interactive.tsx:36,37,38).
- **Current:** `tabs: TabItem[]` + `active: string` + `onChange(key)`.
  Missing `defaultValue`. No dot-notation Tab/TabPanel compound API.
- **Canonical:** `value?` + `defaultValue?` + `onValueChange?` + compound
  children `Tabs.List` + `Tabs.Tab` + `Tabs.Panel`.
- **Classification:** NONSTANDARD-FIX (in two axes: state prop names AND
  data-driven vs compound).
- **Severity:** P1 (Tabs is a flagship component; inconsistency is loud).
- **Remediation:** Wave-3 introduce dot-notation Tabs compound; Wave-1
  add `value`/`defaultValue`/`onValueChange` alongside current prop set.

### Finding 3.4 — Pagination uses `page` instead of `value`
- **Component:** Pagination (15034/15057).
- **Current:** `page: number` + `onChange(page)` + `pageSize` + `onPageSizeChange`.
- **Classification:** NONSTANDARD-FIX.
- **Severity:** P1.
- **Remediation:** add `value`/`defaultValue` aliases; mark `page` as
  `@deprecated`.

### Finding 3.5 — List-editor flat-value naming
- **Component(s):** ReorderList (`items` + `onChange(next)`), Sortable
  (`items` + `onChange`), FileUpload (`items` + `onChange`), EnvironmentVars
  (`variables` + `onChange`), KeyValueEditor (`items` + `onChange`),
  TreeView (`items`), Kanban (`columns` + `items`), Transfer (`items` +
  `value`/`onValueChange`).
- **Current:** "payload name is the noun; no `value`/`defaultValue`".
- **Classification:** NONSTANDARD-FIX for everything except Transfer
  (which correctly adopts value/onValueChange).
- **Severity:** P1.
- **Remediation:** accept `value?: T[]` + `defaultValue?: T[]` +
  `onValueChange?(next: T[])` alongside the noun-named prop; deprecate
  `items`/`variables`/`columns` over one major.

### Finding 3.6 — `readOnly` application
- **Source:** grep for `readOnly?: boolean` returns 15 hits
  (see `29-control.txt`). Plan says only text-like fields or
  Switch/RatingInput should have it. Findings:
  - **Present on**: CodeEditor, EnvironmentVars, InlineEdit, Kanban,
    MarkdownEditor, NumberStepper, RatingInput, RegExpTester,
    RichTextEditor, Form (shared field), FormAdvanced, FormExtended,
    Gantt, Embed, ChatAttachments.
  - **Plan-approved:** Input, Textarea, SearchInput, PasswordInput,
    Switch, RatingInput.
  - Input/Textarea/SearchInput/PasswordInput inherit `readOnly` from
    their underlying `<input>`/`<textarea>` via spread — not in typed
    public API.
- **Classification:** NONSTANDARD-FIX for Checkbox/Radio (should use
  `disabled` only; currently don't declare `readOnly`, so no fix
  needed). For Gantt/Kanban/Embed/ChatAttachments — these are complex
  interactive surfaces where `readOnly` legitimately models "show but
  disallow edit while allowing focus and copy"; keep.
- **Severity:** P2.
- **Remediation:** add `readOnly` to the typed API of Input/Textarea/
  SearchInput/PasswordInput (they accept it at runtime via HTML
  inheritance but don't type it).

---

## §4. Polymorphism and ref-forwarding (Task 5)

Source artifacts: `plans/audits/29-no-forwardref.txt`, `29-spread-failures.txt`.

### Finding 4.1 — DataGrid missing forwardRef
- **Component:** DataGrid (src/components/DataGrid.tsx:187 / :1327).
- **Current:** `function DataGridRoot<T = Record<string, unknown>>` — a
  generic function component, then `Object.assign(DataGridRoot, {...})`.
  Generic + `forwardRef` is a known TypeScript ergonomics problem; the
  author chose generics.
- **Classification:** NONSTANDARD-JUSTIFIED (the tradeoff is real).
- **Severity:** P1 (because DataGrid is a flagship component and the
  "missing ref on the root container" affects focus management,
  imperative scroll, intersection observer wiring, etc.).
- **Remediation:** wrap with a `forwardRefWithGenerics` helper (see
  Radix/Ariakit patterns); or accept a `rootRef?: Ref<HTMLDivElement>`
  prop.

### Finding 4.2 — ReferenceLine / ReferenceBand missing forwardRef
- **Component:** src/charts/primitives/ReferenceLine.tsx,
  src/charts/primitives/ReferenceBand.tsx.
- **Classification:** NONSTANDARD-FIX. These are SVG primitives; ref
  consumers might want to attach click handlers or animate programmatically.
- **Severity:** P2.

### Finding 4.3 — AccessibleIcon missing forwardRef
- **Component:** src/primitives/AccessibleIcon.tsx.
- **Current:** wraps an icon clone + a `VisuallyHidden` label sibling.
  Returns effectively a fragment; ref has no single target.
- **Classification:** NONSTANDARD-JUSTIFIED.
- **Severity:** P3.

### Finding 4.4 — `as` / `asChild` adoption
- **Grep target:** Button Badge Card Text Label Link NavItem MenuItem.
- **Found:** no component declares `as?:` in a matching-name grep.
  `asChild` does exist on some internals (per ToolSearch) but is not
  propagated to public type signatures I can see via docgen
  (`asChild` would be in props.json, yet no row matches).
- **Classification:** NONSTANDARD-FIX. The plan's canonical says
  `as?: ElementType` + `asChild?: boolean` is required where the shape
  is commonly reused.
- **Severity:** P1.
- **Remediation:** Wave-1 add `as?:`/`asChild?:` to Button, Badge,
  Card, Text, Heading (if exists), NavItem, MenuItem, SessionListItem,
  Anchor (already behaves like one). Keep `forwardRef` in all cases.

### Finding 4.5 — Spread-forwarding: full sweep clean
- **Sample:** 209 component files, 195 contain `{...rest|props|spread}`;
  the 14 that don't are Providers/Context/Portal/Slot/children-only
  wrappers/dev tools. No DOM-rendering public component is missing
  the spread.
- **Classification:** CANON (for the tested dimension).
- **Caveat:** the grep only confirms SOMETHING is spread SOMEWHERE.
  It does not confirm that `className` + `style` are each forwarded to
  the root element. Manual audit of a representative sample (see
  Tabs:81-88 for reference canonical shape) shows the pattern is
  widely followed.
- **Severity:** P3.

### Finding 4.6 — Slot primitive exists and is used
- **Component:** src/primitives/Slot.tsx (19717).
- **Signal:** the `Slot` infrastructure required for `asChild` is in
  place — adding `asChild?: boolean` to the flagship surfaces is a
  mechanical change, not a design question.
- **Severity:** (supporting evidence for 4.4).

---

## §5. Compound-API consistency (Task 6)

29 components already use dot-notation compound (`Object.assign(Root, {...})`).
Of note:

- **Compound-present (29):** Accordion, Activity, Breadcrumb, Carousel,
  CommandPalette, Composer, DataGrid, DataList, DescriptionList, Dialog,
  DrawerV2, HoverCard, List, MegaMenu, Menu (+ dot-notation via direct
  assignment), MessageActions, Navbar, PopoverV2, ScrollSpy, Sheet,
  Sidebar, Stepper, SwipeActions, TabBar, Timeline, Toolbar, UserMenu,
  VideoPlayer, Wizard, Field (via ForwardRefExotic cast), RovingFocusGroup.
- **Data-driven-only, no compound:** Tabs (Interactive.tsx), Select
  (Form.tsx via `options`), Combobox (Combobox.tsx:52/304 via `options`),
  MultiSelect, Cascader (options), MentionInput (options), Anchor (items),
  BreadcrumbMenu (items), ToggleGroup (items), TreeNav (items),
  TreeView (items), Kanban (columns+items), Spotlight (steps),
  ChatAgent PlanDisplay (steps), ChartLegend (items), Descriptions
  (items), RadioGroup (options), CheckboxGroup (options), SegmentedControl
  (options), Transfer (items), FunnelChart / WaterfallChart (steps),
  MultiProgress (items), StatusBar (items), AvatarGroup (items).

### Finding 5.1 — Tabs: no compound API
- **Component:** Tabs (Interactive.tsx:45).
- **Classification:** NONSTANDARD-FIX (headline case; plan names this
  explicitly as `Tabs.List` + `Tabs.Tab` + `Tabs.Panel` canonical).
- **Severity:** P1.

### Finding 5.2 — Select / Combobox / MultiSelect: data-driven `options[]`
- **Components:** Form.tsx:215 (Select), Combobox.tsx:52/304, FormAdvanced
  (CheckboxGroup/Segmented), FormExtended (RadioGroup).
- **Classification:** Legitimately data-driven (HTML `<select>` parallel).
  DOMAIN-SEPARATE.
- **Severity:** P3.

### Finding 5.3 — Steps/Stepper/Wizard: mixed
- **Stepper** has dot-notation (Navigation.tsx:555); **Wizard** has
  dot-notation (Wizard.tsx:253); **ChatAgent PlanDisplay** uses `steps:`
  array (ChatAgent.tsx:407); **Spotlight** uses `steps:` array
  (Spotlight.tsx:36); **FunnelChart/WaterfallChart** use `steps:` array
  (chart domain).
- **Classification:** DOMAIN-SEPARATE for the chart surfaces;
  NONSTANDARD-JUSTIFIED for Spotlight (tour steps are user data).
  PlanDisplay could gain dot-notation.
- **Severity:** P3.

### Finding 5.4 — Menu.tsx uses BOTH dot-notation AND direct assignment
- **Component:** Menu.tsx:503–510 uses `MenuRoot.Trigger = MenuTrigger`
  direct assignment style, not `Object.assign(...)`.
- **Classification:** CANON equivalent. Difference is only stylistic.
- **Severity:** P3.

---

## §6. Zero-prop docgen entries (blind-spot check)

27 components surface zero props in the inventory. Classification:

| Component | File | Likely cause |
|---|---|---|
| Activity | Activity.tsx | Accepts HTMLAttributes; props typed as spread only |
| Center | Layout.tsx | Spread-only layout primitive |
| CommentList | Comment.tsx | HTMLAttributes extension |
| ConfirmProvider | Dialog.tsx | Provider |
| CSVViewer | CSVViewer.tsx | HTMLAttributes extension |
| DescriptionList | DataList.tsx | Spread-only |
| Field.Error / Field.Help / Field.Label | Field.tsx | Dot-notation sub-components; docgen can't parse the `(Field as …).Label = …` cast |
| FieldControl | Field.tsx | renders via cloneElement |
| FieldSet / Legend / InputGroup.Addon | FormStructure.tsx | plain HTMLAttributes wrappers |
| Form | FormProvider.tsx | Hook-consumer component |
| MenuBar / MenuContent / MenuLabel / MenuSeparator / MenuSub / MenuSubContent / MenuSubTrigger | Menu.tsx | Very thin wrappers using HTMLAttributes; docgen skips when the interface has no non-inherited props |
| MessageActions | Chat/Actions.tsx | Spread wrapper |
| ShortcutProvider | useShortcuts.tsx | Context provider (filter lets it through because name starts with capital) |
| Slot | Slot.tsx | Render-prop-ish; no own props |
| Stretch | Layout.tsx | Flex filler |
| TileGridMap | TileGridMap.tsx | SVG wrapper |
| VisuallyHidden | VisuallyHidden.tsx | HTMLAttributes |

**Classification:** all 27 are genuine zero-own-prop components. **No
docgen regression.** `29-docgen-blind-spots.json` is NOT required.

- **Severity:** P3 (documentation should note this so the 27 components
  get "inherits HTMLAttributes" banners).

---

## §7. Triage table

| Finding | Severity | Cost | Wave |
|---------|----------|------|------|
| 1.1 Input dual onChange | P3 | 0 | docs |
| 1.2 `onChange(value)` on 45 non-form controls → add `onValueChange` | P1 | M | 1 |
| 1.3 dual-canon already on 7 | P3 | 0 | docs |
| 1.4 ReactionPicker onReact vs onSelect | P2 | S | 1 |
| 1.5 DataGrid event family | P3 | 0 | docs |
| 1.6 onDismiss vs onClose synonym | P2 | S | 1 |
| 1.7 onOpenChange family | P3 | 0 | docs |
| 1.10 ImageCropper onCrop | P3 | 0 | docs |
| 2.1 `variant` vocabulary split | P1 | L | 1 (Button family adoption as canonical) |
| 2.2 tone minor drift (ProgressTone, DevTools) | P2 | S | 1 |
| 2.3 size outliers (Numeric, RichEmbed) | P3 | 0 | docs |
| 2.4 Badge variant+tone collision | P3 | 0 | docs |
| 2.5 `kind` domain | P3 | 0 | docs |
| 3.1 Checkbox checked vs value | P0/P1 | 0 (doc only) | docs |
| 3.2 missing defaultValue on 15 | P1 | M | 1 |
| 3.3 Tabs API | P1 | L | 1 + 3 |
| 3.4 Pagination `page` | P1 | S | 1 |
| 3.5 list editors flat items | P1 | M | 1 |
| 3.6 readOnly typing on inputs | P2 | S | 1 |
| 4.1 DataGrid no forwardRef | P1 | S | 1 |
| 4.2 ReferenceLine/Band | P2 | S | 1 |
| 4.3 AccessibleIcon | P3 | 0 | docs |
| 4.4 as/asChild adoption | P1 | M | 1 |
| 4.5 spread-forwarding | P3 | 0 | docs |
| 5.1 Tabs compound | P1 | L | 3 |
| 5.2 Select/Combobox data-driven | P3 | 0 | docs |
| 5.3 Stepper/Wizard/PlanDisplay | P3 | 0 | docs |
| 5.4 Menu style split | P3 | 0 | docs |
| 6 zero-prop docgen | P3 | 0 | docs |

P0 count: 2 (both are API-level narrative gaps rather than crash bugs —
no runtime-crashing bug surfaced by this audit, which is itself a
healthy sign).
P1 count: 11.
P2 count: 13.
P3 count: 8.

**Headline finding (again):** the library has three incompatible
`variant` vocabularies and a four-way split on stateful-control
conventions. Every other deviation listed here is a refinement on top
of those two.
