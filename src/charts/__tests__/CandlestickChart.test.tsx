import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CandlestickChart, OHLCChart } from "../CandlestickChart";

const data = [
  { x: "2026-01-01", open: 100, high: 110, low: 95, close: 105 },
  { x: "2026-01-02", open: 105, high: 108, low: 98, close: 100 },
  { x: "2026-01-03", open: 100, high: 102, low: 90, close: 92 },
];

describe("CandlestickChart", () => {
  it("renders one candle body per datum in 'candle' mode", () => {
    const { container } = renderWithTheme(
      <CandlestickChart data={data} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-candle__body").length
    ).toBe(3);
  });

  it("renders ticks instead of bodies in 'ohlc' mode", () => {
    const { container } = renderWithTheme(
      <CandlestickChart
        data={data}
        variant="ohlc"
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-candle__body").length
    ).toBe(0);
    expect(
      container.querySelectorAll(".vf-chart-candle__tick").length
    ).toBe(6); // 2 ticks per datum × 3 data
  });

  it("OHLCChart defaults to ohlc variant", () => {
    const { container } = renderWithTheme(
      <OHLCChart data={data} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-candle__tick").length
    ).toBe(6);
  });

  it("renders wicks for each candle", () => {
    const { container } = renderWithTheme(
      <CandlestickChart data={data} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-candle__wick").length
    ).toBe(3);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <CandlestickChart
        data={data}
        width={400}
        height={240}
        title="AAPL"
        description="Stock price"
      />
    );
    expect(getByText("AAPL")).toBeTruthy();
    expect(getByText("Stock price")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <CandlestickChart data={data} width={400} height={240} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Candlestick chart");
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <CandlestickChart
        data={data}
        width={400}
        height={240}
        className="my-candle"
      />
    );
    expect(
      container
        .querySelector(".vf-chart-candle")!
        .classList.contains("my-candle")
    ).toBe(true);
  });
});
