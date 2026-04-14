# 07 — Components: Forms & Inputs

**Goal:** Ship ~40 form and input components, each controlled/uncontrolled, fully typed, a11y-complete, with consistent API.

**Depends on:** all Track A phases (01-06).
**Unblocks:** Chat composer (Phase 12), specialty editors (Phase 13), docs forms.
**Effort:** 6-8 days.

## Conventions (apply to every input)

- **Controlled + uncontrolled:** `value` / `defaultValue` / `onChange` (or domain-specific: `checked` / `onCheckedChange`).
- **Sizes:** `xs` | `sm` | `md` | `lg` — `md` default.
- **Variants:** `default` | `ghost` | `solid` — `default` default.
- **Tones:** `neutral` | `success` | `danger` | `warning` — visual-only accent hint.
- **States:** `disabled`, `readOnly`, `required`, `invalid`, `loading`.
- **`asChild`** supported where compositional.
- **Wrapped in `<Field>`** for label + help + error composition.
- **`id` auto-generated** via `useId` if not provided.
- **Keyboard conventional** (see Phase 05).

---

## F01. Input (upgrade existing)

```tsx
<Input
  type="text" | "email" | "password" | "number" | "tel" | "url" | "search"
  value={value}
  onChange={(v: string) => setValue(v)}
  onChangeRaw={(e) => ...}       // escape hatch
  placeholder="..."
  size="md"
  leadingIcon={<SearchIcon />}
  trailingIcon={<XIcon />}
  clearable={boolean}
  prefix="$" | suffix=".com"
  loading={boolean}
  invalid={boolean}
  autoFocus
  disabled readOnly required
/>
```

- Native `<input>` under the hood; aria-invalid/aria-required/aria-describedby wired via `<Field>`.
- `clearable` renders an X button when value is non-empty.

## F02. Textarea (upgrade)

```tsx
<Textarea
  value, onChange, defaultValue
  rows={4}
  autoResize={boolean}           // grows with content, min=rows
  maxLength={number}
  showCount={boolean}            // "120 / 500"
  resizable="none" | "vertical" | "horizontal" | "both"
/>
```

- `autoResize` uses an offscreen mirror div to measure content height.
- `showCount` + `maxLength` renders a counter in the corner; turns red when ≥95%.

## F03. Select (upgrade — keep native baseline)

```tsx
<Select value, onChange, defaultValue options={[{value, label, disabled?}]} />
<Select><option value="a">A</option></Select>
```

- Uses native `<select>` (best a11y, best mobile).
- For a custom dropdown listbox, use `<Combobox>`.

## F04. Toggle (upgrade → `<Switch>` alias)

```tsx
<Toggle checked, onCheckedChange, defaultChecked label="Enable X" size="md" />
```

- `role="switch"`, `aria-checked`.

## F05. Checkbox (upgrade)

```tsx
<Checkbox checked, onCheckedChange, defaultChecked indeterminate={boolean} label />
```

- Tri-state supported.
- Custom check mark SVG; animated (Phase 06).

## F06. CheckboxGroup (new)

```tsx
<CheckboxGroup value={string[]} onChange defaultValue options={[{ value, label, disabled? }]} />
```

- Manages a set of checkboxes with shared state.

## F07. Radio / RadioGroup (upgrade)

```tsx
<RadioGroup value, onChange, defaultValue options={[{ value, label, description? }]} orientation="vertical" />
```

- Roving tabindex.
- Arrow keys navigate.

## F08. Slider (upgrade)

```tsx
<Slider
  value={number | [number, number]}   // single or range
  onChange, defaultValue
  min max step marks={[{ value, label? }]}
  orientation="horizontal" | "vertical"
  showValue={boolean | "always" | "hover"}
  formatValue={(v) => string}
/>
```

- Range variant for dual-handle.
- Keyboard: Arrow / PageUp-Down / Home-End.
- Optional tick marks and labels.

## F09. NumberInput (upgrade)

```tsx
<NumberInput
  value, onChange, defaultValue
  min max step precision
  prefix suffix
  hideControls={boolean}
  format={"decimal" | "currency" | "percent" | Intl.NumberFormatOptions}
  locale
/>
```

- Step buttons (up/down) — keyboard-accessible.
- Formatting respects locale.

## F10. SearchInput (upgrade)

```tsx
<SearchInput
  value, onChange
  placeholder
  debounce={number}               // debounce onChange emission
  onSearch={(query) => void}      // fires on debounced change + Enter
  shortcut="mod+k"                // keyboard shortcut to focus
  loading
/>
```

- Leading search icon; clear button; optional shortcut badge.

## F11. PasswordInput (new)

```tsx
<PasswordInput
  value, onChange
  visibilityToggle={boolean}
  strengthMeter={boolean}
  strengthRules={[{ label, test: (v) => boolean, weight? }]}
  onStrengthChange={(score: 0-4) => void}
/>
```

- Eye / eye-off toggle.
- Strength meter renders 4 segments; colors escalate green→amber→red based on score.

## F12. PinInput / OTPInput (new)

```tsx
<PinInput
  length={6}
  value, onChange, defaultValue
  type="numeric" | "alphanumeric" | "alpha"
  mask={boolean}
  autoFocus
  onComplete={(value) => void}
/>
```

- N separate boxes; auto-advance on type; backspace moves back.
- Pastes spread across boxes.
- Mobile: `inputMode="numeric"` and `autocomplete="one-time-code"` for SMS autofill.

## F13. TagInput / ChipsInput (new)

```tsx
<TagInput
  value: string[], onChange
  placeholder
  validate={(tag) => boolean | string}
  maxTags
  delimiters={[",", " ", "Enter"]}
  suggestions={string[]}
  renderTag={(tag, { remove }) => ReactNode}
/>
```

- Backspace on empty input removes last tag.
- Chips are removable via X button.
- Paste supports delimiter-split input.

## F14. MultiSelect (new)

```tsx
<MultiSelect
  value: Value[], onChange, defaultValue
  options={[{ value, label, group?, disabled? }]}
  searchable={boolean}
  creatable={boolean}             // allow entering new values
  maxSelected
  renderSelected={(item, { remove }) => ReactNode}
/>
```

- Chips in trigger for selected values.
- Dropdown with search input.
- Grouped options supported.

## F15. Combobox / Autocomplete (new)

```tsx
<Combobox<T>
  value: T | null, onChange
  items: T[]
  searchable
  itemToString={(item) => string}
  onInputValueChange={(input) => void}
  filter={(item, query) => boolean}    // default: case-insensitive substring
  renderItem={(item, { highlighted, selected }) => ReactNode}
  emptyState="No results"
  loading={boolean}
  virtualized={boolean}                // delegate to VirtualList for 1000+ items
  creatable={boolean}
/>
```

- Generic over item type.
- Async data: pass `items` + `loading`; parent debounces fetching.
- Portal-rendered dropdown with FloatingElement positioning.

## F16. TreeSelect (new)

```tsx
<TreeSelect
  value, onChange
  items={TreeNode[]}
  multiple={boolean}
  cascade={boolean}                    // selecting parent selects children
/>
```

- Combines `<Combobox>` style trigger with `<TreeView>` inside dropdown.

## F17. CurrencyInput (new)

```tsx
<CurrencyInput
  value: number, onChange
  currency="USD" | "EUR" | ...
  locale="en-US"
  precision={2}
  allowNegative={boolean}
  min max
/>
```

- Displays formatted (`$1,234.56`); emits numeric.
- Caret-aware editing (advanced — at minimum, format on blur).

## F18. PhoneInput (new)

```tsx
<PhoneInput
  value: string, onChange
  defaultCountry="US"
  onlyCountries={["US", "CA", "GB"]}
  preferred={["US", "CA"]}
  international={boolean}
/>
```

- Country selector dropdown + national number input.
- Formatting via `libphonenumber-js` (peer dep, not bundled).

## F19. MaskedInput (new)

```tsx
<MaskedInput
  value, onChange
  mask="(###) ###-####"                // or function
  placeholder="_"
/>
```

- Characters: `#` digit, `A` letter, `*` any, literal chars are fixed.

## F20. DatePicker (new)

```tsx
<DatePicker
  value: Date | null, onChange
  defaultValue
  min max disabledDates={(d) => boolean}
  placeholder
  format={"yyyy-MM-dd" | (d) => string}
  locale
  showWeekNumbers
  firstDayOfWeek={0 | 1}              // Sunday or Monday
  inline={boolean}                     // render calendar always open
/>
```

- Trigger is an `<Input>`.
- Popover contains month grid + prev/next nav + month/year dropdowns.
- Keyboard: full spec (Phase 05).

## F21. DateRangePicker (new)

```tsx
<DateRangePicker
  value: { start: Date | null; end: Date | null }, onChange
  presets={[{ label: "Last 7 days", range: () => [start, end] }]}
  numberOfMonths={2}
/>
```

- Dual-month view; click start then end.
- Preset side panel for common ranges.

## F22. TimePicker (new)

```tsx
<TimePicker
  value: string (24h "HH:mm"), onChange
  format="12h" | "24h"
  step={15}                           // minutes
  min max
  showSeconds
/>
```

- Hour/minute/AM-PM spinners or dropdowns.

## F23. DateTimePicker (new)

Composition of DatePicker + TimePicker in a single popover.

## F24. ColorPicker (new)

```tsx
<ColorPicker
  value: string, onChange                // hex
  format="hex" | "rgb" | "hsl"
  swatches={string[]}
  showAlpha={boolean}
  showEyeDropper={boolean}               // uses EyeDropper API if supported
/>
```

- HSV square + hue slider + alpha slider + swatches.
- Eye-dropper via `useEyeDropper` hook (where supported).

## F25. RatingInput (new)

```tsx
<RatingInput
  value: number, onChange
  max={5}
  allowHalf={boolean}
  readOnly={boolean}
  icon={<StarIcon />}
/>
```

- Star / bar / numeric variants.
- Keyboard: arrow keys step.

## F26. SignaturePad (new)

```tsx
<SignaturePad
  value: string | null (data URL), onChange
  width height
  strokeColor strokeWidth
  onBegin onEnd
/>
```

- Canvas-based; touch + pointer input.
- Clear button, undo last stroke.

## F27. FileUpload (new — replaces/extends DropZone)

```tsx
<FileUpload
  value: File[], onChange
  multiple accept maxSize maxFiles
  disabled
  onReject={(rejected: { file, reason }) => void}
  renderItem={(file, { remove }) => ReactNode}
  preview={boolean}                      // show image thumbnails
/>
```

- Dropzone + click-to-browse + file list.
- Preview thumbnails for images.
- Per-file remove.
- Optional per-file progress (driven externally).

## F28. ImageCropper (new)

```tsx
<ImageCropper
  src: string, onChange: (blob: Blob) => void
  aspect={1 | 16/9 | "free"}
  minZoom maxZoom
  circular={boolean}
/>
```

- Pan + zoom + crop area.
- Outputs cropped Blob on confirm.

## F29. RichTextEditor (new)

```tsx
<RichTextEditor
  value: string (HTML), onChange
  defaultValue
  toolbar={Array<ToolbarItem>}
  placeholder
  readOnly
  mentions={{ trigger: "@", items: [...], render: () => ... }}
  onPaste={(html) => html}               // sanitizer hook
/>
```

- Built on `@lexical/react` (peer dep) or `tiptap` — decision at implementation time.
- Voidframe ships the **toolbar + wrapper**, not the editor core.
- Default toolbar: Bold, Italic, Underline, Strike, Code, Link, H1-H3, UL/OL, Blockquote, Code block, Undo/Redo.

## F30. MarkdownEditor (new)

```tsx
<MarkdownEditor
  value: string, onChange
  preview={"live" | "split" | "hidden"}
  toolbar
  shortcuts
  uploadImage={(file) => Promise<string>}   // returns URL to insert
/>
```

- Plain textarea with syntax highlighting (via CodeEditor), markdown toolbar, live preview pane.

## F31. CodeEditor (new)

```tsx
<CodeEditor
  value, onChange
  language="javascript" | "typescript" | "python" | "json" | "yaml" | ...
  theme="void-dark"
  readOnly
  lineNumbers
  minimap
  onSave={(value) => void}               // Cmd+S
/>
```

- Wraps Monaco or CodeMirror 6 (peer dep; not bundled).
- Theme is our custom brutalist palette.

## F32. MentionInput (new)

```tsx
<MentionInput
  value, onChange
  triggers={[{ char: "@", items, render, onSelect }]}
  placeholder
/>
```

- Typing a trigger character opens a popover list.
- Arrow keys navigate, Enter inserts.
- Stores plain text with mention markers (e.g. `@[id]`).

## F33. SlashCommandInput (new)

Like MentionInput but triggered by `/` and oriented at commands. Used in chat composers and editors.

## F34. SegmentedControl (new)

```tsx
<SegmentedControl value, onChange options={[{ value, label, icon? }]} size />
```

- Horizontal group of toggle buttons; one active at a time.
- Roving tabindex.

## F35. Switch — alias of Toggle.

## F36. Field / FormField (upgrade)

```tsx
<Field>
  <Field.Label required>Email</Field.Label>
  <Field.Control>
    <Input type="email" />
  </Field.Control>
  <Field.Help>We'll never share your email.</Field.Help>
  <Field.Error>Required</Field.Error>
</Field>
```

- Compound component (Phase 02).
- Auto-wires `htmlFor`, `aria-describedby`, `aria-invalid`.

## F37. Form / useForm (new)

```tsx
const { values, errors, touched, register, handleSubmit, reset, setValue, setError } =
  useForm({ defaultValues, validate, onSubmit });

<Form onSubmit={handleSubmit}>
  <Field>
    <Field.Label>Name</Field.Label>
    <Input {...register("name")} />
    <Field.Error>{errors.name}</Field.Error>
  </Field>
  ...
</Form>
```

- Lightweight (no schema DSL). For schema-driven forms, document react-hook-form + zod integration.
- ~200 LOC. Not a replacement for RHF; a good default.

## F38. FormActions (new)

Layout helper: right-aligned footer for submit/cancel.

```tsx
<FormActions>
  <Button variant="ghost">Cancel</Button>
  <Button variant="solid" type="submit">Save</Button>
</FormActions>
```

## F39. InputGroup (new)

```tsx
<InputGroup>
  <InputGroup.Addon>https://</InputGroup.Addon>
  <Input placeholder="example.com" />
  <InputGroup.Addon>.dev</InputGroup.Addon>
</InputGroup>
```

- Visually joined inputs + addons.

## F40. FieldSet / Legend (new)

Native `<fieldset>` + `<legend>` wrapper with Voidframe styling. For grouped controls.

---

## API Consistency Checklist

Every component above:
- [ ] Forwards ref to its root element.
- [ ] Supports `className` and `style` override.
- [ ] Uses `useControllableState` if stateful.
- [ ] Uses `useId` if it needs to generate IDs.
- [ ] Fires dev warnings for invalid prop combos.
- [ ] Exposes `ComponentNameProps` interface.
- [ ] Ships with a unit test covering render + primary interaction.
- [ ] Ships with a11y audit passing axe.
- [ ] Has a CSS file at `src/css/components/[name].css`.
- [ ] Has a Storybook story (Phase 22).

## Acceptance Criteria

- [ ] All 40 components implemented.
- [ ] Demo app updated to showcase all.
- [ ] All pass axe audit.
- [ ] All keyboard-operable per Phase 05 spec.
- [ ] Bundle size check: form components total <30KB gzipped.
- [ ] No peer-dep bloat: RichTextEditor, CodeEditor, PhoneInput have peer deps documented (not bundled).
