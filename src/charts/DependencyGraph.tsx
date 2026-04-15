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
import {
  interpolatePoint,
  splitSegmentByRectObstacles,
  type RectObstacle,
} from "./math/edges";
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
  /** Optional label rendered in the edge tooltip. */
  label?: string;
  /** Optional weight rendered in the edge tooltip. */
  value?: number;
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
  /** Click a node to highlight its neighbourhood. Default true. */
  selectable?: boolean;
  /** Render arrowheads on edges. Default true. */
  directed?: boolean;
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
  // Longest-path layering by INCOMING edges: a node sits 1 layer below
  // the deepest node that points at it. Roots (no incoming edges) land
  // at layer 0 / top, so the natural read for "source → target" is a
  // downward arrow from a higher level to its dependency.
  const layer = new Map<string, number>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    if (!incoming.has(e.target)) incoming.set(e.target, []);
    incoming.get(e.target)!.push(e.source);
  }
  const visiting = new Set<string>();
  const visit = (id: string): number => {
    if (layer.has(id)) return layer.get(id)!;
    if (visiting.has(id)) return 0; // cycle: place at layer 0
    visiting.add(id);
    const sources = incoming.get(id) ?? [];
    let l = 0;
    for (const s of sources) l = Math.max(l, visit(s) + 1);
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
      selectable = true,
      directed = true,
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

    const [hover, setHover] = useState<
      | { kind: "node"; node: PlacedNode; x: number; y: number }
      | { kind: "edge"; edge: DependencyEdge; x: number; y: number }
      | null
    >(null);
    const [selected, setSelected] = useState<string | null>(null);

    // Adjacency for selection-driven dimming.
    const adjacency = useMemo(() => {
      const map = new Map<string, Set<string>>();
      for (const e of edges) {
        if (!map.has(e.source)) map.set(e.source, new Set());
        if (!map.has(e.target)) map.set(e.target, new Set());
        map.get(e.source)!.add(e.target);
        map.get(e.target)!.add(e.source);
      }
      return map;
    }, [edges]);

    const isHighlighted = (id: string): boolean => {
      if (!selected) return false;
      if (id === selected) return true;
      return adjacency.get(selected)?.has(id) ?? false;
    };
    const isDimmed = (id: string): boolean =>
      selected !== null && !isHighlighted(id);

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
          onClick={() => {
            if (selectable) setSelected(null);
          }}
        >
          <defs>
            {/* userSpaceOnUse so the arrow is a fixed pixel size,
                not multiplied by stroke-width. */}
            <marker
              id="vf-dep-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0,1 L9,5 L0,9 z" fill="currentColor" />
            </marker>
          </defs>
          {(() => {
            // Build a per-edge route: direct 3-segment orthogonal
            // connector when it doesn't cross any unrelated node, or a
            // side-gutter detour when it would. Edges always attach at
            // node borders and never cross other nodes' rectangles.
            type Seg = {
              ax: number;
              ay: number;
              bx: number;
              by: number;
            };
            // Line endpoints sit on the node border so the arrow head's
            // tip touches the rect edge cleanly. Marker body extends
            // backward along the line into the rect interior, which
            // looks like the arrow is "landing on" the node.
            const ARROW_INSET = 0;

            const directRoute = (s: PlacedNode, t: PlacedNode): Seg[] => {
              if (direction === "top-down") {
                if (t.y < s.y) {
                  // target above source — exit source TOP, enter target BOTTOM
                  const x1 = s.x + nodeWidth / 2;
                  const y1 = s.y;
                  const x2 = t.x + nodeWidth / 2;
                  const y2 = t.y + nodeHeight;
                  const midY = (y1 + y2) / 2;
                  return [
                    { ax: x1, ay: y1, bx: x1, by: midY },
                    { ax: x1, ay: midY, bx: x2, by: midY },
                    { ax: x2, ay: midY, bx: x2, by: y2 + ARROW_INSET },
                  ];
                }
                // target below source — exit source BOTTOM, enter target TOP
                const x1 = s.x + nodeWidth / 2;
                const y1 = s.y + nodeHeight;
                const x2 = t.x + nodeWidth / 2;
                const y2 = t.y;
                const midY = (y1 + y2) / 2;
                return [
                  { ax: x1, ay: y1, bx: x1, by: midY },
                  { ax: x1, ay: midY, bx: x2, by: midY },
                  { ax: x2, ay: midY, bx: x2, by: y2 - ARROW_INSET },
                ];
              }
              // left-right
              if (t.x < s.x) {
                const x1 = s.x;
                const y1 = s.y + nodeHeight / 2;
                const x2 = t.x + nodeWidth;
                const y2 = t.y + nodeHeight / 2;
                const midX = (x1 + x2) / 2;
                return [
                  { ax: x1, ay: y1, bx: midX, by: y1 },
                  { ax: midX, ay: y1, bx: midX, by: y2 },
                  { ax: midX, ay: y2, bx: x2 + ARROW_INSET, by: y2 },
                ];
              }
              const x1 = s.x + nodeWidth;
              const y1 = s.y + nodeHeight / 2;
              const x2 = t.x;
              const y2 = t.y + nodeHeight / 2;
              const midX = (x1 + x2) / 2;
              return [
                { ax: x1, ay: y1, bx: midX, by: y1 },
                { ax: midX, ay: y1, bx: midX, by: y2 },
                { ax: midX, ay: y2, bx: x2 - ARROW_INSET, by: y2 },
              ];
            };

            type EdgeRender = {
              edge: DependencyEdge;
              key: string;
              incident: boolean;
              dim: boolean;
              segs: Seg[];
              /** runs[segIdx] = visible/obstructed runs along that segment. */
              runs: ReturnType<typeof splitSegmentByRectObstacles>[];
            };
            const edgeData: EdgeRender[] = edges
              .map((e, i) => {
                const s = placedById.get(e.source);
                const t = placedById.get(e.target);
                if (!s || !t) return null;
                const others: RectObstacle[] = placed
                  .filter(
                    (p) => p.id !== e.source && p.id !== e.target
                  )
                  .map((p) => ({
                    x: p.x,
                    y: p.y,
                    w: nodeWidth,
                    h: nodeHeight,
                  }));
                // Always use the direct orthogonal 3-segment route —
                // edges only attach to the nodes they connect, no
                // phantom detours into empty space. Where a segment
                // crosses under an unrelated node, the obstructed run
                // renders as a dashed overlay so the reader can see the
                // edge is passing "underneath".
                const segs = directRoute(s, t);
                const runs = segs.map((seg) =>
                  splitSegmentByRectObstacles(
                    seg.ax,
                    seg.ay,
                    seg.bx,
                    seg.by,
                    others
                  )
                );
                const incident =
                  selected === e.source || selected === e.target;
                return {
                  edge: e,
                  key: `${e.source}-${e.target}-${i}`,
                  incident,
                  dim: selected !== null && !incident,
                  segs,
                  runs,
                };
              })
              .filter((x): x is EdgeRender => x !== null);

            const onEdgeEnter = (
              ed: DependencyEdge,
              ev: React.PointerEvent
            ) => {
              if (!ed.label && ed.value === undefined) return;
              setHover({
                kind: "edge",
                edge: ed,
                x: ev.clientX,
                y: ev.clientY,
              });
            };
            const onEdgeMove = (ev: React.PointerEvent) => {
              if (hover?.kind !== "edge") return;
              setHover({ ...hover, x: ev.clientX, y: ev.clientY });
            };

            // Render every run along every segment. Visible runs are
            // solid, obstructed runs are dashed so the reader can see
            // the edge is passing under an unrelated node. The arrow
            // head sits on the LAST run of the LAST segment (which is
            // always the one touching the target node's border).
            return (
              <>
                {edgeData.map((ed) => {
                  const lastSeg = ed.segs.length - 1;
                  const lastRunOfLastSeg =
                    (ed.runs[lastSeg]?.length ?? 1) - 1;
                  return ed.segs.map((seg, segIdx) => {
                    const segRuns = ed.runs[segIdx] ?? [];
                    return segRuns.map((r, rIdx) => {
                      const start = interpolatePoint(
                        seg.ax,
                        seg.ay,
                        seg.bx,
                        seg.by,
                        r.start
                      );
                      const end = interpolatePoint(
                        seg.ax,
                        seg.ay,
                        seg.bx,
                        seg.by,
                        r.end
                      );
                      const isArrowEnd =
                        directed &&
                        segIdx === lastSeg &&
                        rIdx === lastRunOfLastSeg;
                      return (
                        <line
                          key={`${ed.key}-${segIdx}-${rIdx}`}
                          className={cx(
                            "vf-chart-dep-graph__edge",
                            r.obstructed &&
                              "vf-chart-dep-graph__edge--obstructed",
                            ed.incident &&
                              "vf-chart-dep-graph__edge--highlighted",
                            ed.dim && "vf-chart-dep-graph__edge--dimmed"
                          )}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke="currentColor"
                          strokeWidth={1.2}
                          strokeDasharray={r.obstructed ? "3 3" : undefined}
                          markerEnd={
                            isArrowEnd ? "url(#vf-dep-arrow)" : undefined
                          }
                          onPointerEnter={(ev) => onEdgeEnter(ed.edge, ev)}
                          onPointerMove={onEdgeMove}
                          onPointerLeave={() => setHover(null)}
                        />
                      );
                    });
                  });
                })}
              </>
            );
          })()}
          {placed.map((n) => {
            const color =
              palette.get(String(n.group ?? "default")) ?? "var(--vf-text-2)";
            const dim = isDimmed(n.id);
            const highlighted = isHighlighted(n.id);
            return (
              <g
                key={n.id}
                className={cx(
                  "vf-chart-dep-graph__node",
                  dim && "vf-chart-dep-graph__node--dimmed",
                  highlighted && "vf-chart-dep-graph__node--highlighted"
                )}
                transform={`translate(${n.x}, ${n.y})`}
                onPointerEnter={(e) =>
                  setHover({ kind: "node", node: n, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (selectable)
                    setSelected((cur) => (cur === n.id ? null : n.id));
                  onNodeClick?.({
                    id: n.id,
                    label: n.label,
                    group: n.group,
                  });
                }}
              >
                <rect
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={color}
                  fillOpacity={highlighted ? 0.32 : 0.18}
                  stroke={
                    highlighted
                      ? "var(--vf-accent, var(--vf-amber))"
                      : color
                  }
                  strokeWidth={highlighted ? 2 : 1.2}
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
          {hover?.kind === "node" ? (
            <ChartTooltipBody
              title={hover.node.label ?? hover.node.id}
              metrics={[
                { label: "layer", value: String(hover.node.layer) },
                ...(hover.node.group !== undefined
                  ? [{ label: "group", value: String(hover.node.group) }]
                  : []),
              ]}
            />
          ) : hover?.kind === "edge" ? (
            <ChartTooltipBody
              title={`${hover.edge.source} → ${hover.edge.target}`}
              metrics={[
                ...(hover.edge.label
                  ? [{ label: "label", value: hover.edge.label }]
                  : []),
                ...(hover.edge.value !== undefined
                  ? [{ label: "weight", value: String(hover.edge.value) }]
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
