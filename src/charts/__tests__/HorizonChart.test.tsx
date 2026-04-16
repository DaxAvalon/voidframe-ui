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

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <HorizonChart
        data={data}
        bands={3}
        width={400}
        height={60}
        title="Temperature"
        description="Daily delta"
      />
    );
    expect(getByText("Temperature")).toBeTruthy();
    expect(getByText("Daily delta")).toBeTruthy();
  });

  it("uses the default aria-label when none is provided", () => {
    const { container } = renderWithTheme(
      <HorizonChart data={data} bands={3} width={400} height={60} />
    );
    const svg = container.querySelector(".vf-chart-horizon__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Horizon chart");
  });

  it("uses a custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <HorizonChart
        data={data}
        bands={3}
        width={400}
        height={60}
        accessibleLabel="custom label"
      />
    );
    const svg = container.querySelector(".vf-chart-horizon__svg");
    expect(svg!.getAttribute("aria-label")).toBe("custom label");
  });

  it("renders with time xKind", () => {
    const timeData = Array.from({ length: 10 }, (_, i) => ({
      x: new Date(2026, 0, i + 1),
      y: Math.sin(i / 3) * 10,
    }));
    const { container } = renderWithTheme(
      <HorizonChart data={timeData} xKind="time" bands={3} width={400} height={60} />
    );
    expect(container.querySelectorAll("svg path").length).toBe(6);
  });

  it("renders with category xKind", () => {
    const catData = [
      { x: "Mon", y: 5 },
      { x: "Tue", y: -3 },
      { x: "Wed", y: 8 },
    ];
    const { container } = renderWithTheme(
      <HorizonChart data={catData} xKind="category" bands={2} width={400} height={60} />
    );
    expect(container.querySelectorAll("svg path").length).toBe(4);
  });

  it("handles all-positive data (no negative paths with nonzero area)", () => {
    const positiveData = Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: i + 1,
    }));
    const { container } = renderWithTheme(
      <HorizonChart data={positiveData} bands={2} width={400} height={60} />
    );
    // Still renders 4 paths (2 bands x 2 polarity), but negative ones are flat
    expect(container.querySelectorAll("svg path").length).toBe(4);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <HorizonChart
        data={data}
        bands={3}
        width={400}
        height={60}
        className="my-horizon"
      />
    );
    expect(
      container.querySelector(".vf-chart-horizon")!.classList.contains("my-horizon")
    ).toBe(true);
  });

  it("handles all-negative data (renders negative band paths)", () => {
    const negData = Array.from({ length: 10 }, (_, i) => ({
      x: i,
      y: -(i + 1),
    }));
    const { container } = renderWithTheme(
      <HorizonChart data={negData} bands={3} width={400} height={60} />
    );
    // 3 bands x 2 polarity = 6 paths
    expect(container.querySelectorAll("svg path").length).toBe(6);
  });

  it("handles single-band decomposition", () => {
    const { container } = renderWithTheme(
      <HorizonChart data={data} bands={1} width={400} height={60} />
    );
    // 1 band x 2 = 2 paths
    expect(container.querySelectorAll("svg path").length).toBe(2);
  });

  it("handles many bands decomposition", () => {
    const { container } = renderWithTheme(
      <HorizonChart data={data} bands={5} width={400} height={60} />
    );
    // 5 bands x 2 = 10 paths
    expect(container.querySelectorAll("svg path").length).toBe(10);
  });

  it("uses custom positiveColor and negativeColor", () => {
    const { container } = renderWithTheme(
      <HorizonChart
        data={data}
        bands={2}
        width={400}
        height={60}
        positiveColor="blue"
        negativeColor="orange"
      />
    );
    expect(container.querySelectorAll("svg path").length).toBe(4);
  });

  it("renders with xFormat", () => {
    const { container } = renderWithTheme(
      <HorizonChart
        data={data}
        bands={3}
        width={400}
        height={60}
        xFormat={(v) => `X${v}`}
      />
    );
    expect(container.querySelector(".vf-chart-horizon")).toBeTruthy();
  });

  it("renders with all-zero data (absMax falls back to 1)", () => {
    const zeroData = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    const { container } = renderWithTheme(
      <HorizonChart data={zeroData} bands={2} width={400} height={60} />
    );
    expect(container.querySelector(".vf-chart-horizon")).toBeTruthy();
  });
});
