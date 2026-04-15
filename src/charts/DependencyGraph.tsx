"use client";

// DependencyGraph — layered DAG. Nodes are placed in horizontal layers
// (longest-path layering). Edges drawn as orthogonal connectors with
// arrowheads. Uses no peer deps — pure custom layout.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { seriesPalette } from "./math/color";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface DependencyNode {
  id: string;
  label?: string;
  group?: string | number;
}

export interface DependencyEdge {
  /** Source node id — depends on `target`. */
  source: string;
  target: string;
}

export interface DependencyGraphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  /** Direction of layering. Default `"top-down"`. */
  direction?: "top-down" | "left-right";
  /** Pixel size of each node. Default 96 × 32. */
  nodeWidth?: number;
  nodeHeight?: number;
  /** Pixel gap between layers. Default 64. */
  layerGap?: number;
  /** Pixel gap between siblings within a layer. Default 32. */
  siblingGap?: number;
  width?: number;
  height?: number;
  title?: ReactNode;
  description?: ReactNode;
  accessibleLabel?: string;
  onNodeClick?: (node: DependencyNode) => void;
}

interface PlacedNode extends DependencyNode {
  layer: number;
  index: number;
  x: number;
  y: number;
}

function computeLayers(
  nodes: DependencyNode[],
  edges: DependencyEdge[]
): Map<string, number> {
  // Longest-path layering: layer(node) = 1 + max layer of its
  // dependencies; nodes with no dependencies are layer 0.
  const layer = new Map<string, number>();
  const deps = new Map<string, string[]>();
  for (const n of nodes) deps.set(n.id, []);
  for (const e of edges) {
    if (!deps.has(e.source)) deps.set(e.source, []);
    deps.get(e.source)!.push(e.target);
  }
  const visiting = new Set<string>();
  const visit = (id: string): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (visiting.has(id)) return 0; // cycle: place at layer 0
    visiting.add(id);
    const targets = deps.get(id) ?? [];
    let l = 0;
    for (const t of targets) l = Math.max(l, visit(t) + 1);
    visiting.delete(id);
    layer.set(id, l);
    return l;
  };
  for (const n of nodes) visit(n.id);
  return layer;
}

export const DependencyGraph = forwardRef<HTMLDivElement, DependencyGraphProps>(
  function DependencyGraph(
    {
      nodes,
      edges,
      direction = "top-down",
      nodeWidth = 96,
      nodeHeight = 32,
      layerGap = 64,
      siblingGap = 32,
      width: widthProp,
      height: heightProp,
      title,
      description,
      accessibleLabel,
      onNodeClick,
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
    useElementSize(containerRef);

    const palette = useMemo(() => {
      const groups = Array.from(
        new Set(nodes.map((n) => String(n.group ?? "default")))
      );
      const cycle = seriesPalette(Math.max(1, groups.length));
      const map = new Map<string, string>();
      groups.forEach((g, i) => map.set(g, cycle[i]!));
      return map;
    }, [nodes]);

    const placed = useMemo<PlacedNode[]>(() => {
      const layer = computeLayers(nodes, edges);
      const byLayer = new Map<number, DependencyNode[]>();
      for (const n of nodes) {
        const l = layer.get(n.id) ?? 0;
        const list = byLayer.get(l) ?? [];
        list.push(n);
        byLayer.set(l, list);
      }
      const out: PlacedNode[] = [];
      const sortedLayers = Array.from(byLayer.keys()).sort((a, b) => a - b);
      for (const l of sortedLayers) {
        const layerNodes = byLayer.get(l)!;
        layerNodes.forEach((n, idx) => {
          if (direction === "top-down") {
            out.push({
              ...n,
              layer: l,
              index: idx,
              x: idx * (nodeWidth + siblingGap),
              y: l * (nodeHeight + layerGap),
            });
          } else {
            out.push({
              ...n,
              layer: l,
              index: idx,
              x: l * (nodeWidth + layerGap),
              y: idx * (nodeHeight + siblingGap),
            });
          }
        });
      }
      return out;
    }, [nodes, edges, direction, nodeWidth, nodeHeight, layerGap, siblingGap]);

    const placedById = useMemo(() => {
      const map = new Map<string, PlacedNode>();
      for (const p of placed) map.set(p.id, p);
      return map;
    }, [placed]);

    const naturalWidth = useMemo(
      () => placed.reduce((max, p) => Math.max(max, p.x + nodeWidth), 0),
      [placed, nodeWidth]
    );
    const naturalHeight = useMemo(
      () => placed.reduce((max, p) => Math.max(max, p.y + nodeHeight), 0),
      [placed, nodeHeight]
    );
    const width = widthProp ?? naturalWidth + 8;
    const height = heightProp ?? naturalHeight + 8;

    const [hover, setHover] = useState<{
      node: PlacedNode;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-dep-graph", className)}
        style={style}
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
          className="vf-chart-dep-graph__svg"
          role="img"
          aria-label={accessibleLabel ?? "Dependency graph"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <marker
              id="vf-dep-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const s = placedById.get(e.source);
            const t = placedById.get(e.target);
            if (!s || !t) return null;
            // Source connects on its bottom-center (top-down) or
            // right-center (left-right); target on top-center or
            // left-center.
            let x1: number, y1: number, x2: number, y2: number;
            let path: string;
            if (direction === "top-down") {
              x1 = s.x + nodeWidth / 2;
              y1 = s.y + nodeHeight;
              x2 = t.x + nodeWidth / 2;
              y2 = t.y;
              const midY = (y1 + y2) / 2;
              path = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2 - 4}`;
            } else {
              x1 = s.x + nodeWidth;
              y1 = s.y + nodeHeight / 2;
              x2 = t.x;
              y2 = t.y + nodeHeight / 2;
              const midX = (x1 + x2) / 2;
              path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2 - 4} ${y2}`;
            }
            return (
              <path
                key={i}
                className="vf-chart-dep-graph__edge"
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                markerEnd="url(#vf-dep-arrow)"
              />
            );
          })}
          {placed.map((n) => {
            const color =
              palette.get(String(n.group ?? "default")) ?? "var(--vf-text-2)";
            return (
              <g
                key={n.id}
                className="vf-chart-dep-graph__node"
                transform={`translate(${n.x}, ${n.y})`}
                onPointerEnter={(e) =>
                  setHover({ node: n, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
                onClick={() =>
                  onNodeClick?.({ id: n.id, label: n.label, group: n.group })
                }
              >
                <rect
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={color}
                  fillOpacity={0.18}
                  stroke={color}
                  strokeWidth={1.2}
                  shapeRendering="crispEdges"
                />
                <text
                  className="vf-chart-dep-graph__label"
                  x={nodeWidth / 2}
                  y={nodeHeight / 2 + 4}
                  textAnchor="middle"
                >
                  {n.label ?? n.id}
                </text>
              </g>
            );
          })}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.node.label ?? hover.node.id}
              metrics={[
                { label: "layer", value: String(hover.node.layer) },
                ...(hover.node.group !== undefined
                  ? [{ label: "group", value: String(hover.node.group) }]
                  : []),
              ]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
DependencyGraph.displayName = "DependencyGraph";
