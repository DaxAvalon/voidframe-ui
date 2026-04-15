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
    // but the gap ending at the "total" step is suppressed → 3 connectors.
    expect(connectors.length).toBe(3);
  });
});
