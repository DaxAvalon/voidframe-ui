# Agent D — CSS + Theme review

> 15 findings. Strongest: `reducedMotion` API naming is semantically
> backwards, print styles are essentially absent, dialog/drawer
> backdrops collapse in light theme, Kanban card elevation inverts in
> light theme, RTL support is broken structurally (physical properties
> dominate), `--vf-accent` used 112 times but never defined as a
> token.

## Findings

### 1. Inverted reducedMotion API naming
**Severity:** high
**Evidence:** `src/provider/VoidframeProvider.tsx:39` — `export type VoidframeReducedMotion = "auto" | "always" | "never";` combined with `tokens.css:291-305`: `@media (prefers-reduced-motion: reduce) { :root:not([data-vf-motion="never"]) {...} }` and `[data-vf-motion="always"] { --vf-transition: none; }`
**Problem:** Prop named `reducedMotion="always"` semantically means "always reduce motion" (i.e. force-disable), but reads to integrators as "always animate"; `never` means "never respect OS reduce" (keep animations on). The names are directly backwards from the noun they modify.
**Fix:** Rename to `motion: "auto" | "off" | "on"` or `reducedMotion: "auto" | "force" | "ignore"`.

### 2. Only one `@media print` rule in entire framework
**Severity:** high
**Evidence:** `src/css/components/specialty.css:1504-1515` is the only `@media print` block; it hides `body *` and shows only `[data-print-layout]`.
**Problem:** Overlays (dialogs, drawers, toasters, tooltips, backdrops with `position:fixed`) have no print hiding; the framework advertises a Print specialty but ink-on-paper defaults (remove backdrops, force black-on-white text, hide `.vf-toaster`, `.vf-spotlight`, `.vf-dialog`) are absent.
**Fix:** Add a shared `@media print` block in `base.css` hiding all `z-index:var(--vf-z-*)` layers and forcing `background:white; color:black`.

### 3. Dialog/Drawer backdrops break in light theme
**Severity:** high
**Evidence:** `feedback-overlays.css:16` — `.vf-dialog__backdrop { background: color-mix(in srgb, var(--vf-bg-0) 70%, transparent); }`. Light `--vf-bg-0: #f5f5f0`.
**Problem:** Dim-the-background idiom is built on the assumption bg-0 is near-black. In light mode the backdrop is a 70% near-white wash — content beneath remains visually foreground and the modality cue collapses.
**Fix:** Use a neutral token like `rgb(0 0 0 / 0.5)` or a dedicated `--vf-scrim` that is dark in every theme.

### 4. Hardcoded whites/greys in Lightbox break light theme
**Severity:** medium
**Evidence:** `src/css/components/interactive-media.css:86-93,109-112,120` — `color: #eee`, `border: 1px solid #444`, `color: #ddd`, `border: 1px solid #555`, backdrop `rgba(0,0,0,0.85)`.
**Problem:** Lightbox assumes dark chrome; in light/grey themes the close/nav buttons are light-on-light with a dim backdrop unaffected by theme tokens.
**Fix:** Replace literals with `var(--vf-text-1)`, `var(--vf-border-2)`; the backdrop intentionally dark is fine (lightboxes darken) but should be a named `--vf-scrim-strong` token.

### 5. Physical properties dominate — RTL is largely broken
**Severity:** high
**Evidence:** `margin-left`/`margin-right`/`padding-left`/`padding-right` across 34 occurrences in 11 files vs 44 logical-property occurrences in 10 files; `left:`/`right:` appear 28 times in 11 files. `chat.css` alone uses `margin-left: auto` 15+ times (lines 128, 164, 343, 590, 778, 894, 1206, 1240, 1568, 1779…) to push timestamps/actions — these pin LEFT in RTL where they should pin start/end. Only one `[dir="rtl"]` selector exists (`icon.css:40`).
**Problem:** `direction="rtl"` is advertised but chat/tooltip/data layout does not flip.
**Fix:** Convert physical margins/padding/positions to `margin-inline-*`, `inset-inline-*`, `padding-inline-*` system-wide.

### 6. Tooltip positioning uses physical `left/right` with `translateX(-50%)`
**Severity:** medium
**Evidence:** `data-extended.css:77-80` — `.vf-tooltip__bubble--left { right: 100%; ... margin-right: 6px; }` / `--right { left: 100%; ... margin-left: 6px; }`
**Problem:** RTL renders tooltips on the wrong side; `--top/--bottom` use `left:50%` which is centering-safe but `margin-top/bottom` mix with logical usage elsewhere inconsistently.
**Fix:** Use `inset-inline-start/-end` and `margin-inline-*`.

### 7. `--vf-accent` used 112 times but never defined as a token
**Severity:** medium
**Evidence:** `tokens.css` has zero `--vf-accent` definitions; 112 references across 21 component files (e.g., `data-extended.css:11`, `button.css` 13x, `badge.css` 4x) always as `var(--vf-accent, <fallback>)`.
**Problem:** The "accent" concept is a runtime-only variable set inline by a handful of components; global theming (e.g., brand accent) has no first-class slot, and consumers cannot set it via CSS theme override.
**Fix:** Define `--vf-accent` (default `var(--vf-text-0)` or `var(--vf-blue)`) in each theme block in `tokens.css`.

### 8. Kanban light-mode contrast inversion
**Severity:** medium
**Evidence:** `data-display.css:682-691` — column `background: var(--vf-bg-2)`, item `background: var(--vf-bg-3)`. In light theme, `bg-2=#e0e0db`, `bg-3=#d6d6d1`: the card is *darker* than its column, which inverts the conventional raised-card elevation.
**Problem:** The elevation hierarchy (bg-0 lowest → bg-5 highest) was picked for dark surfaces; flipping to light inverts "higher surface = lighter" so cards look pressed-in.
**Fix:** Either invert the light ramp so higher indexes are lighter, or define elevation-named tokens (`--vf-surface-0/1/2`) that resolve correctly per theme.

### 9. Gantt/overlay scrim hardcoded to `rgba(0,0,0,*)`
**Severity:** medium
**Evidence:** `data-display.css:650` (`rgba(0,0,0,0.2)` gantt resize handle); `overlay.css:25` (`rgba(0,0,0,0.6)`); `interactive.css:57` (`rgba(0,0,0,0.75)`); `specialty.css:1411` (`box-shadow ... rgba(0,0,0,0.35)`); `dev.css:369` (`0 2px 10px rgba(0,0,0,0.4)`).
**Problem:** None are tokenized. Shadows are invisible on dark themes and resize handles are invisible on light.
**Fix:** Add `--vf-shadow-sm/md/lg` and `--vf-scrim` tokens, redefine per theme.

### 10. Density overrides scattered, not token-only
**Severity:** low
**Evidence:** `tokens.css:214-252` — 14 `[data-vf-density=...]` selectors hit specific component classes (`.vf-button--sm`, `.vf-table__cell`, `.vf-card`, `.vf-input`, `.vf-textarea`, `.vf-form-control`), not just tokens. 28 `[data-vf-density]` selectors total in tokens.css alone.
**Problem:** Density is advertised as a CSS-variable-driven system but in practice is partly a hardcoded list of hand-picked components; anything not in the allow-list (Badge--md, Avatar, Tag, Popover, Toast bodies) ignores density beyond inherited spacing.
**Fix:** Drive padding exclusively from `--vf-sp-*` tokens in every component rule; delete the per-component density overrides.

### 11. Duplicate `prefers-reduced-motion` blocks
**Severity:** low
**Evidence:** `tokens.css:291-298`, `keyframes.css:89-95`, `components/icon.css:44` — three independent blocks each setting animation-duration/transition-duration to near-zero with `!important`.
**Problem:** One of them (tokens.css) also drops `--vf-transition: none`, and another (keyframes.css) adds `scroll-behavior: auto !important` — users can't easily identify where behavior lives.
**Fix:** Consolidate into a single `@media (prefers-reduced-motion)` block; drop per-component duplicates.

### 12. Fallback hexes don't match token values
**Severity:** low
**Evidence:** `var(--vf-red, #c44)` appears 30+ times in `feedback-overlays.css` and `data-display.css`, but actual `--vf-red` is `#f87171` (dark theme) / `#b91c1c` (light) / `#fb7185` (grey). `var(--vf-blue, #38b)` vs actual `#6b9fdd`. `dev.css:87` uses `#c03030`.
**Problem:** If a consumer uses these classes outside `.vf-root`, the fallback color is visually inconsistent with the real theme; fallbacks also mislead readers about the palette.
**Fix:** Either drop fallbacks (always require `.vf-root`) or generate them from the token source of truth.

### 13. Dead/rarely-used perf utility classes
**Severity:** low
**Evidence:** `performance.css:44-45` defines `.vf-will-change-transform` and `.vf-will-change-opacity`; grep across `src/**/*.tsx` finds zero references. `.vf-cv-auto` referenced only in README prose, not in any component.
**Problem:** Three classes shipped as public API surface with no consumer in the framework itself — will drift as the library evolves.
**Fix:** Remove, or convert to documented utilities with an actual example.

### 14. `!important` used for sr-only and reset is fine, but responsive.css relies on it for layout
**Severity:** low
**Evidence:** 28 `!important` total; `responsive.css` alone has 8 (`width: 100vw !important`, `display: block !important`, `grid-template-columns: none !important`, `text-align: left !important`).
**Problem:** Adaptive modal/drawer/table rules escalate to `!important` to beat their own component rules — a code smell suggesting specificity was lost earlier and the adaptive variants were bolted on after.
**Fix:** Rewrite adaptive rules to target `.vf-modal__panel--adaptive` directly at the same specificity; drop `!important`.

### 15. Tokens define six `--vf-bg-*` / six `--vf-text-*` / five `--vf-border-*` — asymmetric and all physical
**Severity:** low
**Evidence:** `tokens.css:13-33` — bg and text have indices 0-5 (six levels), border has 0-4 (five). No semantic surface/ink tokens (`--vf-surface-overlay`, `--vf-ink-muted`), forcing every component to guess which numeric index to use.
**Problem:** Designers/component-authors don't know "what's bg-2 vs bg-3?" and the light theme's bg inversion (item 8) is a direct consequence of tying layers to an ordinal scale rather than semantic roles.
**Fix:** Add semantic aliases: `--vf-surface-canvas`, `--vf-surface-raised`, `--vf-surface-overlay`, `--vf-ink-primary`, `--vf-ink-muted`, etc., mapped per theme.
