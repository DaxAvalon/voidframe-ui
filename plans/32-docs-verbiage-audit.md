# Documentation and Demo Verbiage Audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to parallelize per-surface review. Use superpowers:executing-plans inline. Steps use checkbox syntax for tracking.

**Goal:** Inventory every place the project describes itself (to users, to other engineers, to tooling) and verify each description is **accurate**, **readable**, and **complete**. Accurate means it matches the actual behavior in `src/`. Readable means it makes sense to someone who's never used the library. Complete means no public surface is left undescribed.

**Architecture:** Read-only review pass that produces per-surface findings + an ordered rewrite plan. Cross-references plan 31 findings: anywhere the docs are accurate but the *code* is broken, the finding goes to plan 31, not here. Anywhere the code is correct but the docs lie, it's a plan-32 finding.

**Tech Stack:** Read / Grep / `scripts/extract-props.mjs` output / vibe-checking in the docs site (`docs/`) and the demo app (`demo/`).

---

## Scope

Every surface where the library produces words:

1. **Top-level README** — `README.md`
2. **Changelog** — `CHANGELOG.md`
3. **Implementation plan and sub-plans** — `VoidFrameImplementationPlan.md`, `plans/*.md` (only those referenced in the published package — most are excluded via .npmignore; skip them for docs audit but sanity-check for stale cross-references)
4. **Docs site content**:
   - `docs/App.tsx`, `docs/curated.tsx`, `docs/guides.tsx`, `docs/migration.tsx`, `docs/patterns.tsx`, `docs/taxonomy.ts`, `docs/hookMap.ts`, `docs/a11y-audit.ts`, `docs/CONVENTIONS.md`
   - Auto-generated data consumed by the docs site: `docs/data/props.json`, `docs/data/hooks.json`, `docs/data/utils.json`
5. **Demo app** — `demo/App.jsx` or `.tsx` (single entry, plus any subpages)
6. **TSDoc blocks on exported components, hooks, utilities** — embedded in `src/**/*.{ts,tsx}`. These feed the PropsTable in the docs site
7. **Error / warning / invariant messages** — `src/utils/warn.ts`, `src/utils/invariant.ts`, and every `warnOnce(...)` / `warn(...)` / `invariant(...)` call site
8. **CLI output** — `tools/cli/*.{mjs,ts}` (init, theme, codemod, doctor subcommands) help text, success messages, error messages
9. **VS Code extension** — `tools/vscode-voidframe/` snippets (prefixes, descriptions) + hover docs
10. **ESLint rule messages** — `tools/eslint-plugin-voidframe/rules/*.ts` violation messages + suggested fixes
11. **Codemod descriptions** — `tools/codemods/*.mjs`
12. **Tokens export** — `scripts/export-tokens.mjs` emitted file headers and tooling-consumer docs

Out of scope:
- Tests' `describe` / `it` strings (internal to the project, low impact)
- Git commit messages (already written, can't retroactively audit)
- License / Forgejo README footers (boilerplate)

---

## Acceptance criteria (what "accurate + readable + complete" means)

Every text surface is judged against these criteria:

| Criterion | Operational check |
|---|---|
| **Accurate: behavior** | Every behavioral claim in the text can be reproduced against the current code. "Checkbox accepts readonly" — does it? Grep and confirm. |
| **Accurate: surface** | Every named component/hook/prop in the text actually exists at that name. No stale names. |
| **Accurate: signature** | Every code snippet in the text typechecks. Every import path resolves. |
| **Readable: audience-appropriate** | README is for evaluators. Docs site is for adopters. TSDoc is for in-editor autocomplete. Error messages are for someone who just hit the error and needs to know what to do. Each text surface addresses its audience. |
| **Readable: free of marketing fluff** | No adjective without a concrete claim behind it. Strip "elegant", "beautiful", "powerful" unless immediately followed by the specific capability that makes the claim true. |
| **Readable: scannable** | Headings, tables, code blocks. Not walls of prose. |
| **Complete: public surface** | Every exported component, hook, and utility has at minimum a one-line TSDoc. |
| **Complete: onboarding path** | From README, an evaluator can reach "install + import + render a Button" in under 60 seconds. From docs, an adopter can find an example of every component. |
| **Complete: migration** | For any breaking change, there's a migration note. |

---

## File Structure

**Outputs:**

- `plans/audits/32-findings.md` — per-surface findings
- `plans/audits/32-tsdoc-gaps.json` — exports that lack any TSDoc (regenerated from props.json)
- `plans/audits/32-remediation.md` — rewrite plan

---

## Task 1: Inventory all text surfaces

**Files:**
- Create: `plans/audits/32-surfaces.md` (checklist of what's being audited)

- [ ] **Step 1: Regenerate the extracted docs data**

```bash
cd /Users/aaron/Code/VoidFrame
docker compose run --rm shell -c "node scripts/extract-props.mjs"
```

This refreshes `docs/data/props.json` (and any companion files: `hooks.json`, `utils.json`).

- [ ] **Step 2: Count the text surfaces**

```bash
# props.json, hooks.json, utils.json are arrays (confirmed 2026-04-18) — count with .length
echo "README lines:      $(wc -l < README.md)"
echo "CHANGELOG lines:   $(wc -l < CHANGELOG.md)"
echo "Docs content:      $(find docs -name "*.tsx" -o -name "*.ts" -o -name "*.md" | grep -v __tests__ | wc -l) files"
echo "Props metadata:    $(node -e 'const p=require("./docs/data/props.json"); console.log(Array.isArray(p)?p.length:Object.keys(p).length)') components"
echo "Hooks metadata:    $(node -e 'const p=require("./docs/data/hooks.json"); console.log(Array.isArray(p)?p.length:Object.keys(p).length)') hooks"
echo "Utils metadata:    $(node -e 'const p=require("./docs/data/utils.json"); console.log(Array.isArray(p)?p.length:Object.keys(p).length)') utils"
echo "warnOnce calls:    $(grep -rn 'warnOnce(' src/ --include='*.ts' --include='*.tsx' | grep -v __tests__ | wc -l)"
echo "invariant calls:   $(grep -rn 'invariant(' src/ --include='*.ts' --include='*.tsx' | grep -v __tests__ | wc -l)"
echo "CLI files:         $(find tools/cli -name '*.mjs' -o -name '*.ts' -o -name '*.js' | grep -v node_modules | wc -l)"
echo "Codemod files:     $(find tools/codemods -name '*.mjs' -o -name '*.ts' -o -name '*.js' | grep -v node_modules | wc -l)"
```

- [ ] **Step 3: Write `plans/audits/32-surfaces.md` as a checklist**

```markdown
# Verbiage surface inventory

## Primary
- [ ] README.md (N lines)
- [ ] CHANGELOG.md (N lines)

## Docs site
- [ ] docs/App.tsx
- [ ] docs/curated.tsx (primary content)
- [ ] docs/guides.tsx
- [ ] docs/patterns.tsx
- [ ] docs/migration.tsx
- [ ] docs/taxonomy.ts
- [ ] docs/hookMap.ts
- [ ] docs/a11y-audit.ts
- [ ] docs/CONVENTIONS.md

## Auto-extracted data (audit source, not target)
- [ ] docs/data/props.json (N components) — spot-check TSDoc quality
- [ ] docs/data/hooks.json (N hooks)
- [ ] docs/data/utils.json (N utils)

## Demo
- [ ] demo/App.tsx (or .jsx)

## Runtime messages
- [ ] N warnOnce calls
- [ ] N invariant calls
- [ ] src/utils/warn.ts wrapper messages

## Tooling
- [ ] tools/cli/ help + messages
- [ ] tools/codemods/ messages
- [ ] tools/eslint-plugin-voidframe/ rule messages
- [ ] tools/vscode-voidframe/ snippets + hover docs
```

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-surfaces.md
git commit -m "audit 32: verbiage surface inventory"
```

---

## Task 2: README review

**Objective:** README is the first thing anyone sees on GitHub. Must pass all three criteria.

- [ ] **Step 1: Read README.md end-to-end** and record findings in `plans/audits/32-findings.md` under `§2. README`

For each section, evaluate:

- **Intro / tagline** — one sentence, no adjectives-without-claims
- **Install** — correct package name (currently `voidframe`; will become `@voidframe/ui` per `plans/npm-publish-plan.md`). Flag if mismatched with package.json
- **Quick start** — an example that can be copy-pasted and runs. Test this by actually pasting it into a fresh project (see Step 3)
- **Subpath imports** — `./charts`, `./dev`, `./tokens`, `./testing`, `./styles.css`. Verify each matches `package.json` `exports`
- **Peer deps** — every peer dep listed with when you need it (e.g., "d3-geo: only for ChoroplethMap / BubbleMap")
- **Theme selector / customization** — tokens, CSS variables, density, contrast, RTL
- **SSR support** — current status of SSR claims
- **Browser support** — explicit matrix (Chrome/Firefox/Safari minimum versions; any IE/legacy is a no)
- **Contributing** — link to Forgejo, expected workflow, test invocation
- **License** — MIT link works

- [ ] **Step 2: Flag every behavioral claim that can be cross-checked**

For each claim, add a `**Verifiable:** <command or file:line>` note. Examples:

- "99% test coverage" — verify against `npm run test:coverage` output
- "Zero runtime dependencies" — `node -e 'console.log(Object.keys(require("./package.json").dependencies || {}))'` should be `[]`
- "Under 170 KB gzipped" — `npm run size` output

Any claim that fails verification is a P0 finding (README lies to users).

- [ ] **Step 3: Pack-and-test the Quick Start against a local tarball**

The published package name doesn't exist on npm yet (see `plans/npm-publish-plan.md` — the rename to `@voidframe/ui` and the npm publish have not happened). Use `npm pack` to produce a local tarball and install from disk:

```bash
cd /Users/aaron/Code/VoidFrame
docker compose run --rm build                   # produce fresh dist/
docker compose run --rm --entrypoint sh shell -c "npm pack --pack-destination /tmp"
# Tarball name will be `voidframe-1.0.0.tgz` (or `@voidframe-ui-1.0.0.tgz` post-rename)

mkdir -p /tmp/vf-quickstart-test && cd /tmp/vf-quickstart-test
npm init -y
npm install /tmp/voidframe-1.0.0.tgz react react-dom
# Now try to follow the README Quick Start verbatim — writing a file, importing, rendering
```

If the Quick Start can't be reproduced against this local install, record the gap as P0. If the only gap is "npm install @voidframe/ui doesn't work because it's unpublished", that's expected — don't record it; defer the live registry test to post-publish per the publish plan.

- [ ] **Step 4: Commit**

```bash
cd /Users/aaron/Code/VoidFrame
git add plans/audits/32-findings.md
git commit -m "audit 32: README findings"
```

---

## Task 3: CHANGELOG review

**Objective:** CHANGELOG must reflect what actually shipped, in order, with accurate per-phase summaries.

- [ ] **Step 1: Cross-check `[Unreleased]` against `git log`**

```bash
git log --oneline --since="2026-02-01" > /tmp/vf-recent-commits.txt
head /tmp/vf-recent-commits.txt
```

Every Phase N commit since the last CHANGELOG-promoted entry should appear under `[Unreleased]`. If CHANGELOG is behind git log, record a finding.

- [ ] **Step 2: Verify the `[Unreleased]` entries describe reality**

For each `### Added — Phase N` section, grep the source for the mentioned symbols:

```bash
# Example: CHANGELOG says Phase 28 added the `voidframe` CLI with init/theme/codemod/doctor
ls tools/cli/commands/  # should show init.mjs, theme.mjs, codemod.mjs, doctor.mjs
```

Flag any "added" item that doesn't actually exist in the codebase.

- [ ] **Step 3: Verify phase ordering**

CHANGELOG currently stops at Phase 21-28. Git log shows Phases 29-35, 40-47, 50-54, then the Phase-1 framework expansion. Any phase that landed but isn't in CHANGELOG is a P1 finding.

- [ ] **Step 4: Verify `[Unreleased]` → `[1.0.0]` promotion readiness**

The publish plan (`plans/npm-publish-plan.md` Step 5) calls for promoting `[Unreleased]` to `[1.0.0] - <date>` before publish. Write out the version-headed entry that should replace `[Unreleased]`.

- [ ] **Step 5: Commit**

```bash
git add plans/audits/32-findings.md
git commit -m "audit 32: CHANGELOG findings"
```

---

## Task 4: Docs-site content review

**Objective:** Every page in `docs/` must display accurate component info, working playground examples, and up-to-date narrative copy.

- [ ] **Step 1: Start the docs site**

```bash
docker compose up docs
```

Browse http://localhost:5175.

- [ ] **Step 2: Per-page review** (record in `§4. Docs site`)

- **Landing page** (`docs/App.tsx`) — tagline, nav structure, visual baseline
- **Curated components page** (`docs/curated.tsx`) — every component listed has a description + at least one working playground example. Broken playgrounds = P0
- **Guides** (`docs/guides.tsx`) — installation, theming, accessibility, SSR. Each guide: accurate and complete
- **Patterns** (`docs/patterns.tsx`) — app-shell patterns, data patterns. Each pattern has runnable code
- **Migration** (`docs/migration.tsx`) — from other libraries (if claimed) or between versions
- **Taxonomy** (`docs/taxonomy.ts`) — the categorization should match how the docs are structured
- **Hook map** (`docs/hookMap.ts`) — verify every hook-component mapping against source grep
- **A11y audit** (`docs/a11y-audit.ts`) — live results or canned?
- **CONVENTIONS.md** — author-facing guide for adding docs examples

For each page, record:

- Accuracy violations (stale component names, wrong props, broken imports)
- Readability issues (walls of prose, undefined acronyms, marketing fluff)
- Completeness gaps (components listed in index but no page; components that exist in source but aren't in the docs at all)

- [ ] **Step 3: Cross-check against source component list**

`docs/taxonomy.ts` is TypeScript — Node's `require` can't consume it directly. Use grep to extract the CATEGORIES lists, or compile taxonomy through `tsx`:

```bash
# Option A: grep-based extraction (simpler; works from host)
# Pulls every capitalized identifier between quotes in docs/taxonomy.ts
grep -oE '"[A-Z][A-Za-z0-9]+"' docs/taxonomy.ts | tr -d '"' | sort -u > /tmp/taxonomy-names.txt

# Source-side component list from props.json (array, see Task 1 note on shape)
node -e '
const p = require("./docs/data/props.json");
for (const c of p) console.log(c.name);
' | sort -u > /tmp/source-names.txt

# Components in source but NOT in taxonomy
comm -23 /tmp/source-names.txt /tmp/taxonomy-names.txt > /tmp/undocumented.txt
wc -l /tmp/undocumented.txt
head -20 /tmp/undocumented.txt

# Components in taxonomy but NOT in source (stale entries)
comm -13 /tmp/source-names.txt /tmp/taxonomy-names.txt > /tmp/stale-taxonomy.txt
wc -l /tmp/stale-taxonomy.txt
```

Any component in `/tmp/undocumented.txt` is a completeness finding (component exists in source but isn't categorized). Any entry in `/tmp/stale-taxonomy.txt` is an accuracy finding (taxonomy references a component that no longer exists).

**Option B (fallback)** if taxonomy uses computed category names or the grep approach is too noisy: run taxonomy through `tsx` or add a small export script (`scripts/dump-taxonomy.mjs`) that imports the TS module via `tsx` and prints JSON.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-findings.md
git commit -m "audit 32: docs site findings"
```

---

## Task 5: TSDoc coverage audit

**Objective:** Every exported component/hook/utility has at minimum a one-line TSDoc. Every declared prop has a TSDoc or an obvious-from-name justification.

- [ ] **Step 1: Generate the TSDoc-gap list**

`props.json` is an array (confirmed 2026-04-18). This script distinguishes **missing** TSDoc from **present-but-terse** so the quality pass is a second, separate review:

```bash
node -e '
const fs = require("fs");
const props = require("./docs/data/props.json");
if (!Array.isArray(props)) { console.error("SHAPE DRIFT: props.json is no longer an array"); process.exit(1); }
const missing = { components: [], props: [] };
const terse   = { components: [], props: [] };
for (const comp of props) {
  const d = (comp.description || "").trim();
  if (!d) missing.components.push(comp.name);
  else if (d.length < 20) terse.components.push({ comp: comp.name, length: d.length, text: d });
  for (const p of comp.props || []) {
    const pd = (p.description || "").trim();
    if (!pd) missing.props.push({ comp: comp.name, prop: p.name });
    // No terse pass for props — one-liners like "The label." are often adequate
  }
}
fs.writeFileSync("plans/audits/32-tsdoc-gaps.json", JSON.stringify({ missing, terse }, null, 2));
console.log("Components with NO TSDoc:", missing.components.length);
console.log("Components with TERSE TSDoc (<20 chars):", terse.components.length);
console.log("Props with NO TSDoc:", missing.props.length);
'
```

The `terse` list is a **quality** review queue (does the one-liner actually explain the component, or is it fluff like "A component for X"?). The `missing` lists are the hard gaps. Prioritize by finding count per component and by which components appear in the docs taxonomy.

- [ ] **Step 2: Do the same for hooks and utils**

```bash
node -e '
const paths = ["./docs/data/hooks.json", "./docs/data/utils.json"];
for (const p of paths) {
  const data = require(p);
  const entries = Array.isArray(data) ? data : Object.entries(data).map(([k,v]) => ({ name: k, ...v }));
  const missing = entries.filter(e => !e.description || e.description.trim().length === 0).map(e => e.name);
  const terse = entries.filter(e => { const d = (e.description || "").trim(); return d && d.length < 20; }).map(e => e.name);
  console.log(p, "missing:", missing.length, "terse:", terse.length);
  if (missing.length) console.log("  missing:", missing.slice(0, 10).join(", "));
  if (terse.length)   console.log("  terse:  ", terse.slice(0, 10).join(", "));
}
'
```

- [ ] **Step 3: Classify gaps**

Not every prop needs a full paragraph:

- Obvious-from-name (`className`, `style`, `children`, `ref`) — no description required
- Domain-specific — must have description
- Enum types — must describe each enum value

Record the components with the highest "meaningful gap" counts as a priority list for TSDoc rewrites.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-tsdoc-gaps.json plans/audits/32-findings.md
git commit -m "audit 32: TSDoc coverage findings"
```

---

## Task 6: Demo app review

**Objective:** The demo app at `demo/App.jsx` should showcase every component at least once, with realistic data. It's the developer's second impression (after README).

- [ ] **Step 1: Start the demo**

```bash
docker compose up demo
```

Browse http://localhost:5173.

- [ ] **Step 2: Per-section review**

For each section/page in the demo, record:

- Does it render? (JS error = P0)
- Does the copy explain what's being shown? (or is it just bare components with no context?)
- Is the data realistic? (Lorem ipsum and placeholder emojis are a P2 readability issue)
- Are every-variant-exhaustive vs canonical-usage examples clearly separated?

- [ ] **Step 3: Coverage check**

Demo imports may use brace-named (`import { A, B }`), default, or namespace (`import * as X`) forms, and may span multiple lines. Use ripgrep with multiline + a capture that grabs all imported identifiers:

```bash
# Named imports (including multi-line) from relative src paths
rg --multiline --only-matching --no-filename \
   "from [\"']\\.\\./src[^\"']*[\"']" demo/ | wc -l  # sanity: number of import statements

# Extract named bindings from every import — handles multi-line braces
rg --multiline --multiline-dotall -o '\{([^}]+)\}\s*from\s*"[^"]*src[^"]*"' demo/ -r '$1' \
  | tr ',' '\n' | sed -E 's/\s*//g; s/\sas\s.+//' | grep -E "^[A-Z]" | sort -u \
  > /tmp/demo-imports.txt

# Total component surface
node -e 'const p=require("./docs/data/props.json"); console.log(Array.isArray(p)?p.length:Object.keys(p).length)'
wc -l /tmp/demo-imports.txt

# Components in source but not imported anywhere in demo/
node -e '
const p=require("./docs/data/props.json");
const imported = new Set(require("fs").readFileSync("/tmp/demo-imports.txt","utf8").split("\n").filter(Boolean));
const missing = p.filter(c => !imported.has(c.name)).map(c => c.name);
console.log("undemoed:", missing.length);
console.log(missing.slice(0, 20).join(", "));
' > /tmp/demo-missing.txt
```

The delta is components missing from the demo. If large (>100), record and plan which to add.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-findings.md
git commit -m "audit 32: demo app findings"
```

---

## Task 7: Runtime message audit (warnings, invariants, errors)

**Objective:** Every dev-mode warning and invariant message must tell the user (a) what's wrong, (b) where (which component / prop), (c) how to fix.

- [ ] **Step 1: Extract every warning and invariant message**

```bash
grep -rn "warnOnce\s*(\|warn\s*(\|invariant\s*(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/32-messages.txt
wc -l plans/audits/32-messages.txt
```

- [ ] **Step 2: Classify each message**

For each: open the file, read the message. Classify:

- `GOOD` — what + where + how-to-fix
- `PARTIAL` — missing at least one of those
- `CRYPTIC` — "invalid state" / "not supported" / "see docs" without specifics
- `DEAD` — wrapped in a condition that can never fire

- [ ] **Step 3: Flag duplicate message IDs**

`warnOnce` uses a string key to dedupe. Two callers using the same key will silence the second. Capture double-quoted, single-quoted, AND backtick template keys:

```bash
# Double-quoted
grep -rnh "warnOnce(" src/ --include="*.ts" --include="*.tsx" | grep -oE 'warnOnce\(\s*"[^"]+"' > /tmp/warnonce-keys.txt
# Single-quoted
grep -rnh "warnOnce(" src/ --include="*.ts" --include="*.tsx" | grep -oE "warnOnce\\(\\s*'[^']+'" >> /tmp/warnonce-keys.txt
# Backtick (static — no interpolation)
grep -rnh "warnOnce(" src/ --include="*.ts" --include="*.tsx" | grep -oE 'warnOnce\(\s*`[^`${]+`' >> /tmp/warnonce-keys.txt
# Backtick with interpolation — dynamic key, needs manual review; record site but skip duplicate-count
grep -rn "warnOnce\s*(\s*\`.*\\\${" src/ --include="*.ts" --include="*.tsx" > /tmp/warnonce-dynamic.txt

# Duplicates across all static forms
sort /tmp/warnonce-keys.txt | uniq -c | sort -rn | awk '$1 > 1' | head -20
wc -l /tmp/warnonce-dynamic.txt  # dynamic keys needing manual audit
```

Any count >1 with different content at different call sites is a bug. Dynamic-key sites (interpolated template literals) can't be deduped by the grep — record them separately and spot-check for collisions manually.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-messages.txt plans/audits/32-findings.md
git commit -m "audit 32: runtime message findings"
```

---

## Task 8: Tooling verbiage review (CLI, codemods, ESLint, VS Code)

**Objective:** Tooling output and docs should be concise, actionable, and accurate.

- [ ] **Step 1: Per-CLI-subcommand review**

```bash
docker compose run --rm shell -c "node tools/cli/bin/voidframe.mjs --help"
docker compose run --rm shell -c "node tools/cli/bin/voidframe.mjs init --help"
docker compose run --rm shell -c "node tools/cli/bin/voidframe.mjs theme --help"
docker compose run --rm shell -c "node tools/cli/bin/voidframe.mjs codemod --help"
docker compose run --rm shell -c "node tools/cli/bin/voidframe.mjs doctor --help"
```

For each: is the help readable? Are all flags documented? Do error messages guide the user to a fix?

- [ ] **Step 2: Codemod messages**

```bash
ls tools/codemods/*.mjs
# Read each; classify pre/post-run messages
```

- [ ] **Step 3: ESLint rule messages**

Open each rule in `tools/eslint-plugin-voidframe/rules/`. Record:

- Error message body
- Does it include a one-line suggested fix?
- Does it reference the relevant doc page?

- [ ] **Step 4: VS Code snippets**

```bash
ls tools/vscode-voidframe/snippets/ 2>/dev/null || find tools/vscode-voidframe -name "*.json"
```

For each snippet file, verify:

- `prefix` matches the component name or a short form
- `description` is a one-liner explaining when to reach for it
- `body` references real imports

**Hover docs:** open `tools/vscode-voidframe/src/docs.js` (per CHANGELOG Phase 28 — "tools/vscode-voidframe/src/docs.js which IS covered by __tests__/docs.test.ts"). Record:

- Where does hover content come from? (Expected source: `docs/data/props.json` or a snapshot bundled with the extension)
- Is the bundled snapshot up to date relative to the current extraction output?
- If the extension reads `props.json` at build time, does the packaging script regenerate it before packaging?

If the source-of-truth is unclear, document-what-exists; do not make assumptions about the implementation.

- [ ] **Step 5: Commit**

```bash
git add plans/audits/32-findings.md
git commit -m "audit 32: tooling verbiage findings"
```

---

## Task 9: Triage and severity scoring

- [ ] **Step 1: Score every finding**

- `P0` — lies to users (wrong name, wrong behavior claimed, broken example)
- `P1` — missing critical info (no install step, no peer-dep note, undocumented prop)
- `P2` — readability issue (fluff, unstructured prose, missing examples)
- `P3` — cosmetic (grammar, typos, inconsistent capitalization)

- [ ] **Step 2: Write the summary at the top of `plans/audits/32-findings.md`**

```markdown
## Summary

| Severity | Count | Surface hotspots |
|---|---|---|
| P0 | N | ... |
| P1 | N | ... |
| P2 | N | ... |
| P3 | N | ... |

**Completeness gaps:**
- N components missing from docs taxonomy
- N exports with no TSDoc
- N warnings with cryptic messages

**Headline:** <one sentence — what's the biggest verbiage problem?>
```

- [ ] **Step 3: Commit**

```bash
git add plans/audits/32-findings.md
git commit -m "audit 32: triage + summary"
```

---

## Task 10: Remediation plan

**Files:**
- Create: `plans/audits/32-remediation.md`

- [ ] **Step 1: Group by owner-surface**

- **Waves** rewrite the README, CHANGELOG, and docs-site pages one surface at a time
- **TSDoc additions** batched by component category. **Primary:** use plan-31's `plans/audits/31-component-index.json` bucketing if that audit has produced it. **Fallback** if plan 31 hasn't been executed: group by top-level folder under `src/components/` — files directly in `src/components/` form one group, `src/components/Chat/` another, `src/components/Viewers/` another, `src/charts/` another, etc.
- **Runtime-message rewrites** batched by file
- **Tooling strings** batched by tool

- [ ] **Step 2: Write the exact replacement text for every P0 and P1**

Don't say "rewrite this paragraph" — write the replacement paragraph. Plan 32 is the plan where the new prose actually appears, ready for a follow-on implementation to paste in.

- [ ] **Step 3: Publish-readiness checklist**

The final items in `plans/npm-publish-plan.md` (Steps 5-6: promote changelog, rewrite README install instructions) become concrete: the new text lives in this remediation doc.

- [ ] **Step 4: Commit**

```bash
git add plans/audits/32-remediation.md
git commit -m "audit 32: remediation plan"
```

---

## Success Criteria

- `plans/audits/32-surfaces.md` lists every text surface in scope
- `plans/audits/32-findings.md` has sections for each of Tasks 2-8 with severity-scored findings
- `plans/audits/32-tsdoc-gaps.json` enumerates every export without a TSDoc
- `plans/audits/32-remediation.md` contains ready-to-paste replacement text for every P0 and P1 finding
- Zero source files modified during this audit (prose rewrites happen during remediation execution)

## Out of Scope

- Fixing prose (happens in the remediation execution, not here)
- Marketing site / landing pages outside `docs/` (none exist; if/when they do, separate plan)
- Translating docs (i18n is a separate feature, not a docs audit concern)
- Rewriting tests' `describe` / `it` strings
