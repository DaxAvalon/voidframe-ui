import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TileGridMap, US_STATES_GRID } from "../TileGridMap";

describe("TileGridMap", () => {
  it("renders one tile per cell using the US states grid preset", () => {
    const values: Record<string, number> = {
      CA: 100,
      TX: 80,
      NY: 70,
      FL: 60,
    };
    const { container } = renderWithTheme(
      <TileGridMap cells={US_STATES_GRID} values={values} />
    );
    expect(
      container.querySelectorAll(".vf-chart-tile-map__cell").length
    ).toBe(US_STATES_GRID.length);
  });

  it("renders custom cells with labels", () => {
    const cells = [
      { id: "a", col: 0, row: 0 },
      { id: "b", col: 1, row: 0 },
      { id: "c", col: 0, row: 1 },
    ];
    const { container } = renderWithTheme(
      <TileGridMap cells={cells} values={{ a: 1, b: 2, c: 3 }} />
    );
    expect(
      container.querySelectorAll(".vf-chart-tile-map__cell").length
    ).toBe(3);
    expect(
      container.querySelectorAll(".vf-chart-tile-map__label").length
    ).toBe(3);
  });

  it("US_STATES_GRID exposes 51 entries (50 states + DC)", () => {
    expect(US_STATES_GRID.length).toBe(51);
    const ids = new Set(US_STATES_GRID.map((c) => c.id));
    expect(ids.has("CA")).toBe(true);
    expect(ids.has("DC")).toBe(true);
    expect(ids.has("HI")).toBe(true);
    expect(ids.has("AK")).toBe(true);
  });

  it("renders title and description", () => {
    const cells = [{ id: "a", col: 0, row: 0 }];
    const { getByText } = renderWithTheme(
      <TileGridMap
        cells={cells}
        values={{ a: 1 }}
        title="States"
        description="By value"
      />
    );
    expect(getByText("States")).toBeTruthy();
    expect(getByText("By value")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const cells = [{ id: "a", col: 0, row: 0 }];
    const { container } = renderWithTheme(
      <TileGridMap cells={cells} values={{ a: 1 }} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Tile grid map");
  });

  it("applies custom className", () => {
    const cells = [{ id: "a", col: 0, row: 0 }];
    const { container } = renderWithTheme(
      <TileGridMap cells={cells} values={{ a: 1 }} className="my-tiles" />
    );
    expect(
      container.querySelector(".vf-chart-tile-map")!.classList.contains("my-tiles")
    ).toBe(true);
  });
});
