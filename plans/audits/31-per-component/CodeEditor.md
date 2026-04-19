# `CodeEditor` functionality audit

**File:** `src/components/CodeEditor.tsx:48`
**Test:** `src/components/__tests__/CodeEditor.test.tsx`
**Prop count:** 13
**Bucket:** media

## Prop liveness
- `value` — LIVE (passed to useControllableState at 71)
- `defaultValue` — LIVE (72)
- `onChange` — LIVE (73)
- `label` — LIVE (117-120, aria-label fallback at 151)
- `placeholder` — LIVE (148)
- `language` — LIVE (107, 155)
- `highlight` — LIVE (106)
- `showLineNumbers` — LIVE (123)
- `tabSize` — LIVE (92, 100)
- `disabled` — LIVE (149)
- `readOnly` — LIVE (150)
- `minHeight` — LIVE (122)
- `id` — LIVE (78 via useId)

## Control pattern
- Pattern: Standard controllable via `useControllableState`
- Uses `useControllableState`: YES (70-75)
- Issues: Tab handler at 95-97 mutates `ta.value` directly before calling `setCode(next)` — if controlled, next render overwrites `ta.value` with prop but selection is already set. This creates a brief flash but may desync if parent ignores the change. For controlled without onChange, writes are lost silently (documented limitation). (FINDING 1)

## State transitions
- `highlight` provided → `<pre aria-hidden>` overlay renders, textarea gets `--overlay` modifier ✓ (133-143)
- `highlight` absent → overlay omitted, textarea uses base class ✓
- `showLineNumbers=true` + N lines → gutter renders N line numbers ✓ (123-130)
- `showLineNumbers=true` + empty code → lineCount clamped to 1 ✓ (103)
- Tab key → inserts `tabSize` spaces at selection; selection moves past indent ✓ (88-97)
- Shift+Tab → NOT handled — there's no unindent behavior (FINDING 2)
- `readOnly=true` + Tab → `preventDefault` still fires but `setCode(next)` mutates state; readOnly is only on the textarea's default behavior, not on the custom Tab path (FINDING 3)
- `disabled=true` → textarea disabled; label still rendered, container unaffected ✓

## Callback signatures
- `onChange(code: string)` — verified, fires via useControllableState on both text input (82) and Tab insert (97)
- `highlight(code: string, language?: string) => ReactNode` — verified (106)

## Test coverage
- File exists: YES, 5 tests
- Tested props: `label`, `defaultValue`, `tabSize`, `showLineNumbers`, `language`, `highlight`, `onChange`
- Untested props: `value` (controlled), `placeholder`, `disabled`, `readOnly`, `minHeight`, `id`

## Findings
1. P1 — Tab handler mutates DOM before parent state update at `src/components/CodeEditor.tsx:95-97`. In controlled mode with a laggy/async parent `onChange`, textarea value diverges from `value` prop until the parent commits. Prefer setting state only and letting React reconcile.
2. P1 — No Shift+Tab unindent at `src/components/CodeEditor.tsx:86-101`. Users cannot reduce indentation via keyboard; Tab-only editing is asymmetric and a standard editor affordance is missing.
3. P0 — Tab bypasses `readOnly` at `src/components/CodeEditor.tsx:86-101`. The Tab handler calls `setCode(next)` unconditionally; when `readOnly=true`, users can still inject indents and the change is persisted to state and emitted via `onChange`. Guard with `if (readOnly || disabled) return`.
4. P2 — `value` controlled path untested at `src/components/__tests__/CodeEditor.test.tsx`. All current tests are uncontrolled.
5. P3 — `placeholder`, `disabled`, `readOnly`, `minHeight`, `id` props untested.
