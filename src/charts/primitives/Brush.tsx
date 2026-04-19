"use client";

// Brush primitive — drag to select a range on the X axis. Emits `[x0, x1]` in
// plot-space pixel coords. Charts invert those through their own scales.

import {
  forwardRef,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SVGAttributes,
} from "react";
import { cx } from "../../utils/cx";
import { useChart } from "./ChartContext";

export type BrushSelection = [number, number] | null;

export interface BrushProps
  extends Omit<SVGAttributes<SVGGElement>, "onChange"> {
  /** Controlled selection. */
  value?: BrushSelection;
  /** Default (uncontrolled) selection. */
  defaultValue?: BrushSelection;
  /** Fires while dragging and on release. */
  onValueChange?: (selection: BrushSelection) => void;
  /** Fires only when the user releases the pointer. */
  onChangeEnd?: (selection: BrushSelection) => void;
  /** Minimum width of the selection, in px. Default 6. */
  minWidth?: number;
  /** Restrict to the X axis (default) or Y axis. */
  axis?: "x" | "y";
}

export const Brush = forwardRef<SVGGElement, BrushProps>(function Brush(
  {
    value,
    defaultValue = null,
    onValueChange,
    onChangeEnd,
    minWidth = 6,
    axis = "x",
    className,
    ...props
  },
  ref
) {
  const { innerWidth, innerHeight } = useChart();
  const [internal, setInternal] = useState<BrushSelection>(defaultValue);
  const selection = value ?? internal;
  const dragState = useRef<{ start: number } | null>(null);

  const isX = axis === "x";
  const span = isX ? innerWidth : innerHeight;

  const setSelection = (next: BrushSelection) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const clamp = (v: number) => Math.max(0, Math.min(span, v));

  const localFromPointer = (e: ReactPointerEvent<SVGRectElement>) => {
    const target = e.currentTarget;
    // Prefer the SVG CTM-based conversion. Headless environments without
    // createSVGPoint fall back to a plain bounding-rect offset.
    try {
      const svg = target.ownerSVGElement as SVGSVGElement | null;
      if (svg && typeof svg.createSVGPoint === "function") {
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const ctm = target.getScreenCTM?.();
        const local = ctm ? point.matrixTransform(ctm.inverse()) : point;
        return isX ? local.x : local.y;
      }
    } catch {
      /* fallthrough to rect-based math */
    }
    const rect = target.getBoundingClientRect();
    return isX ? e.clientX - rect.left : e.clientY - rect.top;
  };

  const onPointerDown = (e: ReactPointerEvent<SVGRectElement>) => {
    const start = clamp(localFromPointer(e));
    dragState.current = { start };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    setSelection([start, start]);
  };
  const onPointerMove = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragState.current) return;
    const end = clamp(localFromPointer(e));
    const { start } = dragState.current;
    const next: BrushSelection = [Math.min(start, end), Math.max(start, end)];
    setSelection(next);
  };
  const onPointerUp = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragState.current) return;
    const end = clamp(localFromPointer(e));
    const { start } = dragState.current;
    dragState.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    const a = Math.min(start, end);
    const b = Math.max(start, end);
    const next: BrushSelection = b - a < minWidth ? null : [a, b];
    setSelection(next);
    onChangeEnd?.(next);
  };

  return (
    <g
      ref={ref}
      className={cx("vf-chart-brush", `vf-chart-brush--${axis}`, className)}
      {...props}
    >
      <rect
        className="vf-chart-brush__track"
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {selection && (
        <rect
          className="vf-chart-brush__selection"
          x={isX ? selection[0] : 0}
          y={isX ? 0 : selection[0]}
          width={isX ? selection[1] - selection[0] : innerWidth}
          height={isX ? innerHeight : selection[1] - selection[0]}
          pointerEvents="none"
        />
      )}
    </g>
  );
});
Brush.displayName = "Brush";
