import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { HorizonChart } from "../HorizonChart";

const data = Array.from({ length: 30 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 3) * 10,
}));

describe("HorizonChart", () => {
  it("renders N bands worth of paths", () => {
    const { container } = renderWithTheme(
      <HorizonChart data={data} bands={3} width={400} height={60} />
    );
    // 3 bands × 2 (positive + negative) = 6 paths + 1 baseline line.
    expect(container.querySelectorAll("svg path").length).toBe(6);
  });

  it("renders a baseline line", () => {
    const { container } = renderWithTheme(
      <HorizonChart data={data} bands={2} width={400} height={50} />
    );
    expect(container.querySelector(".vf-chart-horizon__baseline")).toBeTruthy();
  });
});
