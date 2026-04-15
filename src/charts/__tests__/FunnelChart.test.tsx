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
});
