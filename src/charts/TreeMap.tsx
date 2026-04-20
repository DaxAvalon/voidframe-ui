"use client";

// TreeMap — squarified treemap via d3-hierarchy. Leaves are rendered as
// rects, interior nodes are flattened (one cell per leaf). Supports label
// rendering inside cells large enough to hold text.

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
  treemap as d3Treemap,
  treemapSquarify,
  treemapBinary,
  treemapDice,
  treemapSlice,
  treemapSliceDice,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import { formatChartNumber, seriesPalette } from "./math/color";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface TreeMapNode {
  name: string;
  value?: number;
  color?: string;
  children?: TreeMapNode[];
}

export type TreeMapTile =
  | "squarify"
  | "binary"
  | "slice"
  | "dice"
  | "slice-dice";

const TILE_MAP = {
  squarify: treemapSquarify,
  binary: treemapBinary,
  slice: treemapSlice,
  dice: treemapDice,
  "slice-dice": treemapSliceDice,
};

export interface TreeMapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: TreeMapNode;
  tile?: TreeMapTile;
  padding?: number;
  width?: number;
  height?: number;
  /** Minimum area for a label to render inside its cell. Default 600 px². */
  labelMinArea?: number;
  title?: ReactNode;
  description?: ReactNode;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  /** Color function keyed by the leaf's ancestor name (1 level above root). */
  colorForGroup?: (group: string) => string;
}

/**
 * Hierarchical rectangle tiling weighted by value. Peer: `d3-hierarchy`.
 */
export const TreeMap = forwardRef<HTMLDivElement, TreeMapProps>(
  function TreeMap(
    {
      data,
      tile = "squarify",
      padding = 1,
      width: widthProp,
      height = 280,
      labelMinArea = 600,
      title,
      description,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      colorForGroup,
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
    const width = widthProp ?? measured.width ?? 520;

    const groupNames = useMemo(
      () => (data.children ?? []).map((c) => c.name),
      [data]
    );
    const palette = useMemo(
      () => seriesPalette(Math.max(1, groupNames.length)),
      [groupNames]
    );
    const groupColor = useMemo(() => {
      const map = new Map<string, string>();
      groupNames.forEach((name, i) => map.set(name, palette[i]!));
      return (name: string) =>
        colorForGroup?.(name) ?? map.get(name) ?? palette[0]!;
    }, [groupNames, palette, colorForGroup]);

    const leaves = useMemo<HierarchyRectangularNode<TreeMapNode>[]>(() => {
      const root = hierarchy<TreeMapNode>(data)
        .sum((d) => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
      const layout = d3Treemap<TreeMapNode>()
        .tile(TILE_MAP[tile])
        .size([width, height])
        .paddingInner(padding)
        .paddingOuter(padding);
      return layout(root).leaves();
    }, [data, tile, padding, width, height]);

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
        className={cx("vf-chart-treemap", className)}
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
          className="vf-chart-treemap__svg"
          role="img"
          aria-label={accessibleLabel ?? "Treemap"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {leaves.map((leaf, i) => {
            const w = (leaf.x1 ?? 0) - (leaf.x0 ?? 0);
            const h = (leaf.y1 ?? 0) - (leaf.y0 ?? 0);
            const area = w * h;
            const ancestors = leaf.ancestors().map((n) => n.data.name);
            const group = ancestors[ancestors.length - 2] ?? leaf.data.name;
            const fill = leaf.data.color ?? groupColor(group);
            return (
              <g
                key={i}
                transform={`translate(${leaf.x0 ?? 0}, ${leaf.y0 ?? 0})`}
              >
                <rect
                  className="vf-chart-treemap__cell"
                  width={Math.max(0, w)}
                  height={Math.max(0, h)}
                  fill={fill}
                  shapeRendering="crispEdges"
                  onPointerMove={(e) =>
                    setHover({
                      name: leaf.data.name,
                      value: leaf.value ?? 0,
                      path: ancestors.slice().reverse(),
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                />
                {area > labelMinArea && (
                  <text
                    className="vf-chart-treemap__label"
                    x={6}
                    y={14}
                    pointerEvents="none"
                  >
                    {leaf.data.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <ChartTooltip
          active={!!hover}
          x={hover?.x ?? 0}
          y={hover?.y ?? 0}
        >
          {hover ? (
            <ChartTooltipBody
              title={hover.name}
              metrics={[{ label: "value", value: valueFormat(hover.value) }]}
              footer={
                hover.path.length > 1
                  ? hover.path.slice(0, -1).join(" › ")
                  : null
              }
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
TreeMap.displayName = "TreeMap";
