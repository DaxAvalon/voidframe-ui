# Forms bucket — audit findings

Signal-first functionality audit per plan 31 / Task 2 (5-point check:
prop-liveness, controlled/uncontrolled contract, state-transition rendering,
callback signatures, test coverage).

Scope: 49 entries in `forms` key of `plans/audits/31-component-index.json`
(`Field.Error`, `Field.Help`, `Field.Label`, `FieldControl`, `FieldSet`,
`Form`, and `InputGroup.Addon` are 0-prop and are audited as roster-only).

## Severity counts

| Severity | Count |
| -------- | ----- |
| P0       | 3     |
| P1       | 3     |
| P2       | 4     |
| P3       | 0     |
| **Total**| **10**|

---

## Per-component findings

### CronBuilder — `src/components/CronBuilder.tsx`

- **P0 — declared `fields` prop is dead.**
  The destructured name is `_fields` and is never consulted. The visual
  builder hard-codes 5 fields via `FIELD_NAMES`/`FIELD_RANGES`; the raw
  validator (`isValidCron`) accepts 5 or 6 tokens, but `buildField` can only
  synthesise 5. Passing `fields={6}` has no effect on rendering, parsing, or
  output. `src/components/CronBuilder.tsx:177` (declaration line 24, usage
  line 177, `FIELD_NAMES.map` at line 196 / 230).

### FilterBuilder — `src/components/FilterBuilder.tsx`

- **P0 — `between` operator shape is broken.**
  The `FilterOperator` union lists `"between"` and it is offered for
  `number`/`date` fields (`src/components/FilterBuilder.tsx:49-50`), but
  `renderValueInput` treats every non-empty operator as a single scalar
  input (`src/components/FilterBuilder.tsx:180-196`). A user can select
  “Between” but can only supply one bound, so the rule emitted to
  `onValueChange` cannot represent a range. No second input, no
  tuple/array value, no handling in the `is_empty`/`is_not_empty`
  short-circuit.

### MentionInput / SlashCommandInput — `src/components/MentionInput.tsx`

- **P0 — `SlashCommandOption.action` shape is a lie.**
  The declared argument is `{ text: string; triggerIndex: number; caret:
  number }` (`src/components/MentionInput.tsx:304`), but the wrapper always
  invokes it with `{ text: "", triggerIndex: 0, caret: 0 }`
  (`src/components/MentionInput.tsx:334`). Every declared field is a
  constant zero/empty string, so consumers that rely on the shape to
  splice text, reposition the caret, or know which trigger fired cannot do
  so.
- **P2 — Empty `insertToken:false` command still inserts a trailing
  space.**
  `insertMention` always concatenates `mentionText + " "`
  (`src/components/MentionInput.tsx:189`). With `SlashCommandInput` +
  `insertToken:false`, `mentionText` is `""`, so selection leaves a stray
  leading space at the former trigger index.

### Combobox — `src/components/Combobox.tsx`

- **P2 — `ComboboxOption.group` is dead code.**
  Declared on the option type (`src/components/Combobox.tsx:40`) and
  documented as “adjacent options with the same group are rendered
  together”, but neither `Combobox` nor `MultiSelect` ever reads
  `option.group`; all options render into a flat `<ul>`
  (`src/components/Combobox.tsx:260-291`, `src/components/Combobox.tsx:495-524`).

### FileUpload — `src/components/FileUpload.tsx`

- **P2 — `UploadStatus = "removed"` is unreachable.**
  The status union exports `"removed"` (`src/components/FileUpload.tsx:31`)
  and the add-path filters on it (`src/components/FileUpload.tsx:214`), but
  `removeItem` deletes the item outright
  (`src/components/FileUpload.tsx:260-262`). No code path ever writes a
  `"removed"` item back into state, so the status is dead for consumers
  subscribing via `onChange`.

### TagInput — `src/components/FormAdvanced.tsx`

- **P2 — `validate` returning a string is documented as a dev warning but
  silently rejects.**
  JSDoc promises: “Return `true` to accept, `false` (or a string) to
  reject. Strings surface as dev warnings.”
  (`src/components/FormAdvanced.tsx:501-502`). Both the single-tag commit
  path (`src/components/FormAdvanced.tsx:542-543`) and the paste path
  (`src/components/FormAdvanced.tsx:578-581`) bail on
  `result === false || typeof result === "string"` without ever calling
  `warn`/`warnOnce`. The string reason is discarded.

### Checkbox — `src/components/FormExtended.tsx`

- **P1 — `disabled` is only partially wired.**
  `data-disabled` and click-guard fire
  (`src/components/FormExtended.tsx:54-55`), but the root keeps
  `tabIndex={0}` and exposes no `aria-disabled`; the keyboard handler only
  no-ops when `disabled` is set
  (`src/components/FormExtended.tsx:40-45`). Disabled checkboxes still sit
  in the tab sequence and report no accessible disabled state. (Contrast
  with the core-bucket Toggle, which also omits the ARIA attr — but here
  the declared prop is documented on the checkbox itself.)

### Radio — `src/components/FormExtended.tsx`

- **P1 — `disabled` same as Checkbox.**
  `data-disabled` + click guard (`src/components/FormExtended.tsx:100-101`)
  but `tabIndex={0}` stays and no `aria-disabled` is emitted
  (`src/components/FormExtended.tsx:104-105`). Keyboard handler no-ops
  only inside its own switch (`src/components/FormExtended.tsx:86-91`).

### ColorSwatch — `src/components/ColorTools.tsx`

- **P1 — `disabled` is coupled to absence of `onSelect`.**
  The button’s `disabled` attribute is literally `!onSelect`
  (`src/components/ColorTools.tsx:60-61`). A consumer who passes an
  `onSelect` handler has no way to render a disabled swatch; a
  display-only swatch (no handler) is always rendered as disabled. There
  is no explicit `disabled` prop declared, but this undocumented coupling
  is observable and surprising.

---

## Zero-finding roster (audited, no findings)

Single-file picks (prop count in parens):

- `DatePicker` (17) — `src/components/DatePicker.tsx`
- `DateRangePicker` (13) — `src/components/DatePicker.tsx`
- `PasswordInput` (13) — `src/components/FormAdvanced.tsx`
- `CommandInput` (12) — `src/components/CommandInput.tsx`
- `NumberStepper` (12) — `src/components/NumberStepper.tsx`
- `SignaturePad` (12) — `src/components/SignaturePad.tsx`
- `TimePicker` (11) — `src/components/TimePicker.tsx`
- `MultiSelect` (11) — `src/components/Combobox.tsx`
- `Cascader` (10) — `src/components/Cascader.tsx`
- `RatingInput` (10) — `src/components/RatingInput.tsx`
- `TreeSelect` (10) — `src/components/TreeSelect.tsx`
- `PinInput` (10) — `src/components/FormAdvanced.tsx`
- `ColorContrast` (9) — `src/components/ColorContrast.tsx`
- `CurrencyInput` (9) — `src/components/MaskedInput.tsx`
- `DateTimePicker` (9) — `src/components/DateTimePicker.tsx`
- `ColorPicker` (8) — `src/components/ColorPicker.tsx`
- `FileAttachment` (8) — `src/components/ChatAttachments.tsx`
- `CheckboxGroup` (7) — `src/components/FormAdvanced.tsx`
- `CurrencyDisplay` (7) — `src/components/Numeric.tsx`
- `Input` (7) — `src/components/Form.tsx`
- `PhoneInput` (7) — `src/components/MaskedInput.tsx`
- `RadioGroup` (7) — `src/components/FormExtended.tsx`
- `SearchInput` (7) — `src/components/FormExtended.tsx`
- `MaskedInput` (6) — `src/components/MaskedInput.tsx`
- `SegmentedControl` (6) — `src/components/FormAdvanced.tsx`
- `Switch` (6) — `src/components/FormAdvanced.tsx` (Toggle alias)
- `TimeZoneSelect` (6) — `src/components/TimeDisplays.tsx`
- `Select` (5) — `src/components/Form.tsx`
- `Textarea` (5) — `src/components/Form.tsx`
- `Field` (4) — `src/components/Field.tsx`
- `FormField` (4) — `src/components/FormExtended.tsx`
- `Mention` (4) — `src/components/ChatComposer.tsx`
- `Label` (3) — `src/components/Text.tsx`
- `Timeline` (2) — `src/components/DataExtended.tsx`
- `FormActions` (1) — `src/components/FormStructure.tsx`
- `FormErrorSummary` (1) — `src/components/FormProvider.tsx`
- `Field.Error` (0) — `src/components/Field.tsx`
- `Field.Help` (0) — `src/components/Field.tsx`
- `Field.Label` (0) — `src/components/Field.tsx`
- `FieldControl` (0) — `src/components/Field.tsx`
- `FieldSet` (0) — `src/components/FormStructure.tsx`
- `Form` (0) — `src/components/FormProvider.tsx`
- `InputGroup.Addon` (0) — `src/components/FormStructure.tsx`
- `NumberInput` (7) — `src/components/FormExtended.tsx`

Controlled/uncontrolled contract: every component in the bucket that
exposes both `value` and `defaultValue` routes through `useControllableState`
(grep-confirmed 17 call sites across the bucket). `DatePicker`,
`DateRangePicker`, `FileUpload`, and `TimeZoneSelect` use bespoke
`isControlled = value !== undefined` variants; each preserves the
“controlled stays controlled” invariant and fires the paired `onChange`
even when the internal state is not updated.

Test coverage roster: every forms component has at least one dedicated
test file in `src/components/__tests__/` except as noted under “components
I couldn’t fully audit” below.

---

## Components I couldn’t fully audit

- **`DateTimePicker`** — no dedicated test file
  (`src/components/__tests__/DateTimePicker.test.tsx` does not exist). A
  single smoke reference appears inside `TimePicker.test.tsx` but nothing
  exercises the date/time interaction path. Functional audit of the
  component itself was completed; coverage is **P3-worthy** but out of
  this bucket’s rubric.
- **Numeric `CurrencyDisplay`** — no dedicated test file; covered
  incidentally by `Specialty.test.tsx`. Audit of the component itself
  found no issues.
- **`ColorTools` (`ColorSwatch`, `Palette`)** — no dedicated test file;
  covered incidentally by `Specialty.test.tsx`.

No components in the forms bucket were fully unreachable — every file in
the index exists on disk and every declared export is exercised by at
least one public entry point.

---

## Methodology notes

1. **Prop-liveness** — for each component, read the declared prop
   interface, then grep for each name inside the same function body.
   Flagged when a destructured name is renamed to `_xxx` (CronBuilder) or
   when the declared name is only referenced by the type, not by
   rendering / handler code (Combobox `group`).
2. **Controlled/uncontrolled** — grepped for `useControllableState` and
   manually read the 4 bespoke controllers (DatePicker family, FileUpload,
   TimeZoneSelect) to confirm they invoke `onChange?.(next)` before or
   after the internal setter and never swap between modes without a
   component-name warning. Clean across the bucket.
3. **State transitions** — focused on `disabled`, `readOnly`, `loading`,
   `error`. The Checkbox/Radio/ColorSwatch findings come from tabIndex
   staying `0` and `aria-disabled` being omitted while `data-disabled`
   flips. `readOnly` was correctly wired everywhere it is declared
   (PasswordInput, SearchInput, RatingInput, NumberStepper).
4. **Callback signatures** — walked every `on*` prop to the call-site and
   verified the literal argument shape. The MentionInput/SlashCommandInput
   P0 is the only concrete signature mismatch. All other bucket
   callbacks fire their declared shape faithfully.
5. **Tests** — `ls src/components/__tests__ | grep -i <Name>` per entry;
   the three noted components rely on cross-cutting tests
   (`Specialty.test.tsx`) rather than dedicated files. No bucket member
   has zero test coverage.

Source never modified. No package installs, no network fetches. Tools
used: Read, Grep, Bash (`ls` only), Write.
