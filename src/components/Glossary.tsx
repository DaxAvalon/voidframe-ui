"use client";

// Glossary — one vocabulary for inline terms and a consolidated list.
//
// `GlossaryProvider` holds the terms; `<Term id>` marks a defined term in
// running text (dotted underline, `cursor: help`, portaled definition on
// hover / focus); `GlossaryList` renders the same terms as a definition list,
// optionally in sections.

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Tooltip, type Placement } from "./Popovers";
import { cx } from "../utils/cx";

export interface GlossaryTerm {
  /** The word as shown in the list (defaults to the id). */
  term?: string;
  definition: ReactNode;
  /** Section heading in `GlossaryList` when no explicit sections are given. */
  section?: string;
  /** Related term ids. */
  see?: string[];
}

export type GlossaryTerms = Record<string, GlossaryTerm>;

interface GlossaryContextValue {
  terms: GlossaryTerms;
  get: (id: string) => (GlossaryTerm & { id: string }) | undefined;
}

const GlossaryContext = createContext<GlossaryContextValue>({ terms: {}, get: () => undefined });

export interface GlossaryProviderProps {
  terms: GlossaryTerms;
  children?: ReactNode;
}

/** Supplies the vocabulary to every `Term` and `GlossaryList` below it. Nested providers merge (inner wins). */
export function GlossaryProvider({ terms, children }: GlossaryProviderProps) {
  const parent = useContext(GlossaryContext);
  const value = useMemo<GlossaryContextValue>(() => {
    const merged: GlossaryTerms = { ...parent.terms, ...terms };
    return {
      terms: merged,
      get: (id) => {
        const t = merged[id];
        return t ? { id, ...t } : undefined;
      },
    };
  }, [parent.terms, terms]);
  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
}

/** Read the enclosing glossary. */
export function useGlossary(): GlossaryContextValue {
  return useContext(GlossaryContext);
}

export interface TermProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Key in the provider's `terms`. */
  id: string;
  /** Text to show; default the term's `term` (or the id). */
  children?: ReactNode;
  /** Inline definition when there is no provider entry. */
  definition?: ReactNode;
  placement?: Placement;
  /** Element to render. Default `dfn` for the first mention, `span` otherwise. */
  as?: "dfn" | "span" | "abbr";
}

/**
 * A defined term inside running text. Dotted underline, `cursor: help`,
 * focusable, and the definition in a portaled tooltip linked with
 * `aria-describedby`. Unknown ids render as plain text with
 * `data-term-missing`.
 */
export const Term = forwardRef<HTMLElement, TermProps>(function Term(
  { id, children, definition: inlineDefinition, placement = "top", as: Tag = "dfn", className, ...rest },
  ref
) {
  const glossary = useGlossary();
  const entry = glossary.get(id);
  const definition = inlineDefinition ?? entry?.definition;
  const text = children ?? entry?.term ?? id;
  if (definition === undefined) {
    return (
      <Tag ref={ref as never} className={cx("vf-term", "vf-term--missing", className)} data-term={id} data-term-missing="" {...rest}>
        {text}
      </Tag>
    );
  }
  return (
    <Tooltip content={<span className="vf-term__definition">{definition}</span>} placement={placement}>
      <Tag ref={ref as never} className={cx("vf-term", className)} data-term={id} tabIndex={0} {...rest}>
        {text}
      </Tag>
    </Tooltip>
  );
});
Term.displayName = "Term";

export interface GlossarySection {
  title: ReactNode;
  /** Term ids in this section; omit to collect terms whose `section` matches `title` (when a string). */
  ids?: string[];
}

export interface GlossaryListProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Explicit sections; default: group by each term's `section`, unsectioned terms first. */
  sections?: GlossarySection[];
  /** Terms to show instead of the provider's. */
  terms?: GlossaryTerms;
  /** Case-insensitive filter on term and definition text. */
  filter?: string;
  /** Prefix for each `<dt id>`, so terms can be deep-linked. Default `"term-"`. */
  anchorPrefix?: string;
  /** Called when a "see also" link is clicked. */
  onSelect?: (id: string) => void;
  /** Shown when nothing matches. */
  empty?: ReactNode;
}

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  return "";
}

/**
 * The glossary as a definition list, alphabetical within sections, with
 * anchors per term and "see also" links.
 */
export const GlossaryList = forwardRef<HTMLDivElement, GlossaryListProps>(function GlossaryList(
  { sections, terms: termsProp, filter, anchorPrefix = "term-", onSelect, empty = "No matching terms.", className, ...rest },
  ref
) {
  const glossary = useGlossary();
  const terms = termsProp ?? glossary.terms;
  const q = filter?.trim().toLowerCase() ?? "";
  const entries = Object.entries(terms)
    .map(([id, t]) => ({ id, ...t, word: t.term ?? id }))
    .filter((e) => !q || e.word.toLowerCase().includes(q) || textOf(e.definition).toLowerCase().includes(q))
    .sort((a, b) => a.word.localeCompare(b.word));
  const resolved: Array<{ title: ReactNode; items: typeof entries }> = sections
    ? sections.map((s) => ({
        title: s.title,
        items: s.ids
          ? s.ids.map((id) => entries.find((e) => e.id === id)).filter((e): e is (typeof entries)[number] => Boolean(e))
          : entries.filter((e) => e.section === s.title),
      }))
    : (() => {
        const bySection = new Map<string, typeof entries>();
        for (const e of entries) {
          const key = e.section ?? "";
          bySection.set(key, [...(bySection.get(key) ?? []), e]);
        }
        return [...bySection.entries()]
          .sort(([a], [b]) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))
          .map(([title, items]) => ({ title: title || null, items }));
      })();
  const visible = resolved.filter((s) => s.items.length > 0);
  return (
    <div ref={ref} className={cx("vf-glossary", className)} {...rest}>
      {visible.length === 0 ? (
        <p className="vf-glossary__empty">{empty}</p>
      ) : (
        visible.map((section, i) => (
          <section key={i} className="vf-glossary__section">
            {section.title ? <h3 className="vf-glossary__title">{section.title}</h3> : null}
            <dl className="vf-glossary__list">
              {section.items.map((e) => (
                <div key={e.id} className="vf-glossary__entry" data-term={e.id}>
                  <dt id={`${anchorPrefix}${e.id}`} className="vf-glossary__term">
                    {e.word}
                  </dt>
                  <dd className="vf-glossary__definition">
                    {e.definition}
                    {e.see && e.see.length > 0 ? (
                      <span className="vf-glossary__see">
                        {" "}
                        See also:{" "}
                        {e.see.map((sid, j) => (
                          <span key={sid}>
                            {j > 0 ? ", " : ""}
                            <a
                              href={`#${anchorPrefix}${sid}`}
                              className="vf-glossary__link"
                              onClick={onSelect ? (ev) => { ev.preventDefault(); onSelect(sid); } : undefined}
                            >
                              {terms[sid]?.term ?? sid}
                            </a>
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
});
GlossaryList.displayName = "GlossaryList";
