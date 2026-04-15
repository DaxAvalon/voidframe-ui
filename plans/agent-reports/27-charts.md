# Feature-gap: Charts (25 findings)

### 1. Reference lines / bands / thresholds
**Category:** Annotations
**Benchmark:** Recharts `<ReferenceLine>`/`<ReferenceArea>`, Nivo markers, ECharts `markLine`/`markArea`, Chart.js annotation plugin.
**Gap:** No primitive or prop for horizontal threshold lines (e.g., SLA target), shaded bands, or labeled thresholds. Only `Sparkline` has a mean reference line.
**Where to add:** new `src/charts/primitives/ReferenceLine.tsx`, `ReferenceBand.tsx`, consumed by `BarChart`, `LineChart`, `AreaChart`, `ComposedChart`, `ScatterPlot`.
**Priority:** must-have

### 2. Point/event/callout annotations
**Category:** Annotations
**Benchmark:** Visx `<Annotation>`, Nivo `markers`, ECharts `markPoint`, Plotly annotations with arrows.
**Gap:** No way to pin a labeled callout (arrow + text) to a datum or time, no event-marker primitive for time axes.
**Where to add:** `src/charts/primitives/Annotation.tsx`, `EventMarker.tsx`.
**Priority:** must-have

### 3. Dual Y-axes (secondary axis)
**Category:** Axis
**Benchmark:** Recharts `yAxisId`, ECharts multiple `yAxis`, Chart.js multiple scales.
**Gap:** `ComposedChart` has a single `yScale`; no API to split series across a left/right axis with independent domains. Blocks common "revenue vs units" use case.
**Where to add:** `src/charts/ComposedChart.tsx`, extend `ChartContext` scale slots.
**Priority:** must-have

### 4. Log / symlog scales on axis charts
**Category:** Axis
**Benchmark:** d3 `scaleLog`/`scaleSymlog`, Recharts `scale="log"`, Vega-Lite `type: "log"`.
**Gap:** `math/scales.ts` exports `logScale`/`sqrtScale` but no chart's public prop surface accepts a scale kind — `BarChart`, `LineChart`, `AreaChart`, `ScatterPlot`, `Histogram` all hardcode `linearScale`. No `symlog` at all.
**Where to add:** `BarChart.tsx`, `LineChart.tsx`, `AreaChart.tsx`, `ScatterPlot.tsx`, `Histogram.tsx`; add `scaleKind?: "linear"|"log"|"symlog"|"sqrt"` prop.
**Priority:** must-have

### 5. Error bars
**Category:** BarChart / LineChart / ScatterPlot
**Benchmark:** Plotly `error_y`, Vega-Lite `errorbar`, Nivo.
**Gap:** No error-bar primitive on any series. Critical for scientific / statistical visualizations alongside `BoxPlot`/`ViolinPlot`.
**Where to add:** `src/charts/series/ErrorBar.tsx`; props on `BarChart`, `LineChart`, `ScatterPlot`.
**Priority:** must-have

### 6. Value labels on bars / data labels
**Category:** BarChart / Pie
**Benchmark:** Chart.js `datalabels` plugin, Recharts `<LabelList>`, ECharts `label.show`.
**Gap:** No way to render `$1.2M` above/inside bars, slices, or line points. Pie/Donut has legend but no inside/outside slice labels or connector lines; Bar has no value labels.
**Where to add:** `BarChart.tsx`, `PieChart.tsx`, `WaterfallChart.tsx`, new `series/DataLabel.tsx`.
**Priority:** must-have

### 7. Interactive legend (toggle series visibility)
**Category:** Legend
**Benchmark:** Recharts/Chart.js/Nivo default behavior — click to hide a series.
**Gap:** `ChartLegend` supports `onToggle`, but no chart wires its series to it; clicking a swatch in `BarChart`/`LineChart` etc. does nothing because charts don't accept a `hiddenSeries` state.
**Where to add:** every chart calling `<ChartLegend>` — pass `hiddenKeys`, filter series accordingly.
**Priority:** must-have

### 8. Legend placement + value display
**Category:** Legend
**Benchmark:** ECharts `legend.orient/left/top`, Recharts `layout`/`verticalAlign`.
**Gap:** `ChartLegend` renders below the SVG with no positional prop on chart components (top/right/left/bottom), no scrolling for many series, no per-item sum/avg values, no custom renderer.
**Where to add:** `primitives/Legend.tsx` and each chart's `showLegend` flag — replace with `legend?: { position, render, values }`.
**Priority:** nice-to-have

### 9. Export to PNG / SVG / copy-as-image
**Category:** Export
**Benchmark:** ECharts `getDataURL`, Chart.js `toBase64Image`, Plotly `toImage`.
**Gap:** No export API anywhere. Users can't produce a PNG, copy the SVG, or generate a printable monochrome variant.
**Where to add:** `primitives/ChartFrame.tsx` — expose imperative handle `{ toSVG, toPNG, toDataTable }`.
**Priority:** must-have

### 10. Data-table fallback (a11y)
**Category:** A11y
**Benchmark:** Highcharts accessibility module, Chart.js `aria-label` tables.
**Gap:** Charts have `accessibleLabel` on the `<svg>` but no hidden `<table>` summarizing data for screen readers; the task brief claims it exists — it does not.
**Where to add:** `ChartFrame.tsx` (accept `data` + `columns` for fallback rendering); apply to all axis charts.
**Priority:** must-have

### 11. Keyboard navigation through data points
**Category:** A11y
**Benchmark:** Highcharts keyboard nav, Visx `@visx/react-keyboard`.
**Gap:** No `tabIndex`/`onKeyDown` on bars, points, or slices. Users can't arrow through a series or Tab between series.
**Where to add:** `series/Bar.tsx`, `Point.tsx`, `Arc.tsx`.
**Priority:** must-have

### 12. Tooltip pinning / controlled tooltip
**Category:** Interaction
**Benchmark:** ECharts `tooltip.trigger="click"`, Plotly click-to-persist.
**Gap:** Hover-only tooltip; click-to-pin for comparison or touch devices is absent. `ChartTooltip` has no controlled-open prop.
**Where to add:** `primitives/ChartTooltip.tsx`, propagate `onPointClick`/`onBarClick` (some exist) to tooltip state.
**Priority:** nice-to-have

### 13. Crosshair + brush sync across multiple charts
**Category:** Interaction / Composition
**Benchmark:** Visx `useTooltipInPortal` + shared context, Vega-Lite `params` binding, ECharts `connect`.
**Gap:** No shared-state bus. Two stacked time-series can't share a crosshair or brush. `SmallMultiples` renders siblings but they can't sync axes or hover.
**Where to add:** new `primitives/ChartSyncProvider.tsx`, wire `Crosshair`/`Brush`/`LineChart` to a shared context.
**Priority:** must-have

### 14. Zoom + pan (wheel / pinch / selection)
**Category:** Interaction
**Benchmark:** ECharts `dataZoom`, Recharts `zoomAndPan`, Plotly native.
**Gap:** `Brush` selects a range but no follow-up zoom; no wheel/pinch zoom, no pan. `NetworkGraph` has drag but no background zoom or minimap.
**Where to add:** `primitives/ZoomPan.tsx`, integrate with `NetworkGraph`, `LineChart`, `ChoroplethMap`.
**Priority:** must-have

### 15. Null / gap / forecast-segment handling on lines
**Category:** LineChart / AreaChart
**Benchmark:** Recharts `connectNulls`, ECharts `connectNulls`, Highcharts forecast dashing.
**Gap:** Nulls silently dropped; no option to break the line at missing values. `LineChartSeries.dashed` toggles the whole line — no way to dash only the forecast tail.
**Where to add:** `LineChart.tsx` — support per-segment dash tagging and `connectNulls: boolean`.
**Priority:** must-have

### 16. Negative value handling in stacked/100% bars
**Category:** BarChart
**Benchmark:** Vega-Lite, ECharts divergent stacks.
**Gap:** `BarChart` stacked path uses `stackSeries` with `offset="none"/"expand"` but does not split positive/negative into separate stacks (standard `diverging` offset). Negatives in grouped mode work; stacked negatives render incorrectly.
**Where to add:** `math/stack.ts` add `"diverging"`, `BarChart.tsx` use it.
**Priority:** nice-to-have

### 17. Scatter enhancements (lasso, trendline, density, jitter)
**Category:** Scatter
**Benchmark:** Plotly lasso, Vega-Lite `regression`, Nivo density.
**Gap:** `ScatterPlot` offers hover only — no lasso/rectangle selection, no linear regression + R², no density hex/heat overlay, no jitter for categorical X.
**Where to add:** `ScatterPlot.tsx`, `series/Regression.tsx`, `series/DensityHex.tsx`.
**Priority:** nice-to-have

### 18. Pie/Donut advanced (explode, semicircle, top-N Other, labels+connectors)
**Category:** Pie
**Benchmark:** ECharts `roseType`/`emphasis.scale`, Highcharts semicircle + connector labels.
**Gap:** `PieChart` has no explode-on-hover, no "semicircle" preset (users must pass start/end angles manually), no auto top-N "Other" rollup, no slice labels with connector lines, no nested rings.
**Where to add:** `PieChart.tsx`.
**Priority:** nice-to-have

### 19. Financial overlays (volume, SMA/EMA/RSI, period selector)
**Category:** Financial
**Benchmark:** TradingView Lightweight Charts, ECharts candlestick + mark.
**Gap:** `CandlestickChart`/`OHLC` render price only. No paired volume pane, no moving-average overlays, no period selector chip group, no synced crosshair with price+volume readout.
**Where to add:** `CandlestickChart.tsx`, new `series/MovingAverage.tsx`, new `FinancialChart.tsx` composite.
**Priority:** nice-to-have

### 20. Diverging / symmetric color scale + dendrogram for heatmaps
**Category:** Heatmap
**Benchmark:** Plotly heatmap `colorscale="RdBu"`, ECharts heatmap + dendrogram, seaborn clustermap.
**Gap:** `Heatmap`/`CalendarHeatmap`/`ChoroplethMap` all quantize to sequential colors. No diverging scale around zero, no row/column clustering/dendrogram, no row/col totals in tooltip, legend is discrete swatches not a gradient color bar.
**Where to add:** `Heatmap.tsx`, `math/color.ts` (diverging palette), new `DendrogramAxis`.
**Priority:** nice-to-have

### 21. TreeMap / Sunburst drill-in + breadcrumbs
**Category:** TreeMap
**Benchmark:** Plotly `treemap` zoom, D3 zoomable sunburst, ECharts `drillDown`.
**Gap:** `TreeMap` flattens leaves with no drill navigation; `Sunburst` renders all depths but no click-to-zoom or breadcrumb trail, no "color by depth" toggle, no adaptive label placement.
**Where to add:** `TreeMap.tsx`, `Sunburst.tsx`; add `breadcrumb` primitive.
**Priority:** nice-to-have

### 22. Geospatial interactions (zoom, marker cluster, AK/HI inset, fit-to-data)
**Category:** Geo
**Benchmark:** Mapbox, Leaflet, d3-geo-zoom, Plotly geo.
**Gap:** `ChoroplethMap` has no zoom/pan, no projection swap at runtime, no Alaska/Hawaii inset (despite `geoAlbersUsa`), no fit-to-data-bounds. `BubbleMap` lacks marker clustering. Legends are discrete swatches, not a continuous gradient bar.
**Where to add:** `ChoroplethMap.tsx`, `BubbleMap.tsx`.
**Priority:** nice-to-have

### 23. Large-data decimation + streaming append
**Category:** Perf
**Benchmark:** Chart.js `decimation`, uPlot, ECharts `sampling: "lttb"`, Plotly WebGL.
**Gap:** All charts render every point as SVG. Beyond ~5k points `LineChart`/`ScatterPlot` will stutter. No LTTB/min-max downsample, no WebGL canvas fallback, no streaming-append with pause/resume for live feeds.
**Where to add:** new `math/decimate.ts` (LTTB), opt-in via `decimate?: number` on `LineChart`, `ScatterPlot`, `AreaChart`, `CandlestickChart`.
**Priority:** must-have (any dashboard with large data)

### 24. NetworkGraph minimap / clustering / shortest-path / edge-bundling
**Category:** Network
**Benchmark:** Cytoscape.js, Sigma.js, vis.js.
**Gap:** `NetworkGraph` does node-neighbor highlight but lacks minimap, viewport zoom, expand/collapse subgraphs, automatic community clustering for large graphs, shortest-path highlight between two selected nodes, edge bundling. `DependencyGraph` has no collapse.
**Where to add:** `NetworkGraph.tsx`, `DependencyGraph.tsx`.
**Priority:** nice-to-have

### 25. Color-blind-safe palette + printable monochrome variant
**Category:** Universal / Export
**Benchmark:** Viridis, ColorBrewer, Tableau CVD palette.
**Gap:** `math/color.ts` `DEFAULT_PALETTE` is theme accents only — no CVD-safe alternative, no patterned-fill (hatching/stipple) for grayscale print, no `printable` variant swap.
**Where to add:** `math/color.ts` — add `cvdPalette`, `divergingPalette`, `viridisPalette`; add SVG `<pattern>` primitive for Bar patterns.
**Priority:** must-have (a11y-adjacent)
