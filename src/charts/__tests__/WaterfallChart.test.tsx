import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { WaterfallChart } from "../WaterfallChart";

const steps: import("../WaterfallChart").WaterfallStep[] = [
  { key: "open", label: "Open", value: 100 },
  { key: "inc1", label: "Signups", value: 30 },
  { key: "dec1", label: "Churn", value: -12 },
  { key: "inc2", label: "Referrals", value: 18 },
  { key: "total", label: "Close", value: "total" },
];

describe("WaterfallChart", () => {
  it("renders one bar per step", () => {
    const { container } = renderWithTheme(
      <WaterfallChart steps={steps} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-bar__rect").length
    ).toBe(steps.length);
  });

  it("draws connector lines between non-total steps", () => {
    const { container } = renderWithTheme(
      <WaterfallChart steps={steps} width={400} height={240} />
    );
    const connectors = container.querySelectorAll(
      ".vf-chart-waterfall__connector"
    );
    // Connectors drawn between successive non-total steps: 4 gaps total,
    // but the gap ending at the "total" step is suppressed -> 3 connectors.
    expect(connectors.length).toBe(3);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <WaterfallChart
        steps={steps}
        width={400}
        height={240}
        title="Revenue"
        description="Running total"
      />
    );
    expect(getByText("Revenue")).toBeTruthy();
    expect(getByText("Running total")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <WaterfallChart steps={steps} width={400} height={240} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Waterfall chart");
  });

  it("renders gridlines by default and hides when showGrid=false", () => {
    const { container } = renderWithTheme(
      <WaterfallChart steps={steps} showGrid={false} width={400} height={240} />
    );
    expect(container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("handles steps with only increases", () => {
    const incSteps: import("../WaterfallChart").WaterfallStep[] = [
      { key: "open", label: "Open", value: 50 },
      { key: "add", label: "Add", value: 30 },
      { key: "total", label: "Total", value: "total" },
    ];
    const { container } = renderWithTheme(
      <WaterfallChart steps={incSteps} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-bar__rect").length
    ).toBe(3);
  });
});
