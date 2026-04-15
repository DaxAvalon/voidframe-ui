# Feature-gap: Forms (22 findings)

> Biggest theme: the *component-level* surface is broad, but the
> *form-level* surface (root, provider, schema validation,
> async/server-error plumbing, field arrays, dirty/reset/autosave) is
> almost entirely missing — consumers coming from Mantine/RHF/Formik/Ant
> will feel the gap immediately. Second theme: Form.tsx primitives
> (`Input`/`Textarea`/`Select`) are too minimal — no prefix/suffix/
> clear/count/loading states that every benchmark library ships by
> default.

### 1. No root `Form` / `FormProvider` / `useForm` primitive
**Category:** Form
**Benchmark:** Radix `<Form.Root>`, Mantine `useForm`, Chakra `FormControl`, Ant `Form.useForm`, shadcn/react-hook-form integration.
**Gap:** There is no form-level state container, submit handler, validation runner, dirty/touched tracking, or `onValid`/`onInvalid` callbacks. Only `Field` (control-scoped context) and `Wizard` (step nav) exist.
**Where to add:** new `src/components/Form.tsx` root + hook; integrate into `Field.tsx`.
**Priority:** must-have

### 2. No schema-based validation adapter (zod/yup/valibot)
**Category:** Form / Validation
**Benchmark:** Mantine `zodResolver`, react-hook-form `@hookform/resolvers`, Ant `rules`.
**Gap:** `FormField.error` takes only a preformatted string; no resolver or per-field `rules` API. `Wizard.canAdvance` is a manual escape hatch.
**Where to add:** `FormAdvanced.tsx` (or new `FormValidation.tsx`).
**Priority:** must-have

### 3. No async / server-error plumbing
**Category:** Integration
**Benchmark:** react-hook-form `setError`, Mantine `form.setFieldError`.
**Gap:** No canonical way to surface 400-response errors at form or field level, no pending validation state, no `isValidating`, no `FormProvider.setErrors({...})`.
**Where to add:** new Form root hook; `Field` context already exposes `invalid` but not message plumbing.
**Priority:** must-have

### 4. `Input` / `Textarea` / `Select` have no slots for prefix, suffix, clear, or icons
**Category:** Input
**Benchmark:** Mantine `leftSection`/`rightSection`, Chakra `InputLeftElement`, Ant `prefix`/`suffix`/`allowClear`.
**Gap:** `InputGroup` exists in `FormStructure.tsx` but is wrapper-based; inline prefix/suffix/clear-button props are absent. Only `SearchInput` has `onClear`.
**Where to add:** `Form.tsx` Input/Textarea/Select.
**Priority:** must-have

### 5. No character counter / `maxLength` counter display
**Category:** Input
**Benchmark:** Ant `showCount`, MUI `FormHelperText`, Mantine `Textarea` with counter recipe.
**Gap:** Input/Textarea/MentionInput/RichTextEditor expose no `showCount`, `maxLength` indicator, or remaining-chars display.
**Where to add:** `Form.tsx`, `RichTextEditor.tsx`, `MarkdownEditor.tsx`.
**Priority:** nice-to-have

### 6. No debounced-change, composition (IME), or copyable helpers
**Category:** Input
**Benchmark:** Mantine `debounce` input hook, MUI `onCompositionEnd` guidance, Ant `Input.copyable`.
**Gap:** No `debounceMs`, no IME-safe `onChange` wrapper, no one-click copy button on read-only values.
**Where to add:** `Form.tsx`, plus a `useDebouncedValue` hook.
**Priority:** nice-to-have

### 7. `Select` (native) lacks disabled options, groups, placeholder, clear
**Category:** Select
**Benchmark:** Radix Select, Mantine `NativeSelect`, MUI `Select` with `OptionGroup`.
**Gap:** `Select` in `Form.tsx` only accepts flat `options` + required value. No `<optgroup>`, no disabled-option, no placeholder, no size/variant, no clearable.
**Where to add:** `Form.tsx`.
**Priority:** must-have

### 8. `Combobox` / `MultiSelect` lack async, virtualization, creatable tags, paste
**Category:** Select
**Benchmark:** react-select `async`/`createable`, Mantine `MultiSelect searchable creatable`, Ant `mode="tags"`.
**Gap:** No `loadOptions`, no `onSearchChange`, no virtualized list for 10k+ options, no creatable callback, no paste-to-split for multi, no grouped options with counts, no highlighting of matched substrings, no pinned-selected-on-top.
**Where to add:** `Combobox.tsx`.
**Priority:** must-have

### 9. `MultiSelect` tags cannot be individually removed via keyboard / `onTagRemove`
**Category:** Select
**Benchmark:** Mantine/Chakra tag chips with backspace-to-remove and per-chip X.
**Gap:** Only `value`/`onChange(string[])`. No `renderTag`, no `onTagRemove`, no backspace-removal contract documented.
**Where to add:** `Combobox.tsx`.
**Priority:** nice-to-have

### 10. `DatePicker` has no disabled-reason, keyboard shortcuts, multi-month, or time-zone
**Category:** Date
**Benchmark:** react-day-picker shortcuts, Mantine `DatePicker numberOfMonths`, Luxon/date-fns-tz support.
**Gap:** `DatePicker` has min/max/disabledDates but no reason tooltip, no `T`=today shortcut, no `numberOfMonths` (DateRangePicker has it but DatePicker doesn't), no timezone/IANA prop. `DateTimePicker` lacks tz entirely.
**Where to add:** `DatePicker.tsx`, `DateTimePicker.tsx`.
**Priority:** nice-to-have

### 11. `DateRangePicker` has presets but no comparison-range mode
**Category:** Date
**Benchmark:** Metabase / Linear / Ant `RangePicker` with "vs. previous period" toggle.
**Gap:** No comparison range, no "single input" display, no ISO-week preset, no mobile-optimized single-month fallback toggle beyond `numberOfMonths`.
**Where to add:** `DatePicker.tsx`.
**Priority:** nice-to-have

### 12. `FileUpload` lacks drag-and-drop visibility, paste, chunked upload, retry
**Category:** File
**Benchmark:** Uppy, react-dropzone, Mantine Dropzone, Ant `Upload` with `customRequest`+`resume`.
**Gap:** `upload` is a single `Promise<void>` per file — no chunking, no retry, no resume, no pause, no concurrency cap, no clipboard-paste handler. `DropZone` exists in FormExtended but is not wired to FileUpload's progress/error UI. No human-readable size/mime error messages exposed.
**Where to add:** `FileUpload.tsx`.
**Priority:** must-have

### 13. No image preview grid / reorder in `FileUpload`
**Category:** File
**Benchmark:** Ant `listType="picture-card"`, Uppy Dashboard.
**Gap:** `disableThumbnails` toggle exists but there's no grid layout, no reorder-by-drag, no per-item actions beyond remove.
**Where to add:** `FileUpload.tsx`.
**Priority:** nice-to-have

### 14. `RichTextEditor` / `MarkdownEditor` missing slash commands, find+replace, images, mentions, history
**Category:** Editor
**Benchmark:** Tiptap + BlockNote slash menu, Notion-style; ProseMirror history; CodeMirror search panel.
**Gap:** Toolbar is fixed-list commands only. No `/` command menu, no inline image upload, no embed blocks, no find+replace, no version-history/diff, no collaborative-cursor (yjs) hook, no `onSlashCommand`. No table support in toolbar list.
**Where to add:** `RichTextEditor.tsx`, `MarkdownEditor.tsx`.
**Priority:** nice-to-have

### 15. `CodeEditor` lacks theme prop, search, fold, bracket matching, language list
**Category:** Editor
**Benchmark:** Monaco, CodeMirror 6, Shiki.
**Gap:** `language` is freeform string, `highlight` is a user-provided function — no built-in themes, no `onFind`, no fold/minimap, no tabs-vs-spaces toggle (`tabSize` only), no `onSave` cmd+S.
**Where to add:** `CodeEditor.tsx`.
**Priority:** nice-to-have

### 16. No `NumberInput` features: format, locale, accounting sign, min/max of null (unbounded), fraction/scale
**Category:** Input
**Benchmark:** Mantine `NumberInput` (formatter/parser, clampBehavior, decimalScale, thousandSeparator, allowNegative), MUI `NumericFormat`.
**Gap:** `NumberInput` in FormExtended only has `min/max/step` (with enforced defaults 0/100). No `formatter/parser`, no thousand separators, no currency prefix, no clamp behavior, no "blank = null" semantics.
**Where to add:** `FormExtended.tsx`.
**Priority:** must-have

### 17. No field arrays / dynamic list helper, no conditional visibility helper
**Category:** Form
**Benchmark:** react-hook-form `useFieldArray`, Formik `FieldArray`, Mantine `form.insertListItem`.
**Gap:** No API for repeating groups ("Add another address"), no `when={(values)=>...}` conditional render, no dependent fields.
**Where to add:** new Form root hook alongside `FormAdvanced.tsx`.
**Priority:** must-have

### 18. No dirty / touched / reset tracking or unsaved-changes guard
**Category:** Form
**Benchmark:** react-hook-form `formState.isDirty`, react-router `useBlocker`, Mantine `form.isDirty()`.
**Gap:** No `isDirty`, no `reset(defaults)`, no navigation-blocker, no `defaultValues` wiring.
**Where to add:** new Form root hook.
**Priority:** must-have

### 19. `Field.Error` not auto-wired to `aria-describedby`, no error-summary, no focus-first-error on submit
**Category:** A11y
**Benchmark:** GOV.UK Design System error summary, Radix `Form.Message` with match.
**Gap:** Field context auto-wires `aria-invalid`/`aria-required`, but there's no `FormErrorSummary` component, no `focusFirstInvalid()` helper, no automatic aria-live announce on submit failure.
**Where to add:** `Field.tsx`, new `FormErrorSummary` in `FormAdvanced.tsx`.
**Priority:** must-have

### 20. Not every input composes inside `Field`
**Category:** Compound API
**Benchmark:** Radix Form / Chakra `FormControl` where any child input reads `id`/`aria-invalid` from context.
**Gap:** `FieldControl` relies on cloneElement but Combobox, MultiSelect, DatePicker, DateTimePicker, TimePicker, ColorPicker, FileUpload, SignaturePad, TreeSelect, RichTextEditor, CodeEditor, MarkdownEditor, RatingInput, MentionInput all take `label`/`id` themselves and don't document integration with `<Field>`. Inconsistent — some render their own label, others should defer.
**Where to add:** all of the above component files; standardize on Field consumption.
**Priority:** must-have

### 21. No `SignaturePad` undo/redo or typed-signature fallback; `ImageCropper` / `MaskedInput` lacking features
**Category:** Input
**Benchmark:** react-signature-canvas `undo`, DocuSign typed fallback; react-image-crop aspect presets; imask regex/alias masks.
**Gap:** `SignaturePad` emits dataUrl but exposes no `undo`, no `toSVG`, no typed-signature option. `MaskedInput` has only `mask` string — no regex tokens, no aliases (phone/date/currency), no `lazy` placeholder mode. `ImageCropper` (not read in depth) should be verified for aspect presets and output format selection.
**Where to add:** `SignaturePad.tsx`, `MaskedInput.tsx`, `ImageCropper.tsx`.
**Priority:** nice-to-have

### 22. No autosave-on-blur / optimistic-save pattern
**Category:** Integration
**Benchmark:** Linear / Notion autosave; Mantine `form.onValuesChange`.
**Gap:** No `onBlurSave`, no `autosave` hook, no saved/saving/error status indicator component.
**Where to add:** new Form hook + status component in `FormAdvanced.tsx`.
**Priority:** nice-to-have
