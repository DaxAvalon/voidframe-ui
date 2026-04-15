"use client";

// The outer SVG wrapper that computes inner plot dimensions from margins
// and publishes scales/size through ChartContext.
//
// Responsive: when `width` or `height` is omitted, falls back to the parent
// element size via useElementSize. In SSR / test environments with no layout,
// a consumer-provided `defaultWidth`/`defaultHeight` keeps rendering
// deterministic.

import {
  forwardRef,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { cx } from "../../utils/cx";
import type { AxisTickScale } from "../math/ticks";
import {
  ChartContext,
  DEFAULT_MARGINS,
  type ChartContextValue,
  type ChartMargins,
} from "./ChartContext";

export interface ChartFrameProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  width?: number;
  height?: number;
  /** Minimum width when responsive measurement returns 0. */
  defaultWidth?: number;
  /** Minimum height when responsive measurement returns 0. */
  defaultHeight?: number;
  margins?: Partial<ChartMargins>;
  xScale?: AxisTickScale;
  yScale?: AxisTickScale;
  /** SVG-level accessible label. */
  accessibleLabel?: string;
  /** Rendered as an `<h4>` inside the frame above the SVG. */
  title?: ReactNode;
  /** Rendered as a `<p>` beneath `title`. */
  description?: ReactNode;
  children?: ReactNode;
  /** Forwarded to the inner SVG, not the outer div. */
  svgClassName?: string;
  /** Forwarded to the inner SVG, not the outer div. */
  svgStyle?: CSSProperties;
}

export const ChartFrame = forwardRef<HTMLDivElement, ChartFrameProps>(
  function ChartFrame(
    {
      width,
      height,
      defaultWidth = 560,
      defaultHeight = 320,
      margins,
      xScale,
      yScale,
      accessibleLabel,
      title,
      description,
      children,
      className,
      style,
      svgClassName,
      svgStyle,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);
    const measured = useElementSize(containerRef);

    const resolvedWidth = Math.max(
      1,
      width ?? (measured.width || defaultWidth)
    );
    const resolvedHeight = Math.max(
      1,
      height ?? (measured.height || defaultHeight)
    );

    const m: ChartMargins = {
      top: margins?.top ?? DEFAULT_MARGINS.top,
      right: margins?.right ?? DEFAULT_MARGINS.right,
      bottom: margins?.bottom ?? DEFAULT_MARGINS.bottom,
      left: margins?.left ?? DEFAULT_MARGINS.left,
    };
    const innerWidth = Math.max(0, resolvedWidth - m.left - m.right);
    const innerHeight = Math.max(0, resolvedHeight - m.top - m.bottom);

    const ctx = useMemo<ChartContextValue>(
      () => ({
        width: resolvedWidth,
        height: resolvedHeight,
        innerWidth,
        innerHeight,
        margins: m,
        xScale,
        yScale,
      }),
      [
        resolvedWidth,
        resolvedHeight,
        innerWidth,
        innerHeight,
        m.top,
        m.right,
        m.bottom,
        m.left,
        xScale,
        yScale,
      ]
    );

    const autoResponsive = width === undefined || height === undefined;

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-frame", className)}
        style={{
          position: "relative",
          width: width ?? "100%",
          ...style,
        }}
        {...props}
      >
        {(title || description) && (
          <div className="vf-chart-frame__header">
            {title && <h4 className="vf-chart-frame__title">{title}</h4>}
            {description && (
              <p className="vf-chart-frame__description">{description}</p>
            )}
          </div>
        )}
        <svg
          className={cx("vf-chart-frame__svg", svgClassName)}
          role="img"
          aria-label={accessibleLabel}
          width={autoResponsive ? undefined : resolvedWidth}
          height={autoResponsive ? undefined : resolvedHeight}
          viewBox={`0 0 ${resolvedWidth} ${resolvedHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: "block",
            width: "100%",
            height: resolvedHeight,
            ...svgStyle,
          }}
        >
          <g
            className="vf-chart-frame__plot"
            transform={`translate(${m.left}, ${m.top})`}
          >
            <ChartContext.Provider value={ctx}>
              {children}
            </ChartContext.Provider>
          </g>
        </svg>
      </div>
    );
  }
);
ChartFrame.displayName = "ChartFrame";
