"use client";

// OrgChart — hierarchical organization tree visualization using SVG.
// No external deps — pure custom tree layout. Nodes placed recursively
// with parent centering above children. Connectors rendered as SVG paths.

import {
  forwardRef,
  useCallback,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useControllableState } from "../hooks/useControllableState";

export interface OrgChartNode {
  id: string;
  label: string;
  description?: string;
  avatar?: string;
  metadata?: Record<string, string>;
  children?: OrgChartNode[];
}

export interface OrgChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  data: OrgChartNode;
  direction?: "top-down" | "left-right";
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalGap?: number;
  verticalGap?: number;
  renderNode?: (node: OrgChartNode, depth: number) => ReactNode;
  onNodeClick?: (node: OrgChartNode) => void;
  collapsible?: boolean;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandChange?: (ids: string[]) => void;
  connectorStyle?: "straight" | "curved" | "step";
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  size?: "sm" | "md";
}

// ── Layout helpers ────────────────────────────────────────

interface PlacedNode {
  node: OrgChartNode;
  depth: number;
  x: number;
  y: number;
  children: PlacedNode[];
}

/**
 * Calculate subtree width (number of leaf-equivalent slots).
 * Collapsed nodes count as a single leaf.
 */
function subtreeWidth(
  node: OrgChartNode,
  expandedSet: Set<string>
): number {
  const kids = node.children ?? [];
  if (kids.length === 0 || !expandedSet.has(node.id)) return 1;
  let total = 0;
  for (const child of kids) total += subtreeWidth(child, expandedSet);
  return total;
}

/**
 * Recursively assign (x, y) positions. In top-down mode:
 *   x = horizontal position (in units of nodeWidth + horizontalGap)
 *   y = depth * (nodeHeight + verticalGap)
 *
 * `offsetSlot` is the cumulative leaf-slot offset from the left edge.
 */
function layoutTree(
  node: OrgChartNode,
  depth: number,
  offsetSlot: number,
  expandedSet: Set<string>,
  nw: number,
  nh: number,
  hGap: number,
  vGap: number,
  isTopDown: boolean
): PlacedNode {
  const kids = node.children ?? [];
  const expanded = expandedSet.has(node.id) && kids.length > 0;

  const placedChildren: PlacedNode[] = [];
  if (expanded) {
    let slot = offsetSlot;
    for (const child of kids) {
      const placed = layoutTree(
        child,
        depth + 1,
        slot,
        expandedSet,
        nw,
        nh,
        hGap,
        vGap,
        isTopDown
      );
      placedChildren.push(placed);
      slot += subtreeWidth(child, expandedSet);
    }
  }

  const selfWidth = subtreeWidth(node, expandedSet);
  // Center parent above its children span.
  const centerSlot = offsetSlot + selfWidth / 2 - 0.5;
  const slotW = nw + hGap;
  const slotH = nh + vGap;

  let x: number;
  let y: number;
  if (isTopDown) {
    x = centerSlot * slotW;
    y = depth * slotH;
  } else {
    x = depth * (nw + vGap);
    y = centerSlot * (nh + hGap);
  }

  return { node, depth, x, y, children: placedChildren };
}

/**
 * Flatten placed tree into an array for rendering.
 */
function flattenPlaced(root: PlacedNode): PlacedNode[] {
  const out: PlacedNode[] = [root];
  for (const child of root.children) {
    out.push(...flattenPlaced(child));
  }
  return out;
}

/**
 * Collect parent->child edges from the placed tree.
 */
function collectEdges(
  root: PlacedNode
): Array<{ parent: PlacedNode; child: PlacedNode }> {
  const out: Array<{ parent: PlacedNode; child: PlacedNode }> = [];
  for (const child of root.children) {
    out.push({ parent: root, child });
    out.push(...collectEdges(child));
  }
  return out;
}

/**
 * Collect all node IDs in the tree.
 */
function collectAllIds(node: OrgChartNode): string[] {
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...collectAllIds(child));
  }
  return ids;
}

// ── Connector path builders ──────────────────────────────

function connectorPath(
  px: number,
  py: number,
  cx_: number,
  cy: number,
  style: "straight" | "curved" | "step",
  isTopDown: boolean
): string {
  if (style === "straight") {
    return `M${px},${py} L${cx_},${cy}`;
  }
  if (style === "curved") {
    if (isTopDown) {
      const midY = (py + cy) / 2;
      return `M${px},${py} C${px},${midY} ${cx_},${midY} ${cx_},${cy}`;
    }
    const midX = (px + cx_) / 2;
    return `M${px},${py} C${midX},${py} ${midX},${cy} ${cx_},${cy}`;
  }
  // step
  if (isTopDown) {
    const midY = (py + cy) / 2;
    return `M${px},${py} L${px},${midY} L${cx_},${midY} L${cx_},${cy}`;
  }
  const midX = (px + cx_) / 2;
  return `M${px},${py} L${midX},${py} L${midX},${cy} L${cx_},${cy}`;
}

// ── Component ─────────────────────────────────────────────

export const OrgChart = forwardRef<HTMLDivElement, OrgChartProps>(
  function OrgChart(
    {
      data,
      direction = "top-down",
      nodeWidth = 180,
      nodeHeight = 80,
      horizontalGap = 40,
      verticalGap = 60,
      renderNode,
      onNodeClick,
      collapsible = true,
      expandedIds: expandedIdsProp,
      defaultExpandedIds,
      onExpandChange,
      connectorStyle = "step",
      zoom: zoomProp,
      onZoomChange,
      size = "md",
      className,
      style,
      ...props
    },
    ref
  ) {
    const allIds = useMemo(() => collectAllIds(data), [data]);

    const [expandedIds, setExpandedIds] = useControllableState<string[]>({
      value: expandedIdsProp,
      defaultValue: defaultExpandedIds ?? allIds,
      onChange: onExpandChange,
      componentName: "OrgChart",
    });

    const [zoomLevel, setZoomLevel] = useControllableState<number>({
      value: zoomProp,
      defaultValue: 1,
      onChange: onZoomChange,
      componentName: "OrgChart.zoom",
    });

    const expandedSet = useMemo(
      () => new Set(expandedIds),
      [expandedIds]
    );

    const isTopDown = direction === "top-down";

    const root = useMemo(
      () =>
        layoutTree(
          data,
          0,
          0,
          expandedSet,
          nodeWidth,
          nodeHeight,
          horizontalGap,
          verticalGap,
          isTopDown
        ),
      [data, expandedSet, nodeWidth, nodeHeight, horizontalGap, verticalGap, isTopDown]
    );

    const flatNodes = useMemo(() => flattenPlaced(root), [root]);
    const edges = useMemo(() => collectEdges(root), [root]);

    const svgWidth = useMemo(
      () =>
        flatNodes.reduce(
          (max, p) => Math.max(max, p.x + nodeWidth),
          0
        ) + 8,
      [flatNodes, nodeWidth]
    );
    const svgHeight = useMemo(
      () =>
        flatNodes.reduce(
          (max, p) => Math.max(max, p.y + nodeHeight),
          0
        ) + 8,
      [flatNodes, nodeHeight]
    );

    const toggleExpand = useCallback(
      (id: string) => {
        const next = expandedSet.has(id)
          ? expandedIds.filter((eid) => eid !== id)
          : [...expandedIds, id];
        setExpandedIds(next);
      },
      [expandedIds, expandedSet, setExpandedIds]
    );

    const handleZoomIn = useCallback(() => {
      setZoomLevel(Math.min(zoomLevel + 0.1, 3));
    }, [zoomLevel, setZoomLevel]);

    const handleZoomOut = useCallback(() => {
      setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
    }, [zoomLevel, setZoomLevel]);

    const fontSize = size === "sm" ? 11 : 13;
    const descFontSize = size === "sm" ? 9 : 11;

    return (
      <div
        ref={ref}
        className={cx(
          "vf-org-chart",
          `vf-org-chart--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        <div className="vf-org-chart__controls">
          <button
            type="button"
            className="vf-org-chart__zoom-btn"
            aria-label="Zoom in"
            onClick={handleZoomIn}
          >
            +
          </button>
          <button
            type="button"
            className="vf-org-chart__zoom-btn"
            aria-label="Zoom out"
            onClick={handleZoomOut}
          >
            &minus;
          </button>
        </div>
        <svg
          className="vf-org-chart__svg"
          role="img"
          aria-label="Organization chart"
          width={svgWidth * zoomLevel}
          height={svgHeight * zoomLevel}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}
        >
          {/* Connectors */}
          {edges.map(({ parent: p, child: c }) => {
            const pCenterX = p.x + nodeWidth / 2;
            const pCenterY = p.y + nodeHeight / 2;
            const cCenterX = c.x + nodeWidth / 2;
            const cCenterY = c.y + nodeHeight / 2;

            let startX: number;
            let startY: number;
            let endX: number;
            let endY: number;

            if (isTopDown) {
              startX = pCenterX;
              startY = p.y + nodeHeight;
              endX = cCenterX;
              endY = c.y;
            } else {
              startX = p.x + nodeWidth;
              startY = pCenterY;
              endX = c.x;
              endY = cCenterY;
            }

            const d = connectorPath(
              startX,
              startY,
              endX,
              endY,
              connectorStyle,
              isTopDown
            );

            return (
              <path
                key={`${p.node.id}-${c.node.id}`}
                className={cx(
                  "vf-org-chart__connector",
                  `vf-org-chart__connector--${connectorStyle}`
                )}
                d={d}
                fill="none"
              />
            );
          })}

          {/* Nodes */}
          {flatNodes.map((placed) => {
            const hasChildren =
              (placed.node.children?.length ?? 0) > 0;
            const isExpanded = expandedSet.has(placed.node.id);

            return (
              <g
                key={placed.node.id}
                className="vf-org-chart__node"
                transform={`translate(${placed.x}, ${placed.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick?.(placed.node);
                }}
              >
                {renderNode ? (
                  <foreignObject
                    width={nodeWidth}
                    height={nodeHeight}
                  >
                    {renderNode(placed.node, placed.depth)}
                  </foreignObject>
                ) : (
                  <>
                    <rect
                      className="vf-org-chart__node-card"
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={4}
                    />
                    <text
                      className="vf-org-chart__node-label"
                      x={nodeWidth / 2}
                      y={
                        placed.node.description
                          ? nodeHeight / 2 - 6
                          : nodeHeight / 2
                      }
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={fontSize}
                    >
                      {placed.node.label}
                    </text>
                    {placed.node.description && (
                      <text
                        className="vf-org-chart__node-description"
                        x={nodeWidth / 2}
                        y={nodeHeight / 2 + 10}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={descFontSize}
                      >
                        {placed.node.description}
                      </text>
                    )}
                  </>
                )}

                {/* Collapse/expand toggle */}
                {collapsible && hasChildren && (
                  <g
                    className="vf-org-chart__collapse-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(placed.node.id);
                    }}
                    role="button"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <circle
                      cx={isTopDown ? nodeWidth / 2 : nodeWidth + 10}
                      cy={isTopDown ? nodeHeight + 10 : nodeHeight / 2}
                      r={8}
                    />
                    <text
                      x={isTopDown ? nodeWidth / 2 : nodeWidth + 10}
                      y={isTopDown ? nodeHeight + 10 : nodeHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {isExpanded ? "\u2212" : "+"}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
);
OrgChart.displayName = "OrgChart";
