"use client";

// Sankey — flow diagram with node relaxation via d3-sankey.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
  sankeyCenter,
  type SankeyGraph,
  type SankeyLayout,
} from "d3-sankey";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface SankeyNode {
  key: string;
  label?: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export type SankeyAlign = "justify" | "left" | "right" | "center";

const ALIGN_MAP = {
  justify: sankeyJustify,
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
};

export interface SankeyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  align?: SankeyAlign;
  title?: ReactNode;
  description?: ReactNode;
  accessibleLabel?: string;
  valueFormat?: (v: number) => string;
}

interface InternalNode extends SankeyNode {
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}
interface InternalLink {
  source: number | InternalNode;
  target: number | InternalNode;
  value: number;
  y0?: number;
  y1?: number;
  width?: number;
}

/**
 * Sankey flow diagram. Weighted links between nodes; auto-layout via
 * `d3-sankey` (peer).
 */
export const Sankey = forwardRef<HTMLDivElement, SankeyProps>(function Sankey(
  {
    nodes,
    links,
    width: widthProp,
    height = 320,
    nodeWidth = 12,
    nodePadding = 10,
    align = "justify",
    title,
    description,
    accessibleLabel,
    valueFormat = (v) => formatChartNumber(v),
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
  const width = widthProp ?? measured.width ?? 560;

  const { computedNodes, computedLinks } = useMemo(() => {
    const indexByKey = new Map(nodes.map((n, i) => [n.key, i]));
    const inputNodes: InternalNode[] = nodes.map((n) => ({ ...n }));
    const inputLinks: InternalLink[] = links.map((l) => ({
      source: indexByKey.get(l.source) ?? 0,
      target: indexByKey.get(l.target) ?? 0,
      value: l.value,
    }));
    const layout = d3Sankey<InternalNode, InternalLink>()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .nodeAlign(ALIGN_MAP[align])
      .extent([
        [1, 1],
        [width - 1, height - 1],
      ]) as SankeyLayout<SankeyGraph<InternalNode, InternalLink>, InternalNode, InternalLink>;
    const graph = layout({ nodes: inputNodes, links: inputLinks });
    return { computedNodes: graph.nodes, computedLinks: graph.links };
  }, [nodes, links, width, height, nodeWidth, nodePadding, align]);

  const palette = useMemo(
    () => seriesPalette(computedNodes.length),
    [computedNodes.length]
  );
  const colorFor = (node: InternalNode, i: number) =>
    node.color ?? palette[i]!;

  const linkPath = sankeyLinkHorizontal<InternalNode, InternalLink>();

  const [hover, setHover] = useState<
    | { type: "link"; source: string; target: string; value: number; x: number; y: number }
    | { type: "node"; key: string; label: string; value: number; x: number; y: number }
    | null
  >(null);

  return (
    <div
      ref={mergedRef}
      className={cx("vf-chart-sankey", className)}
      style={{ width: widthProp ?? "100%", ...style }}
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
        className="vf-chart-sankey__svg"
        role="img"
        aria-label={accessibleLabel ?? "Sankey diagram"}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {computedLinks.map((link, i) => {
          const path = linkPath(link) ?? "";
          const sourceNode = link.source as InternalNode;
          const targetNode = link.target as InternalNode;
          return (
            <path
              key={i}
              className="vf-chart-sankey__link"
              d={path}
              fill="none"
              stroke="var(--vf-text-3)"
              strokeOpacity={0.35}
              strokeWidth={Math.max(1, link.width ?? 1)}
              onPointerMove={(e) =>
                setHover({
                  type: "link",
                  source: sourceNode.key,
                  target: targetNode.key,
                  value: link.value,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onPointerLeave={() => setHover(null)}
            />
          );
        })}
        {computedNodes.map((node, i) => {
          const x = node.x0 ?? 0;
          const y = node.y0 ?? 0;
          const w = (node.x1 ?? 0) - x;
          const h = (node.y1 ?? 0) - y;
          const color = colorFor(node, i);
          const label = node.label ?? node.key;
          return (
            <g key={node.key}>
              <rect
                className="vf-chart-sankey__node"
                x={x}
                y={y}
                width={w}
                height={Math.max(1, h)}
                fill={color}
                shapeRendering="crispEdges"
                onPointerMove={(e) =>
                  setHover({
                    type: "node",
                    key: node.key,
                    label,
                    value: (node as unknown as { value?: number }).value ?? 0,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onPointerLeave={() => setHover(null)}
              />
              <text
                className="vf-chart-sankey__label"
                x={x < width / 2 ? x + w + 4 : x - 4}
                y={y + h / 2}
                dominantBaseline="middle"
                textAnchor={x < width / 2 ? "start" : "end"}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
        {hover?.type === "link" ? (
          <ChartTooltipBody
            title={`${hover.source} → ${hover.target}`}
            metrics={[{ label: "flow", value: valueFormat(hover.value) }]}
          />
        ) : hover?.type === "node" ? (
          <ChartTooltipBody
            title={hover.label}
            metrics={[{ label: "value", value: valueFormat(hover.value) }]}
          />
        ) : null}
      </ChartTooltip>
    </div>
  );
});
Sankey.displayName = "Sankey";
