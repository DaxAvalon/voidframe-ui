import { useMemo, useState, type ReactNode } from "react";
import "../src/css/index.css";
import {
  VoidframeProvider,
  Text,
  Label,
  Input,
} from "../src";
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
import { categorize, CATEGORIES, type Category } from "./taxonomy";

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
        The sidebar splits into four sections:
      </Text>
      <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
        <li>
          <b>Guides</b> — install, theming, provider options, i18n, dev tools.
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
  return (
    <div>
      {over ? (
        <>
          <section className="vf-docs__block">
            <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
              Summary
            </Text>
            {over.summary}
          </section>
          {over.examples.map((ex) => (
            <section key={ex.title} className="vf-docs__block">
              <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
                {ex.title}
              </Text>
              <Playground
                title={ex.title}
                code={ex.code}
                scope={playgroundScope}
                paneHeight={220}
                noInline={ex.noInline ?? /\brender\s*\(/.test(ex.code)}
              />
            </section>
          ))}
        </>
      ) : hasDescription ? (
        <section className="vf-docs__block">
          <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
            Summary
          </Text>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {doc.description}
          </div>
        </section>
      ) : !hasProps ? (
        <section className="vf-docs__block">
          <Text size="sm" color="var(--vf-text-3)">
            <code>{name}</code> is exported from voidframe but doesn&apos;t
            yet have a TSDoc description or documented props. Check the
            source link below for usage.
          </Text>
        </section>
      ) : null}
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
      {doc.file && (
        <Text size="sm" color="var(--vf-text-3)">
          Source: <code>{doc.file}</code>
        </Text>
      )}
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
                        <div className="vf-docs__nav-subhead">{g.group}</div>
                      )}
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
              {active.render()}
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
