"use client";

// Portaled chart tooltip. Consumers control the `active` state and render
// whatever content they want inside; this primitive handles positioning +
// portal mounting.

import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../../primitives/Portal";
import {
  computeAnchoredPosition,
  type AnchorPosition,
  type Placement,
} from "../../utils/anchor";
import { cx } from "../../utils/cx";

export interface ChartTooltipProps extends HTMLAttributes<HTMLDivElement> {
  /** When false, the tooltip isn't rendered. */
  active?: boolean;
  /** Pointer or target point in viewport coords. */
  x: number;
  y: number;
  placement?: Placement;
  offset?: number;
  children?: ReactNode;
}

const EMPTY_SIZE = { width: 0, height: 0 };

export const ChartTooltip = forwardRef<HTMLDivElement, ChartTooltipProps>(
  function ChartTooltip(
    {
      active = true,
      x,
      y,
      placement = "top",
      offset = 12,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
    const [pos, setPos] = useState<AnchorPosition | null>(null);

    useEffect(() => {
      if (!active) return;
      const size = contentEl
        ? { width: contentEl.offsetWidth, height: contentEl.offsetHeight }
        : EMPTY_SIZE;
      const rect = {
        top: y,
        left: x,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
      };
      setPos(computeAnchoredPosition(rect, size, placement, offset));
    }, [active, contentEl, x, y, placement, offset]);

    if (!active) return null;

    const inline: CSSProperties = pos
      ? { position: "fixed", top: pos.top, left: pos.left, ...style }
      : { position: "fixed", top: -9999, left: -9999, ...style };

    return (
      <Portal>
        <div
          ref={(node) => {
            setContentEl(node);
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as { current: HTMLDivElement | null }).current = node;
          }}
          role="tooltip"
          className={cx("vf-chart-tooltip", className)}
          data-side={pos?.side}
          style={inline}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
ChartTooltip.displayName = "ChartTooltip";
