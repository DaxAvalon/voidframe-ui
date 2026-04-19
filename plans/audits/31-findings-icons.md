# Audit — Icons family (Phase 14)

Scope: 78 components grouped under `icons` in `plans/audits/31-component-index.json`.
- 75 shared-shape icons live in `src/icons/set.tsx`, all built via the `makeIcon` factory that wraps the base `Icon` primitive.
- 4 distinct components audited individually: `Icon` (`src/icons/Icon.tsx`), `IconGroup` + `IconButton` (`src/icons/IconButton.tsx`), `AccessibleIcon` (`src/primitives/AccessibleIcon.tsx`).

Methodology: read the shared `IconProps` contract, spot-check deviations across the 75 factory-built icons, validate barrel enumeration, enumerate test coverage, and verify accessibility defaults (decorative by default, promoted to `role="img"` + `aria-label` when `label` is supplied).

---

## Family summary — 75 factory-built icons in `src/icons/set.tsx`

### Shared contract (`IconProps`)

Defined at `src/icons/Icon.tsx:24-45`. Extends `Omit<SVGProps<SVGSVGElement>, "children">` so every native SVG prop passes through. Enumerated props:

- `size?: IconSize | number` (`"xs"|"sm"|"md"|"lg"|"xl"|"xxl"`) — default `"md"`, consumed at `src/icons/Icon.tsx:68-70` and emitted as `width`/`height` plus `vf-icon--{size}` class.
- `color?: string` — injected into inline `style.color` at `src/icons/Icon.tsx:77`.
- `strokeWidth?: number` — default `1`, applied at `src/icons/Icon.tsx:97`.
- `label?: string` — accessible name; drives `role="img"` + `aria-label` at `src/icons/Icon.tsx:100-102`.
- `decorative?: boolean` — forces `aria-hidden` even when `label` present (`src/icons/Icon.tsx:71`).
- `directional?: boolean` — emits `data-directional="true"` and adds `vf-icon--directional` class for automatic RTL mirroring (`src/icons/Icon.tsx:87,103`).
- `flipX?`, `flipY?`, `rotate?: 0|90|180|270` — composed into the inline `transform` at `src/icons/Icon.tsx:73-78`.
- `spin?`, `pulse?` — CSS class toggles at `src/icons/Icon.tsx:88-89` (animations suppressed under `prefers-reduced-motion`).
- `children?: ReactNode` — rendered inside the `<svg>` at `src/icons/Icon.tsx:107`.

Sample consumer verified: `PlusIcon` (`src/icons/set.tsx:44-51`) forwards all `IconProps` through `makeIcon` (`src/icons/set.tsx:17-40`); its wrapper only peels `label` + `directional` for defaulting, then spreads the rest into `<Icon>`.

### Per-icon consistency — no outliers found

All 75 exports in `src/icons/set.tsx` are produced by the same `makeIcon(displayName, defaultLabel, glyph, options?)` factory (`src/icons/set.tsx:17-40`). The only per-icon differentiators are:
- the default accessible label (second arg)
- the glyph JSX (third arg)
- an optional `{ directional: true }` flag (fourth arg) used by 6 icons: `SendIcon` (`set.tsx:161`), `ChevronLeftIcon` (`set.tsx:198`), `ChevronRightIcon` (`set.tsx:204`), `ArrowLeftIcon` (`set.tsx:232`), `ArrowRightIcon` (`set.tsx:242`), `PlayIcon` (`set.tsx:604`).

No icon adds, drops, or renames an `IconProps` field. No icon bypasses the `<Icon>` wrapper. No stray props leak outside the shared contract.

### Tree-shaking — PASS

`src/icons/index.ts:16-92` explicitly enumerates all 75 icon names plus `Icon`, `IconProps`, `IconSize`, `IconButton`, `IconGroup`, `adaptIcon`, and related types. No `export *` anywhere in the barrel. Safe for tree-shaking. (P2 clear.)

### Accessibility — PASS

- Default rendering is decorative: when `label` is falsy, the SVG gets `aria-hidden="true"` and no `role` (`src/icons/Icon.tsx:71,100-102`), validated by the `Icon primitive > is decorative by default` test at `src/icons/__tests__/Icon.test.tsx:19-28`.
- Every factory icon provides a sane `defaultLabel`, so imported icons announce themselves by default (`makeIcon` fallback at `src/icons/set.tsx:30`). Override verified by `icon labels can be overridden` test at `src/icons/__tests__/Icon.test.tsx:111-114`.
- Forced-decorative escape hatch via `decorative` prop (`src/icons/Icon.tsx:71`). (P1 clear.)

### Test coverage

A single combined test file `src/icons/__tests__/Icon.test.tsx` covers the primitive (7 cases), the bundled set (5 cases — `SearchIcon`, `XIcon`, `CheckIcon`, `ChevronRightIcon`, `ArrowRightIcon`, `SpinnerIcon`), `IconButton` (5 cases), `IconGroup` (2 cases), and `adaptIcon` (1 case). `AccessibleIcon` has its own test file at `src/primitives/__tests__/AccessibleIcon.test.tsx`.

P3 observation: no programmatic smoke test iterates the full export list from `./set` to confirm every one of the 75 icons renders without error. The family passes by construction (identical factory), but a loop-render test would catch future drift. Non-blocking.

---

## Distinct component — `Icon`

`src/icons/Icon.tsx`.

1. Forwards ref: yes (`Icon.tsx:47`, wrapped in `memo` at `Icon.tsx:113`). `displayName` is re-asserted after `memo` at `Icon.tsx:114` because `React.memo` drops it.
2. Prop contract: documented via JSDoc at `Icon.tsx:28-43`, extends `SVGProps` for full passthrough (`Icon.tsx:24`).
3. Accessibility: decorative-by-default, promoted to `role="img"` + `aria-label` on `label` prop (`Icon.tsx:100-102`).
4. RTL: emits `data-directional` + `vf-icon--directional` class (`Icon.tsx:87,103`) — CSS handles mirroring.
5. Reduced-motion: spin/pulse animations applied via class, leaving the mediaquery disable to CSS (comment at `Icon.tsx:40-43`).

Findings: none. Clean.

---

## Distinct component — `IconButton`

`src/icons/IconButton.tsx:37-105`.

1. Forwards ref: yes (`IconButton.tsx:37`).
2. Prop contract: `variant`, `size`, `accent`, `aria-label`, `tooltip`, `active`, plus `ButtonHTMLAttributes` passthrough (`IconButton.tsx:21-33`).
3. Accessibility: dev-warns when `aria-label`/`aria-labelledby` are both absent (`IconButton.tsx:54-67`); reflects toggle state as `aria-pressed` (`IconButton.tsx:86`). Tooltip node given `role="tooltip"` (`IconButton.tsx:98`).
4. Default `type="button"` (`IconButton.tsx:48`) prevents accidental form submits.
5. Accent theming: surfaces `--vf-accent` CSS custom property (`IconButton.tsx:70`).

Findings:
- P3 (test-only, non-blocking): the dev warning fires at most once per process (`warnedMissingLabel` module-level flag at `IconButton.tsx:35`), so the test at `src/icons/__tests__/Icon.test.tsx:156-165` passes only when it runs before other suites that may have already triggered the warn. Order-sensitive; currently incidental, not broken.
- Minor: `useEffect` warn runs on every mount after label-resolution; acceptable for dev-only code.

No P0/P1/P2.

---

## Distinct component — `IconGroup`

`src/icons/IconButton.tsx:116-174`.

1. Forwards ref: yes (`IconButton.tsx:116`).
2. Prop contract: `gap`, `align`, `separator`, plus `HTMLAttributes<HTMLDivElement>` (`IconButton.tsx:109-114`).
3. Accessibility: interleaved separator spans are `aria-hidden="true"` (`IconButton.tsx:153`).
4. Layout: composes `alignItems` from the `align` string (`IconButton.tsx:123-130`), applies `gap` via inline style.
5. Supports both children-as-array and single child via `Array.isArray` check (`IconButton.tsx:146`).

Findings: none.

---

## Distinct component — `AccessibleIcon`

`src/primitives/AccessibleIcon.tsx` (barrelled from `src/primitives/index.ts`, not from the icons barrel).

1. Prop contract: `label: string` (required), `children: ReactNode` (`AccessibleIcon.tsx:4-8`).
2. Accessibility: clones the child, injects `aria-hidden` + `focusable={false}` (`AccessibleIcon.tsx:18-23`), and appends a `<VisuallyHidden>` sibling carrying the announced label (`AccessibleIcon.tsx:28`).
3. Test coverage: dedicated file at `src/primitives/__tests__/AccessibleIcon.test.tsx` covers both the hidden-label and `aria-hidden` behaviours.
4. No `forwardRef` — primitive is a pass-through fragment; a ref would have no meaningful single target.
5. Lives in `primitives/` rather than `icons/`. This is the intentional split (low-level a11y helper vs. SVG primitive). Cross-reference: it is NOT re-exported from `src/icons/index.ts`.

Findings:
- P3 (doc-only): the icons-family audit prompt treats `AccessibleIcon` as adjacent to the icons group, but the barrel does not re-export it. If consumers are expected to import it alongside `IconButton` etc., consider re-exporting from `src/icons/index.ts`. Non-blocking; current `src/primitives/index.ts` export is sufficient.

No P0/P1/P2.

---

## Zero-finding roster (outlier icons)

None. All 75 factory icons in `src/icons/set.tsx` conform to the shared `IconProps` shape and use `makeIcon` uniformly.

---

## Methodology notes

- Read `src/icons/Icon.tsx` for the canonical `IconProps`.
- Read `src/icons/set.tsx` end-to-end (756 lines) to confirm every export uses `makeIcon` and no icon introduces extra props. Counted `export const <Name>Icon = makeIcon(` occurrences and reconciled against the 75-entry list in `plans/audits/31-component-index.json:1309+`.
- Verified `src/icons/index.ts` explicitly lists every exported symbol — no star re-exports.
- Audited tests at `src/icons/__tests__/Icon.test.tsx` (combined) and `src/primitives/__tests__/AccessibleIcon.test.tsx` (dedicated).
- Cross-checked `src/icons/adapters.tsx` — the `adaptIcon` helper also flows through the same `Icon` base, preserving contract parity for third-party icon libraries.
- No source was modified. No tests were run (read-only audit).

## Severity counts

- P0 (broken shared contract): 0
- P1 (accessibility gap): 0
- P2 (tree-shaking concern): 0
- P3 (test-only / doc-only): 3
  1. No family-wide loop-render smoke test for the 75 icons in `set.tsx`.
  2. `IconButton` dev-warn test is order-sensitive due to module-level `warnedMissingLabel` flag.
  3. `AccessibleIcon` not re-exported from `src/icons/index.ts` (lives in primitives barrel only).
