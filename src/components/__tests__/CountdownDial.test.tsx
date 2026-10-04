import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { CountdownDial, countdownFraction, formatSeconds } from "../CountdownDial";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const C = 2 * Math.PI * 45;

describe("countdownFraction", () => {
  it("maps remaining over total to 0..1 and clamps", () => {
    expect(countdownFraction(10, 10)).toBe(1);
    expect(countdownFraction(5, 10)).toBe(0.5);
    expect(countdownFraction(0, 10)).toBe(0);
    expect(countdownFraction(12, 10)).toBe(1);
    expect(countdownFraction(-1, 10)).toBe(0);
  });
  it("is 0 without a positive total or with non-finite input", () => {
    expect(countdownFraction(3, 0)).toBe(0);
    expect(countdownFraction(NaN, 10)).toBe(0);
    expect(countdownFraction(3, Infinity)).toBe(0);
  });
});

describe("formatSeconds", () => {
  it("rounds up so the last second reads 1, and never goes negative", () => {
    expect(formatSeconds(10)).toBe("10");
    expect(formatSeconds(0.2)).toBe("1");
    expect(formatSeconds(0)).toBe("0");
    expect(formatSeconds(-3)).toBe("0");
    expect(formatSeconds(NaN)).toBe("0");
  });
});

describe("CountdownDial", () => {
  it("is a timer that is not live, named with the label and the seconds", () => {
    renderWithTheme(<CountdownDial total={30} remaining={12.4} label="Stay quiet" />);
    const t = screen.getByRole("timer", { name: "Stay quiet: 13 seconds" });
    expect(t).toHaveAttribute("aria-live", "off");
    expect(t).toHaveAttribute("data-remaining", "13");
    expect(t.querySelector(".vf-countdown-dial__value")).toHaveTextContent("13");
    expect(t.querySelector(".vf-countdown-dial__label")).toHaveTextContent("Stay quiet");
  });

  it("draws the ring with the remaining fraction", () => {
    renderWithTheme(<CountdownDial total={10} remaining={5} data-testid="c" />);
    const fill = screen.getByTestId("c").querySelector("circle.vf-countdown-dial__fill")!;
    expect(fill).toHaveAttribute("stroke-dasharray", String(C));
    expect(Number(fill.getAttribute("stroke-dashoffset"))).toBeCloseTo(C * 0.5, 6);
    expect(screen.getByTestId("c")).toHaveClass("vf-countdown-dial--ring");
  });

  it("draws the bar with the remaining fraction", () => {
    renderWithTheme(<CountdownDial total={10} remaining={2.5} variant="bar" data-testid="c" />);
    const c = screen.getByTestId("c");
    expect(c).toHaveClass("vf-countdown-dial--bar");
    expect((c.querySelector(".vf-countdown-dial__bar .vf-countdown-dial__fill") as HTMLElement).style.width).toBe("25%");
    expect(c.querySelector("svg")).toBeNull();
  });

  it("keeps the visuals out of the accessibility tree", () => {
    renderWithTheme(<CountdownDial total={10} remaining={4} label="Rolling" data-testid="c" />);
    const c = screen.getByTestId("c");
    expect(c.querySelector(".vf-countdown-dial__ring")).toHaveAttribute("aria-hidden", "true");
    expect(c.querySelector(".vf-countdown-dial__label")).toHaveAttribute("aria-hidden", "true");
    expect(c).toHaveAccessibleName("Rolling: 4 seconds");
  });

  it("honours size, tone and a custom format", () => {
    renderWithTheme(<CountdownDial total={60} remaining={59.2} size="xl" tone="warning" format={(s) => `${s.toFixed(1)}s`} data-testid="c" />);
    const c = screen.getByTestId("c");
    expect(c).toHaveClass("vf-countdown-dial--xl");
    expect(c).toHaveClass("vf-countdown-dial--warning");
    expect(c.querySelector(".vf-countdown-dial__value")).toHaveTextContent("59.2s");
    expect(c).toHaveAccessibleName("59.2s seconds");
  });

  it("shows 0 and an empty ring at or past the end", () => {
    renderWithTheme(<CountdownDial total={10} remaining={-2} data-testid="c" />);
    const fill = screen.getByTestId("c").querySelector("circle.vf-countdown-dial__fill")!;
    expect(Number(fill.getAttribute("stroke-dashoffset"))).toBeCloseTo(C, 6);
    expect(screen.getByTestId("c")).toHaveAttribute("data-remaining", "0");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <div>
        <CountdownDial total={30} remaining={12} label="Stay quiet" size="xl" />
        <CountdownDial total={5} remaining={2.5} variant="bar" label="Rolling" tone="warning" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
