import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { genericForwardRef } from "../utils/forwardRef";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  color?: string | ((row: T) => string);
  bold?: boolean;
  fontSize?: number;
  align?: CSSProperties["textAlign"];
  render?: (row: T, index: number) => ReactNode;
}

export interface TableProps<T = Record<string, unknown>>
  extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  style?: CSSProperties;
}

type TableRowLookup = Record<string, unknown>;

export const Table = genericForwardRef(function Table<T = Record<string, unknown>>(
  { columns, data, className, style, ...props }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cx("vf-table", className)} style={style} {...props}>
      <div
        className="vf-table__grid"
        style={{
          gridTemplateColumns: columns.map((c) => c.width ?? "1fr").join(" "),
          minWidth: columns.length * 60,
        }}
      >
        {columns.map((c) => (
          <div
            key={c.key}
            className="vf-table__header-cell"
            style={c.align ? { textAlign: c.align } : undefined}
          >
            {c.header}
          </div>
        ))}
        {data.map((row, ri) =>
          columns.map((c) => {
            const inline: CSSProperties = {
              ...(c.color
                ? {
                    color: typeof c.color === "function" ? c.color(row) : c.color,
                  }
                : {}),
              ...(c.fontSize ? { fontSize: c.fontSize } : {}),
              ...(c.align ? { textAlign: c.align } : {}),
            };
            return (
              <div
                key={`${ri}-${c.key}`}
                className={cx("vf-table__cell", c.bold && "vf-table__cell--bold")}
                style={inline}
              >
                {c.render
                  ? c.render(row, ri)
                  : ((row as TableRowLookup)[c.key] as ReactNode)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
(Table as { displayName?: string }).displayName = "Table";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  style?: CSSProperties;
}

export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, sub, color, className, style, ...props },
  ref
) {
  return (
    <div ref={ref} className={className} style={style} {...props}>
      <Label>{label}</Label>
      <div className="vf-stat__value" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="vf-stat__sub">{sub}</div>}
    </div>
  );
});
Stat.displayName = "Stat";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  /** Bar color (sets `--vf-accent`). */
  color?: string;
  label?: string;
  showValue?: boolean;
  /** Bar height in px. */
  height?: number;
  style?: CSSProperties;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, color, label, showValue, height, className, style, ...props },
  ref
) {
  const pct = Math.min((value / max) * 100, 100);
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...(height !== undefined ? ({ "--vf-progress-height": `${height}px` } as CSSProperties) : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-progress", className)}
      style={composedStyle}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      {...props}
    >
      {(label || showValue) && (
        <div className="vf-progress__head">
          {label && <Label>{label}</Label>}
          {showValue && (
            <Label style={{ color: "var(--vf-accent, var(--vf-green))" }}>
              {Math.round(pct)}%
            </Label>
          )}
        </div>
      )}
      <div className="vf-progress__track">
        <div
          className="vf-progress__fill"
          style={{ width: `${pct}%` }}
          data-empty={pct === 0 ? "true" : undefined}
          data-full={pct >= 100 ? "true" : undefined}
        />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";
