# 21 — Developer Experience

**Goal:** Using Voidframe should feel faster, safer, and more discoverable than alternatives. Dev-mode warnings, debug tools, great error messages, polished JSDoc.

**Depends on:** 02 Architecture (warnings).
**Effort:** 2 days.

## Dev Warnings (catalogue)

Every warning:
- Fires only in non-production.
- Has a unique key (to dedupe).
- Includes actionable message with component name + fix + docs link.
- Never breaks user code — logs and continues.

### Categorized warnings

**Missing required a11y**
- IconButton / icon-only Button without `aria-label`.
- Input / Textarea / Select without an accessible label.
- Modal without `aria-labelledby` or `aria-label`.
- `<img>` children in IconButton without `alt`.

**Invalid prop combinations**
- `value` + `defaultValue` both provided.
- `checked` + `defaultChecked` both provided.
- `disabled` + `onClick` handler (noop warning — handler won't fire).
- `asChild` with 0 or 2+ children.
- `asChild` with non-element child.

**State transitions**
- Controlled → uncontrolled switch mid-lifecycle.
- Uncontrolled → controlled switch.

**Missing context / provider**
- Using `<Tabs.Trigger>` outside `<Tabs>`.
- Using `useToast` without `<Toaster>`.
- Using Voidframe components without `VoidframeProvider`.

**Unexpected values**
- Unknown size / variant / tone values.
- Positive `tabindex`.

**Deprecations**
- Removed props still being passed.
- Renamed props with pointer to new name.

**Performance hints**
- `<Table>` / `<DataGrid>` with >500 rows without virtualization.
- `<Combobox>` with >200 options without virtualization.
- Unmemoized row renderers in large lists.

---

## Debug Mode

Provider-level toggle enabling extra diagnostics:

```tsx
<VoidframeProvider debug>
```

Enables:
- **Component outlines** — hovered component gets a subtle outline with component name label.
- **Z-index legend** — overlays show their z-index on a corner.
- **Re-render flash** — components that re-rendered in the last frame get a tint.
- **Focus ring always** — `:focus-visible` becomes `:focus` for debugging keyboard flow.
- **Render count** — component displays render count in corner (dev tools).

All toggles scoped to dev build; absent from production.

Exposed via `useDebug()` hook for consumers to add their own debug visualizations.

---

## React DevTools Integration

- Every component has `displayName`.
- Compound subcomponents use dot-notation (`Card.Header` in DevTools).
- Hooks labeled for DevTools (`useDebugValue`):
  ```tsx
  function useToggle(initial) {
    const [value, setValue] = useState(initial);
    useDebugValue(value ? "on" : "off");
    return [value, () => setValue(v => !v), setValue];
  }
  ```
- Provider registers a DevTools hook for inspecting theme, density, direction.

---

## Error Messages

Every throw:
- Names the component / hook.
- States the condition.
- Suggests the fix.
- Links to docs.

Example:

```
Error: <Tabs.Trigger> must be used within <Tabs>.
You're rendering <Tabs.Trigger> without a parent <Tabs>. Wrap it:
  <Tabs>
    <Tabs.List>
      <Tabs.Trigger value="a">A</Tabs.Trigger>
    </Tabs.List>
  </Tabs>
See: https://voidframe.dev/docs/tabs
```

Helper for consistent formatting:

```ts
function vfError(component: string, message: string, link?: string): Error {
  const url = link ? `\nSee: https://voidframe.dev/docs/${link}` : "";
  return new Error(`[voidframe] <${component}> ${message}${url}`);
}
```

---

## JSDoc & IntelliSense

Every exported symbol has JSDoc:

```tsx
/**
 * A primary button.
 *
 * @example
 * <Button variant="solid" onClick={handleClick}>Save</Button>
 *
 * @a11y Requires a visible label or `aria-label` when used with icon-only children.
 * @docs https://voidframe.dev/docs/button
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...);
```

IntelliSense surfaces the JSDoc on hover in VSCode/WebStorm. Prop-level JSDoc:

```ts
export interface ButtonProps {
  /** Visual style. `solid` for primary actions, `ghost` for tertiary. */
  variant?: Variant;
  /** Visual size. `md` by default. */
  size?: Size;
  /** Whether the button is disabled. `onClick` won't fire when true. */
  disabled?: boolean;
}
```

Every prop has a JSDoc string. Every interface has examples.

---

## Type-Level DX

- Strict types surface mistakes at compile time.
- Discriminated unions for complex props:
  ```ts
  export type ToastProps =
    | { tone: "default"; /* ... */ }
    | { tone: "danger"; /* ... */ action?: never };
  ```
- `satisfies` patterns documented.
- Exported generic helpers: `PolymorphicProps<C, P>`, `Responsive<T>`, etc.

Avoid:
- Overly-clever conditional types that slow down TS server.
- Types that require TS 5.x features unless worth the floor.

---

## Consumer DX Tools

### VSCode extension (Phase 25)

- Snippets: `<vf-button>` → Button stub with common props.
- Token preview — hover over `tokens.bg2` shows color swatch.
- Component docs — hover over component shows docs link.
- Auto-import all Voidframe exports.

### Codemods (optional)

For major version upgrades, ship codemods to automate migrations:

```
npx voidframe-codemod v2-migrate ./src
```

Rename props, replace deprecated imports, etc.

### ESLint plugin

`eslint-plugin-voidframe` that lints:
- Invalid prop combos.
- Missing `aria-label`.
- Deprecated components.
- Theme-agnostic color literals (suggests using tokens).

---

## Error Boundary Integration

Document consumer patterns:

```tsx
<ErrorBoundary fallback={(err) => <ErrorState error={err} onRetry={() => ...} />}>
  <App />
</ErrorBoundary>
```

Voidframe ships `<ErrorBoundary>` (primitive) and `<ErrorState>` (component) designed to compose.

---

## Suspense Integration

Components that can suspend (lazy-loaded overlays) document the Suspense boundary pattern. Provider wraps a global `<Suspense>` by default for toast/modal queues.

---

## Logging

Expose a log hook:

```ts
import { setLogger } from "voidframe";

setLogger({
  warn: (msg, ...args) => myLogger.warn(msg, args),
  error: (msg, ...args) => myLogger.error(msg, args),
});
```

So dev warnings can be captured by Sentry/Datadog/etc. Default logs to `console`.

---

## Dev Build vs Production

- Dev build includes: warnings, `displayName`, full JSDoc, debug-mode toggles, prop-validation side effects.
- Production build strips all of the above via DCE.

Verification: built production bundle size check should be materially smaller than dev, and grep for `[voidframe]` should return empty strings.

---

## Documentation Stubs Per Component

Each component's source file top-comment links to the docs page:

```tsx
/**
 * Button
 * @docs https://voidframe.dev/docs/button
 * @see ButtonProps
 */
```

When IDE indexes the file, devs get a quick path to docs.

---

## Acceptance Criteria

- [ ] Dev warnings fire for all listed categories.
- [ ] All compound subcomponents have `displayName`.
- [ ] All exported symbols have JSDoc with examples.
- [ ] Error messages include component name + fix + docs link.
- [ ] `setLogger()` exported for consumer integration.
- [ ] Debug mode toggleable via provider.
- [ ] React DevTools shows meaningful component names.
- [ ] ESLint plugin published (minimum: deprecated-prop rule).
- [ ] Production builds strip warnings via DCE.

## Notes

- **Warnings that don't actionable are noise.** Every warning must tell the dev what to change.
- **Dev mode is for devs.** Don't leak dev features to production end users.
- **Good types > good docs > warnings.** If the type system can prevent a mistake, prefer that over a runtime warning.
