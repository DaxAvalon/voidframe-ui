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
  useImperativeHandle,
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

export interface ChartFrameHandle {
  /** Returns the chart SVG markup as a string. */
  toSVG: () => string;
  /** Renders the chart to a PNG data URL. */
  toPNG: (scale?: number) => Promise<string>;
}

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
  /**
   * Imperative handle for `toSVG` / `toPNG` exports. The component's main
   * ref exposes the underlying `<div>` element; export helpers live here
   * to keep DOM-ref semantics clean.
   */
  exportRef?: React.Ref<ChartFrameHandle>;
}

/**
 * Shared chart shell: handles dimensions, margins, ARIA role, and the
 * internal context that series/axes read. Wrap your chart composition in
 * `ChartFrame`.
 */
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
      exportRef,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);
    const measured = useElementSize(containerRef);

    useImperativeHandle(
      exportRef,
      () => {
        const handle: ChartFrameHandle = {
          toSVG: () => {
            const svg = svgRef.current;
            if (!svg) return "";
            return svg.outerHTML;
          },
          toPNG: async (scale = 2) => {
            const svg = svgRef.current;
            if (!svg) return "";
            const svgString = svg.outerHTML;
            const blob = new Blob([svgString], {
              type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            const w = svg.viewBox.baseVal.width || svg.clientWidth;
            const h = svg.viewBox.baseVal.height || svg.clientHeight;
            return new Promise<string>((resolve, reject) => {
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = w * scale;
                canvas.height = h * scale;
                const ctx2d = canvas.getContext("2d");
                if (!ctx2d) {
                  URL.revokeObjectURL(url);
                  reject(new Error("Canvas 2D context unavailable"));
                  return;
                }
                ctx2d.scale(scale, scale);
                ctx2d.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL("image/png"));
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load SVG into image"));
              };
              img.src = url;
            });
          },
        };
        return handle;
      },
      []
    );

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
          ref={svgRef}
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
