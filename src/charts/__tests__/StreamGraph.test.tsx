import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { StreamGraph } from "../StreamGraph";

const data = Array.from({ length: 10 }, (_, i) => ({
  x: i,
  a: 10 + Math.sin(i / 2) * 5,
  b: 8 + Math.cos(i / 2) * 4,
  c: 6 + Math.sin(i / 3) * 3,
}));

describe("StreamGraph", () => {
  it("renders one area per series", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }, { key: "b" }, { key: "c" }]}
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll("path.vf-chart-area").length
    ).toBe(3);
  });

  it("renders a legend by default", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelector(".vf-chart-stream__legend")
    ).toBeTruthy();
  });

  it("hides legend when showLegend=false", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        showLegend={false}
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelector(".vf-chart-stream__legend")
    ).toBeFalsy();
  });

  it("renders with category xKind", () => {
    const catData = [
      { x: "Jan", a: 10, b: 5 },
      { x: "Feb", a: 15, b: 8 },
      { x: "Mar", a: 12, b: 6 },
    ];
    const { container } = renderWithTheme(
      <StreamGraph
        data={catData}
        series={[{ key: "a" }, { key: "b" }]}
        xKind="category"
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll("path.vf-chart-area").length
    ).toBe(2);
  });

  it("renders with time xKind", () => {
    const timeData = Array.from({ length: 5 }, (_, i) => ({
      x: new Date(2026, 0, i + 1),
      a: 10 + i,
      b: 8 + i,
    }));
    const { container } = renderWithTheme(
      <StreamGraph
        data={timeData}
        series={[{ key: "a" }, { key: "b" }]}
        xKind="time"
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll("path.vf-chart-area").length
    ).toBe(2);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={200}
        className="my-stream"
      />
    );
    expect(
      container.querySelector(".vf-chart-stream")!.classList.contains("my-stream")
    ).toBe(true);
  });

  it("renders with empty data without crashing", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={[]}
        series={[{ key: "a" }]}
        width={400}
        height={200}
      />
    );
    expect(container.querySelector(".vf-chart-stream")).toBeTruthy();
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={200}
        title="Stream"
        description="Over time"
      />
    );
    expect(getByText("Stream")).toBeTruthy();
    expect(getByText("Over time")).toBeTruthy();
  });

  it("uses custom xFormat", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }]}
        xFormat={(v) => `X:${v}`}
        width={400}
        height={200}
      />
    );
    expect(container.querySelector(".vf-chart-stream")).toBeTruthy();
  });

  it("renders with all-equal data (yMin === yMax fallback)", () => {
    const flatData = [
      { x: 0, a: 5 },
      { x: 1, a: 5 },
    ];
    const { container } = renderWithTheme(
      <StreamGraph
        data={flatData}
        series={[{ key: "a" }]}
        width={400}
        height={200}
      />
    );
    expect(container.querySelector(".vf-chart-stream")).toBeTruthy();
  });

  it("uses custom curve", () => {
    const { container } = renderWithTheme(
      <StreamGraph
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        curve="step"
        width={400}
        height={200}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area").length).toBe(2);
  });
});
