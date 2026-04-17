import { useMemo, useState, type ReactNode } from "react";
import "../src/css/index.css";
import {
  VoidframeProvider,
  Text,
  Label,
  Input,
  Badge,
  Stat,
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
  render: () => ReactNode;
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
        The sidebar splits into five sections:
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
          <b>Components</b> — every exported component grouped by category,
          with auto-generated props tables pulled live from source.
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

function ComponentPage({ name }: { name: string }) {
  const doc = getPropsFor(name);
  const over = curated[name];
  const hasDescription = Boolean(doc.description && doc.description.trim());
  const hasProps = doc.props.length > 0;

  // Auto-generate playground code if no curated examples
  const autoCode = !over ? generatePlaygroundCode(doc) : null;

  return (
    <div className="vf-docs__page">
      {/* Section 1: Info */}
      <div className="vf-docs__info-section">
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

        {/* Hook relationships */}
        {componentHooks[name] && (
          <section className="vf-docs__block">
            <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
              Hooks
            </Text>
            {componentHooks[name]!.internal.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 4 }}>Uses internally:</Text>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {componentHooks[name]!.internal.map(h => (
                    <Badge key={h} size="sm" variant="outline">{h}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 4 }}>Recommended:</Text>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {componentHooks[name]!.recommended.map(r => (
                  <div key={r.hook} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <Badge size="sm" tone="info">{r.hook}</Badge>
                    <Text size="xs" color="var(--vf-text-3)">{r.reason}</Text>
                  </div>
                ))}
              </div>
            </div>
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

      {/* Section 2: Playground(s) */}
      <div className="vf-docs__playground-section">
        <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
          Playground
        </Text>

        {over ? (
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
    </div>
  );
}

function ApiEntryPage({ entry }: { entry: ApiEntry }) {
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
                  {usedBy.map(c => <Badge key={c} size="sm" variant="outline">{c}</Badge>)}
                </div>
              </div>
            )}
            {recommendedFor.length > 0 && (
              <div>
                <Text size="xs" color="var(--vf-text-3)" style={{ marginBottom: 4 }}>Recommended for:</Text>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {recommendedFor.map(c => <Badge key={c} size="sm" tone="info">{c}</Badge>)}
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
        <Text>Accessibility audit status for voidframe components. All components are tested with jest-axe. Keyboard and screen reader testing status documented below.</Text>
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

// ── Build the flat nav list ──────────────────────────────────

const allComponents = (propsData as ComponentDoc[]).slice().sort((a, b) =>
  a.name.localeCompare(b.name)
);
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
  ...allComponents.map((c) => ({
    id: `component-${c.name}`,
    title: c.name,
    section: "Components",
    group: categorize(c.file, c.name),
    render: () => <ComponentPage name={c.name} />,
    searchText: `${c.name} ${c.description ?? ""}`,
  })),
  ...allHooks.map((h) => ({
    id: `hook-${h.name}`,
    title: h.name,
    section: "Hooks",
    render: () => <ApiEntryPage entry={h} />,
    searchText: `${h.name} ${h.description ?? ""}`,
  })),
  ...allUtils.map((u) => ({
    id: `util-${u.name}`,
    title: u.name,
    section: "Utilities",
    render: () => <ApiEntryPage entry={u} />,
    searchText: `${u.name} ${u.description ?? ""}`,
  })),
];

const itemsById = new Map<string, NavItem>(items.map((i) => [i.id, i]));

// ── App ──────────────────────────────────────────────────────

type SectionName =
  | "Overview"
  | "Guides"
  | "Patterns"
  | "Components"
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
    "Hooks",
    "Utilities",
  ];
  return sections
    .map<GroupedSection>((s) => {
      const own = list.filter((i) => i.section === s);
      if (s === "Components") {
        const byCat = new Map<string, NavItem[]>();
        for (const it of own) {
          const g = it.group ?? "Other";
          const arr = byCat.get(g) ?? [];
          arr.push(it);
          byCat.set(g, arr);
        }
        const groups = (CATEGORIES as readonly string[])
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
            {guides.length} guides · {allComponents.length} components ·{" "}
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
              <div key={active.id}>{active.render()}</div>
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
