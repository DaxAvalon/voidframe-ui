"use client";

// ListRow — the two-cell row that never wraps: an identity cell on the
// leading side that flexes and truncates (with a `title` fallback when its
// text is plain), and a trailing cell of controls that never shrinks, at a
// fixed minimum height so rows with and without controls line up.

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import type { Tone } from "../types";
import { selectableAttrs } from "../utils/selectable";

export type ListRowMinHeight = "sm" | "md" | "lg" | number;

export interface ListRowProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Icon, avatar or glyph before the identity cell; never shrinks. */
  leading?: ReactNode;
  /** Controls on the trailing side; never shrink or wrap. */
  trailing?: ReactNode;
  /** Second line under the main text, truncated like it. */
  description?: ReactNode;
  /**
   * Minimum row height: `sm` 32, `md` 40 (default), `lg` 48, or a number of
   * px. Rows with and without controls share it so lists stay even.
   */
  minHeight?: ListRowMinHeight;
  /** Render as a list item for use inside `<ul>` / `<ol>`. */
  as?: "div" | "li";
  tone?: Tone;
  /** Shared selection grammar (`data-selected`, `aria-current`). */
  selected?: boolean;
  /** Make the row selectable: click or Enter/Space calls it. */
  onSelect?: () => void;
  /**
   * Tooltip for the truncated identity text. Default: the text itself when
   * `children` is a string or number; pass `false` to suppress.
   */
  title?: string | false;
  children?: ReactNode;
  style?: CSSProperties;
}

const MIN_HEIGHT: Record<"sm" | "md" | "lg", number> = { sm: 32, md: 40, lg: 48 };

export const ListRow = forwardRef<HTMLElement, ListRowProps>(function ListRow(
  {
    leading,
    trailing,
    description,
    minHeight = "md",
    as: Tag = "div",
    tone,
    selected,
    onSelect,
    onClick,
    onKeyDown,
    title,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const ta = toneAttrs("vf-list-row", { tone });
  const sel = selectableAttrs("vf-list-row", { selected, onSelect, onClick, onKeyDown });
  const text =
    title === false
      ? undefined
      : title ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined);
  const mh = typeof minHeight === "number" ? minHeight : MIN_HEIGHT[minHeight];
  return (
    <Tag
      ref={ref as never}
      className={cx(ta.className, ...sel.classNames, className)}
      style={{ ...({ "--vf-list-row-min-height": `${mh}px` } as CSSProperties), ...style }}
      {...ta.attrs}
      {...props}
      {...sel.attrs}
    >
      {leading && <span className="vf-list-row__leading">{leading}</span>}
      <span className="vf-list-row__identity">
        <span className="vf-list-row__text" title={text}>
          {children}
        </span>
        {description && <span className="vf-list-row__description">{description}</span>}
      </span>
      {trailing && <span className="vf-list-row__trailing">{trailing}</span>}
    </Tag>
  );
});
ListRow.displayName = "ListRow";
