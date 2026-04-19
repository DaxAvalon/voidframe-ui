# `RegExpTester` functionality audit

**File:** `src/components/RegExpTester.tsx:7`
**Test:** `src/components/__tests__/RegExpTester.test.tsx`
**Prop count:** 15
**Bucket:** utility

## Prop liveness
- `pattern` — LIVE (line 92, via useControllableState)
- `defaultPattern` — LIVE (line 93)
- `onPatternChange` — LIVE (line 94)
- `testString` — LIVE (line 99)
- `defaultTestString` — LIVE (line 100)
- `onTestStringChange` — LIVE (line 101)
- `flags` — LIVE (line 106)
- `defaultFlags` — LIVE (line 107)
- `onFlagsChange` — LIVE (line 108)
- `showFlags` — LIVE (line 146)
- `showMatches` — LIVE (line 184)
- `showCaptures` — LIVE (line 196)
- `showReplace` — LIVE (line 209)
- `size` — LIVE (line 129)
- `readOnly` — LIVE (line 143, 179)

## Control pattern
- Pattern: `value` / `defaultValue` / `onChange` for each of pattern, testString, flags.
- Uses `useControllableState`: YES (lines 91, 98, 105). ✓
- Issues: none.

## State transitions
- `error` (invalid regex) → alert rendered (line 168), matches skipped (line 114).
- `readOnly` → both inputs read-only (143, 179). Flag buttons NOT disabled when `readOnly=true` → FINDING 1.
- `size` → class modifier only.
- Empty pattern → no matches, no error.
- `showReplace=true` → Replace UI rendered but the input has NO `onChange` handler and the result div is empty → FINDING 2 (dead code).

## Callback signatures
- `onPatternChange(pattern: string)` — verified.
- `onTestStringChange(text: string)` — verified.
- `onFlagsChange(flags: string)` — verified.

## Test coverage
- File exists: YES.
- Tested props: pattern, testString, flags (controlled).
- Untested props: showReplace (since it's broken), readOnly+flag-buttons interaction, size variants.
- Tested states: basic match extraction, invalid regex.
- Untested states: readOnly with flag toggle, zero-width match handling (line 49).
- Untested callbacks: onFlagsChange via flag button click.

## Findings
1. P1 — `readOnly` does not disable flag buttons (src/components/RegExpTester.tsx:149). Buttons still call `toggleFlag` → `onFlagsChange` fires when user clicks them despite readOnly.
2. P1 — `showReplace` UI is non-functional at src/components/RegExpTester.tsx:209. The replace input has no `value`/`onChange` binding and the result div is empty. Prop is accepted but the feature is unimplemented (dead render).
3. P2 — `toggleFlag` at line 118 does a string `replace` — if flags contained duplicates (shouldn't, but user could type into a controlled prop), only the first occurrence is removed.
4. P2 — `memo()` wrap at line 225 exists but `displayName` assignment on line 226-227 relies on cast. Works but fragile.
5. P3 — Default `flags="g"` (line 107) means first call always has global; `getMatches` also force-adds `g` (line 39), so default is effectively redundant.
