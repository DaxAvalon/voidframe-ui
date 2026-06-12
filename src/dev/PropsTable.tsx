"use client";

import { cx } from "../utils/cx";

export interface PropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  required?: boolean;
}

/**
 * What a documented export *is*, so the docs can list it honestly:
 * visual elements get live playgrounds; layout/primitive/provider
 * surfaces get code-only usage docs; subcomponents fold into their
 * parent's page; compat aliases group on the shadcn-compat page.
 */
export type ComponentDocKind =
  | "element"
  | "layout"
  | "primitive"
  | "provider"
  | "subcomponent"
  | "compat";

export interface ComponentDoc {
  name: string;
  description?: string;
  props: PropDoc[];
  /** Source file path relative to the repo root. Emitted by the
   * extract-props script so the docs site can link back to source. */
  file?: string;
  /** Resolved by scripts/docs-kinds.mjs at extract time. Entries
   * predating the kind field are treated as "element". */
  kind?: ComponentDocKind;
  /** Owning component for subcomponent/compat kinds. */
  docsParent?: string;
}

export interface PropsTableProps {
  /** Component doc object, typically loaded from docs/data/props.json. */
  doc: ComponentDoc;
  /** Pre-filter to this subset of prop names. */
  only?: string[];
  /** Exclude these prop names (e.g. HTML-attribute noise). */
  exclude?: string[];
  className?: string;
}

export function PropsTable({
  doc,
  only,
  exclude,
  className,
}: PropsTableProps) {
  let rows = doc.props;
  if (only) {
    const allow = new Set(only);
    rows = rows.filter((p) => allow.has(p.name));
  }
  if (exclude) {
    const deny = new Set(exclude);
    rows = rows.filter((p) => !deny.has(p.name));
  }
  rows = rows.slice().sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={cx("vf-props-table", className)}>
      <table className="vf-props-table__table">
        <thead>
          <tr>
            <th scope="col">prop</th>
            <th scope="col">type</th>
            <th scope="col">default</th>
            <th scope="col">description</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="vf-props-table__empty">
                No props documented for {doc.name}.
              </td>
            </tr>
          ) : (
            rows.map((p) => (
              <tr key={p.name}>
                <td className="vf-props-table__name">
                  {p.name}
                  {p.required && (
                    <span
                      className="vf-props-table__required"
                      aria-label="required"
                    >
                      *
                    </span>
                  )}
                </td>
                <td className="vf-props-table__type">
                  <code>{p.type}</code>
                </td>
                <td className="vf-props-table__default">
                  {p.defaultValue ? <code>{p.defaultValue}</code> : <span>—</span>}
                </td>
                <td className="vf-props-table__desc">
                  {p.description ?? ""}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
PropsTable.displayName = "PropsTable";
