import { describe, expect, it } from "vitest";
import * as charts from "../index";

describe("charts barrel export", () => {
  it("exports ChartFrame", () => {
    expect(charts.ChartFrame).toBeDefined();
  });

  it("exports ChartContext and useChart", () => {
    expect(charts.ChartContext).toBeDefined();
    expect(charts.useChart).toBeDefined();
    expect(charts.useOptionalChart).toBeDefined();
    expect(charts.DEFAULT_MARGINS).toBeDefined();
  });

  it("exports primitives", () => {
    expect(charts.Axis).toBeDefined();
    expect(charts.Gridlines).toBeDefined();
    expect(charts.ChartLegend).toBeDefined();
    expect(charts.ChartTooltip).toBeDefined();
    expect(charts.ChartTooltipBody).toBeDefined();
    expect(charts.Crosshair).toBeDefined();
    expect(charts.Brush).toBeDefined();
    expect(charts.ReferenceLine).toBeDefined();
    expect(charts.ReferenceBand).toBeDefined();
  });

  it("exports math utilities", () => {
    expect(charts.linearScale).toBeDefined();
    expect(charts.logScale).toBeDefined();
    expect(charts.sqrtScale).toBeDefined();
    expect(charts.timeScale).toBeDefined();
    expect(charts.bandScale).toBeDefined();
    expect(charts.pointScale).toBeDefined();
    expect(charts.quantizeScale).toBeDefined();
    expect(charts.bandCenter).toBeDefined();
    expect(charts.generateTicks).toBeDefined();
    expect(charts.defaultNumericFormat).toBeDefined();
    expect(charts.stackSeries).toBeDefined();
    expect(charts.resolveCurve).toBeDefined();
    expect(charts.bisectNearest).toBeDefined();
    expect(charts.scanNearest).toBeDefined();
    expect(charts.seriesPalette).toBeDefined();
    expect(charts.defaultSeriesPalette).toBeDefined();
    expect(charts.formatChartNumber).toBeDefined();
    expect(charts.cvdPalette).toBeDefined();
    expect(charts.divergingPalette).toBeDefined();
    expect(charts.CVD_PALETTE).toBeDefined();
    expect(charts.DIVERGING_PALETTE).toBeDefined();
  });

  it("exports Phase 22 core charts", () => {
    expect(charts.BarChart).toBeDefined();
    expect(charts.LineChart).toBeDefined();
    expect(charts.AreaChart).toBeDefined();
    expect(charts.ScatterPlot).toBeDefined();
    expect(charts.BubbleChart).toBeDefined();
    expect(charts.ComposedChart).toBeDefined();
    expect(charts.PieChart).toBeDefined();
    expect(charts.DonutChart).toBeDefined();
    expect(charts.RadarChart).toBeDefined();
    expect(charts.Histogram).toBeDefined();
    expect(charts.CalendarHeatmap).toBeDefined();
    expect(charts.Sparkline).toBeDefined();
    expect(charts.Heatmap).toBeDefined();
  });

  it("exports Phase 23 advanced layouts", () => {
    expect(charts.SmallMultiples).toBeDefined();
    expect(charts.TreeMap).toBeDefined();
    expect(charts.Sunburst).toBeDefined();
    expect(charts.FunnelChart).toBeDefined();
    expect(charts.WaterfallChart).toBeDefined();
    expect(charts.BoxPlot).toBeDefined();
    expect(charts.computeBoxStats).toBeDefined();
    expect(charts.ViolinPlot).toBeDefined();
    expect(charts.CandlestickChart).toBeDefined();
    expect(charts.OHLCChart).toBeDefined();
    expect(charts.StreamGraph).toBeDefined();
    expect(charts.HorizonChart).toBeDefined();
    expect(charts.Sankey).toBeDefined();
    expect(charts.ChordDiagram).toBeDefined();
    expect(charts.ParallelCoordinates).toBeDefined();
    expect(charts.ScatterMatrix).toBeDefined();
  });

  it("exports Phase 24 geospatial + network", () => {
    expect(charts.NetworkGraph).toBeDefined();
    expect(charts.DependencyGraph).toBeDefined();
    expect(charts.ChoroplethMap).toBeDefined();
    expect(charts.BubbleMap).toBeDefined();
    expect(charts.TileGridMap).toBeDefined();
    expect(charts.US_STATES_GRID).toBeDefined();
    expect(charts.MissingPeerDependencyError).toBeDefined();
  });
});
