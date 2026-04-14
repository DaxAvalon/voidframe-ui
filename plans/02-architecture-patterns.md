# 02 — Architecture Patterns

**Goal:** Establish the composition patterns, ref forwarding, controllable state, and dev-mode safety net that every component will use. Without this phase, Voidframe stays a toy; with it, Voidframe becomes a real framework.

**Depends on:** 01 TypeScript.
**Unblocks:** 03 Primitives, 04 CSS, all component phases.
**Effort:** 2-3 days.

## Deliverables

- `forwardRef` on every interactive component.
- Polymorphic `as` prop on every layout/text component (optional, default is sensible).
- `asChild` / Slot pattern (Radix-style) for composition without extra DOM.
- `useControllableState` hook for controlled/uncontrolled duality.
- `useMergedRefs` for combining forwarded + internal refs.
- Compound component pattern documented and applied (Card, Tabs, Menu, etc.).
- Dev-mode warnings for invalid prop combos, missing context, missing a11y attributes.
- `useId` for SSR-safe ID generation.
- `useIsomorphicLayoutEffect` to avoid SSR warnings.
- A `createContext` wrapper that enforces provider presence.

---

## 1. Ref Forwarding (mandatory)

**Every component that renders a DOM element forwards its ref.** No exceptions.

```tsx
import { forwardRef } from "react";

export interface ButtonProps extends BaseProps { /* ... */ }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "default", children, ...rest }, ref) {
    return <button ref={ref} {...rest}>{children}</button>;
  }
);
```

### Rules
- The forwarded type matches the rendered element (`HTMLButtonElement`, `HTMLDivElement`, etc.).
- Components that render nothing (pure logic — `VisuallyHidden`, etc.) are exceptions and documented.
- Generic components use `forwardRef` with a typed wrapper — see "Generic forwardRef" below.
- Named function expressions (`function Button(...)`) preserve the component name in DevTools.

### Generic forwardRef helper (`src/utils/forwardRef.ts`)

```tsx
// Preserves generics across forwardRef
export function genericForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
): (props: P & { ref?: React.Ref<T> }) => React.ReactElement | null {
  return forwardRef(render) as any;
}
```

Used for `Table<T>`, `Combobox<T>`, `DataGrid<T>`, etc.

---

## 2. Polymorphic `as` Prop

Layout and text components accept `as` to render as a different element or component. Default is preserved for ergonomics.

```tsx
<Flex as="section">...</Flex>
<Text as="h1" size="xl">Title</Text>
<Button as="a" href="/">Home</Button>  // renders <a> with button styling
```

### Implementation (`src/utils/polymorphic.ts`)

```tsx
export type AsProp<C extends React.ElementType> = { as?: C };

export type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"];
```

### Usage

```tsx
type FlexProps<C extends React.ElementType = "div"> =
  PolymorphicComponentPropsWithRef<C, { gap?: number; direction?: "row" | "column" }>;

type FlexComponent = <C extends React.ElementType = "div">(
  props: FlexProps<C>
) => React.ReactElement | null;

export const Flex: FlexComponent = forwardRef(function Flex<C extends React.ElementType = "div">(
  { as, gap, direction, children, ...rest }: FlexProps<C>,
  ref: PolymorphicRef<C>
) {
  const Component = as || "div";
  return <Component ref={ref} style={{ display: "flex", gap, flexDirection: direction }} {...rest}>
    {children}
  </Component>;
}) as any;
```

### Where to apply
- **Always polymorphic:** `Box`, `Flex`, `Grid`, `Stack`, `HStack`, `VStack`, `Container`, `Center`, `Text`, `Heading`, `Label`.
- **Optionally polymorphic:** `Button` (for `<a>` button-styled links), `Card` (for `<article>`, `<section>`).
- **Never polymorphic:** `Input`, `Textarea`, `Select`, `Modal`, `Drawer` — their semantic element is load-bearing.

---

## 3. Slot / `asChild` Pattern

Radix-style composition: instead of wrapping, merge props onto a single child element.

```tsx
// Without asChild — extra <button> wrapper around <Link>
<Button><Link to="/">Home</Link></Button>

// With asChild — Button merges its props onto <Link>, no wrapper
<Button asChild>
  <Link to="/">Home</Link>
</Button>
```

### Implementation (`src/primitives/Slot.tsx`)

```tsx
import { Children, cloneElement, forwardRef, isValidElement } from "react";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  forwardedRef
) {
  if (!isValidElement(children)) return null;
  const child = Children.only(children) as React.ReactElement;
  return cloneElement(child, {
    ...mergeProps(slotProps, child.props),
    ref: mergeRefs([forwardedRef, (child as any).ref]),
  });
});

function mergeProps(slotProps: any, childProps: any) {
  const merged: any = { ...childProps };
  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key)) {
      merged[key] = (...args: any[]) => {
        childValue?.(...args);
        slotValue?.(...args);
      };
    } else if (key === "style") {
      merged.style = { ...slotValue, ...childValue };
    } else if (key === "className") {
      merged.className = [slotValue, childValue].filter(Boolean).join(" ");
    } else if (slotValue !== undefined) {
      merged[key] = slotValue;
    }
  }
  return merged;
}
```

### Rules
- Components that opt into `asChild` accept an `asChild?: boolean` prop.
- When `asChild`, the component **must** render exactly one child element.
- Event handlers merge (both the component's and the child's fire).
- `style` and `className` merge.
- Refs merge via `useMergedRefs`.
- Dev-mode warns if `asChild` is set but children is not a single valid element.

### Where to apply
- Button, Link, Card, Badge, MenuItem, any trigger (TooltipTrigger, DropdownTrigger, PopoverTrigger).
- Any component whose sole purpose is "give this child these styles/props".

---

## 4. `useControllableState` (controlled/uncontrolled duality)

Most stateful components must support **both** controlled and uncontrolled usage. This is a tier-1 expectation.

```tsx
// Uncontrolled — component owns state, parent observes via onChange
<Toggle defaultChecked onCheckedChange={console.log} />

// Controlled — parent owns state
<Toggle checked={checked} onCheckedChange={setChecked} />
```

### Implementation (`src/hooks/useControllableState.ts`)

```tsx
import { useCallback, useRef, useState } from "react";

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue as T);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled]
  );

  return [current, setValue];
}
```

### Rules
- Every component that holds state exposes `value`/`onChange` (controlled) **and** `defaultValue` (uncontrolled).
- Toggle exposes `checked` / `defaultChecked` / `onCheckedChange` (boolean convention).
- Input exposes `value` / `defaultValue` / `onChange`.
- Tabs exposes `value` / `defaultValue` / `onChange`.
- Dev-mode warns on controlled → uncontrolled switch (or vice-versa) mid-lifecycle.

---

## 5. `useMergedRefs`

```tsx
// src/hooks/useMergedRefs.ts
export function useMergedRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return useCallback((node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  }, refs); // eslint-disable-line react-hooks/exhaustive-deps
}
```

Used anywhere a component has an internal ref AND forwards a ref AND (optionally) merges a child's ref.

---

## 6. Compound Component Pattern

For complex components with multiple moving parts, expose a namespace.

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Actions><Button>OK</Button></Card.Actions>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>

<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="detail">Detail</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview">...</Tabs.Panel>
  <Tabs.Panel value="detail">...</Tabs.Panel>
</Tabs>
```

### Rules
- Subcomponents are attached to the parent via `Card.Header = CardHeader;` pattern.
- Each subcomponent is **also exported standalone** for tree-shaking: `export { CardHeader, CardTitle, ... }`.
- Shared state flows via an internal context (`CardContext`, `TabsContext`).
- Context is created via the `createSafeContext` helper (below).

### Components using compound pattern
- `Card` (Card.Header, Card.Title, Card.Body, Card.Footer, Card.Actions)
- `Tabs` (Tabs.List, Tabs.Trigger, Tabs.Panel)
- `Accordion` (Accordion.Item, Accordion.Trigger, Accordion.Content)
- `Menu` (Menu.Root, Menu.Trigger, Menu.Content, Menu.Item, Menu.Separator, Menu.Sub)
- `Modal` (Modal.Root, Modal.Trigger, Modal.Content, Modal.Header, Modal.Body, Modal.Footer, Modal.Close)
- `Dropdown` (Dropdown.Trigger, Dropdown.Content, Dropdown.Item)
- `Table` (Table.Header, Table.Row, Table.Cell, Table.HeaderCell)
- `DataGrid` (same pattern + Toolbar, FilterBar)
- `Form` (Form.Field, Form.Label, Form.Control, Form.Help, Form.Error)
- `Command` (Command.Input, Command.List, Command.Group, Command.Item)
- `Toolbar` (Toolbar.Button, Toolbar.Separator, Toolbar.ToggleGroup)

---

## 7. `createSafeContext` (context with provider guard)

```tsx
// src/utils/createSafeContext.ts
export function createSafeContext<T>(name: string) {
  const Context = React.createContext<T | null>(null);
  Context.displayName = name;
  function useContext(component: string): T {
    const ctx = React.useContext(Context);
    if (ctx === null) {
      throw new Error(`<${component}> must be used within <${name}>.`);
    }
    return ctx;
  }
  return [Context.Provider, useContext] as const;
}

// Usage:
const [TabsProvider, useTabsContext] = createSafeContext<TabsState>("Tabs");
```

Guarantees a clear error when a subcomponent is used outside its parent, rather than a confusing `null` crash.

---

## 8. `useId` (SSR-safe IDs)

React 18+ ships `useId`; we re-export it with a prefix convention.

```tsx
// src/hooks/useId.ts
import { useId as reactUseId } from "react";

export function useId(providedId?: string, prefix = "vf"): string {
  const generatedId = reactUseId();
  return providedId ?? `${prefix}-${generatedId}`;
}
```

Every component that needs to link `aria-labelledby`, `aria-describedby`, or `<label htmlFor>` uses this.

---

## 9. `useIsomorphicLayoutEffect`

```tsx
// src/hooks/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

Use in any hook that measures DOM (positioning, scroll) to avoid SSR "useLayoutEffect does nothing" warnings.

---

## 10. Dev-Mode Warnings

Voidframe should tell developers when they're using it wrong — clearly, in dev, never in production.

### Pattern (`src/utils/warn.ts`)

```tsx
export function warn(condition: boolean, message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== "production" && !condition) {
    console.warn(`[voidframe] ${message}`, ...args);
  }
}

export function warnOnce(key: string, message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== "production" && !seen.has(key)) {
    seen.add(key);
    console.warn(`[voidframe] ${message}`, ...args);
  }
}
const seen = new Set<string>();
```

### What to warn about
- **Controlled↔uncontrolled switch**: `useControllableState` detects a prop going from defined → undefined.
- **Missing provider**: `createSafeContext` throws; context consumers outside provider.
- **Invalid prop combos**: e.g. `<Input type="number" pattern="..."/>` (nonsensical), `<Toggle disabled checked={true} onCheckedChange={cb}/>` (onCheckedChange won't fire).
- **Missing a11y**: `<IconButton>` without `aria-label`; `<Input>` without a label or `aria-label`.
- **Missing keys**: when iterating via props (column defs, menu items), warn on duplicates.
- **Deprecated props**: document the replacement, set deprecation date.
- **`asChild` misuse**: `asChild` with 0 or 2+ children, or non-element child.
- **Unexpected size/variant values**: e.g. `size="xxxl"`.
- **Conflicting props**: `defaultValue` + `value`, `defaultChecked` + `checked`.

### Rule
Every warning includes a link to the docs section for that component:
```
[voidframe] <IconButton> requires an aria-label. See: https://voidframe.dev/docs/iconography#a11y
```

---

## 11. `displayName` on Everything

```tsx
Button.displayName = "Button";
Card.Header.displayName = "Card.Header";
```

Rule: every exported component (including compound subcomponents) sets `displayName`. Required for clean React DevTools and for error messages from `createSafeContext`.

---

## 12. Deprecation Helper

```tsx
// src/utils/deprecate.ts
export function deprecatedProp(component: string, oldName: string, newName: string, version: string): void {
  warnOnce(
    `${component}-${oldName}`,
    `<${component}> prop "${oldName}" is deprecated and will be removed in ${version}. Use "${newName}" instead.`
  );
}
```

Applied wherever we rename a prop across versions.

---

## 13. `Portal` and `Presence` — defined here, implemented in 03

These deserve architecture-level mention because they change how overlays compose. Full implementation in [03-primitives-and-hooks.md](03-primitives-and-hooks.md).

- `Portal` — renders children into a detached DOM node (via `createPortal`).
- `Presence` — manages mount/unmount around exit animations (the "keep the element in the tree long enough to animate out" problem).

---

## 14. Strict Mode & Concurrent Rendering

Every component must be safe under:
- `<React.StrictMode>` — effects fire twice in dev; components mount/unmount/remount.
- **Concurrent rendering** — renders can be discarded; effects may never commit.
- **Suspense boundaries** — components may suspend on data.

### Rules
- **No side effects in render.** All mutations go in `useEffect`.
- **Cleanup every subscription.** `useEffect` must return a cleanup function if it subscribes to anything.
- **Don't rely on render count.** Never `useRef` a "first render" boolean without justification.
- **IDs via `useId`**, not `Math.random()` or counters.
- **No global mutable singletons** that assume single-render semantics.

---

## 15. Naming Conventions

- Components: `PascalCase` (`Button`, `CardHeader`).
- Compound subcomponents: `Parent.Child` (`Card.Header`), standalone export `CardHeader`.
- Hooks: `useCamelCase` (`useToggle`).
- Utilities: `camelCase` (`formatNumber`).
- Types/interfaces: `PascalCase` (`ButtonProps`).
- CSS classes (Phase 04): `vf-[component]` and `vf-[component]--[modifier]`.
- Data attributes: `data-vf-[name]` (`data-vf-state="open"`).
- Event handler props: `on[Verb]` (`onClick`, `onOpenChange`, `onValueChange`).

---

## Acceptance Criteria

- [ ] Every exported component uses `forwardRef`.
- [ ] Every layout/text component accepts `as` with proper type inference.
- [ ] `<Slot>` is exported and `asChild` works on Button, Badge, Card.
- [ ] `useControllableState` is implemented and used by every stateful component.
- [ ] `useMergedRefs`, `useId`, `useIsomorphicLayoutEffect` are exported.
- [ ] `createSafeContext` replaces all raw `React.createContext` usage where consumers require a provider.
- [ ] Dev-mode warnings fire for the scenarios listed in §10.
- [ ] Every exported component has `displayName`.
- [ ] Compound pattern is applied to Card, Tabs, Accordion, Menu, Modal, Dropdown, Table, Form.
- [ ] A Strict Mode test wraps the demo in `<StrictMode>` and everything still works.

## Notes

- This phase is invisible to end users but is the load-bearing layer for everything else. Resist the urge to cut corners.
- The Slot/asChild pattern is the biggest quality-of-life win for consumers building forms/routers. Don't skip it.
- Dev warnings should never fire in production bundles. Use `process.env.NODE_ENV` guards, and verify the tree-shaker drops them.
