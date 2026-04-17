# Voidframe API Conventions

Design rules for consistent component APIs across the library.

## Prop Naming

### Event handlers

- **`onValueChange: (value: T) => void`** — the primary value-emit
  callback on all form controls. Emits the clean value, not a DOM event.
- **`onChange: (e: ChangeEvent) => void`** — secondary, raw event handler
  kept for backward compat on native-wrapping components (Input, Textarea,
  SearchInput, PasswordInput). Prefer `onValueChange` in new code.
- **`onXChange`** — compound-specific: `onSortChange`, `onFiltersChange`,
  `onSelectionChange`, `onLayoutChange`. Named after the state they emit.

### State props

| Controlled | Uncontrolled | Callback |
|-----------|-------------|----------|
| `value` | `defaultValue` | `onValueChange` |
| `checked` | `defaultChecked` | `onChange(boolean)` |
| `open` | `defaultOpen` | `onOpenChange` |
| `selected` | `defaultSelected` | `onSelectionChange` |

All stateful components use the `useControllableState` hook internally.

### Variant vs Tone

- **`variant`** describes the visual style shape: `"default"`, `"ghost"`,
  `"accent"`, `"solid"`, `"outline"`, `"subtle"`.
- **`tone`** describes the semantic meaning: `"success"`, `"warning"`,
  `"danger"`, `"info"`, `"neutral"`.

Both can be used on the same component (e.g. `<Badge variant="solid"
tone="danger">`). `variant` controls the rendering (filled vs outlined),
`tone` controls the color.

### Size

All size-aware components use `"sm" | "md" | "lg"`. Extended sizes
(`"xs"`, `"xl"`, `"full"`) are component-specific:

- Dialog, Sheet: `"sm" | "md" | "lg" | "xl" | "full"`
- Icon: `"xs" | "sm" | "md" | "lg" | "xl" | "xxl"`

### Boolean props

| Prop | Meaning |
|------|---------|
| `disabled` | Grayed out, no interaction, not focusable |
| `readOnly` | Value visible, focusable, but cannot be changed |
| `loading` | Shows spinner/skeleton, may disable interaction |

## Compound Components

### Dot notation (Radix pattern)

Used for multi-part components where sub-parts are meaningless outside
the parent context:

```tsx
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm</Dialog.Title>
    <Dialog.Description>Are you sure?</Dialog.Description>
    <Dialog.Close>Cancel</Dialog.Close>
  </Dialog.Content>
</Dialog>
```

Components using this pattern: `Dialog`, `Menu`, `PopoverV2`, `DrawerV2`,
`Sheet`, `Accordion`, `Field`.

### Flat exports

Used for standalone components or those with a simple props-driven API:

```tsx
<Tabs tabs={[{ key: "a", label: "Tab A", content: <p>A</p> }]} />
```

Components using this pattern: `Tabs`, `Button`, `Badge`, `Card`,
`DataGrid`, `Table`, `Select`, `Combobox`.

### When to use which

- Dot notation when the component has 2+ sub-parts that need shared context
  (trigger/content pairs, header/body/footer slots).
- Flat exports when the API is primarily props-driven and children are
  opaque ReactNode.

## Type Exports

Every component exports its props type as `{ComponentName}Props`:

```ts
export interface ButtonProps { ... }
export interface DataGridProps<T> { ... }
```

Variant/size/tone union types are also exported:

```ts
export type ButtonVariant = "default" | "ghost" | "accent" | "solid";
export type ButtonSize = "sm" | "md" | "lg";
```

## Universal Props

Every component accepts:
- `className?: string`
- `style?: CSSProperties`
- `ref` (via `forwardRef`)

Every component has:
- `displayName` set
- `"use client"` directive
