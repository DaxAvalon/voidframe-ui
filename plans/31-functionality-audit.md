# Feature and Functionality Audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development — this audit parallelizes well across component-category subagents. Steps use checkbox syntax for tracking.

**Goal:** For every exported component, verify that (a) every declared prop is actually consumed by the implementation and behaves as documented, (b) state management handles every declared state transition correctly (controlled/uncontrolled, loading, empty, error, disabled, readonly), and (c) event callbacks fire with the documented signature at the documented times. Produce a per-component findings record and a remediation plan.

**Architecture:** Read-only cross-check between (a) the extracted prop metadata in `docs/data/props.json`, (b) the component source in `src/`, and (c) the test files under `__tests__/`. For each component, record "wired / half-wired / dead / missing-test" per prop. No source changes in this audit.

**Tech Stack:** Read / Grep / the existing `docs/data/props.json` / the existing test suite for cross-checking behavior claims.

---

## Scope

**≈ 500 exported component surfaces** across:

- 133 `src/components/*.tsx` files (incl. `Chat/`, `Viewers/` subdirs) — ~350 exports
- 47 `src/charts/*.tsx` files — ~55 exports
- 15 `src/primitives/*.tsx` files
- 7 `src/dev/*.tsx` files
- 75 icons in `src/icons/set.tsx` (audited as a single surface, not per-icon)
- 59 hooks in `src/hooks/` — behavior verification, not prop verification
- 24 utilities in `src/utils/` — function-contract verification

The authoritative component list is `docs/data/props.json`. Regenerate it first (Task 1) and use it as the work queue.

This audit does **not** cover:

- API-consistency (plan 29) — naming conventions
- Security (plan 30) — tainted-data flows
- Documentation accuracy (plan 32) — TSDoc strings themselves

---

## File Structure

**Outputs:**

- `plans/audits/31-component-index.json` — canonical component list + area assignment
- `plans/audits/31-findings.md` — human-readable findings, grouped by category
- `plans/audits/31-per-component/<Component>.md` — one file per component with detailed notes (optional, for heavy components like DataGrid / Chat / Gantt that have 30+ props each)
- `plans/audits/31-remediation.md` — ordered fix plan

**Inputs:**

- `docs/data/props.json` — declared prop surface (regenerate fresh)
- `src/**/*.tsx` — implementation
- `src/**/__tests__/*.test.tsx` — existing behavior verification

---

## Task 1: Build the component work queue

**Files:**
- Create: `plans/audits/31-component-index.json`

- [ ] **Step 1: Regenerate prop metadata**

```bash
cd /Users/aaron/Code/VoidFrame
docker compose run --rm shell -c "node scripts/extract-props.mjs"
```

- [ ] **Step 2: Build the work queue, bucketed by category**

```bash
mkdir -p plans/audits/31-per-component
node -e '
const fs = require("fs");
const inv = require("./docs/data/props.json");
if (!Array.isArray(inv)) { console.error("SHAPE DRIFT: props.json is no longer an array — update this script."); process.exit(1); }
const buckets = {};
for (const comp of inv) {
  const file = comp.file || "";
  const name = comp.name;
  let bucket;
  // Path wins over name regex — a component in /Chat/ goes to the chat bucket even if its name starts with "Message"
  if (file.includes("/charts/")) bucket = "charts";
  else if (file.includes("/primitives/")) bucket = "primitives";
  else if (file.includes("/dev/")) bucket = "dev";
  else if (file.includes("/Chat/")) bucket = "chat";
  else if (file.includes("/Viewers/")) bucket = "viewers";
  // Only fall back to name regex when path is ambiguous
  else if (/^(Form|Input|Checkbox|Radio|Switch|Select|Combobox|Date|Time|Color|File|Signature|Rating|Mask|Search|Password|Currency|Phone|Mention|Textarea|Label|Field)/.test(name)) bucket = "forms";
  else if (/^(Table|DataGrid|Tree|Virtual|List|Card|Kanban)/.test(name)) bucket = "data";
  else if (/^(Dialog|Drawer|Popover|Modal|Sheet|Toast|Tooltip|Menu|Command|Spotlight)/.test(name)) bucket = "overlays";
  else if (/^(Nav|Breadcrumb|Tabs|Link|Anchor|Step|Wizard)/.test(name)) bucket = "navigation";
  else if (/^(Chat|Message|Reaction)/.test(name)) bucket = "chat";
  else if (/(Chart|Graph|Plot|Map|Heatmap|Timeline|Calendar|Gantt|Activity)/.test(name)) bucket = "domain";
  else bucket = "misc";
  (buckets[bucket] ||= []).push({ name, file, propCount: (comp.props || []).length });
}
for (const b of Object.keys(buckets)) buckets[b].sort((a,b) => b.propCount - a.propCount);
fs.writeFileSync("plans/audits/31-component-index.json", JSON.stringify(buckets, null, 2));
console.log("total:", inv.length);
for (const [b, xs] of Object.entries(buckets)) console.log(b.padEnd(14), xs.length);
'
```

Expected: buckets populated; total ≈ 499 (as of 2026-04-18). **Sanity check after running:** scan the printed bucket sizes. If `forms` or `data` exceeds 80 components, split them in Task 2 (two subagents each).

**Misc bucket note:** whatever lands in `misc` is by definition heterogeneous leftovers. The subagent dispatched to `misc` must audit each component independently — do not look for shared patterns within this bucket.

- [ ] **Step 3: Commit**

```bash
git add plans/audits/31-component-index.json
git commit -m "audit 31: component work queue"
```

---

## Task 2: Per-component verification (parallel across buckets)

**Objective:** For every component in the queue, run the 5-point check below. Each bucket can be worked in parallel by a separate subagent.

**Dispatch plan:**

Spawn one subagent per bucket (Explore agent type, thoroughness: `medium` for small buckets, `very thorough` for `forms`, `data`, `overlays`, `charts`). Each subagent receives:

- Its bucket file from `plans/audits/31-component-index.json`
- The 5-point check below
- Output path: `plans/audits/31-per-component/<Component>.md`
- Time limit: one bucket per subagent; no cross-bucket communication

### The 5-point check, per component

For each component in the bucket:

1. **Prop-to-code liveness**
   - Every declared prop name appears in the component body (not just the interface)
   - Dead props go in `FINDING: DEAD PROP`
   - Aliased/renamed props (e.g. prop destructured as different name) counted as live

2. **Controlled/uncontrolled correctness**
   - If `value` is declared, `onChange` or `onValueChange` should also be declared (otherwise it's a read-only-controlled trap)
   - If `defaultValue` is declared, `value` should also be supported (otherwise no upgrade path)
   - Uses `useControllableState` where applicable (not ad-hoc `useState` paired with a prop)

3. **State transitions**
   - For each documented state (`loading`, `error`, `empty`, `disabled`, `readOnly`, `open`, `collapsed`), confirm the component actually renders differently
   - Look for `data-disabled`, `aria-disabled`, `aria-busy`, `aria-invalid` etc. applied in the render output

4. **Callback signatures**
   - Every `on*` prop: verify it fires with the shape declared in the props interface
   - Verify it does not fire spuriously on mount or unmount (no `useEffect(() => onChange(x), [])`)
   - Verify controlled-mode callbacks still fire even when the prop is controlled externally

5. **Test coverage for the above**
   - If a test exists for the component (`src/**/__tests__/<Component>.test.tsx`), record: does it exercise each prop? Each state? Each callback?
   - If no test file exists → `FINDING: UNTESTED COMPONENT` (include in remediation)

### Output format (one per component)

Write `plans/audits/31-per-component/<Component>.md` with this template:

```markdown
# `<Component>` functionality audit

**File:** `src/.../Component.tsx:<line>`
**Test:** `src/.../__tests__/Component.test.tsx` or `MISSING`
**Prop count:** N

## Prop liveness
- `foo` — LIVE (used at line 42)
- `bar` — LIVE
- `baz` — DEAD (declared but never read in component body) → FINDING 1
- …

## Control pattern
- Pattern: `value` + `defaultValue` + `onChange` + `onValueChange`
- Uses `useControllableState`: YES
- Issues: none / `onChange` not called when `value` is externally controlled (FINDING 2)

## State transitions
- `loading` → renders `<VisuallyHidden>Loading</VisuallyHidden>` + `aria-busy` ✓
- `disabled` → applies `aria-disabled` but still fires `onClick` (FINDING 3)
- …

## Callback signatures
- `onChange(next: T)` — verified
- `onSelect(id: string)` — fires on mount (FINDING 4)

## Test coverage
- File exists: YES, 8 tests
- Tested props: foo, bar, onChange
- Untested props: baz, quux
- Tested states: loading, disabled
- Untested states: readOnly, error
- Untested callbacks: onSelect

## Findings
1. P2 — Dead prop `baz` …
2. P1 — Missing onChange fire on external control update …
3. P2 — disabled state doesn't gate onClick …
4. P0 — onSelect fires on mount (spurious) …
```

- [ ] **Step 1: Dispatch subagents (one per bucket)**

Run these in parallel (single message with multiple Agent tool uses):

```
Agent(subagent_type: Explore, description: "Forms bucket functionality audit")
Agent(subagent_type: Explore, description: "Data bucket functionality audit")
Agent(subagent_type: Explore, description: "Overlays bucket functionality audit")
Agent(subagent_type: Explore, description: "Charts bucket functionality audit")
Agent(subagent_type: Explore, description: "Navigation bucket functionality audit")
Agent(subagent_type: Explore, description: "Chat bucket functionality audit")
Agent(subagent_type: Explore, description: "Viewers bucket functionality audit")
Agent(subagent_type: Explore, description: "Primitives bucket functionality audit")
Agent(subagent_type: Explore, description: "Dev bucket functionality audit")
Agent(subagent_type: Explore, description: "Domain (gantt/kanban/calendar/chart-extras) bucket functionality audit")
Agent(subagent_type: Explore, description: "Misc bucket functionality audit")
```

Each prompt must reference this plan file and the component-index JSON, and include the 5-point check + output-file template verbatim.

- [ ] **Step 2: Collect results**

Verify every component in the index has a corresponding `plans/audits/31-per-component/<Component>.md`. For any missing, re-dispatch with the specific component list.

- [ ] **Step 2.5: Lint every per-component file for required sections**

Before committing, validate that each per-component file has the 6 required sections. A subagent producing a malformed file (missing sections, no findings) would make Task 6's aggregation undercount.

```bash
node -e '
const fs = require("fs"); const path = require("path");
const required = ["## Prop liveness", "## Control pattern", "## State transitions", "## Callback signatures", "## Test coverage", "## Findings"];
const files = fs.readdirSync("plans/audits/31-per-component").filter(f => f.endsWith(".md"));
const bad = [];
for (const f of files) {
  const s = fs.readFileSync(path.join("plans/audits/31-per-component", f), "utf8");
  const missing = required.filter(h => !s.includes(h));
  if (missing.length) bad.push({ f, missing });
}
if (bad.length) {
  console.log("MALFORMED:"); for (const b of bad) console.log("  ", b.f, "missing:", b.missing.join(", "));
  process.exit(1);
} else console.log("all", files.length, "files pass lint");
'
```

Expected: "all N files pass lint". If any file is malformed, re-dispatch that bucket's subagent with the specific components.

- [ ] **Step 3: Commit**

```bash
git add plans/audits/31-per-component/
git commit -m "audit 31: per-component findings"
```

---

## Task 3: Hook contract audit

**Objective:** Hooks don't have props but they do have a return contract and a parameter contract. Verify each.

- [ ] **Step 1: Enumerate hooks**

```bash
node -e '
const fs = require("fs");
const path = require("path");
const hooks = [];
function walk(d) { for (const f of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.match(/^use[A-Z]/) && f.name.endsWith(".ts")) hooks.push(p); } }
walk("src/hooks");
console.log(hooks.length); hooks.forEach(h => console.log(h));
'
```

- [ ] **Step 2: Per-hook check**

For each hook file, open and record:

- Input parameters and their types
- Return shape (tuple / object / value)
- Stability guarantees (which returns are stable across renders? which aren't?)
- SSR behavior (does it touch `window` / `document` / `localStorage` unconditionally? If so, does it guard with `typeof window`?)
- Cleanup (`useEffect` cleanup functions present for subscriptions?)
- Test file exists? If yes, does it assert the return shape?

Write findings into `plans/audits/31-findings.md` under `§3. Hooks`.

- [ ] **Step 3: Focus hooks**

These hooks require deeper inspection:

- `useControllableState` — the canonical controlled/uncontrolled abstraction. Any bug here cascades
- `useForm` — schema adapter hook (Zod/Yup/Valibot)
- `useFieldArray` — array CRUD semantics
- `useEventSource`, `useWebSocket`, `useFetch` — network-touching
- `useLocalStorage`, `useSessionStorage` — persistence
- `useClipboardRead`, `useGeolocation`, `usePermission` — permission-gated

- [ ] **Step 4: Commit**

```bash
git add plans/audits/31-findings.md
git commit -m "audit 31: hook contract findings"
```

---

## Task 4: Utility contract audit

**Objective:** Every utility in `src/utils/` must handle: empty input, null/undefined input, malformed input, boundary values.

- [ ] **Step 1: Enumerate utilities**

```bash
ls src/utils/*.ts | grep -v index.ts | grep -v __tests__
```

Target: 24 files.

- [ ] **Step 2: Per-util check**

For each utility (`cx`, `safeHref`, `sanitizeHtml`, `formatters`, `color`, `date`, `focus`, `composeEventHandlers`, `deepMerge`, etc.):

- Signature + return type
- Handling of undefined/null/empty
- Pure function? (no side effects, no closures over mutable state)
- Test file exists? Tests happy path + edge cases + error case (per the `VoidFrameImplementationPlan.md` minimum bar)?

- [ ] **Step 3: Commit**

```bash
git add plans/audits/31-findings.md
git commit -m "audit 31: utility contract findings"
```

---

## Task 5: Demo/playground coverage cross-check for the top-50 high-surface components

**Objective:** For the 50 highest-prop-count components (from `31-component-index.json`), verify each declared prop has a **demo or playground control that exercises it**. This is static — auditable from source files — not live browser manipulation. A prop with no demo coverage can't be proven to work; a prop with coverage has at least one observed non-default value.

Likely candidates (ranked by prop count; actual list comes from `31-component-index.json`): `DataGrid`, `Chat`, `Gantt`, `Kanban`, `DatePicker`, `Calendar`, `Combobox`, `MediaPlayer`, `RichTextEditor`, `MarkdownEditor`, `Wizard`, `ChartFrame`, `ChatComposer`, `DashboardGrid`, `TreeView`, `Dialog`, `AppShell`, `DependencyGraph`, `NetworkGraph`, `Table`, `VirtualList`, `Form`, `FormProvider`, `CodeEditor`, `Playground`, `DevPanel`, `Spotlight`, `FilterBuilder`, `CronBuilder`, `FileUpload`, `SignaturePad`, `ImageCropper`, `Lightbox`, `Carousel`, `OrgChart`, `LogViewer`, `JSONViewer`, `DiffViewer`, `MarkdownRenderer`, `ColorPicker`, `TimePicker`, `DateTimePicker`, `MentionInput`, `MaskedInput`, `CurrencyInput`, `PhoneInput`, `Menu`, `DrawerCompound`, `Popovers`, `ToastSystem`.

- [ ] **Step 1: For each top-50 component, grep demo + docs for usage**

```bash
node -e '
const fs = require("fs");
const cp = require("child_process");
const idx = require("./plans/audits/31-component-index.json");
const all = Object.values(idx).flat();
all.sort((a,b) => b.propCount - a.propCount);
const top50 = all.slice(0, 50);
for (const c of top50) {
  const grep = cp.execSync(`grep -rn "<${c.name}\\b" demo/ docs/ 2>/dev/null || true`).toString();
  const sites = grep.split("\n").filter(Boolean);
  console.log(c.name, "sites:", sites.length);
}
' > plans/audits/31-top50-coverage.txt
```

- [ ] **Step 2: Per-component prop-level coverage check**

For each top-50 component:

- Read the component's props (from the inventory) and the demo/docs usage sites found above
- For each declared prop, record whether at least one usage site sets it to a non-default value
- Props with zero non-default usages across demo + docs → `FINDING: NO DEMO COVERAGE`. Not necessarily a bug, but it means the prop is unverified by showcase material

Append a `## Demo coverage` section to each top-50 component's file in `plans/audits/31-per-component/`:

```markdown
## Demo coverage
- Demo usage sites: `demo/App.tsx:123`, `docs/curated.tsx:456`
- Props exercised (non-default values observed): `value`, `onChange`, `variant`, `size`
- Props without demo coverage: `loading`, `error`, `readOnly`, `placeholder` → FINDING N
- Combinations tested: `loading + disabled` (none observed) → consider a demo story
```

- [ ] **Step 3: Optional live verification (human-in-the-loop, not required for audit completion)**

If the audit is being run by a human, the demo server can be started for spot-checks:

```bash
docker compose up demo
```

Spot-check any particularly suspicious top-50 findings at http://localhost:5173. Record observations but do not block the audit on this step — the authoritative output is the static coverage table from Step 2.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/31-top50-coverage.txt plans/audits/31-per-component/
git commit -m "audit 31: top-50 demo coverage findings"
```

---

## Task 6: Triage and severity scoring

- [ ] **Step 1: Score every finding**

- `P0` — Declared prop does nothing / callback never fires / state transition never happens (user-visible broken API)
- `P1` — Prop works for main path but not edge path; default value different from docs
- `P2` — Redundant/undocumented prop; dead code; untested but working
- `P3` — Test coverage gap only

- [ ] **Step 2: Aggregate the findings index**

Create `plans/audits/31-findings.md` at the top level with:

```markdown
## Summary

| Severity | Count | Top 5 components by finding count |
|---|---|---|
| P0 | N | ... |
| P1 | N | ... |
| P2 | N | ... |
| P3 | N | ... |

## Component hall of shame
- `ComponentX` — 8 P0+P1 findings
- ...

## Zero-finding components (verified clean)
- `ComponentY`, `ComponentZ`, ...
```

- [ ] **Step 3: Commit**

```bash
git add plans/audits/31-findings.md
git commit -m "audit 31: triage + summary"
```

---

## Task 7: Remediation plan

**Files:**
- Create: `plans/audits/31-remediation.md`

- [ ] **Step 1: For each P0, specify the fix**

Template:

```markdown
### Fix for ComponentName — finding N
- **File:** src/.../Component.tsx:<line>
- **Root cause:** <one sentence>
- **Fix:** <code snippet or prose>
- **Regression test:** add to `<Component>.test.tsx` — test name + assertion shape
```

- [ ] **Step 2: For P1, group into per-component PRs**

One PR per component. Each PR: fix all findings for that component, add regression tests, update TSDoc to match actual behavior.

- [ ] **Step 3: For P2/P3**

Roll into the docs audit (plan 32) when the finding is documentation-only; otherwise into a follow-up cleanup phase. Don't interleave with P0/P1 fixes — they'll just add noise.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/31-remediation.md
git commit -m "audit 31: remediation plan"
```

---

## Success Criteria

- `plans/audits/31-component-index.json` covers every exported component from `docs/data/props.json` (expected ≈ 499 entries as of 2026-04-18)
- Every component in the index has a corresponding `plans/audits/31-per-component/<Component>.md` that passes the Step 2.5 lint check
- Hook and utility findings are in `§3` and `§4` of `plans/audits/31-findings.md`
- Top-50 components have `## Demo coverage` sections
- `plans/audits/31-remediation.md` specifies a fix for every P0/P1
- **`git diff --stat src/` reports zero lines changed** — this audit is read-only; the final commit step verifies this before merging

Final verification command (add to the last commit step in Task 7 or as a separate pre-merge check):

```bash
# MUST show no entries. If any line under src/ is reported, the audit violated its read-only promise.
git diff --stat HEAD~N..HEAD -- src/   # where N = number of commits across this audit
```

## Out of Scope

- Fixing findings — separate implementation plan drives from the remediation doc
- API naming — covered by plan 29
- Security — covered by plan 30
- Documentation verbiage — covered by plan 32
