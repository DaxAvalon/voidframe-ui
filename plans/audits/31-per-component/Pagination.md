# `Pagination` functionality audit

**File:** `src/components/Navigation.tsx:244`
**Test:** `src/components/__tests__/Navigation.test.tsx`, `src/components/__tests__/NavigationUpgrades.test.tsx`
**Prop count:** 12
**Bucket:** core

## Prop liveness
- `page` — LIVE (266, 279, 287-288, 306, 316-317, 326)
- `total` — LIVE (265, legacy alias)
- `totalPages` — LIVE (265, 316-317, 325-326)
- `onChange` — LIVE (278, 287, 307, 316, 325)
- `siblingCount` — LIVE (266)
- `boundaryCount` — LIVE (266)
- `showFirstLast` — LIVE (275, 322)
- `showPrevNext` — LIVE (284, 313)
- `showPageSize` — LIVE (331)
- `pageSize` — LIVE (335)
- `pageSizeOptions` — LIVE (339)
- `onPageSizeChange` — LIVE (336)

## Control pattern
- Pattern: Fully controlled — consumer owns `page`. No uncontrolled fallback.
- Uses `useControllableState`: NO (not needed; no default)
- Issues:
  - If `total` and `totalPages` both provided, `totalPages` wins (265) — legacy fallback documented ✓
  - `onChange` is required; no graceful degradation if omitted (TypeScript enforces)

## State transitions
- `totalPages <= 0` → `computePages` returns `[]`; only Prev/Next/First/Last buttons render if flagged ✓ (204)
- `page=1` → Prev/First disabled ✓ (279, 288)
- `page=totalPages` → Next/Last disabled ✓ (317, 326)
- `page > totalPages` (invalid) → Next still disabled; Last's onClick still fires with totalPages. No warning. (FINDING 1)
- `page < 1` (invalid) → computePages starts at siblingStart but includes page num only if > 0; current page button may not render as current; no warning. (FINDING 1)
- `showPageSize=true` + no `pageSize` → `<select>` rendered with undefined value → React warning in controlled select (FINDING 2)
- `pageSize` not in `pageSizeOptions` → no matching option, select value is empty → warns ("...a non-controlled to controlled..."). (FINDING 2)

## Callback signatures
- `onChange(page: number)` — verified (278, 287, 307, 316, 325)
- `onPageSizeChange(size: number)` — verified (336) — `Number(e.target.value)` from select

## Test coverage
- File exists: YES, ~5 tests across 2 files
- Tested props: `page`, `total`, `totalPages`, `onChange`, `siblingCount`, `boundaryCount`, `showFirstLast`, `showPageSize`, `pageSize`, `pageSizeOptions`, `onPageSizeChange`
- Untested props: `showPrevNext` (explicit false/true), edge cases for invalid page

## Findings
1. P1 — No validation of `page` bounds at `src/components/Navigation.tsx:244-350`. If `page < 1` or `page > totalPages`, `computePages` can still push invalid state (e.g. `siblingStart` becomes negative). Prev/Next handlers gate via `page > 1` / `page < totalPages` but `First`/`Last` buttons fire `onChange(1)` and `onChange(totalPages)` unconditionally (278, 325), which may be the intended "reset" but is undocumented.
2. P1 — Uncontrolled-to-controlled select warning risk at `src/components/Navigation.tsx:334-344`. When `showPageSize=true`, the `<select>` is rendered with `value={pageSize}`; if `pageSize` is undefined React warns and switches to uncontrolled. Should guard with `pageSize ?? pageSizeOptions[0]` or default.
3. P2 — Legacy `total` alias is silent at `src/components/Navigation.tsx:265`. No deprecation warning in dev; comment says "Prefer `totalPages`" but nothing nudges migration.
4. P2 — `computePages` produces odd output for small `totalPages` relative to `siblingCount+boundaryCount` at `src/components/Navigation.tsx:215-222`. Clamping via `Math.max(Math.min(page - sibling, ...))` etc. can yield siblingStart > siblingEnd → empty middle. Usually masked by boundary pages but a `totalPages=3, siblingCount=2, boundaryCount=1` case renders duplicates (filtered by the `Set`), still displays correctly but the math is hard to audit.
5. P3 — `showPrevNext=false` untested at `src/components/__tests__/Navigation*.test.tsx`.
