import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { BubbleMap } from "../BubbleMap";

// Minimal valid TopoJSON: a single square Polygon as one feature.
const topology = {
  type: "Topology",
  arcs: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ],
  objects: {
    shapes: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[0]],
          properties: { id: "A" },
        },
      ],
    },
  },
};

const points = [
  { id: "p1", coordinates: [2, 3] as [number, number], value: 10, label: "Alpha" },
  { id: "p2", coordinates: [5, 5] as [number, number], value: 50 },
  { id: "p3", coordinates: [8, 7] as [number, number], value: 100, color: "#fff" },
];


describe("BubbleMap", () => {
  it("renders a wrapper div with the documented class", () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-bubble-map")).toBeTruthy();
  });

  it("renders an SVG with the documented class", () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-bubble-map__svg")).toBeTruthy();
  });

  it("renders title and description in the header", () => {
    const { getByText } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
        title="Cities"
        description="Bubble sized by population"
      />
    );
    expect(getByText("Cities")).toBeTruthy();
    expect(getByText("Bubble sized by population")).toBeTruthy();
  });

  it("uses the supplied accessibleLabel on the SVG", () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
        accessibleLabel="city map"
      />
    );
    const svg = container.querySelector(".vf-chart-bubble-map__svg");
    expect(svg!.getAttribute("aria-label")).toBe("city map");
  });

  it("renders base paths and bubble circles after the peer loads", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(points.length);
    });
    expect(
      container.querySelectorAll(".vf-chart-bubble-map__base").length
    ).toBeGreaterThan(0);
  });

  it("supports a custom projection without throwing", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        projection="geoEqualEarth"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(points.length);
    });
    expect(container.querySelector(".vf-chart-bubble-map__svg")).toBeTruthy();
  });
});
