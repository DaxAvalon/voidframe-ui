"use client";

// ChordDiagram — relational chart showing flows between N groups. Built on
// d3-chord's math (via d3-shape.arc for group arcs + chord paths we compute
// directly from the flat matrix so we avoid pulling another d3 submodule).
//
// Input: a symmetric (or asymmetric) N × N matrix. Each row represents
// outgoing flow from group i to group j.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { arc as d3Arc } from "d3-shape";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface ChordGroup {
  key: string;
  label?: string;
  color?: string;
}

export interface ChordDiagramProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  groups: ChordGroup[];
  /** Square matrix where `matrix[i][j]` is flow from i → j. */
  matrix: number[][];
  size?: number;
  /** Thickness of the outer arc ring. Default 14. */
  ringThickness?: number;
  padAngle?: number;
  title?: ReactNode;
  description?: ReactNode;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
}

interface GroupArcLayout {
  key: string;
  label: string;
  color: string;
  total: number;
  startAngle: number;
  endAngle: number;
  // offsets within the arc for outgoing links
  subAngles: Array<{ target: number; start: number; end: number; value: number }>;
}

export const ChordDiagram = forwardRef<HTMLDivElement, ChordDiagramProps>(
  function ChordDiagram(
    {
      groups,
      matrix,
      size: sizeProp,
      ringThickness = 14,
      padAngle = 0.02,
      title,
      description,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      className,
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = (node: HTMLDivElement | null) => {
      (containerRef as { current: HTMLDivElement | null }).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as { current: HTMLDivElement | null }).current = node;
    };
    const measured = useElementSize(containerRef);
    const size = sizeProp ?? measured.width ?? 360;
    const outerR = Math.max(40, size / 2 - 10);
    const innerR = outerR - ringThickness;

    const palette = useMemo(() => seriesPalette(groups.length), [groups]);

    const layout = useMemo<GroupArcLayout[]>(() => {
      const totals = groups.map((_, i) =>
        matrix[i]?.reduce((a, b) => a + b, 0) ?? 0
      );
      const grandTotal = totals.reduce((a, b) => a + b, 0) || 1;
      const usableAngle = Math.PI * 2 - padAngle * groups.length;
      let angle = 0;
      return groups.map((g, i) => {
        const share = totals[i]! / grandTotal;
        const start = angle + padAngle / 2;
        const end = start + share * usableAngle;
        angle = end + padAngle / 2;
        // Sub-sweeps within the group — one per outgoing target.
        let subStart = start;
        const subAngles: GroupArcLayout["subAngles"] = [];
        const row = matrix[i] ?? [];
        for (let j = 0; j < row.length; j++) {
          const v = row[j] ?? 0;
          const subShare = totals[i]! > 0 ? v / totals[i]! : 0;
          const sweep = subShare * (end - start);
          subAngles.push({
            target: j,
            start: subStart,
            end: subStart + sweep,
            value: v,
          });
          subStart += sweep;
        }
        return {
          key: g.key,
          label: g.label ?? g.key,
          color: g.color ?? palette[i]!,
          total: totals[i]!,
          startAngle: start,
          endAngle: end,
          subAngles,
        };
      });
    }, [groups, matrix, palette, padAngle]);

    const arcGen = d3Arc<{
      startAngle: number;
      endAngle: number;
      innerRadius: number;
      outerRadius: number;
    }>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .padAngle(padAngle / 2);

    const [hover, setHover] = useState<
      | { type: "group"; label: string; value: number; x: number; y: number }
      | {
          type: "chord";
          fromLabel: string;
          toLabel: string;
          value: number;
          x: number;
          y: number;
        }
      | null
    >(null);

    // Pre-compute arc centroid on the inner circle for chord anchor points.
    const anchor = (angle: number): [number, number] => [
      Math.cos(angle - Math.PI / 2) * innerR,
      Math.sin(angle - Math.PI / 2) * innerR,
    ];

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-chord", className)}
        style={{ width: sizeProp ?? "100%", ...style }}
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
          className="vf-chart-chord__svg"
          role="img"
          aria-label={accessibleLabel ?? "Chord diagram"}
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        >
          {/* chord ribbons — one per (i, j) non-zero entry */}
          {layout.flatMap((g, i) =>
            g.subAngles.map((sub) => {
              const j = sub.target;
              if (sub.value <= 0 || i === j) return null;
              const targetGroup = layout[j]!;
              // Find the reciprocal sub-arc within target group.
              const reciprocal = targetGroup.subAngles.find(
                (s) => s.target === i
              );
              const aMid = (sub.start + sub.end) / 2;
              const bMid =
                reciprocal
                  ? (reciprocal.start + reciprocal.end) / 2
                  : (targetGroup.startAngle + targetGroup.endAngle) / 2;
              const [ax, ay] = anchor(aMid);
              const [bx, by] = anchor(bMid);
              const path = `M ${ax} ${ay} Q 0 0 ${bx} ${by}`;
              return (
                <path
                  key={`${i}-${j}`}
                  className="vf-chart-chord__chord"
                  d={path}
                  fill="none"
                  stroke={g.color}
                  strokeOpacity={0.45}
                  strokeWidth={Math.max(1, sub.value / 2)}
                  onPointerMove={(e) =>
                    setHover({
                      type: "chord",
                      fromLabel: g.label,
                      toLabel: targetGroup.label,
                      value: sub.value,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                />
              );
            })
          )}
          {/* group arcs */}
          {layout.map((g) => {
            const d =
              arcGen({
                startAngle: g.startAngle,
                endAngle: g.endAngle,
                innerRadius: innerR,
                outerRadius: outerR,
              }) ?? "";
            const midAngle = (g.startAngle + g.endAngle) / 2;
            const labelX =
              Math.cos(midAngle - Math.PI / 2) * (outerR + 8);
            const labelY =
              Math.sin(midAngle - Math.PI / 2) * (outerR + 8);
            return (
              <g key={g.key}>
                <path
                  className="vf-chart-chord__arc"
                  d={d}
                  fill={g.color}
                  onPointerMove={(e) =>
                    setHover({
                      type: "group",
                      label: g.label,
                      value: g.total,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                />
                <text
                  className="vf-chart-chord__label"
                  x={labelX}
                  y={labelY}
                  textAnchor={labelX > 0 ? "start" : "end"}
                  dominantBaseline="middle"
                >
                  {g.label}
                </text>
              </g>
            );
          })}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover?.type === "group" ? (
            <ChartTooltipBody
              title={hover.label}
              metrics={[{ label: "total flow", value: valueFormat(hover.value) }]}
            />
          ) : hover?.type === "chord" ? (
            <ChartTooltipBody
              title={`${hover.fromLabel} → ${hover.toLabel}`}
              metrics={[{ label: "flow", value: valueFormat(hover.value) }]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
ChordDiagram.displayName = "ChordDiagram";
