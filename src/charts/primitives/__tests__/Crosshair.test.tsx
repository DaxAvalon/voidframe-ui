import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { ChartFrame } from "../ChartFrame";
import { Crosshair } from "../Crosshair";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <ChartFrame width={400} height={200}>
      {children}
    </ChartFrame>
  );
}

describe("Crosshair", () => {
  it("renders a wrapper g with the documented class when both x and y are set", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={50} y={75} />
      </Frame>
    );
    expect(container.querySelector(".vf-chart-crosshair")).toBeTruthy();
  });

  it("renders the dashed modifier class by default", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={10} y={10} />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair--dashed")
    ).toBeTruthy();
  });

  it("omits the dashed modifier when dashed=false", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={10} y={10} dashed={false} />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair--dashed")
    ).toBeFalsy();
    expect(container.querySelector(".vf-chart-crosshair")).toBeTruthy();
  });

  it("renders both x and y guide lines in mode='both' (default)", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={20} y={30} />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair__line--x")
    ).toBeTruthy();
    expect(
      container.querySelector(".vf-chart-crosshair__line--y")
    ).toBeTruthy();
  });

  it("renders only the x line in mode='x'", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={20} y={30} mode="x" />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair__line--x")
    ).toBeTruthy();
    expect(
      container.querySelector(".vf-chart-crosshair__line--y")
    ).toBeFalsy();
  });

  it("renders only the y line in mode='y'", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={20} y={30} mode="y" />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair__line--y")
    ).toBeTruthy();
    expect(
      container.querySelector(".vf-chart-crosshair__line--x")
    ).toBeFalsy();
  });

  it("renders the crosshair point when both axes + showPoint are set", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={40} y={50} showPoint />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair__point")
    ).toBeTruthy();
  });

  it("does not render the point when showPoint=false", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair x={40} y={50} showPoint={false} />
      </Frame>
    );
    expect(
      container.querySelector(".vf-chart-crosshair__point")
    ).toBeFalsy();
  });

  it("returns null when neither x nor y is provided", () => {
    const { container } = renderWithTheme(
      <Frame>
        <Crosshair />
      </Frame>
    );
    expect(container.querySelector(".vf-chart-crosshair")).toBeFalsy();
  });
});
