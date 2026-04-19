# Parameter Standardization Audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to parallelize the per-category inspection tasks. Use superpowers:executing-plans to run inline. Steps use checkbox syntax for tracking.

**Goal:** Inventory every component's prop signature, compare to a canonical convention, classify each divergence as "justified" or "needs-harmonization", and produce a concrete remediation plan (new props + deprecation shims) that preserves backward compatibility.

**Architecture:** Read-only inspection pass that produces `plans/audits/29-param-inventory.json` (machine-readable) and `plans/audits/29-findings.md` (human-readable). No source changes in this audit — remediation is a separate follow-on plan.

**Tech Stack:** Read / Grep / ripgrep / the existing `scripts/extract-props.mjs` (which already walks `src/**/*.tsx` with `react-docgen-typescript`).

---

## Scope

**Every exported component**, not every file. One file often exports many components (e.g. `Menu.tsx` exports Menu + 10 dot-notation sub-components; `icons/set.tsx` exports 75 icons).

Current counts (as of 2026-04-18):
- 472 `export const <Name>` exports across all `.tsx` files under `src/`
- 32 `export function <Name>` components
- 11 compound sub-components assigned via dot-notation (`Menu.Item = …`)
- ≈ **500 exported component surfaces total** (consistent with the docs site's "491 components")

Broken down by area:
- `src/components/` (incl. `Chat/`, `Viewers/` subdirs) — 133 files, ≈350 exports
- `src/charts/` (incl. `primitives/`, `series/`, `math/` subdirs) — 47 files, ≈55 exports
- `src/primitives/` — 15 files, ≈18 exports
- `src/icons/` — 5 files, ≈75 exports (mostly in `set.tsx`)
- `src/dev/` — 7 files, ≈8 exports
- `src/provider/`, `src/responsive/`, `src/i18n/`, `src/themes/` — small (<10 exports each)

Hooks (59 files) and utilities (24 files) have their own audits (plan 31 for functionality, plan 30 sweeps their security-relevant surfaces).

Ground truth: `docs/data/props.json` produced by `scripts/extract-props.mjs`. Every task in this audit uses that JSON as the canonical component list, not a file listing.

## Canonical Conventions (v1.0 baseline)

Derived from the current codebase majority pattern. These are the "standard" shapes. Divergences must be justified or fixed.

| Concern | Canonical shape | Notes |
|---|---|---|
| Value-emit callback | `onValueChange(value)` | Added in Phase 33 for form inputs. |
| Raw-event callback (legacy) | `onChange(event)` | Kept on Input/Textarea for back-compat; may coexist with `onValueChange`. |
| Controlled/uncontrolled | `value?` + `defaultValue?` + `onChange?` + (optional) `onValueChange?` | `useControllableState` internally. |
| Disabled vs readonly | `disabled?: boolean`; `readOnly?: boolean` | `readOnly` only on text-like fields where HTML supports it (Input, Textarea, SearchInput, PasswordInput) or where componentry explicitly models it (Switch, RatingInput). Checkbox/Radio use `disabled` only. |
| Variant | `variant?: "solid" \| "outline" \| "subtle" \| "ghost"` | Visual shape/treatment. |
| Tone | `tone?: "default" \| "success" \| "warning" \| "danger" \| "info"` | Semantic color. |
| Size | `size?: "sm" \| "md" \| "lg"` | Dimensional. |
| Polymorphism | `as?: ElementType` + `asChild?: boolean` via `Slot` | `forwardRef` required. |
| Compound | Dot-notation (`Dialog.Trigger`, `Dialog.Content`) | Not `dialog={{ trigger: ..., content: ... }}`. |
| Forwarded spread | `className?`, `style?`, `...rest` onto the root element | Always. |
| Event-handler merging | Compose via `composeEventHandlers` | Never clobber user-provided handlers when `asChild` / `as`. |
| Ref forwarding | `forwardRef<Element, Props>` on every visible component | Required for focus trap, dismissable layer, etc. |

---

## File Structure

**Outputs (created by this plan):**
- `plans/audits/29-param-inventory.json` — full machine-readable prop map
- `plans/audits/29-findings.md` — human-readable findings, grouped by category
- `plans/audits/29-remediation.md` — ordered remediation plan (separate from `findings.md` because remediation has its own acceptance criteria)

**Inputs (read-only):**
- `src/components/**/*.tsx` (incl. `Chat/`, `Viewers/` subdirs)
- `src/primitives/**/*.tsx`
- `src/charts/**/*.tsx` (incl. `primitives/`, `series/`, `math/` subdirs)
- `src/dev/**/*.tsx`
- `src/icons/**/*.{ts,tsx}`
- `src/provider/**/*.tsx`, `src/responsive/**/*.tsx`, `src/i18n/**/*.tsx`, `src/themes/**/*.ts` — small surfaces, swept opportunistically
- `docs/data/props.json` — already-extracted prop metadata from `scripts/extract-props.mjs`. **Shape:** top-level is an **array** of `{ name, description, file, props: [{ name, type, description, required, defaultValue? }] }`. Every `node -e` snippet in this plan assumes that shape.
- `src/hooks/useControllableState.ts` — canonical controlled/uncontrolled pattern

---

## Task 1: Regenerate and snapshot the prop inventory

**Files:**
- Create: `plans/audits/29-param-inventory.json`

- [ ] **Step 1: Run the existing extractor fresh**

```bash
cd /Users/aaron/Code/VoidFrame
docker compose run --rm shell -c "node scripts/extract-props.mjs"
```

Expected: `docs/data/props.json` is updated. Tool logs a count like "Extracted N components".

- [ ] **Step 2: Copy to the audit output location**

```bash
mkdir -p plans/audits
cp docs/data/props.json plans/audits/29-param-inventory.json
```

- [ ] **Step 3: Confirm inventory is non-empty and complete**

```bash
node -e '
const inv = require("./plans/audits/29-param-inventory.json");
if (!Array.isArray(inv)) { console.error("SHAPE DRIFT: props.json is no longer an array — stop and update every node -e script in this plan."); process.exit(1); }
console.log("Components:", inv.length);
const missing = inv.filter(c => !Array.isArray(c.props) || c.props.length === 0);
console.log("Zero-prop entries:", missing.length);
console.log("  (first 10):", missing.slice(0,10).map(c => c.name).join(", "));
'
```

Expected: Components count ≥ 450 (true surface is ~500, per `src/index.ts` + barrels). If count < 400 → Finding 0: docgen regression (shape drift, react-docgen-typescript missing components with generic type params, HOC wrappers, or re-exports). If **Zero-prop entries** list is long, record those as **Finding 0b: docgen-invisible components** — these need manual prop inventory via Read + TypeScript interface inspection.

**Known docgen blind spots** to manually sweep (not caught by `react-docgen-typescript`):
- Components exported via `Parent.Child = Child` dot-notation assignment
- Components wrapped in `forwardRef(...)` after generic type parameters
- 75 icons in `src/icons/set.tsx` (each is a `ForwardRefExoticComponent` with identical `IconProps` — audit as a single surface, not per-icon)
- Re-exports from barrel files

If any of those slip through docgen, the implementer manually adds them to a `plans/audits/29-docgen-blind-spots.json` file and the audit proceeds with that as a supplement.

---

## Task 2: Callback naming audit

**Files:**
- Modify: `plans/audits/29-findings.md` (append section)

**Objective:** For every `on*` prop across the inventory, classify the signature.

- [ ] **Step 1: Enumerate all `on*` props and their signatures**

```bash
node -e '
const inv = require("./plans/audits/29-param-inventory.json");
const rows = [];
for (const comp of inv) {
  for (const p of comp.props || []) {
    if (!p.name.startsWith("on") || p.name[2] !== p.name[2]?.toUpperCase()) continue;
    rows.push({ comp: comp.name, name: p.name, type: (p.type || "").replace(/\s+/g, " ").slice(0, 120) });
  }
}
rows.sort((a,b) => a.name.localeCompare(b.name) || a.comp.localeCompare(b.comp));
for (const r of rows) console.log(`${r.name.padEnd(28)} ${r.comp.padEnd(28)} ${r.type}`);
' > plans/audits/29-callbacks.txt
wc -l plans/audits/29-callbacks.txt
```

**Bounding the classification work:** callback rows will likely exceed 300. Before classifying individually, **group by callback name first**: for each unique `onFoo` name, gather the components using it. Families of identical-named callbacks get one classification decision, not N. Only when signature differs across components does the row require per-component classification.

- [ ] **Step 2: Classify each callback**

For each row, record one of:
- `CANON` — matches `onValueChange(value)` / `onChange(event)` / `onSelect(value)` / `onSubmit(value)` / etc. shape
- `LEGACY-OK` — e.g., `onChange: (e) => void` on Input/Textarea. Back-compat keep.
- `NONSTANDARD-JUSTIFIED` — domain requires it (e.g., `onReact: (emoji) => void` on ReactionBar — not a value control)
- `NONSTANDARD-FIX` — needs harmonization

Write classifications into `plans/audits/29-findings.md` under **§2. Callback naming**. Use this template per finding:

```markdown
### Finding 2.N: <short title>
- **Component(s):** `Foo` (`src/components/Foo.tsx`), `Bar` (`src/components/Bar.tsx`)
- **Current:** `onFooChange(foo: Foo, meta: Meta) => void`
- **Canonical:** `onValueChange(value: Foo) => void` with `meta` exposed via a separate prop or context
- **Classification:** NONSTANDARD-FIX
- **Remediation:** add `onValueChange`; keep `onFooChange` with `@deprecated` JSDoc + runtime `warnOnce` for one minor version, then remove in next major.
- **Migration cost:** low (2 components, ~12 call sites internally)
```

- [ ] **Step 3: Commit the findings so far**

```bash
git add plans/audits/29-callbacks.txt plans/audits/29-findings.md
git commit -m "audit 29: callback-naming findings"
```

---

## Task 3: Variant / tone / size audit

**Objective:** Find props named `variant`, `tone`, `kind`, `type`, `size`, `color`, `intent`, `appearance`, `look`, `style` (as enum). Decide which family each belongs to, flag naming collisions (e.g. Badge uses BOTH `variant` and `tone` — which is it?).

- [ ] **Step 1: List every enum-shaped prop**

```bash
node -e '
const inv = require("./plans/audits/29-param-inventory.json");
const rows = [];
for (const comp of inv) {
  for (const p of comp.props || []) {
    const t = (p.type || "");
    if (!t.includes("|") || !t.includes("\"")) continue;
    rows.push({ comp: comp.name, name: p.name, type: t.replace(/\s+/g, " ").slice(0, 140) });
  }
}
rows.sort((a,b) => a.name.localeCompare(b.name) || a.comp.localeCompare(b.comp));
for (const r of rows) console.log(`${r.name.padEnd(18)} ${r.comp.padEnd(26)} ${r.type}`);
' > plans/audits/29-enums.txt
```

- [ ] **Step 2: Build the naming collision table**

Record each component that uses multiple of {variant, tone, kind, type, color, intent, appearance}. For Badge, Alert, Progress, Button, IconButton, Badge — expect collisions. Classify each as:
- `DOMAIN-SEPARATE` — two distinct axes legitimately (e.g., Badge shape × Badge color)
- `SYNONYM-FIX` — two names for the same axis across components

Append to `plans/audits/29-findings.md` as **§3. Variant/tone/size**.

- [ ] **Step 3: Audit size literal consistency**

Expected values: `"sm" | "md" | "lg"` (and optionally `"xs"` / `"xl"`). Anything else (`"small"`, `"large"`, numeric) is a deviation.

```bash
grep -rn "size\?\s*:\s*\"" src/components/ src/primitives/ src/charts/ src/dev/ | grep -v __tests__ | head -30
```

Classify each deviation.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/29-enums.txt plans/audits/29-findings.md
git commit -m "audit 29: variant/tone/size findings"
```

---

## Task 4: Controlled / uncontrolled state audit

**Objective:** Every stateful component should consistently expose `value` + `defaultValue` + `onChange` (or its value-emit equivalent). Surface components that:
- Expose `value` without `defaultValue` (or vice versa)
- Expose `value` without an `onChange` (read-only-controlled is almost always a bug)
- Expose `onChange` without `value`/`defaultValue` (uncontrolled-only — possibly intentional but worth recording)

- [ ] **Step 1: Generate the value/defaultValue/onChange cross-tab**

```bash
node -e '
const inv = require("./plans/audits/29-param-inventory.json");
const rows = [];
for (const comp of inv) {
  const propSet = new Set((comp.props || []).map(p => p.name));
  const has = (n) => propSet.has(n);
  const pattern = [has("value"), has("defaultValue"), has("onChange"), has("onValueChange")]
    .map((b, i) => b ? ["V","D","C","VC"][i] : "-").join("");
  if (pattern === "----") continue;
  rows.push({ comp: comp.name, pattern });
}
rows.sort((a,b) => a.pattern.localeCompare(b.pattern) || a.comp.localeCompare(b.comp));
for (const r of rows) console.log(`${r.pattern.padEnd(12)} ${r.comp}`);
' > plans/audits/29-control.txt
```

- [ ] **Step 2: Flag every non-standard pattern**

Canonical shapes: `VDC-`, `VDCVC`, `VD--` (read-only display), `-DC-`, `---VC`.
Deviations to flag: `V---` (controlled without a setter), `V-C-` missing `defaultValue`, `--C-` without any value source, etc.

For each deviation, record in `plans/audits/29-findings.md` § 4 with:
- whether `useControllableState` is used (grep inside each file)
- whether the component is genuinely meant to be display-only

- [ ] **Step 3: Audit `readOnly` application**

List every component that declares `readOnly` explicitly (not via HTML inheritance):

```bash
grep -rn "readOnly\s*\?:\s*boolean" src/components/ src/primitives/ src/charts/ src/dev/ | grep -v __tests__
```

Confirm: readOnly semantics are honored inside the component body (keyboard / click / focus still work, but state can't change).

- [ ] **Step 4: Commit**

```bash
git add plans/audits/29-control.txt plans/audits/29-findings.md
git commit -m "audit 29: controlled/uncontrolled findings"
```

---

## Task 5: Polymorphism and ref-forwarding audit

**Objective:** Every component rendered as a DOM element should accept `ref`, support `className`/`style`, and support polymorphism if the shape is commonly reused (Button, Text, Heading, Box, Card).

- [ ] **Step 1: Find components that render a DOM element but do NOT use `forwardRef`**

```bash
node -e '
const fs = require("fs"); const path = require("path");
function walk(d) { for (const f of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, f.name); if (f.isDirectory() && !f.name.startsWith("__")) walk(p); else if (f.name.endsWith(".tsx") && !f.name.endsWith(".test.tsx")) check(p); } }
function check(p) {
  const s = fs.readFileSync(p, "utf8");
  if (!/export\s+(const|function)\s+[A-Z]/.test(s)) return;
  if (/forwardRef/.test(s)) return;
  if (/^import\s+.*\bPortal\b/m.test(s)) return;
  if (!/return\s*\(?\s*<[a-z]/.test(s)) return;
  console.log(p);
}
for (const root of ["src/components", "src/primitives", "src/charts", "src/dev"]) walk(root);
' > plans/audits/29-no-forwardref.txt
wc -l plans/audits/29-no-forwardref.txt
```

For each hit, open the file and decide: (a) genuinely wrapper/Provider (ok), or (b) missing `forwardRef` (fix).

- [ ] **Step 2: Find components that should accept `as` / `asChild` but don't**

Targets: Button, Badge, Card, Heading, Text, Link, NavItem, MenuItem, ListItem. For each: check whether `as?` or `asChild?` is in the props. Record those that should but don't.

```bash
for c in Button Badge Card Text Label Link NavItem MenuItem; do
  echo "=== $c ==="
  grep -lr "export const $c\b\|export function $c\b" src/components/ src/primitives/ src/charts/ src/dev/ 2>/dev/null | grep -v __tests__
  grep -hr "asChild\|as\s*\?:" src/components/ src/primitives/ src/charts/ src/dev/ 2>/dev/null | grep -v __tests__ | grep -i "$c" | head -2
done
```

- [ ] **Step 3: Audit root-element prop spreading (full sweep, not a sample)**

Every component should spread `className` + `style` + `{...rest}` onto its root, EXCEPT when it explicitly models a container with its own root + inner element (in which case the convention is: props go to the outermost element, `innerProps` / explicit named props go to the inner).

**Full sweep** across `src/components`, `src/primitives`, `src/charts`, `src/dev`:

```bash
node -e '
const fs = require("fs"); const path = require("path");
const roots = ["src/components", "src/primitives", "src/charts", "src/dev"];
const results = [];
function walk(d) { for (const f of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, f.name); if (f.isDirectory() && !f.name.startsWith("__")) walk(p); else if (f.name.endsWith(".tsx") && !f.name.endsWith(".test.tsx")) check(p); } }
function check(p) {
  const s = fs.readFileSync(p, "utf8");
  if (!/export\s+(const|function)\s+[A-Z]/.test(s)) return;
  const spreadsRest = /\{\.\.\.(rest|props|spread)\}/.test(s);
  const spreadsClass = /className\s*=\s*\{.*\bcx\s*\(/.test(s) || /className\s*=\s*\{className\}/.test(s);
  const spreadsStyle = /style\s*=\s*\{style\}|style\s*=\s*\{.*style.*\}/.test(s);
  if (!spreadsRest || !spreadsClass) results.push({ p, spreadsRest, spreadsClass, spreadsStyle });
}
for (const r of roots) walk(r);
for (const r of results) console.log(r.p.padEnd(60), "rest:", r.spreadsRest?"Y":"N", "class:", r.spreadsClass?"Y":"N", "style:", r.spreadsStyle?"Y":"N");
console.log("---"); console.log("violations:", results.length);
' > plans/audits/29-spread-failures.txt
```

Every hit in the output is a candidate finding. For each: open the file and decide whether the component legitimately manages its own spreading differently (e.g. renders a fragment, renders children-only, uses a Provider pattern) or is genuinely missing the convention.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/29-no-forwardref.txt plans/audits/29-findings.md
git commit -m "audit 29: polymorphism/ref findings"
```

---

## Task 6: Compound-API consistency audit

**Objective:** Decide the compound-API convention (dot-notation vs flat-props), then audit deviations.

Canonical: **dot-notation**. `Dialog.Trigger`, `Dialog.Content`, `Menu.Item`, `Accordion.Item`, `Tabs.List` + `Tabs.Tab` + `Tabs.Panel`.

- [ ] **Step 1: Enumerate components with dot-notation exports**

```bash
grep -rn "\.\(Trigger\|Content\|Item\|Root\|Header\|Footer\|Body\|Close\|Description\|Title\|List\|Tab\|Panel\|Group\)\s*=\s*" src/components/ src/primitives/ src/charts/ src/dev/ 2>/dev/null | grep -v __tests__ | head -40
```

- [ ] **Step 2: Enumerate components that take compound-like data via props instead**

Known: Tabs legacy API (`tabs: TabItem[]`). Also inspect: Menu, Select, Steps, Stepper, Wizard — anywhere the content is a data array rather than composable children.

```bash
grep -rn "tabs:\s*\|items:\s*\|steps:\s*\|options:\s*" src/components/ src/primitives/ src/charts/ src/dev/ 2>/dev/null | grep -v __tests__ | head -30
```

- [ ] **Step 3: Classify each**

For each compound candidate, record:
- Does dot-notation version exist? Yes/No
- Does flat/data version exist? Yes/No
- If both: which is documented as primary?
- If neither: is this even a "compound" surface, or genuinely a data-driven list (Select options, pagination, breadcrumbs)?

Append `§6. Compound patterns` to findings.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/29-findings.md
git commit -m "audit 29: compound-API findings"
```

---

## Task 7: Triage and severity scoring

**Objective:** Convert findings into a prioritized remediation plan.

- [ ] **Step 1: Score every finding**

Add a `**Severity:**` line to each finding using:
- `P0` — Internal inconsistency that produces runtime bugs or wrong-typed callbacks (e.g. a component declares `onChange(value)` but actually invokes `onChange(event)`)
- `P1` — API surface inconsistency that would confuse new users; harmonization required before the library can be documented consistently
- `P2` — Stylistic/naming inconsistency, easy to fix, no breaking change required
- `P3` — Cosmetic / documentation only

- [ ] **Step 2: Count severities and write the executive summary**

Add a summary section at the top of `plans/audits/29-findings.md`:

```markdown
## Summary

| Severity | Count | Examples |
|---|---|---|
| P0 | N | ... |
| P1 | N | ... |
| P2 | N | ... |
| P3 | N | ... |

**Headline finding:** <one sentence — what's the biggest consistency issue?>
```

- [ ] **Step 3: Commit**

```bash
git add plans/audits/29-findings.md
git commit -m "audit 29: triage + executive summary"
```

---

## Task 8: Remediation plan

**Files:**
- Create: `plans/audits/29-remediation.md`

**Objective:** Produce a plan that, if executed, closes every P0 and P1 finding **without breaking existing consumers**.

- [ ] **Step 1: Group findings into remediation "waves"**

Wave 1 (non-breaking): add new prop, keep old, emit `warnOnce`. One commit per component family.
Wave 2 (breaking, deferred to 2.0): remove deprecated props.
Wave 3 (internal only): compound-API refactors that change exports but not component runtime behavior.

For each wave, list: findings covered, estimated commit count, risk.

- [ ] **Step 2: Write the per-component migration table**

For every component with a P0/P1 finding, write:

```markdown
### `ComponentName`
| Old | New | Deprecation | Migration window |
|---|---|---|---|
| `onFooChange(foo, meta)` | `onValueChange(foo)` + `onMeta(meta)` | `warnOnce("ComponentName:onFooChange-deprecated", ...)` | v1.x → remove in v2.0 |
```

- [ ] **Step 3: Define acceptance criteria**

The remediation is "done" when:
1. Every P0/P1 finding has a new-API prop landed with tests for both old + new
2. Migration notes written for every P0/P1 (detailed enough that a codemod COULD be written; actually authoring the codemod is optional and only required when the old→new transform is mechanical across many call sites — `tools/codemods/` already exists from Phase 26, so the tooling is in place)
3. `warnOnce` fires once per old-API usage in dev mode
4. Docs show new API as primary; old marked `@deprecated` in TSDoc
5. CHANGELOG entry under Unreleased records the migration

- [ ] **Step 4: Commit**

```bash
git add plans/audits/29-remediation.md
git commit -m "audit 29: remediation plan"
```

---

## Out of Scope

- Changing any component source file. That happens in the remediation plan execution, not here.
- Behavioral/functionality audit — see plan 31.
- Accessibility audit — the existing `a11yAxe.test.tsx` + plan 33 (Phase 33) covers that; not revisited here.

## Success Criteria

- `plans/audits/29-param-inventory.json` exists and covers every component in `src/components`, `src/primitives`, `src/charts`, `src/dev`, plus the icon surface and small provider/responsive/i18n/themes directories. Count ≥ 450.
- `plans/audits/29-docgen-blind-spots.json` (if created) enumerates any components docgen missed, ensuring manual coverage is not forgotten.
- `plans/audits/29-findings.md` has at least the 6 sections (callbacks, variants, control, polymorphism, compound, executive summary) with severity-scored findings
- `plans/audits/29-remediation.md` specifies exact migration for every P0/P1 finding
- `git diff --stat src/` shows zero modified source files at the end of the audit (the plan is read-only; implementation is a separate follow-on)
