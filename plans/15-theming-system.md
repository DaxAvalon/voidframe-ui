# 15 — Theming System

**Goal:** A theming system that supports multiple named themes, nested scopes, density modes, high-contrast mode, and runtime switching — all via CSS custom properties, all SSR-safe.

**Depends on:** 01 TypeScript, 04 CSS architecture.
**Effort:** 1-2 days.

## Levels

1. **Named themes** — `dark` (default), `light`, plus user-defined.
2. **Token overrides** — partial token maps applied on top of a named theme.
3. **Nested theme scopes** — a subtree with a different theme.
4. **Density modes** — `comfortable` | `compact` | `spacious`.
5. **Contrast modes** — `normal` | `high`.
6. **Direction** — `ltr` | `rtl`.
7. **Reduced motion** — user preference aware, overridable.

All of these are independently composable.

---

## Named Themes

Themes are full token sets. Three shipped:

- `darkTheme` (default) — the brutalist dark aesthetic.
- `lightTheme` — high-contrast light alternative.
- `midnightTheme` — extra-dark variant with deeper blacks.

Implementation:

```ts
// src/themes/dark.ts
export const darkTheme: VoidframeTokens = { ... };

// src/themes/light.ts
export const lightTheme: VoidframeTokens = { ... defaultTokens overridden ... };

// src/themes/midnight.ts
export const midnightTheme: VoidframeTokens = { ... };
```

Consumer usage:

```tsx
import { VoidframeProvider, lightTheme } from "voidframe";

<VoidframeProvider theme={lightTheme}>
  <App />
</VoidframeProvider>
```

Internally: the provider emits CSS custom properties at its root scope. Switching theme → re-writing the `<style>` block OR (preferred) toggling `data-vf-theme="light"` if theme is a named one.

---

## `createTheme`

```ts
export function createTheme(overrides: ThemeOverrides, base?: VoidframeTokens): VoidframeTokens {
  return { ...(base ?? defaultTokens), ...overrides };
}

// Usage:
const myTheme = createTheme({
  green: "#86efac",
  fontFamily: "'IBM Plex Mono', monospace",
});
```

For static themes, consumers can also export a CSS file:

```css
[data-vf-theme="myteam"] {
  --vf-green: #86efac;
  --vf-font-family: 'IBM Plex Mono', monospace;
}
```

Both paths supported.

---

## Theme Scopes

A nested subtree can use a different theme without unmounting the rest.

```tsx
<VoidframeProvider theme={darkTheme}>
  <Header />
  <ThemeScope theme={lightTheme}>
    <Preview />             {/* this subtree renders in light */}
  </ThemeScope>
  <Footer />
</VoidframeProvider>
```

Implementation: `<ThemeScope>` re-emits CSS custom properties at its own root div. No context gymnastics — CSS custom props cascade naturally.

```tsx
export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { theme, density, contrast, direction, children, className, style, ...rest },
  ref
) {
  const cssVars = tokensToCssVars(theme);
  return (
    <div
      ref={ref}
      data-vf-density={density}
      data-vf-contrast={contrast}
      dir={direction}
      className={cx("vf-theme-scope", className)}
      style={{ ...cssVars, ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
});
```

Use cases: preview panes showing the opposite theme, embed widgets with their own brand, multi-tenant dashboards.

---

## Density

Three density modes via `data-vf-density` attribute (Phase 04).

```tsx
<VoidframeProvider density="compact">
```

Effect: reduced spacing tokens. All components scale down accordingly because spacing is token-referenced.

- `comfortable` (default): original values.
- `compact`: roughly 75% spacing — for dense dashboards, power-user interfaces.
- `spacious`: roughly 130% spacing — for marketing / landing pages / accessibility.

Per-component override via prop: `<Table density="compact">` works for scoped tweaks.

---

## Contrast

```tsx
<VoidframeProvider contrast="high">
```

- Boosts text contrast (text-1, text-2 → brighter).
- Boosts border contrast (border-1, border-2 → brighter).
- Thickens focus ring (3px instead of 2px).
- Intended for users who enable OS high-contrast mode or prefer AAA-level readability.

Auto-detect: if `(prefers-contrast: more)` matches, opt in automatically unless explicitly overridden.

---

## Direction (RTL)

```tsx
<VoidframeProvider direction="rtl">
```

- Sets `dir="rtl"` on root.
- CSS uses logical properties (`margin-inline-start`, `padding-block`) so everything mirrors automatically.
- Icons with `data-directional` flip.
- Layout components (Drawer, SplitView, Breadcrumb) handle RTL semantics.

Full coverage in [17-i18n-rtl-locale.md](17-i18n-rtl-locale.md).

---

## Reduced Motion

```tsx
<VoidframeProvider reducedMotion="auto" | "always" | "never">
```

- `auto` (default): respects `prefers-reduced-motion`.
- `always`: force-disable all motion (user override for testing).
- `never`: override the system preference (not generally recommended).

---

## System Theme Sync

```tsx
<VoidframeProvider theme="system">
```

- `theme="system"` auto-matches `prefers-color-scheme`.
- Hook: `useColorScheme()` returns current resolved scheme (`"light" | "dark"`) and provides `{ setScheme(s | "system") }`.

---

## Persistence

Optional hook for saving user preference:

```tsx
import { useThemePersistence } from "voidframe";

function App() {
  const { theme, setTheme } = useThemePersistence({
    key: "voidframe-theme",
    defaultTheme: "system",
  });

  return (
    <VoidframeProvider theme={theme}>
      ...
      <ThemeSelector value={theme} onChange={setTheme} />
    </VoidframeProvider>
  );
}
```

- Reads from localStorage; falls back to system preference.
- Emits `storage` event for multi-tab sync.

---

## Semantic Aliases

Tokens should be layered semantically. Underneath the raw palette (`green`, `red`), we expose **roles**:

```ts
success: var(--vf-green),
danger:  var(--vf-red),
warning: var(--vf-amber),
info:    var(--vf-blue),
```

Future addition: per-component semantic tokens (e.g., `--vf-button-bg`, `--vf-card-border`) that default to raw tokens but can be overridden for theming *without* touching every component's CSS. This is optional — can be added incrementally if needed.

---

## Custom Theme Registration

For consumer-defined themes that want `data-vf-theme="mybrand"` support (rather than runtime CSS var injection), they can register CSS:

```css
/* consumer's own CSS */
[data-vf-theme="mybrand"] {
  --vf-bg-0: #001122;
  --vf-green: #00ff88;
  /* ... */
}
```

```tsx
<VoidframeProvider themeName="mybrand">
```

This path avoids runtime style generation entirely — ideal for SSR.

---

## `<ThemeSelector>` Component

```tsx
<ThemeSelector
  value onChange
  themes={[
    { id: "dark", label: "Dark" },
    { id: "light", label: "Light" },
    { id: "system", label: "Auto", icon: <SunMoonIcon /> },
  ]}
/>
```

- Dropdown or toggle group.

---

## Accent Override (per component)

```tsx
<Button accent="#86efac">Custom green</Button>
```

- Sets `--vf-accent` inline on the element.
- Component CSS references `var(--vf-accent, fallback)`.
- Documented in Phase 04.

---

## Brand Kits (docs pattern)

Documentation provides "brand kit" examples: how to take Voidframe and skin it for a specific brand, preserving the aesthetic rules:

- Only accent colors may change substantially.
- Typography may change but must remain monospace.
- Radii remain 0.
- Surface ramp must stay high-contrast (5 distinguishable layers).

This keeps the brutalist aesthetic consistent across "themed" deployments.

---

## Acceptance Criteria

- [ ] `darkTheme`, `lightTheme`, `midnightTheme` shipped.
- [ ] `createTheme()` composes overrides correctly.
- [ ] `<ThemeScope>` nests correctly; tokens cascade via CSS.
- [ ] Density modes adjust spacing globally and per-component.
- [ ] Contrast mode boosts contrast token values.
- [ ] `theme="system"` follows `prefers-color-scheme`.
- [ ] Reduced motion mode disables animation.
- [ ] `useThemePersistence` syncs with localStorage.
- [ ] `<ThemeSelector>` component provided.
- [ ] Docs show brand kit example.
- [ ] No FOUC during SSR (theme applied before hydration).

## Notes

- **Don't build a token generator / design-token DSL.** Keep `createTheme` minimal. For sophisticated token pipelines, integrate Style Dictionary (Phase 25).
- **CSS custom properties are the gold standard.** Runtime JS style injection should be a last resort — prefer pre-shipped CSS per theme.
- **Default dark.** Voidframe is a dark framework first; light is a concession.
