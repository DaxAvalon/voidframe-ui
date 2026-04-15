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

export interface DataListItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DataListProps extends HTMLAttributes<HTMLDivElement> {
  items?: DataListItem[];
  /** Orientation. Default "horizontal" (2-col). */
  orientation?: "horizontal" | "vertical";
  children?: ReactNode;
}

const DataListBase = forwardRef<HTMLDivElement, DataListProps>(function DataList(
  { items, orientation = "horizontal", className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("vf-datalist", `vf-datalist--${orientation}`, className)}
      {...props}
    >
      {items?.map((it, i) => (
        <div key={i} className="vf-datalist__row">
          <div className="vf-datalist__label">{it.label}</div>
          <div className="vf-datalist__value">{it.value}</div>
        </div>
      ))}
      {children}
    </div>
  );
});
DataListBase.displayName = "DataList";

export interface DataListItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
}

const DataListItemComponent = forwardRef<HTMLDivElement, DataListItemProps>(
  function DataListItem({ label, value, className, ...props }, ref) {
    return (
      <div ref={ref} className={cx("vf-datalist__row", className)} {...props}>
        <div className="vf-datalist__label">{label}</div>
        <div className="vf-datalist__value">{value}</div>
      </div>
    );
  }
);
DataListItemComponent.displayName = "DataListItem";

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

export const DescriptionList = Object.assign(DescriptionListBase, {
  Term: DescriptionTerm,
  Description: DescriptionDetail,
});
