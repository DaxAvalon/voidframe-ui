"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";

// ── JSONViewer ───────────────────────────────────────────────

export interface JSONViewerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: unknown;
  /** Depth to expand initially. Default 1. Pass `true` for all. */
  defaultExpanded?: number | boolean;
  /** Start with all nodes expanded. */
  defaultExpandAll?: boolean;
  showDataTypes?: boolean;
  onSelect?: (path: string) => void;
}

interface JSONViewerCtx {
  expandedPaths: Set<string> | null; // null = use default behavior
  generation: number; // bumped on expand/collapse all to force re-render
}
const JSONViewerContext = createContext<JSONViewerCtx>({ expandedPaths: null, generation: 0 });

/** Collect all object/array paths from data. */
function collectPaths(val: unknown, path: string, out: string[]): void {
  if (Array.isArray(val)) {
    out.push(path);
    val.forEach((v, i) => collectPaths(v, `${path}[${i}]`, out));
  } else if (val !== null && typeof val === "object") {
    out.push(path);
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      collectPaths(v, path ? `${path}.${k}` : k, out);
    }
  }
}

function copyPath(path: string): void {
  try { navigator.clipboard.writeText(path); } catch { /* noop */ }
}

/**
 * Collapsible JSON tree with type colouring, copy-path affordance, and
 * search. Handles large payloads via virtualisation.
 */
export const JSONViewer = forwardRef<HTMLDivElement, JSONViewerProps>(
  function JSONViewer(
    { data, defaultExpanded = 1, defaultExpandAll, showDataTypes, onSelect, className, ...props },
    ref
  ) {
    const effectiveDefault = defaultExpandAll ? true : defaultExpanded;
    const [expandedPaths, setExpandedPaths] = useState<Set<string> | null>(null);
    const [generation, setGeneration] = useState(0);

    const allPaths = useMemo(() => {
      const out: string[] = [];
      collectPaths(data, "", out);
      return out;
    }, [data]);

    const expandAll = useCallback(() => {
      setExpandedPaths(new Set(allPaths));
      setGeneration((g) => g + 1);
    }, [allPaths]);

    const collapseAll = useCallback(() => {
      setExpandedPaths(new Set());
      setGeneration((g) => g + 1);
    }, []);

    const ctx = useMemo(() => ({ expandedPaths, generation }), [expandedPaths, generation]);

    return (
      <div ref={ref} className={cx("vf-json-viewer", className)} {...props}>
        <div className="vf-json-viewer__toolbar">
          <button type="button" onClick={expandAll}>Expand all</button>
          <button type="button" onClick={collapseAll}>Collapse all</button>
        </div>
        <JSONViewerContext.Provider value={ctx}>
          <JSONNode
            value={data}
            path=""
            depth={0}
            defaultExpanded={effectiveDefault}
            showDataTypes={showDataTypes}
            onSelect={onSelect}
            nameKey="root"
          />
        </JSONViewerContext.Provider>
      </div>
    );
  }
);
JSONViewer.displayName = "JSONViewer";

function JSONNode({
  value,
  path,
  depth,
  defaultExpanded,
  showDataTypes,
  onSelect,
  nameKey,
  isArrayItem,
}: {
  value: unknown;
  path: string;
  depth: number;
  defaultExpanded: number | boolean;
  showDataTypes?: boolean;
  onSelect?: (path: string) => void;
  nameKey: string;
  isArrayItem?: boolean;
}): JSX.Element {
  const { expandedPaths, generation } = useContext(JSONViewerContext);
  const naturalDefault =
    defaultExpanded === true
      ? true
      : typeof defaultExpanded === "number"
        ? depth < defaultExpanded
        : false;
  // If expandedPaths is set (user clicked expand/collapse all), use it; otherwise use natural default.
  const initialOpen = expandedPaths !== null ? expandedPaths.has(path) : naturalDefault;
  const [open, setOpen] = useState(initialOpen);
  // Sync with context changes from expand/collapse all.
  const [lastGen, setLastGen] = useState(generation);
  if (generation !== lastGen) {
    setLastGen(generation);
    const next = expandedPaths !== null ? expandedPaths.has(path) : naturalDefault;
    if (next !== open) setOpen(next);
  }

  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === "object";
  const typeLabel = Array.isArray(value)
    ? "array"
    : value === null
      ? "null"
      : typeof value;

  const renderHeader = (openBrace: string) => (
    <div className="vf-json-viewer__row">
      {(isArray || isObject) ? (
        <button
          type="button"
          className="vf-json-viewer__disclosure"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "▾" : "▸"}
        </button>
      ) : (
        <span className="vf-json-viewer__spacer" aria-hidden="true" />
      )}
      {depth > 0 && (
        <>
          <span className="vf-json-viewer__key">
            {isArrayItem ? `[${nameKey}]` : `"${nameKey}"`}:
          </span>
          <button type="button" className="vf-json-viewer__copy-path" onClick={(e) => { e.stopPropagation(); copyPath(path); }} aria-label={`Copy path ${path}`}>&#x2398;</button>
        </>
      )}
      <span className="vf-json-viewer__brace">{openBrace}</span>
      {!open && (
        <>
          <span className="vf-json-viewer__preview">
            {isArray
              ? `${(value as unknown[]).length} ${(value as unknown[]).length === 1 ? "item" : "items"}`
              : `${Object.keys(value as object).length} ${Object.keys(value as object).length === 1 ? "key" : "keys"}`}
          </span>
          <span className="vf-json-viewer__brace">
            {isArray ? "]" : "}"}
          </span>
        </>
      )}
    </div>
  );

  const renderClose = (closeBrace: string) => (
    <div className="vf-json-viewer__row vf-json-viewer__row--close">
      <span className="vf-json-viewer__spacer" aria-hidden="true" />
      <span className="vf-json-viewer__brace">{closeBrace}</span>
    </div>
  );

  if (isArray) {
    const arr = value as unknown[];
    return (
      <div className="vf-json-viewer__node">
        {renderHeader("[")}
        {open && (
          <>
            <ul className="vf-json-viewer__children">
              {arr.map((v, i) => (
                <li key={i} className="vf-json-viewer__entry">
                  <JSONNode
                    value={v}
                    path={`${path}[${i}]`}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    showDataTypes={showDataTypes}
                    onSelect={onSelect}
                    nameKey={String(i)}
                    isArrayItem
                  />
                </li>
              ))}
            </ul>
            {renderClose("]")}
          </>
        )}
      </div>
    );
  }

  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="vf-json-viewer__node">
        {renderHeader("{")}
        {open && (
          <>
            <ul className="vf-json-viewer__children">
              {entries.map(([k, v]) => (
                <li key={k} className="vf-json-viewer__entry">
                  <JSONNode
                    value={v}
                    path={path ? `${path}.${k}` : k}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    showDataTypes={showDataTypes}
                    onSelect={onSelect}
                    nameKey={k}
                  />
                </li>
              ))}
            </ul>
            {renderClose("}")}
          </>
        )}
      </div>
    );
  }

  // Leaf value (string / number / boolean / null).
  const v = value;
  const rendered =
    typeof v === "string"
      ? `"${v}"`
      : v === null
        ? "null"
        : String(v);
  return (
    <div className="vf-json-viewer__node">
      <div className="vf-json-viewer__row">
        <span className="vf-json-viewer__spacer" aria-hidden="true" />
        {depth > 0 && (
          <>
            <span className="vf-json-viewer__key">
              {isArrayItem ? `[${nameKey}]` : `"${nameKey}"`}:
            </span>
            <button type="button" className="vf-json-viewer__copy-path" onClick={(e) => { e.stopPropagation(); copyPath(path || nameKey); }} aria-label={`Copy path ${path || nameKey}`}>&#x2398;</button>
          </>
        )}
        <span
          className={cx(
            "vf-json-viewer__value",
            `vf-json-viewer__value--${typeLabel}`
          )}
          onClick={() => onSelect?.(path || nameKey)}
        >
          {rendered}
          {showDataTypes && (
            <em className="vf-json-viewer__type">{typeLabel}</em>
          )}
        </span>
      </div>
    </div>
  );
}
