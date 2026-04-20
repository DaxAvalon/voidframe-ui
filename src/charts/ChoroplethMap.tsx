"use client";

// ChoroplethMap — render a TopoJSON layer with one fill per feature
// keyed to a `values` lookup. Uses d3-geo (peer dep) for projections
// + topojson-client to convert TopoJSON to GeoJSON features.

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
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { quantizeScale } from "./math/scales";
import { formatChartNumber } from "./math/color";
import { loadPeer, MissingPeerDependencyError } from "./peer";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

// Loose TopoJSON type — d3 + topojson-client validate at use time.
export type TopologyInput = unknown;

export interface ChoroplethMapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** TopoJSON object (e.g. parsed from a static .json import). */
  topology: TopologyInput;
  /** Object name within `topology.objects`, e.g. `"states"`. */
  objectKey: string;
  /** `feature.properties[featureIdProp]` is the key to match `values`. */
  featureIdProp: string;
  /** Lookup from feature id → numeric value. Missing → "no data". */
  values: Record<string, number>;
  width?: number;
  height?: number;
  /** Color buckets low→high. Default 5 blues. */
  colors?: string[];
  /** d3-geo projection name. Default `"geoMercator"`. */
  projection?: "geoMercator" | "geoEqualEarth" | "geoNaturalEarth1" | "geoAlbersUsa";
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  accessibleLabel?: string;
  valueFormat?: (v: number) => string;
}

const DEFAULT_COLORS = [
  "var(--vf-bg-3)",
  "color-mix(in srgb, var(--vf-blue) 30%, var(--vf-bg-3))",
  "color-mix(in srgb, var(--vf-blue) 55%, transparent)",
  "color-mix(in srgb, var(--vf-blue) 75%, transparent)",
  "var(--vf-blue)",
];

interface PreparedFeature {
  id: string;
  pathD: string;
  centroid: [number, number];
  properties: Record<string, unknown>;
}

export const ChoroplethMap = forwardRef<HTMLDivElement, ChoroplethMapProps>(
  function ChoroplethMap(
    {
      topology,
      objectKey,
      featureIdProp,
      values,
      width: widthProp,
      height = 360,
      colors = DEFAULT_COLORS,
      projection = "geoMercator",
      title,
      description,
      showLegend = true,
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
    const [features, setFeatures] = useState<PreparedFeature[]>([]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const [d3geo, topo] = await Promise.all([
            loadPeer("d3-geo", "<ChoroplethMap>", () => import("d3-geo")),
            loadPeer(
              "topojson-client",
              "<ChoroplethMap>",
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
          const proj = projFactory() as ReturnType<
            typeof d3geo.geoMercator
          >;
          const fc = (topo as unknown as {
            feature: (
              t: unknown,
              o: unknown
            ) => { features: Array<{ properties: Record<string, unknown>; geometry: unknown }> };
          }).feature(
            topology,
            (topology as { objects: Record<string, unknown> }).objects[objectKey]
          );
          // Fit the projection to the available canvas.
          (proj as unknown as { fitSize: (size: [number, number], object: unknown) => unknown }).fitSize(
            [width, height],
            fc
          );
          const pathGen = (d3geo as { geoPath: (proj: unknown) => (x: unknown) => string }).geoPath(proj);
          const centroidOf = (d3geo as { geoPath: (proj: unknown) => { centroid: (x: unknown) => [number, number] } }).geoPath(proj);
          const prepared: PreparedFeature[] = fc.features.map((f) => ({
            id: String(f.properties[featureIdProp] ?? ""),
            pathD: pathGen(f) ?? "",
            centroid: centroidOf.centroid(f) as [number, number],
            properties: f.properties,
          }));
          setFeatures(prepared);
        } catch (e) {
          if (e instanceof MissingPeerDependencyError) setError(e);
          else throw e;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [topology, objectKey, featureIdProp, projection, width, height]);

    const max = useMemo(() => {
      let hi = 0;
      for (const v of Object.values(values)) if (v > hi) hi = v;
      return hi || 1;
    }, [values]);

    const colorScale = useMemo(
      () => quantizeScale<string>({ domain: [0, max], range: colors }),
      [max, colors]
    );

    const [hover, setHover] = useState<{
      feature: PreparedFeature;
      value: number | null;
      x: number;
      y: number;
    } | null>(null);

    if (error) {
      return (
        <div
          ref={mergedRef}
          className={cx("vf-chart-choropleth", "vf-chart-choropleth--error", className)}
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
        className={cx("vf-chart-choropleth", className)}
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
          className="vf-chart-choropleth__svg"
          role="img"
          aria-label={accessibleLabel ?? "Choropleth map"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {features.map((f) => {
            const v = values[f.id];
            const fill = v === undefined ? "var(--vf-bg-3)" : colorScale(v);
            return (
              <path
                key={f.id || f.pathD.slice(0, 16)}
                className="vf-chart-choropleth__feature"
                d={f.pathD}
                fill={fill}
                stroke="var(--vf-bg-1)"
                strokeWidth={0.5}
                onPointerMove={(e) =>
                  setHover({
                    feature: f,
                    value: v ?? null,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onPointerLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
        {showLegend && (
          <ChartLegend
            className="vf-chart-choropleth__legend"
            items={colors.map<ChartLegendItem>((c, i) => ({
              key: `b${i}`,
              label:
                i === 0
                  ? "0"
                  : i === colors.length - 1
                    ? `${valueFormat(max)}+`
                    : "",
              color: c,
              glyph: "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.feature.id}
              metrics={[
                {
                  label: "value",
                  value:
                    hover.value === null ? "—" : valueFormat(hover.value),
                },
              ]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
ChoroplethMap.displayName = "ChoroplethMap";
