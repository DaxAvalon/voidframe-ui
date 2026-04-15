import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { ChartFrame } from "../ChartFrame";
import { useChart } from "../ChartContext";

function Probe({ onCtx }: { onCtx: (ctx: ReturnType<typeof useChart>) => void }) {
  const ctx = useChart();
  onCtx(ctx);
  return null;
}

describe("ChartFrame", () => {
  it("renders an SVG with a translate for the plot region", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200} />
    );
    const plot = container.querySelector(".vf-chart-frame__plot");
    expect(plot).toBeTruthy();
    expect(plot!.getAttribute("transform")).toBe("translate(44, 12)");
  });

  it("computes inner dimensions from margins", () => {
    let captured: ReturnType<typeof useChart> | null = null;
    renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Probe onCtx={(c) => (captured = c)} />
      </ChartFrame>
    );
    const c = captured as unknown as ReturnType<typeof useChart>;
    expect(c.innerWidth).toBe(400 - 44 - 16); // default left+right
    expect(c.innerHeight).toBe(200 - 12 - 32);
  });

  it("falls back to defaultWidth/defaultHeight when unmeasured", () => {
    let captured: ReturnType<typeof useChart> | null = null;
    renderWithTheme(
      <ChartFrame defaultWidth={600} defaultHeight={300}>
        <Probe onCtx={(c) => (captured = c)} />
      </ChartFrame>
    );
    const c = captured as unknown as ReturnType<typeof useChart>;
    expect(c.width).toBe(600);
    expect(c.height).toBe(300);
  });

  it("renders the title and description when provided", () => {
    const { getByText } = renderWithTheme(
      <ChartFrame width={300} height={200} title="Sales" description="Q1" />
    );
    expect(getByText("Sales")).toBeTruthy();
    expect(getByText("Q1")).toBeTruthy();
  });

  it("exposes role=img and aria-label when accessibleLabel is set", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={200} height={100} accessibleLabel="test chart" />
    );
    const svg = container.querySelector("svg");
    expect(svg!.getAttribute("role")).toBe("img");
    expect(svg!.getAttribute("aria-label")).toBe("test chart");
  });
});
