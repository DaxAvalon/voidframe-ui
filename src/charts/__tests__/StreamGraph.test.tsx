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
});
