"use client";

// FactRow — "label · value · note" at a 44 px minimum height with the tone
// as a 3 px rule on the leading edge: the row shape checks, diagnostics,
// takes, marks and hotkeys all share.

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import type { Tone } from "../types";

export interface FactRowProps extends HTMLAttributes<HTMLElement> {
  /** What the fact is about. */
  label: ReactNode;
  /** The fact itself; monospace when `mono`. */
  value?: ReactNode;
  /** A short remark after the value (unit, source, "since 09:12"). */
  note?: ReactNode;
  /** Buttons on the trailing edge; never shrink. */
  actions?: ReactNode;
  /** Colour of the leading rule. `neutral` draws it in border-2. */
  tone?: Tone;
  /** Render the value in the monospace stack with tabular numerals. Default true. */
  mono?: boolean;
  /** Minimum height in px. Default 44 (a touch target). */
  minHeight?: number;
  as?: "div" | "li";
  style?: CSSProperties;
}

export const FactRow = forwardRef<HTMLElement, FactRowProps>(function FactRow(
  { label, value, note, actions, tone = "neutral", mono = true, minHeight = 44, as: Tag = "div", className, style, ...props },
  ref
) {
  const ta = toneAttrs("vf-fact-row", { tone });
  return (
    <Tag
      ref={ref as never}
      className={cx(ta.className, className)}
      style={{ ...({ "--vf-fact-row-min-height": `${minHeight}px` } as CSSProperties), ...style }}
      {...ta.attrs}
      {...props}
    >
      <span className="vf-fact-row__label">{label}</span>
      {value !== undefined && value !== null && (
        <span className={cx("vf-fact-row__value", mono && "vf-fact-row__value--mono")}>{value}</span>
      )}
      {note && <span className="vf-fact-row__note">{note}</span>}
      {actions && <span className="vf-fact-row__actions">{actions}</span>}
    </Tag>
  );
});
FactRow.displayName = "FactRow";
