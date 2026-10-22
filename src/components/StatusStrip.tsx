"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { VisuallyHidden } from "../primitives/VisuallyHidden";
import { cx } from "../utils/cx";
import { useMergedRefs } from "../hooks/useMergedRefs";

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
  /**
   * How important the segment is when the strip must shed values
   * (`collapse`). Lower numbers drop first; equal priorities drop from the
   * end. Omit for a segment that is never dropped.
   */
  priority?: number;
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
  /**
   * Drop segments by `priority` when the strip is narrower than its content
   * (lowest priority first; segments without a priority always stay). The
   * strip measures itself and re-evaluates on resize. Default `false`.
   */
  collapse?: boolean;
  /** Called when the set of hidden segment ids changes under `collapse`. */
  onCollapseChange?: (hiddenIds: string[]) => void;
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

/**
 * Decide which segments to hide so the rest fits in `available` px.
 * `widths` are the segments' natural widths (including the separator gap).
 * Drops the lowest priority first, ties from the end; segments without a
 * priority are never dropped. Exported for tests and custom strips.
 */
export function collapseSegments(
  segments: readonly Pick<StatusSegment, "id" | "priority">[],
  widths: ReadonlyMap<string, number>,
  available: number
): string[] {
  const hidden: string[] = [];
  if (!(available > 0)) return hidden;
  let total = 0;
  for (const s of segments) total += widths.get(s.id) ?? 0;
  if (total <= available) return hidden;
  const droppable = segments
    .map((s, index) => ({ s, index }))
    .filter(({ s }) => s.priority !== undefined)
    .sort((a, b) => a.s.priority! - b.s.priority! || b.index - a.index);
  for (const { s } of droppable) {
    if (total <= available) break;
    total -= widths.get(s.id) ?? 0;
    hidden.push(s.id);
  }
  return hidden;
}

const StatusStripImpl = forwardRef<HTMLUListElement, StatusStripProps>(function StatusStrip(
  {
    segments,
    size = "md",
    separator = "·",
    wrap = false,
    collapse = false,
    onCollapseChange,
    label = "Status",
    className,
    style,
    ...rest
  },
  ref
) {
  const vars = { "--vf-status-strip-separator": JSON.stringify(separator) } as CSSProperties;
  const listRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergedRefs(ref, listRef);
  const widthsRef = useRef(new Map<string, number>());
  const [hidden, setHidden] = useState<string[]>([]);
  const hiddenKey = hidden.join("|");
  const onCollapseChangeRef = useRef(onCollapseChange);
  onCollapseChangeRef.current = onCollapseChange;

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || !collapse) return;
    const items = Array.from(list.querySelectorAll<HTMLLIElement>("li"));
    const gap = parseFloat(getComputedStyle(list).columnGap || "0") || 0;
    // Only visible items can be measured; remembered widths cover the rest.
    for (const li of items) {
      if (li.hidden) continue;
      const id = li.dataset.segment;
      if (!id) continue;
      const w = li.getBoundingClientRect().width;
      if (w > 0) widthsRef.current.set(id, w + gap);
    }
    const available = list.getBoundingClientRect().width;
    const next = collapseSegments(segments, widthsRef.current, available);
    setHidden((prev) => (prev.join("|") === next.join("|") ? prev : next));
  }, [collapse, segments]);

  useEffect(() => {
    if (!collapse) {
      setHidden((prev) => (prev.length ? [] : prev));
      return;
    }
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    return () => ro.disconnect();
  }, [collapse, measure]);

  useEffect(() => {
    onCollapseChangeRef.current?.(hidden);
    // `hiddenKey` is the value identity of `hidden`.
  }, [hiddenKey]);

  const hiddenSet = new Set(hidden);
  return (
    <ul
      ref={mergedRef}
      aria-label={label}
      className={cx(
        "vf-status-strip",
        `vf-status-strip--${size}`,
        wrap && !collapse && "vf-status-strip--wrap",
        collapse && "vf-status-strip--collapse",
        className
      )}
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
            data-priority={s.priority}
            hidden={hiddenSet.has(s.id) || undefined}
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
