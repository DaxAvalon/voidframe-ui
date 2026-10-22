import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { LineChart } from "../LineChart";
import { Sparkline } from "../Sparkline";
import { ChartLegend } from "../primitives/Legend";
import { Mermaid, mermaidThemeVariables } from "../../components/RichEmbed";

const data = [
  { x: 0, a: 10 },
  { x: 1, a: 30 },
  { x: 2, a: 20 },
];

describe("LineChart reference lines and point styles", () => {
  it("draws reference lines with tone colours and labels, extending the domain", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        width={300}
        height={200}
        referenceLines={[
          { y: 50, label: "Target", tone: "success" },
          { y: 0, dashed: false, color: "red", labelPosition: "start", label: "Floor" },
        ]}
      />
    );
    const refs = container.querySelectorAll(".vf-chart-line-chart__reference");
    expect(refs).toHaveLength(2);
    const first = refs[0]!.querySelector("line")!;
    expect(first.getAttribute("stroke")).toBe("var(--vf-success)");
    expect(first.getAttribute("stroke-dasharray")).toBe("6 4");
    expect(refs[0]!.querySelector("text")?.textContent).toBe("Target");
    const second = refs[1]!.querySelector("line")!;
    expect(second.getAttribute("stroke")).toBe("red");
    expect(second.getAttribute("stroke-dasharray")).toBeNull();
    expect(refs[1]!.querySelector("text")?.getAttribute("text-anchor")).toBe("start");
    // The 50 target sits above the data max (30) and the chart still renders the series.
    expect(container.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("styles points per datum: tone, hollow, hidden", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[
          {
            key: "a",
            pointStyle: (_d, value) =>
              value >= 30 ? { tone: "danger" } : value <= 10 ? { hidden: true } : { hollow: true, size: 6 },
          },
        ]}
        width={300}
        height={200}
      />
    );
    const points = container.querySelectorAll(".vf-chart-line-chart__styled-points .vf-chart-point");
    expect(points).toHaveLength(2);
    const danger = Array.from(points).find((p) => p.getAttribute("data-tone") === "danger")!;
    expect(danger.getAttribute("fill")).toBe("var(--vf-danger)");
    const hollow = Array.from(points).find((p) => p.hasAttribute("data-hollow"))!;
    expect(hollow.getAttribute("fill")).toBe("var(--vf-bg-1)");
    expect(hollow.getAttribute("width")).toBe("6");
  });
});

describe("Sparkline highlightLast and tone", () => {
  it("marks the last point and colours by tone", () => {
    const { container } = renderWithTheme(<Sparkline data={[1, 3, 2]} highlightLast tone="warning" width={60} height={20} />);
    const last = container.querySelector(".vf-chart-sparkline__last")!;
    expect(last).not.toBeNull();
    expect(last.getAttribute("fill")).toBe("var(--vf-warning)");
    expect(Number(last.getAttribute("cx"))).toBeLessThanOrEqual(57.5);
    expect(container.querySelector(".vf-chart-sparkline")).toHaveAttribute("data-tone", "warning");
    expect(container.querySelector("path")?.getAttribute("stroke")).toBe("var(--vf-warning)");
  });
});

describe("ChartLegend dash and description", () => {
  it("renders dashed line swatches and descriptions", () => {
    const { container } = renderWithTheme(
      <ChartLegend
        items={[
          { key: "a", label: "Actual", color: "red", glyph: "line" },
          { key: "t", label: "Target", color: "green", glyph: "line", dash: "dashed", description: "monthly goal" },
          { key: "c", label: "Custom", color: "blue", glyph: "line", dash: "2 6" },
        ]}
      />
    );
    const lines = container.querySelectorAll("svg line");
    expect(lines[0]!.getAttribute("stroke-dasharray")).toBeNull();
    expect(lines[1]!.getAttribute("stroke-dasharray")).toBe("4 3");
    expect(lines[2]!.getAttribute("stroke-dasharray")).toBe("2 6");
    expect(screen.getByText("monthly goal")).toHaveClass("vf-chart-legend__description");
  });
});

describe("Mermaid voidframe theme", () => {
  it("initialises with base theme plus token-derived variables and reports render/error", async () => {
    const initialize = vi.fn();
    const render_ = vi.fn().mockResolvedValue({ svg: "<svg><text>ok</text></svg>" });
    const onRender = vi.fn();
    const loader = vi.fn().mockResolvedValue({ initialize, render: render_ });
    render(<Mermaid chart="graph TD; A-->B;" loader={loader} onRender={onRender} themeVariables={{ lineColor: "hotpink" }} />);
    await waitFor(() => expect(onRender).toHaveBeenCalledWith("<svg><text>ok</text></svg>"));
    const config = initialize.mock.calls[0]![0] as { theme: string; themeVariables: Record<string, string> };
    expect(config.theme).toBe("base");
    expect(config.themeVariables.lineColor).toBe("hotpink");
    expect(config.themeVariables).toHaveProperty("primaryColor");
    expect(mermaidThemeVariables()).toHaveProperty("fontFamily");

    const onError = vi.fn();
    render(<Mermaid chart="x" theme="dark" loader={vi.fn().mockRejectedValue(new Error("boom"))} onError={onError} />);
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0]![0].message).toBe("boom");
  });

  it("passes a named theme through unchanged", async () => {
    const initialize = vi.fn();
    const loader = vi.fn().mockResolvedValue({ initialize, render: vi.fn().mockResolvedValue({ svg: "<svg/>" }) });
    render(<Mermaid chart="x" theme="neutral" loader={loader} />);
    await waitFor(() => expect(initialize).toHaveBeenCalled());
    expect(initialize.mock.calls[0]![0]).toEqual({ theme: "neutral", securityLevel: "strict" });
  });
});
