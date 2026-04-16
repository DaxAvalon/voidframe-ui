# Audit 28 — API Consistency

## High

1. **onValueChange incomplete** — Phase 33 added `onValueChange` to Input/Textarea but NOT to SearchInput, PasswordInput, MaskedInput, CurrencyInput, PhoneInput. These still use raw `onChange` with event objects or inconsistent value callbacks.

2. **readOnly not standardized** — Only RatingInput has `readOnly?: boolean`. Missing from Input, Textarea, Checkbox, Radio, Select, Combobox, and all other form controls.

## Medium

3. **Compound pattern inconsistency** — Dialog, Menu, PopoverV2, DrawerV2, Accordion, Sheet use dot notation (Dialog.Trigger, Dialog.Content). Tabs uses flat prop-based API (`tabs: TabItem[]`). Modal vs Dialog creates confusion.

4. **variant vs tone naming** — Badge uses both `variant` (solid/outline/subtle) AND `tone` (success/warning/danger). Alert uses `tone`. Progress uses `variant` for shape type. No documented convention.

## Verified Consistent

- **Size props**: All components use `"sm" | "md" | "lg"` (some extend to `"xl" | "full"`)
- **Controlled/uncontrolled**: Proper `value`/`defaultValue` + `useControllableState` everywhere
- **className/style**: All components accept both
- **forwardRef**: All components use forwardRef properly
- **displayName**: All components have displayName set
- **"use client"**: 103/103 component files have directive
- **Type exports**: All follow `{ComponentName}Props` convention
- **Children patterns**: Semantically appropriate (containers accept children, inputs don't)
