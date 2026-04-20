"use client";

// Sunburst — radial partition layout via d3-hierarchy.partition, rendered
// as nested arc slices.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  hierarchy,
  partition,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { arc as d3Arc } from "d3-shape";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface SunburstNode {
  name: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

export interface SunburstProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: SunburstNode;
  size?: number;
  /** Minimum sweep angle (radians) for a label to render. Default 0.25. */
  labelMinAngle?: number;
  title?: ReactNode;
  description?: ReactNode;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  padAngle?: number;
}

/**
 * Radial hierarchical chart (zoomable). Peer: `d3-hierarchy`.
 */
export const Sunburst = forwardRef<HTMLDivElement, SunburstProps>(
  function Sunburst(
    {
      data,
      size: sizeProp,
      labelMinAngle = 0.25,
      title,
      description,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      padAngle = 0,
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
    const size = sizeProp ?? measured.width ?? 320;
    const radius = Math.max(40, size / 2 - 8);

    const root = useMemo(() => {
      const h = hierarchy<SunburstNode>(data)
        .sum((d) => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
      const layout = partition<SunburstNode>().size([Math.PI * 2, radius]);
      layout(h);
      return h;
    }, [data, radius]);

    const palette = useMemo(() => {
      const firstLevel = root.children?.map((c) => c.data.name) ?? [];
      const p = seriesPalette(Math.max(1, firstLevel.length));
      const map = new Map<string, string>();
      firstLevel.forEach((name, i) => map.set(name, p[i]!));
      return map;
    }, [root]);

    const colorFor = (
      node: HierarchyRectangularNode<SunburstNode>
    ): string => {
      if (node.data.color) return node.data.color;
      const topAncestor = node
        .ancestors()
        .slice()
        .reverse()[1];
      return palette.get(topAncestor?.data.name ?? "") ?? "var(--vf-text-3)";
    };

    const arcGen = d3Arc<HierarchyRectangularNode<SunburstNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1)
      .padAngle(padAngle);

    const nodes = root
      .descendants()
      .filter((n) => n.depth > 0) as unknown as HierarchyRectangularNode<SunburstNode>[];

    const [hover, setHover] = useState<{
      name: string;
      value: number;
      path: string[];
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-sunburst", className)}
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
          className="vf-chart-sunburst__svg"
          role="img"
          aria-label={accessibleLabel ?? "Sunburst chart"}
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        >
          {nodes.map((node, i) => {
            const path = arcGen(node) ?? "";
            const sweep = node.x1 - node.x0;
            const angle = (node.x0 + node.x1) / 2;
            const midR = (node.y0 + node.y1) / 2;
            return (
              <g key={i}>
                <path
                  className="vf-chart-sunburst__slice"
                  d={path}
                  fill={colorFor(node)}
                  stroke="var(--vf-bg-1)"
                  strokeWidth={1}
                  onPointerMove={(e) =>
                    setHover({
                      name: node.data.name,
                      value: node.value ?? 0,
                      path: node.ancestors().map((n) => n.data.name).reverse(),
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                />
                {sweep > labelMinAngle && (
                  <text
                    className="vf-chart-sunburst__label"
                    transform={`rotate(${(angle * 180) / Math.PI - 90}) translate(${midR}, 0) ${angle > Math.PI ? "rotate(180)" : ""}`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {node.data.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.name}
              metrics={[{ label: "value", value: valueFormat(hover.value) }]}
              footer={hover.path.length > 1 ? hover.path.join(" › ") : null}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
Sunburst.displayName = "Sunburst";
