import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ChoroplethMap } from "../ChoroplethMap";

// Minimal valid TopoJSON: two square Polygons so we get one feature
// per region and can verify the values lookup.
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
    [
      [10, 0],
      [20, 0],
      [20, 10],
      [10, 10],
      [10, 0],
    ],
  ],
  objects: {
    regions: {
      type: "GeometryCollection",
      geometries: [
        { type: "Polygon", arcs: [[0]], properties: { id: "A" } },
        { type: "Polygon", arcs: [[1]], properties: { id: "B" } },
      ],
    },
  },
};

describe("ChoroplethMap", () => {
  it("renders a wrapper div with the documented class", () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-choropleth")).toBeTruthy();
  });

  it("renders the SVG with the documented aria-label", () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
        accessibleLabel="state shading"
      />
    );
    const svg = container.querySelector(".vf-chart-choropleth__svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("aria-label")).toBe("state shading");
  });

  it("renders title and description in the frame header", () => {
    const { getByText } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
        title="States"
        description="By value"
      />
    );
    expect(getByText("States")).toBeTruthy();
    expect(getByText("By value")).toBeTruthy();
  });

  it("renders one path per feature after the peer loads", async () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-choropleth__feature").length
      ).toBe(2);
    });
  });

  it("renders a legend by default and hides it with showLegend=false", async () => {
    const withLegend = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        withLegend.container.querySelector(".vf-chart-choropleth__legend")
      ).toBeTruthy();
    });

    const noLegend = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        width={400}
        height={300}
        showLegend={false}
      />
    );
    // Legend block is purely a prop branch — no need to wait on the peer.
    expect(
      noLegend.container.querySelector(".vf-chart-choropleth__legend")
    ).toBeFalsy();
  });

  it("respects a custom color palette in the legend", async () => {
    const colors = ["#111", "#222", "#333"];
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        colors={colors}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      const legend = container.querySelector(".vf-chart-choropleth__legend");
      expect(legend).toBeTruthy();
      expect(
        legend!.querySelectorAll(".vf-chart-legend__item").length
      ).toBe(3);
    });
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5 }}
        width={400}
        height={300}
        className="my-map"
      />
    );
    expect(
      container.querySelector(".vf-chart-choropleth")!.classList.contains("my-map")
    ).toBe(true);
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5 }}
        width={400}
        height={300}
      />
    );
    const svg = container.querySelector(".vf-chart-choropleth__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Choropleth map");
  });

  it("renders features with missing values as 'no data' fill", async () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5 }}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      const features = container.querySelectorAll(".vf-chart-choropleth__feature");
      expect(features.length).toBe(2);
      // B has no value → should use no-data fill
      const bFeature = features[1];
      expect(bFeature!.getAttribute("fill")).toBe("var(--vf-bg-3)");
    });
  });

  it("renders with geoEqualEarth projection", async () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        projection="geoEqualEarth"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-choropleth__feature").length
      ).toBe(2);
    });
  });

  it("renders with geoNaturalEarth1 projection", async () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        projection="geoNaturalEarth1"
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-choropleth__feature").length
      ).toBe(2);
    });
  });

  it("uses custom valueFormat", async () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 10 }}
        valueFormat={(v) => `$${v}`}
        width={400}
        height={300}
      />
    );
    await waitFor(() => {
      expect(
        container.querySelectorAll(".vf-chart-choropleth__feature").length
      ).toBe(2);
    });
  });

  it("legend labels use the valueFormat prop", () => {
    const { container } = renderWithTheme(
      <ChoroplethMap
        topology={topology}
        objectKey="regions"
        featureIdProp="id"
        values={{ A: 5, B: 500 }}
        valueFormat={(v) => `#${v}`}
        width={400}
        height={300}
      />
    );
    const legend = container.querySelector(".vf-chart-choropleth__legend");
    expect(legend?.textContent ?? "").toMatch(/#500/);
  });
});
