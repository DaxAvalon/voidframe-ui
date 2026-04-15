import { useMemo, useState, type ReactNode } from "react";
import "../src/css/index.css";
import {
  VoidframeProvider,
  Text,
  Label,
  Button,
  Input,
} from "../src";
import type { ComponentDoc } from "../src";
import propsData from "./data/props.json";
import { pages, type DocPage } from "./pages";

const propsIndex = new Map<string, ComponentDoc>();
for (const doc of propsData as ComponentDoc[]) {
  propsIndex.set(doc.name, doc);
}

export function getPropsFor(name: string): ComponentDoc {
  return (
    propsIndex.get(name) ?? {
      name,
      props: [],
      description: undefined,
    }
  );
}

export default function DocsApp() {
  const [activeId, setActiveId] = useState<string>(pages[0]?.id ?? "");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.group ?? "").toLowerCase().includes(q)
    );
  }, [filter]);

  const grouped = useMemo(() => {
    const out = new Map<string, DocPage[]>();
    for (const p of filtered) {
      const g = p.group ?? "Overview";
      const list = out.get(g) ?? [];
      list.push(p);
      out.set(g, list);
    }
    return Array.from(out.entries());
  }, [filtered]);

  const active = pages.find((p) => p.id === activeId) ?? pages[0]!;

  return (
    <VoidframeProvider>
      <div className="vf-docs">
        <header className="vf-docs__topbar">
          <span className="vf-docs__brand">
            ▲ VOIDFRAME · DOCS
          </span>
          <span className="vf-docs__count">
            {pages.length} pages · {(propsData as ComponentDoc[]).length}{" "}
            components indexed
          </span>
        </header>
        <div className="vf-docs__layout">
          <aside className="vf-docs__nav">
            <div className="vf-docs__search">
              <Input
                value={filter}
                onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
                placeholder="Search…"
                aria-label="Filter doc pages"
              />
            </div>
            <nav aria-label="Documentation pages">
              {grouped.map(([group, items]) => (
                <div key={group} className="vf-docs__nav-group">
                  <Label>{group}</Label>
                  <ul className="vf-docs__nav-list">
                    {items.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={
                            "vf-docs__nav-link" +
                            (p.id === activeId
                              ? " vf-docs__nav-link--active"
                              : "")
                          }
                          onClick={() => setActiveId(p.id)}
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {filtered.length === 0 && (
                <Text size="sm" color="var(--vf-text-3)">
                  No pages match &ldquo;{filter}&rdquo;.
                </Text>
              )}
            </nav>
          </aside>
          <main className="vf-docs__main">
            <Page page={active} />
          </main>
        </div>
      </div>
    </VoidframeProvider>
  );
}

function Page({ page }: { page: DocPage }) {
  return (
    <article className="vf-docs__page">
      <header className="vf-docs__page-head">
        <Text size="xl" upper spacing={3} color="var(--vf-text-0)">
          {page.title}
        </Text>
        {page.subtitle && (
          <Text size="sm" color="var(--vf-text-3)">
            {page.subtitle}
          </Text>
        )}
      </header>
      {page.render()}
    </article>
  );
}

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
