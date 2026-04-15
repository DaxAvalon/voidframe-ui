"use client";

// NetworkGraph — force-directed graph via d3-force (loaded as an
// optional peer dep). Nodes can be dragged; the simulation rebalances
// on each drag tick. Click events bubble up via onNodeClick.
//
// The simulation runs on a worker-free, RAF-based tick loop. Nodes
// auto-cool after `coolDownAfter` ms with no interaction so we don't
// pin CPU once the graph settles.

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
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
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
}

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

    // Mount + (re)create the simulation when nodes/links change.
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
          // Cooldown loop — stop the simulation once it's been quiet.
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

    const [hover, setHover] = useState<{
      node: SimNode;
      x: number;
      y: number;
    } | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    const onNodeDown =
      (node: SimNode) => (e: ReactPointerEvent<SVGElement>) => {
        const sim = simulationRef.current;
        if (!sim) return;
        e.stopPropagation();
        sim.alphaTarget(0.3);
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
        >
          {simLinks.map((l, i) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            return (
              <line
                key={i}
                className="vf-chart-network__link"
                x1={s.x ?? 0}
                y1={s.y ?? 0}
                x2={t.x ?? 0}
                y2={t.y ?? 0}
                strokeWidth={Math.max(1, l.value)}
              />
            );
          })}
          {simNodes.map((n) => {
            const color = palette.get(String(n.group ?? "default")) ?? "var(--vf-text-2)";
            return (
              <g
                key={n.id}
                className={cx(
                  "vf-chart-network__node",
                  dragging === n.id && "vf-chart-network__node--dragging"
                )}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                onPointerDown={onNodeDown(n)}
                onPointerMove={onNodeMove(n)}
                onPointerUp={onNodeUp(n)}
                onPointerCancel={onNodeUp(n)}
                onPointerEnter={(e) =>
                  setHover({ node: n, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
                onClick={() => onNodeClick?.({
                  id: n.id, label: n.label, group: n.group, radius: n.radius,
                })}
              >
                <circle r={n.radius} fill={color} />
                {n.label && (
                  <text
                    className="vf-chart-network__label"
                    x={n.radius + 4}
                    y={4}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.node.label ?? hover.node.id}
              metrics={[
                ...(hover.node.group !== undefined
                  ? [{ label: "group", value: String(hover.node.group) }]
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
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
NetworkGraph.displayName = "NetworkGraph";
