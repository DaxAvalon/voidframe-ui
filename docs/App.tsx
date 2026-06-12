import { useMemo, useState, type ReactNode } from "react";
import "../src/css/index.css";
import {
  VoidframeProvider,
  Text,
  Label,
  Input,
  Badge,
  Stat,
  CodeBlock,
} from "../src";
import { auditData, getAuditSummary } from "./a11y-audit";
import { migrations } from "./migration";
import {
  Playground,
  PropsTable,
} from "../src/dev";
import type { ComponentDoc } from "../src/dev";
import propsData from "./data/props.json";
import hooksData from "./data/hooks.json";
import utilsData from "./data/utils.json";
import { guides } from "./guides";
import { curated } from "./curated";
import { playgroundScope } from "./scope";
import { generatePlaygroundCode } from "./autoPlayground";
import { categorize, CATEGORIES, type Category } from "./taxonomy";
import { patterns, type Pattern } from "./patterns";
import { componentHooks, getComponentsForHook } from "./hookMap";
import { usageSnippets, LIVE_NON_ELEMENTS } from "./usageSnippets";

// ── Types ────────────────────────────────────────────────────

interface ApiEntry {
  name: string;
  kind: "function" | "variable" | "type" | "interface";
  signature?: string;
  description?: string;
  file?: string;
}

interface NavItem {
  id: string;
  title: string;
  section: string;
  group?: string;
  render: (onNavigate?: (id: string) => void) => ReactNode;
  searchText: string;
}

// ── Indexers ─────────────────────────────────────────────────

const propsIndex = new Map<string, ComponentDoc>();
for (const doc of propsData as ComponentDoc[]) {
  propsIndex.set(doc.name, doc);
}

function getPropsFor(name: string): ComponentDoc {
  return (
    propsIndex.get(name) ?? {
      name,
      props: [],
      description: undefined,
    }
  );
}

type DocKind = NonNullable<ComponentDoc["kind"]>;

/** Entries predating the kind field count as visual elements. */
function kindOf(doc: ComponentDoc): DocKind {
  return doc.kind ?? "element";
}

/** Compound parts folded into this component's page. */
function childrenOf(name: string): ComponentDoc[] {
  return (propsData as ComponentDoc[])
    .filter((d) => kindOf(d) === "subcomponent" && d.docsParent === name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Short honest description of what a non-element entry is. */
const KIND_NOTES: Record<Exclude<DocKind, "element">, string> = {
  layout:
    "Layout utility — arranges its children and renders no visual chrome of its own.",
  primitive:
    "Behavioral primitive — a building block other components compose; mostly or entirely invisible.",
  provider:
    "Provider — supplies context to the subtree; renders nothing visual itself.",
  subcomponent: "Compound part — only meaningful inside its parent component.",
  compat: "shadcn-compat alias backed by the equivalent voidframe component.",
};

// ── Page renderers ───────────────────────────────────────────

function OverviewPage() {
  return (
    <div className="vf-docs__block">
      <Text>
        Voidframe is a dark, monochrome, terminal-brutalist React UI framework.
        Every component is hand-rolled, themed through a single set of{" "}
        <code>--vf-*</code> CSS custom properties, and designed for
        data-dense interfaces.
      </Text>
      <Text>
        The sidebar splits into these sections:
      </Text>
      <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
        <li>
          <b>Guides</b> — install, theming, provider options, i18n, dev tools.
        </li>
        <li>
          <b>Patterns</b> — page-level composition examples showing how
          multiple components work together.
        </li>
        <li>
          <b>Components</b> — every visual component grouped by category,
          with live playgrounds and props tables pulled from source.
          Compound parts (<code>Dialog.Trigger</code>, <code>MenuItem</code>…)
          are documented on their parent&rsquo;s page.
        </li>
        <li>
          <b>Primitives &amp; Utilities</b> — layout utilities
          (<code>VStack</code>, <code>Box</code>…) and behavioral primitives
          (<code>Portal</code>, <code>FocusScope</code>…) that arrange or
          orchestrate rather than draw.
        </li>
        <li>
          <b>Providers</b> — context surfaces like{" "}
          <code>VoidframeProvider</code>, documented with usage code.
        </li>
        <li>
          <b>Compat</b> — shadcn-compat aliases on one collective page.
        </li>
        <li>
          <b>Hooks</b> — every exported React hook with signature and description.
        </li>
        <li>
          <b>Utilities</b> — helper functions for formatting, classnames,
          date math, deprecation, and architecture.
        </li>
      </ul>
      <Text>
        A handful of components ship a curated <b>Playground</b> as well —
        edit the code in the browser and watch the render change live.
      </Text>
    </div>
  );
}

function ComponentPage({ name, onNavigate }: { name: string; onNavigate?: (id: string) => void }) {
  const doc = getPropsFor(name);
  const over = curated[name];
  const hasDescription = Boolean(doc.description && doc.description.trim());
  const hasProps = doc.props.length > 0;
  const kind = kindOf(doc);
  const liveDemo = kind === "element" || LIVE_NON_ELEMENTS.has(name);
  const subParts = childrenOf(name);

  // Auto-generate playground code if no curated examples
  const autoCode = !over && liveDemo ? generatePlaygroundCode(doc) : null;

  return (
    <div className="vf-docs__page">
      {/* Section 1: Info */}
      <div className="vf-docs__info-section">
        {/* Kind note for non-element entries */}
        {kind !== "element" && (
          <section className="vf-docs__block">
            <Badge tone="neutral">{kind}</Badge>{" "}
            <Text size="sm" color="var(--vf-text-3)">
              {KIND_NOTES[kind]}
              {kind === "subcomponent" && doc.docsParent ? (
                <>
                  {" "}Part of <code>{doc.docsParent}</code>.
                </>
              ) : null}
            </Text>
          </section>
        )}
        {/* Description */}
        {over ? (
          <section className="vf-docs__block">
            {over.summary}
          </section>
        ) : hasDescription ? (
          <section className="vf-docs__block">
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {doc.description}
            </div>
          </section>
        ) : (
          <section className="vf-docs__block">
            <Text size="sm" color="var(--vf-text-3)">
              <code>{name}</code> — no description available yet.
            </Text>
          </section>
        )}

        {/* Props table */}
        {hasProps && (
          <section className="vf-docs__block">
            <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
              Props
            </Text>
            <PropsTable
              doc={doc}
              exclude={["className", "style", "children"]}
            />
          </section>
        )}

        {/* Source link */}
        {doc.file && (
          <Text size="sm" color="var(--vf-text-3)">
            Source: <code>{doc.file}</code>
          </Text>
        )}
      </div>

      {/* Divider */}
      <hr className="vf-docs__divider" />

      {/* Section 2: Playground / usage */}
      <div className="vf-docs__playground-section">
        <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
          {liveDemo ? "Playground" : "Usage"}
        </Text>

        {!liveDemo ? (
          // Honest code-only usage for invisible surfaces — no fake demo.
          usageSnippets[name] ? (
            <CodeBlock language="tsx" code={usageSnippets[name]!} />
          ) : (
            <Text size="sm" color="var(--vf-text-3)">
              {kind === "subcomponent" && doc.docsParent
                ? <>See the <code>{doc.docsParent}</code> page for a working example.</>
                : <>See the props table above — this {kind} renders no standalone demo.</>}
            </Text>
          )
        ) : over ? (
          // Curated examples
          over.examples.map((ex) => (
            <section key={ex.title} className="vf-docs__block">
              <Text size="sm" color="var(--vf-text-2)">
                {ex.title}
              </Text>
              <Playground
                title={ex.title}
                code={ex.code}
                scope={playgroundScope}
                paneHeight={260}
                noInline={ex.noInline ?? /\brender\s*\(/.test(ex.code)}
              />
            </section>
          ))
        ) : autoCode ? (
          // Auto-generated playground
          <Playground
            title={`${name} — Live Editor`}
            code={autoCode}
            scope={playgroundScope}
            paneHeight={260}
            noInline={/\brender\s*\(/.test(autoCode)}
          />
        ) : (
          <Text size="sm" color="var(--vf-text-3)">
            No playground available for this component.
          </Text>
        )}
      </div>

      {/* Section 3: Compound parts folded into this page */}
      {subParts.length > 0 && (
        <div className="vf-docs__info-section">
          <hr className="vf-docs__divider" />
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
            Sub-components
          </Text>
          {subParts.map((part) => (
            <section key={part.name} className="vf-docs__block">
              <Text size="sm" style={{ fontWeight: 700 }}>
                <code>{part.name}</code>
              </Text>
              {part.description && (
                <Text size="sm" color="var(--vf-text-3)">
                  {part.description}
                </Text>
              )}
              {part.props.length > 0 && (
                <PropsTable
                  doc={part}
                  exclude={["className", "style", "children"]}
                />
              )}
            </section>
          ))}
        </div>
      )}

      {/* Hook relationships */}
      {componentHooks[name] && (
        <section className="vf-docs__block" style={{ marginTop: 16 }}>
          <hr className="vf-docs__divider" />
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)" style={{ marginTop: 16, marginBottom: 12 }}>
            Compatible Hooks
          </Text>

          {componentHooks[name]!.internal.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 6 }}>Used internally by this component:</Text>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {componentHooks[name]!.internal.map(h => (
                  <button
                    key={h}
                    type="button"
                    className="vf-docs__hook-link vf-docs__hook-link--internal"
                    onClick={() => onNavigate?.(`hook-${h}`)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {componentHooks[name]!.recommended.map(r => (
              <button
                key={r.hook}
                type="button"
                className="vf-docs__hook-card"
                onClick={() => onNavigate?.(`hook-${r.hook}`)}
              >
                <span className="vf-docs__hook-card-name">{r.hook}</span>
                <span className="vf-docs__hook-card-reason">{r.reason}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApiEntryPage({ entry, onNavigate }: { entry: ApiEntry; onNavigate?: (id: string) => void }) {
  return (
    <div>
      {entry.description && (
        <section className="vf-docs__block">
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
            Description
          </Text>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {entry.description}
          </div>
        </section>
      )}
      {entry.signature && (
        <section className="vf-docs__block">
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
            Signature
          </Text>
          <pre
            style={{
              padding: "8px 12px",
              background: "var(--vf-bg-0)",
              border: "1px solid var(--vf-border-1)",
              fontFamily: "var(--vf-font-family)",
              fontSize: "var(--vf-fs-1)",
              color: "var(--vf-text-0)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {entry.signature}
          </pre>
        </section>
      )}
      {entry.file && (
        <Text size="sm" color="var(--vf-text-3)">
          Source: <code>{entry.file}</code>
        </Text>
      )}
      {entry.name.startsWith("use") && (() => {
        const { usedBy, recommendedFor } = getComponentsForHook(entry.name);
        if (usedBy.length === 0 && recommendedFor.length === 0) return null;
        return (
          <section className="vf-docs__block">
            <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
              Components
            </Text>
            {usedBy.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 4 }}>Used internally by:</Text>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {usedBy.map(c => (
                    <button
                      key={c}
                      type="button"
                      className="vf-docs__hook-link"
                      onClick={() => onNavigate?.(`component-${c}`)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {recommendedFor.length > 0 && (
              <div>
                <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 4 }}>Recommended for:</Text>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {recommendedFor.map(c => (
                    <button
                      key={c}
                      type="button"
                      className="vf-docs__hook-link"
                      onClick={() => onNavigate?.(`component-${c}`)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })()}
      {!entry.description && !entry.signature && (
        <Text size="sm" color="var(--vf-text-3)">
          No docstring available for <code>{entry.name}</code>.
        </Text>
      )}
    </div>
  );
}

function GuidePage({ render }: { render: () => ReactNode }) {
  return <>{render()}</>;
}

function PatternPage({ pattern }: { pattern: Pattern }) {
  return (
    <div className="vf-docs__page">
      <div className="vf-docs__info-section">
        <section className="vf-docs__block">
          <Text>{pattern.description}</Text>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {pattern.components.map((c) => (
              <Badge key={c} size="sm" variant="outline">{c}</Badge>
            ))}
          </div>
        </section>
      </div>
      <hr className="vf-docs__divider" />
      <div className="vf-docs__playground-section">
        <Playground
          title={pattern.title}
          code={pattern.code}
          scope={playgroundScope}
          paneHeight={400}
          noInline={/\brender\s*\(/.test(pattern.code)}
        />
      </div>
    </div>
  );
}

function A11yAuditPage() {
  const summary = getAuditSummary(auditData);
  return (
    <div className="vf-docs__page">
      <section className="vf-docs__block">
        <Text>Formal accessibility audit of a representative cross-section of voidframe components. Every component below is exercised through jest-axe on every commit; keyboard navigation and screen-reader behaviour are documented per-entry. The full library uses the same ARIA / focus / roving-tabindex patterns — a complete row-per-component audit is tracked in plan 33.</Text>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <Stat label="WCAG AA" value={`${summary.aaPercent}%`} />
          <Stat label="Keyboard Nav" value={`${summary.keyboardPercent}%`} />
          <Stat label="Screen Reader" value={`${summary.srPercent}%`} />
        </div>
      </section>
      <hr className="vf-docs__divider" />
      <section className="vf-docs__block">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--vf-fs-1)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--vf-border-2)", textAlign: "start" }}>
              <th style={{ padding: "4px 8px" }}>Component</th>
              <th style={{ padding: "4px 8px" }}>Category</th>
              <th style={{ padding: "4px 8px" }}>WCAG</th>
              <th style={{ padding: "4px 8px" }}>Keyboard</th>
              <th style={{ padding: "4px 8px" }}>Screen Reader</th>
              <th style={{ padding: "4px 8px" }}>Focus</th>
            </tr>
          </thead>
          <tbody>
            {auditData.map((item) => (
              <tr key={item.name} style={{ borderBottom: "1px solid var(--vf-border-0)" }}>
                <td style={{ padding: "4px 8px", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "4px 8px", color: "var(--vf-text-3)" }}>{item.category}</td>
                <td style={{ padding: "4px 8px" }}>
                  <Badge tone={item.wcagLevel === "untested" ? "warning" : "success"} size="sm">{item.wcagLevel}</Badge>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <Badge tone={item.keyboardNav === "full" ? "success" : item.keyboardNav === "partial" ? "warning" : "neutral"} size="sm">{item.keyboardNav}</Badge>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <Badge tone={item.screenReader === "tested" ? "success" : "warning"} size="sm">{item.screenReader}</Badge>
                </td>
                <td style={{ padding: "4px 8px", color: "var(--vf-text-3)" }}>{item.focusManagement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MigrationPage() {
  const guide = migrations[0];
  if (!guide) return <Text>No migration guides available yet.</Text>;
  return (
    <div className="vf-docs__page">
      <section className="vf-docs__block">
        <Text size="lg" style={{ fontWeight: 700 }}>{guide.fromVersion} → {guide.toVersion}</Text>
        {guide.breakingChanges.length === 0 ? (
          <Text style={{ color: "var(--vf-text-3)" }}>No breaking changes documented yet. This framework will be populated before the v2 release.</Text>
        ) : (
          guide.breakingChanges.map((bc, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: 600 }}>{bc.component}</Text>
              <Text size="sm">{bc.description}</Text>
              <pre style={{ background: "var(--vf-bg-1)", padding: 8, border: "1px solid var(--vf-border-1)", marginTop: 4 }}>
                {"// Before\n"}{bc.before}{"\n\n// After\n"}{bc.after}
              </pre>
            </div>
          ))
        )}
      </section>
      {guide.newFeatures.length > 0 && (
        <section className="vf-docs__block">
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)">New Features</Text>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            {guide.newFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── Compat page ──────────────────────────────────────────────

function CompatPage({ docs }: { docs: ComponentDoc[] }) {
  const byParent = new Map<string, ComponentDoc[]>();
  for (const d of docs) {
    const root = d.docsParent ?? d.name;
    const arr = byParent.get(root) ?? [];
    arr.push(d);
    byParent.set(root, arr);
  }
  const roots = Array.from(byParent.keys()).sort();
  return (
    <div className="vf-docs__page">
      <div className="vf-docs__info-section">
        <section className="vf-docs__block">
          <Text size="sm" color="var(--vf-text-3)">
            Drop-in aliases mirroring the shadcn/ui API, each backed by the
            equivalent voidframe component. Import from{" "}
            <code>voidframe-ui/compat-shadcn</code> when porting an existing
            shadcn codebase; new code should use the voidframe components
            directly.
          </Text>
        </section>
        {roots.map((root) => (
          <section key={root} className="vf-docs__block">
            <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
              {root}
            </Text>
            {(byParent.get(root) ?? []).map((d) => (
              <div key={d.name} style={{ marginBottom: 12 }}>
                <Text size="sm" style={{ fontWeight: 700 }}>
                  <code>{d.name}</code>
                </Text>
                {d.props.length > 0 && (
                  <PropsTable
                    doc={d}
                    exclude={["className", "style", "children"]}
                  />
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

// ── Build the flat nav list ──────────────────────────────────

const allComponents = (propsData as ComponentDoc[]).slice().sort((a, b) =>
  a.name.localeCompare(b.name)
);

// Partition by kind so the sidebar lists honestly: visual elements
// under Components; invisible utilities and providers in their own
// sections; compound parts folded into their parent's page; compat
// aliases on one collective page.
const elementDocs = allComponents.filter((c) => kindOf(c) === "element");
const utilityDocs = allComponents.filter(
  (c) => kindOf(c) === "layout" || kindOf(c) === "primitive"
);
const providerDocs = allComponents.filter((c) => kindOf(c) === "provider");
const subcomponentDocs = allComponents.filter(
  (c) => kindOf(c) === "subcomponent"
);
const compatDocs = allComponents.filter((c) => kindOf(c) === "compat");
// Subcomponents whose parent has no docs entry keep a standalone page
// rather than dead-ending (e.g. a parent the extractor failed to parse).
const orphanSubDocs = subcomponentDocs.filter(
  (c) => !c.docsParent || !propsIndex.has(c.docsParent)
);

// Folding children into parent pages must not break search: searching a
// child name should surface the parent page.
const childSearchText = new Map<string, string>();
for (const c of subcomponentDocs) {
  if (!c.docsParent) continue;
  childSearchText.set(
    c.docsParent,
    `${childSearchText.get(c.docsParent) ?? ""} ${c.name}`
  );
}
const allHooks = (hooksData as ApiEntry[]).slice().sort((a, b) =>
  a.name.localeCompare(b.name)
);
const allUtils = (utilsData as ApiEntry[]).slice().sort((a, b) =>
  a.name.localeCompare(b.name)
);

const items: NavItem[] = [
  {
    id: "overview",
    title: "Overview",
    section: "Overview",
    render: () => <OverviewPage />,
    searchText: "overview intro",
  },
  ...guides.map((g) => ({
    id: `guide-${g.id}`,
    title: g.title,
    section: "Guides",
    render: () => <GuidePage render={g.render} />,
    searchText: `${g.title} ${g.subtitle ?? ""}`,
  })),
  {
    id: "a11y-audit",
    title: "Accessibility Audit",
    section: "Guides",
    render: () => <A11yAuditPage />,
    searchText: "accessibility a11y audit wcag keyboard screen reader",
  },
  {
    id: "migration-guide",
    title: "Migration Guide",
    section: "Guides",
    render: () => <MigrationPage />,
    searchText: "migration upgrade breaking changes v2",
  },
  ...patterns.map((p) => ({
    id: `pattern-${p.id}`,
    title: p.title,
    section: "Patterns" as SectionName,
    render: () => <PatternPage pattern={p} />,
    searchText: `${p.title} ${p.description} ${p.components.join(" ")}`,
  })),
  ...elementDocs.map((c) => ({
    id: `component-${c.name}`,
    title: c.name,
    section: "Components",
    group: categorize(c.file, c.name),
    render: (onNavigate?: (id: string) => void) => <ComponentPage name={c.name} onNavigate={onNavigate} />,
    searchText: `${c.name} ${c.description ?? ""}${childSearchText.get(c.name) ?? ""}`,
  })),
  ...orphanSubDocs.map((c) => ({
    id: `component-${c.name}`,
    title: c.name,
    section: "Components",
    group: categorize(c.file, c.name),
    render: (onNavigate?: (id: string) => void) => <ComponentPage name={c.name} onNavigate={onNavigate} />,
    searchText: `${c.name} ${c.description ?? ""}`,
  })),
  ...utilityDocs.map((c) => ({
    id: `component-${c.name}`,
    title: c.name,
    section: "Primitives & Utilities",
    group: kindOf(c) === "layout" ? "Layout" : "Primitives",
    render: (onNavigate?: (id: string) => void) => <ComponentPage name={c.name} onNavigate={onNavigate} />,
    searchText: `${c.name} ${c.description ?? ""}`,
  })),
  ...providerDocs.map((c) => ({
    id: `component-${c.name}`,
    title: c.name,
    section: "Providers",
    render: (onNavigate?: (id: string) => void) => <ComponentPage name={c.name} onNavigate={onNavigate} />,
    searchText: `${c.name} ${c.description ?? ""}`,
  })),
  {
    id: "compat-shadcn",
    title: "shadcn compat",
    section: "Compat",
    render: () => <CompatPage docs={compatDocs} />,
    searchText: `shadcn compat aliases ${compatDocs.map((c) => c.name).join(" ")}`,
  },
  ...allHooks.map((h) => ({
    id: `hook-${h.name}`,
    title: h.name,
    section: "Hooks",
    render: (onNavigate?: (id: string) => void) => <ApiEntryPage entry={h} onNavigate={onNavigate} />,
    searchText: `${h.name} ${h.description ?? ""}`,
  })),
  ...allUtils.map((u) => ({
    id: `util-${u.name}`,
    title: u.name,
    section: "Utilities",
    render: (onNavigate?: (id: string) => void) => <ApiEntryPage entry={u} onNavigate={onNavigate} />,
    searchText: `${u.name} ${u.description ?? ""}`,
  })),
];

const itemsById = new Map<string, NavItem>(items.map((i) => [i.id, i]));

// Alias nav IDs for entries without standalone pages, so existing
// onNavigate("component-DialogHeader") calls (hook map, future links)
// resolve to the page that documents them.
for (const c of subcomponentDocs) {
  const own = `component-${c.name}`;
  if (itemsById.has(own)) continue;
  const parentItem = c.docsParent
    ? itemsById.get(`component-${c.docsParent}`)
    : undefined;
  if (parentItem) itemsById.set(own, parentItem);
}
const compatItem = itemsById.get("compat-shadcn")!;
for (const c of compatDocs) {
  const own = `component-${c.name}`;
  if (!itemsById.has(own)) itemsById.set(own, compatItem);
}

// ── App ──────────────────────────────────────────────────────

type SectionName =
  | "Overview"
  | "Guides"
  | "Patterns"
  | "Components"
  | "Primitives & Utilities"
  | "Providers"
  | "Compat"
  | "Hooks"
  | "Utilities";

interface GroupedSection {
  section: SectionName;
  groups: Array<{ group: string | null; items: NavItem[] }>;
}

function groupItems(list: NavItem[]): GroupedSection[] {
  const sections: SectionName[] = [
    "Overview",
    "Guides",
    "Patterns",
    "Components",
    "Primitives & Utilities",
    "Providers",
    "Compat",
    "Hooks",
    "Utilities",
  ];
  const SECTION_GROUP_ORDER: Partial<Record<SectionName, readonly string[]>> = {
    Components: CATEGORIES as readonly string[],
    "Primitives & Utilities": ["Layout", "Primitives"],
  };
  return sections
    .map<GroupedSection>((s) => {
      const own = list.filter((i) => i.section === s);
      const order = SECTION_GROUP_ORDER[s];
      if (order) {
        const byCat = new Map<string, NavItem[]>();
        for (const it of own) {
          const g = it.group ?? "Other";
          const arr = byCat.get(g) ?? [];
          arr.push(it);
          byCat.set(g, arr);
        }
        const groups = order
          .map((cat) => ({
            group: cat,
            items: (byCat.get(cat) ?? []).sort((a, b) =>
              a.title.localeCompare(b.title)
            ),
          }))
          .filter((g) => g.items.length > 0);
        return { section: s, groups };
      }
      return {
        section: s,
        groups: [{ group: null, items: own }],
      };
    })
    .filter((s) => s.groups.some((g) => g.items.length > 0));
}

export default function DocsApp() {
  const [activeId, setActiveId] = useState<string>("overview");
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.searchText.toLowerCase().includes(q));
  }, [filter]);

  const grouped = useMemo(() => groupItems(filteredItems), [filteredItems]);
  const active = itemsById.get(activeId) ?? items[0]!;

  return (
    <VoidframeProvider>
      <div className="vf-docs">
        <header className="vf-docs__topbar">
          <span className="vf-docs__brand">▲ VOIDFRAME · DOCS</span>
          <span className="vf-docs__count">
            {guides.length} guides · {elementDocs.length} components ·{" "}
            {utilityDocs.length + providerDocs.length} primitives & providers ·{" "}
            {allHooks.length} hooks · {allUtils.length} utilities
          </span>
        </header>
        <div className="vf-docs__layout">
          <aside className="vf-docs__nav">
            <div className="vf-docs__search">
              <Input
                value={filter}
                onChange={(e) =>
                  setFilter((e.target as HTMLInputElement).value)
                }
                placeholder="Search…"
                aria-label="Filter docs"
              />
            </div>
            <nav aria-label="Documentation pages">
              {grouped.map(({ section, groups }) => (
                <div key={section} className="vf-docs__nav-section">
                  <Label>{section}</Label>
                  {groups.map((g) => (
                    <div
                      key={g.group ?? section}
                      className="vf-docs__nav-group"
                    >
                      {g.group && (
                        <button
                          type="button"
                          className="vf-docs__nav-subhead"
                          onClick={() => toggleGroup(g.group!)}
                          style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", width: "100%" }}
                        >
                          <span>{g.group}</span>
                          <span>{collapsed.has(g.group!) ? "▸" : "▾"}</span>
                        </button>
                      )}
                      {!collapsed.has(g.group ?? "") && (
                        <ul className="vf-docs__nav-list">
                          {g.items.map((it) => (
                            <li key={it.id}>
                              <button
                                type="button"
                                className={
                                  "vf-docs__nav-link" +
                                  (it.id === activeId
                                    ? " vf-docs__nav-link--active"
                                    : "")
                                }
                                onClick={() => setActiveId(it.id)}
                              >
                                {it.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {filteredItems.length === 0 && (
                <Text size="sm" color="var(--vf-text-3)">
                  No entries match &ldquo;{filter}&rdquo;.
                </Text>
              )}
            </nav>
          </aside>
          <main className="vf-docs__main">
            <article className="vf-docs__page">
              <header className="vf-docs__page-head">
                <Text
                  size="xl"
                  upper
                  spacing={3}
                  color="var(--vf-text-0)"
                >
                  {active.title}
                </Text>
                <Text size="sm" color="var(--vf-text-3)">
                  {active.section}
                  {active.group ? ` · ${active.group}` : ""}
                </Text>
              </header>
              <div key={active.id}>{active.render(setActiveId)}</div>
            </article>
          </main>
        </div>
      </div>
    </VoidframeProvider>
  );
}

// Legacy export for the CLI package snippet hint — no-op in the docs
// site itself. Keeps older imports working if any exist.
export function DocBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="vf-docs__block">
      <Label>{title}</Label>
      {children}
    </section>
  );
}
