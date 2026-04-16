"use client";

import {
  forwardRef,
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
  showDataTypes?: boolean;
  onSelect?: (path: string) => void;
}

export const JSONViewer = forwardRef<HTMLDivElement, JSONViewerProps>(
  function JSONViewer(
    { data, defaultExpanded = 1, showDataTypes, onSelect, className, ...props },
    ref
  ) {
    return (
      <div ref={ref} className={cx("vf-json-viewer", className)} {...props}>
        <JSONNode
          value={data}
          path=""
          depth={0}
          defaultExpanded={defaultExpanded}
          showDataTypes={showDataTypes}
          onSelect={onSelect}
          nameKey="root"
        />
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
  const shouldExpand =
    defaultExpanded === true
      ? true
      : typeof defaultExpanded === "number"
        ? depth < defaultExpanded
        : false;
  const [open, setOpen] = useState(shouldExpand);

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
        <span className="vf-json-viewer__key">
          {isArrayItem ? `[${nameKey}]` : `"${nameKey}"`}:
        </span>
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
          <span className="vf-json-viewer__key">
            {isArrayItem ? `[${nameKey}]` : `"${nameKey}"`}:
          </span>
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
