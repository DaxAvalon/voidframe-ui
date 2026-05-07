"use client";

// Phase 9 — DataList + DescriptionList
//
// DataList: stylized label/value rows (scaled up from KeyValue for longer
// lists). Offers compound + array APIs.
//
// DescriptionList: thin semantic wrapper around <dl>/<dt>/<dd> with Voidframe
// styling.

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";

export interface DataListItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DataListProps extends HTMLAttributes<HTMLDivElement> {
  items?: DataListItem[];
  /** Orientation. Default "horizontal" (2-col). */
  orientation?: "horizontal" | "vertical";
  /** Gap between rows. Number values are treated as pixels. */
  gap?: number | string;
  /**
   * Return arbitrary HTML attributes to apply to each rendered row when the
   * array-API (`items`) is used. Tests / instrumentation can attach
   * `data-testid` / `aria-*` per row without falling back to content-based
   * queries. The compound API (`<DataList.Item>`) already accepts spread
   * props directly.
   */
  itemAttributes?: (item: DataListItem, index: number) => HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
}

const DataListBase = forwardRef<HTMLDivElement, DataListProps>(function DataList(
  { items, orientation = "horizontal", gap, itemAttributes, className, children, style, ...props },
  ref
) {
  const gapStyle = gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {};
  return (
    <div
      ref={ref}
      className={cx("vf-datalist", `vf-datalist--${orientation}`, className)}
      style={{ ...gapStyle, ...style }}
      {...props}
    >
      {items?.map((it, i) => {
        const extra = itemAttributes?.(it, i) ?? {};
        return (
          <div key={i} className="vf-datalist__row" data-item-index={i} {...extra}>
            <div className="vf-datalist__label">{it.label}</div>
            <div className="vf-datalist__value">{it.value}</div>
          </div>
        );
      })}
      {children}
    </div>
  );
});
DataListBase.displayName = "DataList";

export interface DataListItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** Semantic tone — highlight rows as success/warning/danger/info. */
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  /**
   * Optional rich expansion content rendered below the label/value row.
   * Use for "click to expand" patterns where the simple value isn't
   * sufficient — nested key/value pairs, code snippets, charts, etc.
   * Voidframe doesn't manage the expand/collapse state; consumers pass
   * `expandedContent` conditionally.
   */
  expandedContent?: ReactNode;
}

const DataListItemComponent = forwardRef<HTMLDivElement, DataListItemProps>(
  function DataListItem(
    { label, value, tone, expandedContent, className, ...props },
    ref
  ) {
    const ta = toneAttrs("vf-datalist__row", { tone });
    return (
      <div
        ref={ref}
        className={cx(ta.className, className)}
        {...ta.attrs}
        {...props}
      >
        <div className="vf-datalist__label">{label}</div>
        <div className="vf-datalist__value">{value}</div>
        {expandedContent && (
          <div className="vf-datalist__expanded">{expandedContent}</div>
        )}
      </div>
    );
  }
);
DataListItemComponent.displayName = "DataListItem";

/**
 * Read-only list of label/value rows for summaries and key/value UIs.
 * Dual API: pass an `items` array, or compose `DataList.Item` children.
 * `orientation="horizontal"` (default) renders a two-column grid;
 * `"vertical"` stacks label above value.
 */
export const DataList = Object.assign(DataListBase, { Item: DataListItemComponent });

// ── DescriptionList ──────────────────────────────────────────

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {}

const DescriptionListBase = forwardRef<HTMLDListElement, DescriptionListProps>(
  function DescriptionList({ className, ...props }, ref) {
    return <dl ref={ref} className={cx("vf-dl", className)} {...props} />;
  }
);
DescriptionListBase.displayName = "DescriptionList";

const DescriptionTerm = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(function DescriptionTerm({ className, ...props }, ref) {
  return (
    <dt
      ref={ref as never}
      className={cx("vf-dl__term", className)}
      {...props}
    />
  );
});
DescriptionTerm.displayName = "DescriptionTerm";

const DescriptionDetail = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(function DescriptionDetail({ className, ...props }, ref) {
  return (
    <dd
      ref={ref as never}
      className={cx("vf-dl__detail", className)}
      {...props}
    />
  );
});
DescriptionDetail.displayName = "DescriptionDetail";

/**
 * Semantic `<dl>` list of term/description pairs. Responsive: stacks below
 * `sm` and lays out in a grid above.
 */
export const DescriptionList = Object.assign(DescriptionListBase, {
  Term: DescriptionTerm,
  Description: DescriptionDetail,
});
