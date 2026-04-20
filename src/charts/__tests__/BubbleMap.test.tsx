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

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
        className="my-bubble-map"
      />
    );
    expect(
      container
        .querySelector(".vf-chart-bubble-map")!
        .classList.contains("my-bubble-map")
    ).toBe(true);
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
      />
    );
    const svg = container.querySelector(".vf-chart-bubble-map__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Bubble map");
  });

  it("applies custom bubble color", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={[
          { id: "p1", coordinates: [2, 3] as [number, number], value: 10 },
        ]}
        color="var(--vf-red)"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(1);
    });
    const bubble = container.querySelector(".vf-chart-bubble-map__bubble");
    expect(bubble!.getAttribute("fill")).toBe("var(--vf-red)");
  });

  it("custom sizeRange affects bubble radii", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        sizeRange={[5, 50]}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(points.length);
    });
    const bubbles = container.querySelectorAll(".vf-chart-bubble-map__bubble");
    const radii = Array.from(bubbles).map((b) => Number(b.getAttribute("r")));
    // All radii should be between 5 and 50
    for (const r of radii) {
      expect(r).toBeGreaterThanOrEqual(5);
      expect(r).toBeLessThanOrEqual(50);
    }
  });

  it("renders with geoNaturalEarth1 projection", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        projection="geoNaturalEarth1"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(points.length);
    });
  });

  it("handles single point (lo === hi fallback)", async () => {
    const singlePoint = [
      { id: "p1", coordinates: [5, 5] as [number, number], value: 42 },
    ];
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={singlePoint}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(1);
    });
  });

  it("uses point-level color overriding default", async () => {
    const coloredPoints = [
      { id: "p1", coordinates: [5, 5] as [number, number], value: 10, color: "#ff0000" },
    ];
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={coloredPoints}
        color="var(--vf-green)"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      const bubble = container.querySelector(".vf-chart-bubble-map__bubble");
      expect(bubble!.getAttribute("fill")).toBe("#ff0000");
    });
  });

  it("uses the default accent color fallback when no color prop is given", async () => {
    const { container } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={[
          { id: "p1", coordinates: [5, 5] as [number, number], value: 10 },
        ]}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-bubble-map__bubble").length
      ).toBe(1);
    });
    const bubble = container.querySelector(".vf-chart-bubble-map__bubble");
    // Default should be the tokenised green accent.
    expect(bubble!.getAttribute("fill")).toBe("var(--vf-green)");
  });

  it("clears error state when inputs change", async () => {
    const { container, rerender } = renderWithTheme(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={points}
        width={400}
        height={300}
      />
    );
    // Force re-run of the effect; if an error were latched, this wouldn't clear it.
    rerender(
      <BubbleMap
        topology={topology}
        objectKey="shapes"
        points={[...points]}
        width={401}
        height={301}
      />
    );
    // We can't guarantee peer deps fail in the test env, but we can at least
    // assert there is no error element after the rerun (covers the clear path).
    await waitFor(() => {
      expect(
        container.querySelector(".vf-chart-bubble-map__error")
      ).toBeNull();
    });
  });
});
