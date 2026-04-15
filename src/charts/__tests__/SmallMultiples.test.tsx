import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { SmallMultiples } from "../SmallMultiples";

describe("SmallMultiples", () => {
  it("renders a facet per item with a per-facet label", () => {
    const items = ["A", "B", "C"];
    const { container, getByTestId } = renderWithTheme(
      <SmallMultiples
        items={items}
        renderItem={(s) => <div data-testid={s}>item-{s}</div>}
        facetLabel={(s) => s}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-multiples__facet").length
    ).toBe(3);
    expect(getByTestId("A")).toBeTruthy();
  });
});
