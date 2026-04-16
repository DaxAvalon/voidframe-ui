import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { FunnelChart } from "../FunnelChart";

const steps = [
  { key: "visits", label: "Visits", value: 1000 },
  { key: "signups", label: "Sign-ups", value: 420 },
  { key: "paid", label: "Paid", value: 90 },
];

describe("FunnelChart", () => {
  it("renders one polygon per step", () => {
    const { container } = renderWithTheme(
      <FunnelChart steps={steps} width={320} height={280} />
    );
    expect(
      container.querySelectorAll(".vf-chart-funnel__step").length
    ).toBe(3);
  });

  it("renders step labels", () => {
    const { getByText } = renderWithTheme(
      <FunnelChart steps={steps} width={320} height={280} />
    );
    expect(getByText("Visits")).toBeTruthy();
    expect(getByText("Paid")).toBeTruthy();
  });

  it("renders percent labels by default", () => {
    const { container } = renderWithTheme(
      <FunnelChart steps={steps} width={320} height={280} />
    );
    expect(
      container.querySelectorAll(".vf-chart-funnel__percent").length
    ).toBe(3);
  });

  it("hides percent labels when showPercent=false", () => {
    const { container } = renderWithTheme(
      <FunnelChart steps={steps} width={320} height={280} showPercent={false} />
    );
    expect(
      container.querySelectorAll(".vf-chart-funnel__percent").length
    ).toBe(0);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <FunnelChart
        steps={steps}
        width={320}
        height={280}
        title="Conversion"
        description="Step funnel"
      />
    );
    expect(getByText("Conversion")).toBeTruthy();
    expect(getByText("Step funnel")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <FunnelChart steps={steps} width={320} height={280} />
    );
    const svg = container.querySelector(".vf-chart-funnel__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Funnel chart");
  });

  it("renders in horizontal orientation", () => {
    const { container } = renderWithTheme(
      <FunnelChart
        steps={steps}
        width={400}
        height={200}
        orientation="horizontal"
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-funnel__step").length
    ).toBe(3);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <FunnelChart
        steps={steps}
        width={320}
        height={280}
        className="my-funnel"
      />
    );
    expect(
      container.querySelector(".vf-chart-funnel")!.classList.contains("my-funnel")
    ).toBe(true);
  });
});
