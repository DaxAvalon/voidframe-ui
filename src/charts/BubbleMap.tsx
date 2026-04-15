"use client";

// BubbleMap — overlay sized circles on a TopoJSON base map at given
// (longitude, latitude) coords. Uses d3-geo + topojson-client (peer
// deps).

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { sqrtScale } from "./math/scales";
import { formatChartNumber } from "./math/color";
import { loadPeer, MissingPeerDependencyError } from "./peer";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";
import type { TopologyInput } from "./ChoroplethMap";

export interface BubbleMapPoint {
  id?: string;
  /** [longitude, latitude]. */
  coordinates: [number, number];
  value: number;
  label?: string;
  color?: string;
}

export interface BubbleMapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  topology: TopologyInput;
  objectKey: string;
  points: BubbleMapPoint[];
  width?: number;
  height?: number;
  projection?: "geoMercator" | "geoEqualEarth" | "geoNaturalEarth1" | "geoAlbersUsa";
  /** Bubble size range, in px radius. Default `[3, 32]`. */
  sizeRange?: [number, number];
  /** Default bubble color. Default accent green. */
  color?: string;
  title?: ReactNode;
  description?: ReactNode;
  accessibleLabel?: string;
  valueFormat?: (v: number) => string;
}

interface ProjectedPoint extends BubbleMapPoint {
  x: number;
  y: number;
}

export const BubbleMap = forwardRef<HTMLDivElement, BubbleMapProps>(
  function BubbleMap(
    {
      topology,
      objectKey,
      points,
      width: widthProp,
      height = 360,
      projection = "geoMercator",
      sizeRange = [3, 32],
      color = "var(--vf-green)",
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

    const [error, setError] = useState<MissingPeerDependencyError | null>(
      null
    );
    const [basePaths, setBasePaths] = useState<string[]>([]);
    const [projected, setProjected] = useState<ProjectedPoint[]>([]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const [d3geo, topo] = await Promise.all([
            loadPeer("d3-geo", "<BubbleMap>", () => import("d3-geo")),
            loadPeer(
              "topojson-client",
              "<BubbleMap>",
              () => import("topojson-client")
            ),
          ]);
          if (cancelled) return;
          const projFactory = (
            d3geo as unknown as Record<string, () => unknown>
          )[projection] as (() => unknown) | undefined;
          if (!projFactory) {
            throw new Error(`Unknown projection "${projection}"`);
          }
          const proj = projFactory() as ReturnType<typeof d3geo.geoMercator>;
          const fc = (topo as unknown as {
            feature: (
              t: unknown,
              o: unknown
            ) => { features: Array<{ geometry: unknown }> };
          }).feature(
            topology,
            (topology as { objects: Record<string, unknown> }).objects[
              objectKey
            ]
          );
          (proj as unknown as { fitSize: (size: [number, number], object: unknown) => unknown }).fitSize(
            [width, height],
            fc
          );
          const pathGen = (d3geo as { geoPath: (proj: unknown) => (x: unknown) => string }).geoPath(proj);
          setBasePaths(fc.features.map((f) => pathGen(f) ?? ""));
          const projectFn = proj as unknown as (lonlat: [number, number]) => [number, number] | null;
          setProjected(
            points.map((p) => {
              const xy = projectFn(p.coordinates) ?? [0, 0];
              return { ...p, x: xy[0], y: xy[1] };
            })
          );
        } catch (e) {
          if (e instanceof MissingPeerDependencyError) setError(e);
          else throw e;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [topology, objectKey, projection, points, width, height]);

    const sizeExtent: [number, number] = useMemo(() => {
      let lo = Infinity;
      let hi = -Infinity;
      for (const p of points) {
        if (p.value < lo) lo = p.value;
        if (p.value > hi) hi = p.value;
      }
      if (!Number.isFinite(lo)) return [0, 1];
      if (lo === hi) hi = lo + 1;
      return [lo, hi];
    }, [points]);

    const sizeFn = useMemo(
      () => sqrtScale({ domain: sizeExtent, range: sizeRange }),
      [sizeExtent, sizeRange]
    );

    const [hover, setHover] = useState<{
      point: ProjectedPoint;
      x: number;
      y: number;
    } | null>(null);

    if (error) {
      return (
        <div
          ref={mergedRef}
          className={cx("vf-chart-bubble-map", "vf-chart-bubble-map--error", className)}
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
        className={cx("vf-chart-bubble-map", className)}
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
          className="vf-chart-bubble-map__svg"
          role="img"
          aria-label={accessibleLabel ?? "Bubble map"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {basePaths.map((d, i) => (
            <path
              key={i}
              className="vf-chart-bubble-map__base"
              d={d}
              fill="var(--vf-bg-3)"
              stroke="var(--vf-bg-1)"
              strokeWidth={0.5}
            />
          ))}
          {projected.map((p, i) => (
            <circle
              key={p.id ?? i}
              className="vf-chart-bubble-map__bubble"
              cx={p.x}
              cy={p.y}
              r={sizeFn(p.value)}
              fill={p.color ?? color}
              fillOpacity={0.55}
              stroke={p.color ?? color}
              strokeWidth={1}
              onPointerMove={(e) =>
                setHover({ point: p, x: e.clientX, y: e.clientY })
              }
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.point.label ?? hover.point.id ?? "Point"}
              metrics={[
                { label: "value", value: valueFormat(hover.point.value) },
                {
                  label: "lon, lat",
                  value: `${formatChartNumber(hover.point.coordinates[0])}, ${formatChartNumber(hover.point.coordinates[1])}`,
                },
              ]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
BubbleMap.displayName = "BubbleMap";
