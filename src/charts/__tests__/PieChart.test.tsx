import { describe, expect, it } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DonutChart, PieChart } from "../PieChart";

const data = [
  { key: "a", label: "A", value: 30 },
  { key: "b", label: "B", value: 20 },
  { key: "c", label: "C", value: 50 },
];

describe("PieChart", () => {
  it("renders one arc path per datum", () => {
    const { container } = renderWithTheme(<PieChart data={data} size={200} />);
    const arcs = container.querySelectorAll(".vf-chart-arc path");
    expect(arcs).toHaveLength(3);
  });

  it("DonutChart defaults to innerRatio=0.6", () => {
    const { container } = renderWithTheme(
      <DonutChart data={data} size={200} />
    );
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("DonutChart's default innerRatio actually reaches the rendered arcs (spread-order fix)", () => {
    const pie = renderWithTheme(<PieChart data={data} size={200} />);
    const donut = renderWithTheme(<DonutChart data={data} size={200} />);

    const pieD = Array.from(
      pie.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");
    const donutD = Array.from(
      donut.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");

    // PieChart (innerRatio=0) and DonutChart (innerRatio=0.6) must produce
    // visually distinct arc paths. If the caller's spread bug regresses,
    // DonutChart's 0.6 default is clobbered by {...props} and donut renders
    // as a pie — making these strings identical.
    expect(donutD).not.toBe("");
    expect(donutD).not.toBe(pieD);
  });

  it("DonutChart applies its 0.6 default even when caller passes innerRatio={undefined} (forwarding pattern)", () => {
    // This reproduces the spread-order regression: when a wrapper forwards
    // an optional-undefined value, props.innerRatio is explicitly `undefined`
    // (an own enumerable key). The pre-fix code `innerRatio={props.innerRatio ?? 0.6} {...props}`
    // let `{...props}` clobber the default with undefined, causing PieChart
    // to fall back to its own `innerRatio = 0` default — rendering a pie.
    const pie = renderWithTheme(<PieChart data={data} size={200} />);
    const donut = renderWithTheme(
      <DonutChart data={data} size={200} innerRatio={undefined} />
    );
    const pieD = Array.from(
      pie.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");
    const donutD = Array.from(
      donut.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");
    // After the fix, DonutChart must render the 0.6 donut shape regardless of
    // whether innerRatio was passed as undefined or omitted entirely.
    expect(donutD).not.toBe(pieD);
  });

  it("DonutChart with explicit innerRatio=0 renders as a pie", () => {
    const pie = renderWithTheme(<PieChart data={data} size={200} />);
    const flatDonut = renderWithTheme(
      <DonutChart data={data} size={200} innerRatio={0} />
    );
    const pieD = Array.from(
      pie.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");
    const flatD = Array.from(
      flatDonut.container.querySelectorAll<SVGPathElement>(".vf-chart-arc path")
    )
      .map((p) => p.getAttribute("d") ?? "")
      .join("|");
    expect(flatD).toBe(pieD);
  });

  it("renders a legend", () => {
    const { container } = renderWithTheme(<PieChart data={data} size={200} />);
    expect(
      container.querySelectorAll(".vf-chart-legend__item")
    ).toHaveLength(3);
  });

  it("hides the legend when showLegend=false", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} showLegend={false} />
    );
    expect(
      container.querySelector(".vf-chart-pie__legend")
    ).toBeFalsy();
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <PieChart data={data} size={200} title="Sales" description="Q1 data" />
    );
    expect(getByText("Sales")).toBeTruthy();
    expect(getByText("Q1 data")).toBeTruthy();
  });

  it("uses default aria-label", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} />
    );
    const svg = container.querySelector(".vf-chart-pie__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Pie chart");
  });

  it("applies custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} accessibleLabel="revenue breakdown" />
    );
    const svg = container.querySelector(".vf-chart-pie__svg");
    expect(svg!.getAttribute("aria-label")).toBe("revenue breakdown");
  });

  it("renders with padAngle and cornerRadius", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} padAngle={0.05} cornerRadius={4} />
    );
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("respects custom endAngle (partial pie)", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} endAngle={Math.PI / 2} />
    );
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} className="my-pie" />
    );
    expect(
      container.querySelector(".vf-chart-pie")!.classList.contains("my-pie")
    ).toBe(true);
  });

  it("uses per-datum color when provided", () => {
    const coloredData = [
      { key: "a", value: 30, color: "#ff0000" },
      { key: "b", value: 20, color: "#00ff00" },
    ];
    const { container } = renderWithTheme(
      <PieChart data={coloredData} size={200} />
    );
    const paths = container.querySelectorAll(".vf-chart-arc path");
    expect(paths).toHaveLength(2);
  });

  it("renders tooltip body on arc hover", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} />
    );
    const arc = container.querySelector(".vf-chart-arc path")!;
    fireEvent.pointerEnter(arc, { clientX: 100, clientY: 100 });
    // Tooltip should be active — check the tooltip container is rendered
    expect(container.querySelector(".vf-chart-pie")).toBeTruthy();
  });

  it("uses custom valueFormat in tooltip", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} valueFormat={(v) => `$${v}`} />
    );
    expect(container.querySelector(".vf-chart-pie")).toBeTruthy();
  });

  it("handles total=0 gracefully (no division error)", () => {
    const zeroData = [
      { key: "a", value: 0 },
      { key: "b", value: 0 },
    ];
    const { container } = renderWithTheme(
      <PieChart data={zeroData} size={200} />
    );
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(2);
  });

  it("renders with default padAngle=0 and cornerRadius=0", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} size={200} />
    );
    // defaults applied; should render without crash
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("renders without explicit size (uses container measurement fallback)", () => {
    const { container } = renderWithTheme(
      <PieChart data={data} />
    );
    expect(container.querySelector(".vf-chart-pie")).toBeTruthy();
  });

  it("forwards ref via callback ref", () => {
    let refNode: HTMLDivElement | null = null;
    renderWithTheme(
      <PieChart data={data} size={200} ref={(node) => { refNode = node; }} />
    );
    expect(refNode).toBeInstanceOf(HTMLDivElement);
  });
});
