# Parameter Standardization — Remediation Plan (plan 29)

Companion to `29-findings.md`. Closes every P0/P1 finding without
breaking existing consumers. Wave-2 contains the breaking clean-up
and is gated on a 2.0 release.

## Waves

| Wave | Breaking | Findings covered | Commits | Risk |
|------|----------|-------------------|---------|------|
| 1    | No       | 1.2 (45 comps), 1.4, 1.6, 2.1, 2.2, 3.2, 3.3a, 3.4, 3.5, 3.6, 4.1, 4.2, 4.4 | ~28 | Low–Med |
| 2    | Yes (2.0)| remove deprecated props from Wave 1                                  | ~20 | High, deferred |
| 3    | Internal | 3.3b Tabs compound, 5.1 Tabs.Panel/Tabs.Tab                           | ~3  | Med |

Acceptance gates: `tools/codemods/` is available (per plan footnote),
so codemods MAY be authored for 1.2 and 3.5 (the two mechanical
transforms with >10 call-site impact each).

## Acceptance criteria (applies to every Wave-1 commit)

1. The new-API prop lands with typed support in the component's Props
   interface AND routes through `useControllableState` where applicable.
2. Both old and new APIs have unit-test coverage (existing test stays
   green; new test asserts new API works equivalently).
3. `warnOnce("<Component>:<oldProp>-deprecated", …)` fires the first
   time the old prop is observed in dev mode.
4. JSDoc on the old prop adds `@deprecated Use {@link newProp} — scheduled
   for removal in 2.0.`.
5. Docs site examples switched to the new API; old API shown only in a
   migration callout.
6. CHANGELOG has a dedicated section under Unreleased.

## Wave 1 migration tables

### 1.2 `onChange` → `onValueChange` on non-form controls (45 components)

Codemod candidate: **yes** (mechanical rename in consumer code).

Pattern per component:
| Old | New | Deprecation | Migration window |
|-----|-----|-------------|------------------|
| `onChange: (v) => void` | `onValueChange: (v) => void` | `warnOnce("<Comp>:onChange-deprecated", ...)` | v1.x → remove in v2.0 |

Components covered (alphabetical):
ButtonGroup, Brush, Checkbox, CheckboxGroup, CodeEditor, ColorPicker,
Combobox, Composer, CronBuilder, CurrencyInput, DatePicker, DateRangePicker,
DateTimePicker, EnvironmentVars, FileUpload, KeyValueEditor, MarkdownEditor,
MentionInput, MessageEdit, MessageFeedback, ModelPicker, ModelSelector,
MultiSelect, NumberInput, Pagination, PinInput, QueryBuilder, Radio,
RadioGroup, RatingInput, ReorderList, RichTextEditor, SegmentedControl,
Select, ShortcutEditor, SignaturePad, Slider, Sortable, Switch,
SystemPromptEditor, TabBar, Tabs, TagInput, ThemeSelector, TimePicker,
TimeZoneSelect, Toggle, TreeSelect, Wizard.

Note: four components already expose both (MaskedInput, PhoneInput,
Textarea variants via Input family); they serve as the reference pattern.

### 1.4 ReactionPicker onReact(id) → onSelect(id)
| Old | New | Deprecation | Migration window |
|-----|-----|-------------|------------------|
| `onReact: (id: string) => void` | `onSelect: (id: string) => void` | warnOnce | 1.x → 2.0 |

### 1.6 onClose → onDismiss on Modal/Drawer/DebugPanel/ContextHelp
| Old | New | Deprecation | Migration window |
|-----|-----|-------------|------------------|
| `onClose: () => void` | `onDismiss: () => void` | warnOnce | 1.x → 2.0 |

### 2.1 `variant` vocabulary unification
Reference vocabulary (adopted as canonical): `"default" | "ghost" | "accent" | "solid"`.

| Component | Current | Canonical | Action |
|---|---|---|---|
| Badge | "solid" \| "outline" \| "subtle" | adopt ref set (keep old as aliases?) | Add new alias values in union; warnOnce when old used |
| ConfirmDialog/ConfirmDialogV2 | (none) | — | — |
| LiveIndicator | "typing" \| "recording" \| "active" \| "live" | `kind` | rename prop `variant` → `kind`; warnOnce on old |
| ConfidenceMeter | "bar" \| "gauge" \| "ring" \| "text-only" | `kind` | rename → `kind` |
| ChatModel ModelSelector/Compare "compact/detailed" | `density` | rename → `density` | warnOnce |
| ThemeSelector "segmented" \| "dropdown" | `kind` | rename → `kind` |
| NotificationCenter "dropdown" \| "drawer" | `kind` | rename → `kind` |
| Dialog "dialog" \| "alertdialog" | (internal; keep) | keep | no action |
| DiffViewer "unified" \| "split" | `kind` | rename → `kind` |
| FloatingActionButton "default" \| "accent" | canonical | keep as-is | already OK |

Rationale: where `variant` currently means "visual treatment" (Button,
Badge, CopyButton, SplitButton, ToggleGroup, FAB), keep the name and
unify on `default/ghost/accent/solid`. Where it means "which layout /
which pattern / which render mode" (LiveIndicator, ConfidenceMeter,
NotificationCenter, ThemeSelector, ModelSelector, DiffViewer), rename
the prop to `kind` or `density` per semantics. This frees `variant` to
have a single canonical meaning across the library.

### 2.2 `tone` minor drift
| Component | Current | New |
|---|---|---|
| Data.tsx ProgressTone (:364) | "neutral"\|"success"\|"danger"\|"warning" | add "info" |
| DevTools.tsx:29 | "default"\|"info"\|"success"\|"warning"\|"danger" | rename "default" → "neutral"; keep "default" as alias for one minor |
| Notifications.tsx:198 | "info"\|"success"\|"warning"\|"danger" | add "neutral" |

### 3.2 Add `defaultValue` to controllable inputs
Components: Input, Textarea, SearchInput, PasswordInput, NumberInput,
Select, Slider, ShortcutEditor, TabBar, Tabs, ModelPicker, MenuRadioGroup,
CheckboxGroup, Switch, Toggle.

Action: add `defaultValue?: T` to the typed Props interface. Route
through `useControllableState` (already imported in most cases).
Non-breaking.

### 3.3a Tabs: add `value` / `defaultValue` / `onValueChange`
(Wave-1 portion — keeps existing `active`/`onChange` as deprecated aliases.)

Migration table:
| Old | New |
|-----|-----|
| `active: string` (required) | `value?: string` + `defaultValue?: string` |
| `onChange(key)` | `onValueChange(key)` |
| `tabs: TabItem[]` | keep for Wave 1; compound added in Wave 3 |

### 3.4 Pagination `page` → `value`
| Old | New |
|-----|-----|
| `page: number` | `value?: number` + `defaultValue?: number` |
| `onChange(page)` | `onValueChange(page)` |
| `pageSize` | unchanged |

### 3.5 List editors: accept `value`/`defaultValue`/`onValueChange` alongside noun-named prop

Components: ReorderList, Sortable, FileUpload, EnvironmentVars,
KeyValueEditor, TreeView, Kanban.

| Component | Old noun | New alias |
|-----------|----------|-----------|
| ReorderList | `items: T[]` | `value?: T[]` + `defaultValue?: T[]` + `onValueChange?(next)` |
| Sortable | `items: T[]` | same |
| FileUpload | `items: UploadItem[]` | same |
| EnvironmentVars | `variables: EnvVar[]` | `value?: EnvVar[]` + `onValueChange?(next)` |
| KeyValueEditor | `items: KeyValuePair[]` | same |
| TreeView | `items: TreeNode[]` | same (plus existing `expanded`/`selected` state which stays) |
| Kanban | `columns` + `items` | compound surface, not mechanical — reschedule to Wave 3 |

### 3.6 Add typed `readOnly` to text inputs
Components: Input, Textarea, SearchInput, PasswordInput, NumberInput.
Action: add `readOnly?: boolean` to Props interface; already accepted via
HTML spread. Non-breaking.

### 4.1 DataGrid ref forwarding
Action: accept `rootRef?: Ref<HTMLDivElement>` in props; apply to root
element. (Avoids the generic-forwardRef gymnastics.) Non-breaking.

### 4.2 ReferenceLine / ReferenceBand: adopt `forwardRef<SVGGElement>`
Straightforward. Non-breaking.

### 4.4 `as` / `asChild` on flagship surfaces
Components to add `as?: ElementType` + `asChild?: boolean`: Button, Badge,
Card, Text, IconButton, NavItem, MenuItem, SessionListItem, Anchor,
Kbd, Tag.

Infrastructure: `src/primitives/Slot.tsx` already exists — just wire it
through. For each component, when `asChild` is true, render via `<Slot>`
merging the component's own event handlers with the child's via
`composeEventHandlers`. Non-breaking (default behavior unchanged).

## Wave 3 (internal refactors)

### 3.3b / 5.1 Tabs compound API

Introduce:
- `Tabs.List` — the `<div role="tablist">` container
- `Tabs.Tab` — each `<button role="tab">`
- `Tabs.Panel` — each `<section role="tabpanel">`

Runtime pattern: follow Menu.tsx:503 (direct assignment) or Dialog.tsx:421
(`Object.assign`). Either style is CANON; pick one and apply to Tabs.

Keep the existing `tabs: TabItem[]` API as a shorthand — Tabs with the
shorthand internally renders `<Tabs.List>` + mapped `<Tabs.Tab>`s.

## Codemods

Two candidates justified by call-site count:
1. **`onChange → onValueChange`** for the 45 components in Wave 1 §1.2.
   Scope: rename only, with AST guard (don't rename `onChange` on
   `<input>`/`<textarea>`/Input/Textarea/SearchInput/PasswordInput).
2. **`<ListEditor items=... />` → `<ListEditor value=... />`** for Wave
   1 §3.5. Scope: for the five list-editor components, rename the
   named-prop noun to `value` and `onChange` callback to
   `onValueChange` in JSX spread, again only when the callee is
   recognised.

Both are reasonable uses of `tools/codemods/`.

## Acceptance criteria — global

Remediation is "done" when:

1. Every P0/P1 finding from `29-findings.md` has a Wave-1 commit that
   lands the new-API prop with tests covering both old + new shapes.
2. Migration notes are written for every P0/P1 item (this file + per-
   commit CHANGELOG entry).
3. `warnOnce` fires exactly once per unique old-API usage in dev mode
   (existing `warnOnce` util already supports this).
4. Docs show the new API as primary on each component page; old API
   documented under a "Deprecated API" expandable callout.
5. CHANGELOG under Unreleased has a dedicated "Parameter Standardization
   (plan 29)" heading enumerating all changes by component.
6. `tools/codemods/onchange-to-onvaluechange.mjs` and
   `tools/codemods/list-editor-value.mjs` ship alongside the warnings,
   so that external consumers have a two-line migration path.

## Wave-2 criteria (future major)

1. `warnOnce` telemetry (if collected) shows <1% of usages still on old
   API in the last two releases.
2. All internal demo and docs call-sites on new API (baked into step 4
   of Wave 1).
3. Remove all `@deprecated` props and their back-compat wiring in one
   release with a clear CHANGELOG breaking-change block.
