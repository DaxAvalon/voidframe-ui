"use client";

import { forwardRef, memo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { VisuallyHidden } from "../primitives/VisuallyHidden";
import { cx } from "../utils/cx";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface StatusSegment {
  /** Stable id, exposed as `data-segment`. */
  id: string;
  /** Short label before the value ("latency"); omit for self-explanatory values ("Scarlett 2i2"). */
  label?: string;
  /** The value, as text or a small node. */
  value: ReactNode;
  /** Colours the value and adds a visually hidden word (ok · warning · alert · info) so the meaning survives without colour. Default `neutral`. */
  tone?: StatusTone;
  /** Tooltip text. */
  title?: string;
}

export interface StatusStripProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  /** The segments, in display order. */
  segments: StatusSegment[];
  /** Type size. Default `md`. */
  size?: "sm" | "md" | "lg";
  /** Text drawn between segments, decorative. Default `·`. */
  separator?: string;
  /** Allow the line to wrap. Default `false`: one line that scrolls rather than hides. */
  wrap?: boolean;
  /** Accessible name of the list. Default "Status". */
  label?: string;
}

/** The word a tone adds for assistive technology; empty for `neutral`. */
export function toneWord(tone: StatusTone | undefined): string {
  switch (tone) {
    case "success":
      return "ok";
    case "warning":
      return "warning";
    case "danger":
      return "alert";
    case "info":
      return "info";
    default:
      return "";
  }
}

const StatusStripImpl = forwardRef<HTMLUListElement, StatusStripProps>(function StatusStrip(
  { segments, size = "md", separator = "·", wrap = false, label = "Status", className, style, ...rest },
  ref
) {
  const vars = { "--vf-status-strip-separator": JSON.stringify(separator) } as CSSProperties;
  return (
    <ul
      ref={ref}
      aria-label={label}
      className={cx("vf-status-strip", `vf-status-strip--${size}`, wrap && "vf-status-strip--wrap", className)}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {segments.map((s) => {
        const tone = s.tone ?? "neutral";
        const word = toneWord(tone);
        return (
          <li
            key={s.id}
            className={cx("vf-status-strip__segment", `vf-status-strip__segment--${tone}`)}
            data-segment={s.id}
            data-tone={tone}
            title={s.title}
          >
            {s.label && <span className="vf-status-strip__label">{s.label}</span>}
            <span className="vf-status-strip__value">{s.value}</span>
            {word && <VisuallyHidden>{`, ${word}`}</VisuallyHidden>}
          </li>
        );
      })}
    </ul>
  );
});

/**
 * One dense line of named facts — interface · sample rate · latency ·
 * dropouts · "saved 20 s ago" — readable at a glance and never relying on
 * colour alone: each non-neutral tone adds a visually hidden word. A list
 * for assistive technology; the separators are drawn in CSS and so are not
 * read. No live region: a status strip is glanced at, not announced.
 */
export const StatusStrip = memo(StatusStripImpl);
