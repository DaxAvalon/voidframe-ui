import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Histogram } from "../Histogram";

describe("Histogram", () => {
  it("renders at least one bar for a uniform sample", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { container } = renderWithTheme(
      <Histogram values={values} bins={10} width={400} height={200} />
    );
    const bars = container.querySelectorAll(".vf-chart-bar__rect");
    expect(bars.length).toBeGreaterThan(0);
  });

  it("renders an SVG with role=img", () => {
    const { container } = renderWithTheme(
      <Histogram
        values={[1, 2, 3, 4, 5]}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector("svg[role='img']")).toBeTruthy();
  });

  it("renders the expected number of bins", () => {
    const values = Array.from({ length: 100 }, () => Math.random() * 100);
    const { container } = renderWithTheme(
      <Histogram values={values} bins={5} width={400} height={200} />
    );
    const bars = container.querySelectorAll(".vf-chart-bar__rect");
    expect(bars.length).toBe(5);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <Histogram
        values={[1, 2, 3]}
        width={300}
        height={200}
        title="Ages"
        description="Distribution"
      />
    );
    expect(getByText("Ages")).toBeTruthy();
    expect(getByText("Distribution")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <Histogram values={[1, 2, 3]} width={300} height={200} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Histogram");
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Histogram values={[1, 2, 3]} width={300} height={200} className="my-hist" />
    );
    expect(
      container.querySelector(".vf-chart-histogram")!.classList.contains("my-hist")
    ).toBe(true);
  });
});
