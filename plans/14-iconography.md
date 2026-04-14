# 14 — Iconography

**Goal:** A complete, aesthetic-coherent icon system — `<Icon>` primitive, a bundled brutalist icon set, integrations with major icon libraries, and patterns for accessibility.

**Depends on:** Phase 02 (forwardRef, polymorphism), 04 (CSS).
**Effort:** 1-2 days (system) + ongoing (drawing the set).

## Philosophy

Icons in Voidframe are **monoline, 1px-stroke, geometric, no rounding**. They are drawn on a 24×24 grid with optional 16×16 small variants. The aesthetic matches the brutalist typography: precise, functional, no decorative flourishes.

We don't force the bundled set. Consumers can use Lucide, Phosphor, Heroicons, Tabler, Radix icons, or their own SVGs — our integration is seamless.

## The `<Icon>` Primitive

```tsx
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: Size | number;                    // xs=12, sm=14, md=16, lg=20, xl=24, xxl=32
  color?: string;                          // any CSS color; default currentColor
  strokeWidth?: number;                    // default 1 for monoline style
  label?: string;                          // accessible name; if absent, aria-hidden
  decorative?: boolean;                    // force aria-hidden even with label
  children?: ReactNode;                    // SVG children (paths, etc.)
  flipX?: boolean;                         // for RTL mirroring
  flipY?: boolean;
  rotate?: 0 | 90 | 180 | 270;
  spin?: boolean;                          // rotates continuously (loading)
  pulse?: boolean;                         // pulse opacity
}
```

```tsx
<Icon size="md" label="Search">
  <circle cx="11" cy="11" r="7" />
  <path d="M20 20l-4-4" />
</Icon>
```

- Default viewBox `0 0 24 24`.
- `fill="none"`, `stroke="currentColor"`, `strokeLinecap="square"`, `strokeLinejoin="miter"` (brutalist defaults).
- Size token map: `xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32`.

## Bundled Icon Set

**Target: ~200 icons** covering common UI needs. All drawn to the brutalist spec. Exported individually for tree-shaking.

```tsx
import { SearchIcon, ChevronDownIcon, XIcon } from "voidframe/icons";

<SearchIcon size="md" />
```

### Categories

- **Actions**: plus, minus, check, x, edit, delete/trash, copy, paste, cut, download, upload, share, save, refresh, undo, redo, print, send, reply, forward, bookmark, pin, unpin
- **Navigation**: chevron (up/down/left/right), arrow (u/d/l/r), double-chevron, home, back, forward, external-link, expand, collapse, more-horizontal, more-vertical
- **Files**: file, file-text, file-code, file-image, folder, folder-open, folder-plus, zip, pdf
- **Editors**: bold, italic, underline, strikethrough, code, code-block, heading, list-unordered, list-ordered, list-check, indent, outdent, align-left/center/right/justify, quote, link, unlink
- **Media**: play, pause, stop, skip-back, skip-forward, volume (full/half/mute), camera, image, video, microphone, mic-off, headphones, record
- **Communication**: message, message-square, mail, mail-open, send, phone, video-call, chat-bubble, at-sign, bell, bell-off, hash
- **Status**: info, warning, error, success, question, loader, spinner, circle-dot, circle-empty, circle-check, circle-x
- **Shapes**: square, circle, triangle, diamond, star, heart
- **Data**: chart-bar, chart-line, chart-pie, table, database, server, cloud, activity, trend-up, trend-down
- **System**: settings, cog, user, users, user-plus, log-in, log-out, key, lock, unlock, shield, eye, eye-off, search, filter, sort, menu, grid, list, sidebar, panel, layout
- **Tech**: terminal, command, cpu, hard-drive, wifi, wifi-off, bluetooth, battery, power, plug, cable
- **Time**: clock, calendar, hourglass, timer, stopwatch, alarm, sun, moon, cloud-rain, snowflake
- **Commerce**: shopping-cart, credit-card, dollar, percent, tag, gift, package, truck, receipt
- **Social/platforms (minimal set)**: github, twitter/x, linkedin, slack, discord, figma — monoline interpretations, not official logos (link to brand guidelines required)

### Source files

`src/icons/` — one TSX per icon:

```tsx
// src/icons/Search.tsx
import { Icon, IconProps } from "./Icon";
import { forwardRef } from "react";

export const SearchIcon = forwardRef<SVGSVGElement, IconProps>(function SearchIcon(props, ref) {
  return (
    <Icon ref={ref} label="Search" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Icon>
  );
});
```

Barrel export `src/icons/index.ts` re-exports all.

### Build-time sprite sheet (optional optimization)

Generate `dist/icons.svg` as a single sprite with `<symbol id="vf-search" ...>` entries. Consumers using the sprite mode import a thin `<Icon name="search" />` that `<use>`s the symbol — perfect for apps that use many icons.

---

## Third-party Icon Integration

Consumers using Lucide / Phosphor / Heroicons / Tabler pass them as children or via `asChild`:

```tsx
import { Search } from "lucide-react";

<IconButton aria-label="Search">
  <Search size={16} />
</IconButton>

// or with asChild on Icon wrapper for consistent sizing
<Icon asChild label="Search">
  <Search />
</Icon>
```

Documentation provides one-liner adapters:

```tsx
// adapters/lucide.ts
export function lucide<T extends FC<any>>(Component: T): typeof Icon {
  return (props) => <Icon {...props}><Component size="100%" /></Icon>;
}
```

---

## `<IconButton>` (see Phase 07 F01 IconButton variant)

```tsx
<IconButton aria-label="Close" variant="ghost" size="sm">
  <XIcon />
</IconButton>
```

- Square by default; padding tied to size tokens.
- `aria-label` is **required** (dev-warn if missing).
- Tooltip support via `tooltip` prop: `<IconButton tooltip="Close" ... />`.

## `<IconGroup>` (new)

Row of icons with separators or gaps.

```tsx
<IconGroup gap={2}>
  <FileIcon />
  <Text size="sm">file.ts</Text>
  <Badge>modified</Badge>
</IconGroup>
```

---

## Animated Icons

Certain icons need motion (loading spinner, expand/collapse caret).

- `<Icon spin>` — continuous rotation.
- `<Icon pulse>` — opacity pulse.
- Caret rotation on expand: set `data-state="open"` + CSS: `rotate: 180deg` when open.
- Morphing icons (menu ↔ close): two paths + CSS transition on `d` attribute (or two stacked icons with opacity swap).

### Prebuilt animated icons

- `SpinnerIcon` — rotating arc.
- `LoadingDotsIcon` — three dots pulsing.
- `CaretIcon` — rotates based on `data-state` / `open` prop.
- `MenuIcon` / `CloseIcon` pair — morphs via parent `<AnimatedIcon>` wrapper.

---

## RTL

Icons that have directionality (arrows, chevrons, carets) must mirror in RTL.

```tsx
<ChevronRightIcon />  // in RTL root (dir="rtl"), this auto-flips
```

Implementation: CSS rule on dir-sensitive icons:

```css
[dir="rtl"] .vf-icon--directional { transform: scaleX(-1); }
```

Each directional icon has `data-directional="true"` in the SVG root; the CSS class `.vf-icon--directional` is applied when that attribute is set.

---

## Brand Icons

Social / platform icons are tricky:
- Official logos have brand guidelines.
- We ship **monoline glyph interpretations** — not official logos.
- Name them suffixed: `GithubGlyphIcon`, `TwitterGlyphIcon`.
- Document this distinction in the docs.

For real brand logos, point users to their official assets (or `simple-icons` package).

---

## Accessibility

- Icons are **decorative by default** (aria-hidden) unless `label` is provided.
- Icon-only buttons require `aria-label` on the button.
- `<AccessibleIcon>` primitive (Phase 03) wraps non-button icons that need labels.
- Animated icons respect `prefers-reduced-motion` (spin stops).

---

## CSS

```css
.vf-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.vf-icon--xs  { width: 12px; height: 12px; }
.vf-icon--sm  { width: 14px; height: 14px; }
.vf-icon--md  { width: 16px; height: 16px; }
.vf-icon--lg  { width: 20px; height: 20px; }
.vf-icon--xl  { width: 24px; height: 24px; }
.vf-icon--xxl { width: 32px; height: 32px; }

.vf-icon--spin  { animation: vf-spin 0.8s linear infinite; }
.vf-icon--pulse { animation: vf-pulse 1.5s ease-in-out infinite; }

[dir="rtl"] .vf-icon[data-directional="true"] { transform: scaleX(-1); }

@media (prefers-reduced-motion: reduce) {
  .vf-icon--spin { animation: none; }
  .vf-icon--pulse { animation: none; }
}
```

---

## Icon Drawing Rules

For anyone contributing icons to the bundled set:

1. **24×24 grid.** Each icon is drawn on a 24×24 viewBox.
2. **1px stroke width.** Never fill unless strictly necessary.
3. **Pixel-aligned paths.** Coordinates on whole or half pixels.
4. **Square caps, miter joins.** No rounded endpoints. Matches brutalist aesthetic.
5. **No gradients, no shadows, no transparency.**
6. **Optical compensation.** Certain shapes (circles) need slight scaling to appear same-weight as squares.
7. **Consistent metaphors.** Trash icon must resemble other trash icons across products. Don't reinvent.
8. **Two weights optional.** Future: `<Icon weight="regular" | "bold">` adds a 2px variant for contexts needing more presence.

---

## Publishing

Bundled icons are:

```tsx
import { SearchIcon } from "voidframe/icons";
// OR
import { SearchIcon } from "voidframe";  // from main barrel (tree-shakable)
```

Per-icon tree-shaking: the barrel re-exports each icon from its own file; bundlers drop unused ones.

Sprite: consumers can opt in to the sprite build for ~60% icon bundle reduction at 10+ icons used.

---

## Acceptance Criteria

- [ ] `<Icon>` primitive implemented with all listed props.
- [ ] `<IconButton>` and `<IconGroup>` implemented.
- [ ] ~200 icons drawn and exported (may be staged — core 50 first, rest over time).
- [ ] Tree-shaking verified: importing one icon → only that icon in bundle.
- [ ] Sprite build optional and documented.
- [ ] RTL auto-mirroring works on directional icons.
- [ ] `prefers-reduced-motion` stops spin/pulse.
- [ ] Dev-warn on `<IconButton>` without `aria-label`.
- [ ] Adapters documented for Lucide, Phosphor, Heroicons, Tabler.
- [ ] Icon drawing guidelines published for contributors.

## Notes

- **Drawing 200 icons is a lot.** Stage: ship the primitive + 50 core icons in phase; add the rest over time. Don't block other work on having all 200 drawn.
- **Don't reinvent.** When an icon metaphor is universal (search = magnifying glass), match it. Brutalist means precise, not eccentric.
- **Licensing**: ensure no icons are derivative of copyrighted works. Reference Lucide/Feather for inspiration (MIT-licensed) but draw independently.
