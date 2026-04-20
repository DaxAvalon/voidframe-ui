"use client";

// NetworkGraph — force-directed graph via d3-force (loaded as an
// optional peer dep).
//
// Edge rendering:
//   - Endpoints are trimmed to the connected nodes' borders so lines
//     never enter the node disc.
//   - Where an edge passes under an *unrelated* node, that segment is
//     overlaid as a dashed line ON TOP of the node — so the underlying
//     edge is still readable while the node clearly sits over it.
//   - `directed` (default true) draws an arrowhead at the target.
//   - Edges with a `label` or `value` open a tooltip on hover.
//
// Selection:
//   - Click a node to highlight it + its connected neighbours and
//     incident edges. Other nodes/edges dim. Click again (or click
//     elsewhere) to clear.
//
// Drag mode:
//   - `rubberBand` (default true): grabbing a node holds the simulation
//     "warm" via alphaTarget(0.3), so neighbours visibly tug along.
//   - When false: the dragged node is pinned to the cursor and others
//     stay put.

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import {
  splitSegmentByObstacles,
  trimSegmentToCircles,
  interpolatePoint,
  type CircleObstacle,
} from "./math/edges";
import { loadPeer, MissingPeerDependencyError } from "./peer";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface NetworkNode {
  id: string;
  label?: string;
  group?: string | number;
  /** Optional fixed pin position. Null/undefined = freely simulated. */
  fx?: number | null;
  fy?: number | null;
  /** Render radius (px). Default 6. */
  radius?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  /** Edge weight; affects rendering thickness. Default 1. */
  value?: number;
  /** Free-form label rendered in the edge tooltip. */
  label?: string;
}

export interface NetworkGraphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  nodes: NetworkNode[];
  links: NetworkLink[];
  width?: number;
  height?: number;
  /** Per-edge target distance. Default 60. */
  linkDistance?: number;
  /** Charge strength between nodes (negative = repulsion). Default -180. */
  chargeStrength?: number;
  /** Optional pin centring force strength. Default 0.05. */
  centerStrength?: number;
  /** Render arrowheads on edges. Default true. */
  directed?: boolean;
  /** Click a node to highlight its neighbourhood. Default true. */
  selectable?: boolean;
  /** Dragging a node tugs its neighbours via alphaTarget(0.3). Default true. */
  rubberBand?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  accessibleLabel?: string;
  onNodeClick?: (node: NetworkNode) => void;
  /** Lock the simulation after this long (ms) without a tick. Default 4000. */
  coolDownAfter?: number;
}

interface SimNode {
  id: string;
  label?: string;
  group?: string | number;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  value: number;
  label?: string;
}

const RESOLVED_RADIUS = (n: SimNode) => n.radius ?? 6;

export const NetworkGraph = forwardRef<HTMLDivElement, NetworkGraphProps>(
  function NetworkGraph(
    {
      nodes,
      links,
      width: widthProp,
      height = 360,
      linkDistance = 60,
      chargeStrength = -180,
      centerStrength = 0.05,
      directed = true,
      selectable = true,
      rubberBand = true,
      title,
      description,
      accessibleLabel,
      onNodeClick,
      coolDownAfter = 4000,
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

    const [error, setError] = useState<MissingPeerDependencyError | null>(
      null
    );
    const [simNodes, setSimNodes] = useState<SimNode[]>([]);
    const [simLinks, setSimLinks] = useState<SimLink[]>([]);
    const simulationRef = useRef<{
      stop: () => void;
      restart: () => void;
      alpha: (a?: number) => number;
      alphaTarget: (a: number) => unknown;
    } | null>(null);
    const lastTickRef = useRef<number>(Date.now());

    const palette = useMemo(() => {
      const groups = Array.from(
        new Set(nodes.map((n) => String(n.group ?? "default")))
      );
      const cycle = seriesPalette(Math.max(1, groups.length));
      const map = new Map<string, string>();
      groups.forEach((g, i) => map.set(g, cycle[i]!));
      return map;
    }, [nodes]);

    useEffect(() => {
      let cancelled = false;
      let raf = 0;
      let stopped = false;

      const run = async () => {
        try {
          const d3Force = await loadPeer(
            "d3-force",
            "<NetworkGraph>",
            () => import("d3-force")
          );
          if (cancelled) return;

          const seedNodes: SimNode[] = nodes.map((n) => ({
            id: n.id,
            label: n.label,
            group: n.group,
            radius: n.radius ?? 6,
            fx: n.fx,
            fy: n.fy,
          }));
          const seedLinks: SimLink[] = links.map((l) => ({
            source: l.source,
            target: l.target,
            value: l.value ?? 1,
            label: l.label,
          }));

          const sim = d3Force
            .forceSimulation<SimNode>(seedNodes)
            .force(
              "link",
              d3Force
                .forceLink<SimNode, SimLink>(seedLinks)
                .id((d) => d.id)
                .distance(linkDistance)
            )
            .force("charge", d3Force.forceManyBody().strength(chargeStrength))
            .force("x", d3Force.forceX(width / 2).strength(centerStrength))
            .force("y", d3Force.forceY(height / 2).strength(centerStrength))
            .alphaDecay(0.05)
            .on("tick", () => {
              lastTickRef.current = Date.now();
              setSimNodes([...seedNodes]);
              setSimLinks([...seedLinks]);
            });

          simulationRef.current = sim as unknown as typeof simulationRef.current;
          const tickGuard = () => {
            if (stopped) return;
            if (Date.now() - lastTickRef.current > coolDownAfter) {
              sim.alphaTarget(0);
            }
            raf = requestAnimationFrame(tickGuard);
          };
          raf = requestAnimationFrame(tickGuard);
          return () => {
            stopped = true;
            cancelAnimationFrame(raf);
            sim.stop();
          };
        } catch (e) {
          if (e instanceof MissingPeerDependencyError) setError(e);
          else throw e;
        }
        return undefined;
      };

      let cleanup: (() => void) | undefined;
      run().then((fn) => {
        cleanup = fn;
      });
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }, [
      nodes,
      links,
      width,
      height,
      linkDistance,
      chargeStrength,
      centerStrength,
      coolDownAfter,
    ]);

    const [hover, setHover] = useState<
      | { kind: "node"; node: SimNode; x: number; y: number }
      | { kind: "edge"; link: SimLink; x: number; y: number }
      | null
    >(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    // Build adjacency for selection + edge filtering.
    const adjacency = useMemo(() => {
      const map = new Map<string, Set<string>>();
      for (const l of simLinks) {
        const sId = (l.source as SimNode).id ?? (l.source as string);
        const tId = (l.target as SimNode).id ?? (l.target as string);
        if (!map.has(sId)) map.set(sId, new Set());
        if (!map.has(tId)) map.set(tId, new Set());
        map.get(sId)!.add(tId);
        map.get(tId)!.add(sId);
      }
      return map;
    }, [simLinks]);

    const isHighlighted = (id: string): boolean => {
      if (!selected) return false;
      if (id === selected) return true;
      return adjacency.get(selected)?.has(id) ?? false;
    };
    const isDimmed = (id: string): boolean =>
      selected !== null && !isHighlighted(id);

    const onNodeDown =
      (node: SimNode) => (e: ReactPointerEvent<SVGElement>) => {
        const sim = simulationRef.current;
        if (!sim) {
          if (process.env.NODE_ENV !== "production" && !rubberBand) {
            console.warn(
              "[voidframe] NetworkGraph: drag is a no-op because the d3-force peer dep is not loaded."
            );
          }
          return;
        }
        e.stopPropagation();
        if (rubberBand) {
          // Re-warm + restart so subsequent .alpha(0.3) calls produce ticks.
          sim.alphaTarget(0.3);
          sim.restart();
        } else {
          sim.alphaTarget(0);
        }
        node.fx = node.x ?? 0;
        node.fy = node.y ?? 0;
        setDragging(node.id);
        try {
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        } catch {
          /* noop */
        }
      };
    const onNodeMove =
      (node: SimNode) => (e: ReactPointerEvent<SVGElement>) => {
        if (dragging !== node.id) return;
        const svg = (e.currentTarget as SVGElement).ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        node.fx = e.clientX - rect.left;
        node.fy = e.clientY - rect.top;
        if (rubberBand) {
          // Re-warm the simulation so neighbours recompute around the
          // pinned position and visibly tug along.
          simulationRef.current?.alpha(0.3);
        } else {
          // Quiet pin-drag: the simulation isn't ticking, so push the
          // dragged node's new position into the rendered state
          // directly. Other nodes stay where they are.
          node.x = node.fx;
          node.y = node.fy;
          setSimNodes((prev) => [...prev]);
        }
      };
    const onNodeUp =
      (node: SimNode) => (e: ReactPointerEvent<SVGElement>) => {
        if (dragging !== node.id) return;
        const sim = simulationRef.current;
        if (sim) sim.alphaTarget(0);
        node.fx = null;
        node.fy = null;
        setDragging(null);
        try {
          (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
        } catch {
          /* noop */
        }
      };

    const handleNodeClick = (node: SimNode) => {
      if (selectable) setSelected((cur) => (cur === node.id ? null : node.id));
      onNodeClick?.({
        id: node.id,
        label: node.label,
        group: node.group,
        radius: node.radius,
      });
    };

    const handleSurfaceClick = () => {
      if (selectable) setSelected(null);
    };

    if (error) {
      return (
        <div
          ref={mergedRef}
          className={cx("vf-chart-network", "vf-chart-network--error", className)}
          style={{ width: widthProp ?? "100%", ...style }}
          {...props}
        >
          <div className="vf-chart-network__error-message">{error.message}</div>
        </div>
      );
    }

    type RenderedEdge = {
      key: string;
      sId: string;
      tId: string;
      ax: number;
      ay: number;
      bx: number;
      by: number;
      width: number;
      label?: string;
      runs: ReturnType<typeof splitSegmentByObstacles>;
      link: SimLink;
    };

    const rendered: RenderedEdge[] = simLinks.map((l, i) => {
      const s = l.source as SimNode;
      const t = l.target as SimNode;
      const trimmed = trimSegmentToCircles(
        s.x ?? 0,
        s.y ?? 0,
        t.x ?? 0,
        t.y ?? 0,
        RESOLVED_RADIUS(s),
        RESOLVED_RADIUS(t)
      );
      const others: CircleObstacle[] = simNodes
        .filter((n) => n.id !== s.id && n.id !== t.id)
        .map((n) => ({ x: n.x ?? 0, y: n.y ?? 0, r: RESOLVED_RADIUS(n) }));
      const runs = splitSegmentByObstacles(
        trimmed.ax,
        trimmed.ay,
        trimmed.bx,
        trimmed.by,
        others
      );
      return {
        key: `${s.id}-${t.id}-${i}`,
        sId: s.id,
        tId: t.id,
        ax: trimmed.ax,
        ay: trimmed.ay,
        bx: trimmed.bx,
        by: trimmed.by,
        width: Math.max(1, l.value),
        label: l.label,
        runs,
        link: l,
      };
    });

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-network", className)}
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
          className="vf-chart-network__svg"
          role="img"
          aria-label={accessibleLabel ?? "Network graph"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onClick={handleSurfaceClick}
        >
          <defs>
            {/* markerUnits=userSpaceOnUse keeps the arrow a fixed pixel
                size instead of scaling with stroke-width — which made
                heavy-weight edges spawn enormous arrow heads. */}
            <marker
              id="vf-network-arrow"
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

          {/* Solid edges, drawn under the nodes. */}
          {rendered.map((edge) => {
            const incident = selected === edge.sId || selected === edge.tId;
            const dim = selected !== null && !incident;
            return (
              <line
                key={`base-${edge.key}`}
                className={cx(
                  "vf-chart-network__link",
                  incident && "vf-chart-network__link--highlighted",
                  dim && "vf-chart-network__link--dimmed"
                )}
                x1={edge.ax}
                y1={edge.ay}
                x2={edge.bx}
                y2={edge.by}
                strokeWidth={edge.width}
                markerEnd={directed ? "url(#vf-network-arrow)" : undefined}
                onPointerEnter={(e) =>
                  setHover({
                    kind: "edge",
                    link: edge.link,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onPointerMove={(e) => {
                  if (hover?.kind !== "edge") return;
                  setHover({ ...hover, x: e.clientX, y: e.clientY });
                }}
                onPointerLeave={() => setHover(null)}
              />
            );
          })}

          {/* Nodes. */}
          {simNodes.map((n) => {
            const color =
              palette.get(String(n.group ?? "default")) ?? "var(--vf-text-2)";
            const dim = isDimmed(n.id);
            const highlighted = isHighlighted(n.id);
            return (
              <g
                key={n.id}
                className={cx(
                  "vf-chart-network__node",
                  dragging === n.id && "vf-chart-network__node--dragging",
                  dim && "vf-chart-network__node--dimmed",
                  highlighted && "vf-chart-network__node--highlighted"
                )}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                onPointerDown={onNodeDown(n)}
                onPointerMove={onNodeMove(n)}
                onPointerUp={onNodeUp(n)}
                onPointerCancel={onNodeUp(n)}
                onPointerEnter={(e) =>
                  setHover({ kind: "node", node: n, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(n);
                }}
              >
                <circle
                  r={RESOLVED_RADIUS(n)}
                  fill={color}
                  stroke={
                    highlighted ? "var(--vf-accent, var(--vf-amber))" : "none"
                  }
                  strokeWidth={highlighted ? 2 : 0}
                />
                {n.label && (
                  <text
                    className="vf-chart-network__label"
                    x={RESOLVED_RADIUS(n) + 4}
                    y={4}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Dashed overlays for the obstructed runs of each edge. Drawn
              ON TOP of nodes so the under-node portion stays visible. */}
          {rendered.map((edge) =>
            edge.runs
              .filter((r) => r.obstructed)
              .map((r, i) => {
                const start = interpolatePoint(
                  edge.ax,
                  edge.ay,
                  edge.bx,
                  edge.by,
                  r.start
                );
                const end = interpolatePoint(
                  edge.ax,
                  edge.ay,
                  edge.bx,
                  edge.by,
                  r.end
                );
                const incident =
                  selected === edge.sId || selected === edge.tId;
                const dim = selected !== null && !incident;
                return (
                  <line
                    key={`obstr-${edge.key}-${i}`}
                    className={cx(
                      "vf-chart-network__link-obstructed",
                      incident &&
                        "vf-chart-network__link-obstructed--highlighted",
                      dim && "vf-chart-network__link-obstructed--dimmed"
                    )}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    strokeWidth={edge.width}
                    pointerEvents="none"
                  />
                );
              })
          )}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover?.kind === "node" ? (
            <ChartTooltipBody
              title={hover.node.label ?? hover.node.id}
              metrics={[
                ...(hover.node.group !== undefined
                  ? [
                      {
                        label: "group",
                        value: String(hover.node.group),
                      } as TooltipMetric,
                    ]
                  : []),
                {
                  label: "edges",
                  value: formatChartNumber(
                    simLinks.filter(
                      (l) =>
                        (l.source as SimNode).id === hover.node.id ||
                        (l.target as SimNode).id === hover.node.id
                    ).length
                  ),
                },
              ]}
            />
          ) : hover?.kind === "edge" ? (
            <ChartTooltipBody
              title={`${(hover.link.source as SimNode).id} → ${(hover.link.target as SimNode).id}`}
              metrics={[
                ...(hover.link.label
                  ? [
                      {
                        label: "label",
                        value: hover.link.label,
                      } as TooltipMetric,
                    ]
                  : []),
                ...(hover.link.value !== undefined
                  ? [
                      {
                        label: "weight",
                        value: formatChartNumber(hover.link.value),
                      } as TooltipMetric,
                    ]
                  : []),
              ]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
NetworkGraph.displayName = "NetworkGraph";
