import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { AudioLevelMeter, applyDecay, dbToFraction } from "../AudioLevelMeter";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

// Ballistics are tested through the pure helper; rendering tests use
// decayDbPerSecond={0} so the display equals the input synchronously.
const still = { decayDbPerSecond: 0 };

describe("applyDecay", () => {
  it("rises snap immediately", () => {
    expect(applyDecay(-40, -10, 0.1, 60)).toBe(-10);
  });

  it("falls are limited to rate × dt", () => {
    expect(applyDecay(-10, -40, 0.1, 60)).toBeCloseTo(-16, 5);
  });

  it("never falls below the target", () => {
    expect(applyDecay(-10, -12, 1, 60)).toBe(-12);
  });

  it("rate 0 or dt 0 follows the target", () => {
    expect(applyDecay(-10, -40, 0.1, 0)).toBe(-40);
    expect(applyDecay(-10, -40, 0, 60)).toBe(-40);
  });

  it("falls toward -Infinity without producing NaN", () => {
    expect(applyDecay(-10, -Infinity, 0.5, 60)).toBe(-40);
    expect(applyDecay(-Infinity, -Infinity, 0.5, 60)).toBe(-Infinity);
  });
});

describe("dbToFraction", () => {
  it("maps the scale to 0..1 and clamps", () => {
    expect(dbToFraction(-60, -60, 0)).toBe(0);
    expect(dbToFraction(-30, -60, 0)).toBe(0.5);
    expect(dbToFraction(0, -60, 0)).toBe(1);
    expect(dbToFraction(6, -60, 0)).toBe(1);
    expect(dbToFraction(-90, -60, 0)).toBe(0);
  });

  it("-Infinity and NaN are 0", () => {
    expect(dbToFraction(-Infinity, -60, 0)).toBe(0);
    expect(dbToFraction(Number.NaN, -60, 0)).toBe(0);
  });
});

describe("AudioLevelMeter", () => {
  it("renders silence as an empty bar with -∞ value text", () => {
    const { root } = renderWithTheme(<AudioLevelMeter value={-Infinity} {...still} />);
    expect(root()).toHaveAttribute("role", "meter");
    expect(root()).toHaveAttribute("aria-valuemin", "-60");
    expect(root()).toHaveAttribute("aria-valuemax", "0");
    expect(root()).toHaveAttribute("aria-valuenow", "-60");
    expect(root()).toHaveAttribute("aria-valuetext", "-∞ dBFS");
    const fill = root().querySelector(".vf-audio-level-meter__fill") as HTMLElement;
    expect(fill.style.width).toBe("0.00%");
  });

  it("positions the fill on the dB scale", () => {
    const { root } = renderWithTheme(<AudioLevelMeter value={-30} {...still} />);
    const fill = root().querySelector(".vf-audio-level-meter__fill") as HTMLElement;
    expect(fill.style.width).toBe("50.00%");
    expect(root()).toHaveAttribute("aria-valuenow", "-30");
    expect(root()).toHaveAttribute("aria-valuetext", "-30.0 dBFS");
  });

  it("clamps aria-valuenow to the scale but reports the real value", () => {
    const { root } = renderWithTheme(<AudioLevelMeter value={3} {...still} />);
    expect(root()).toHaveAttribute("aria-valuenow", "0");
    expect(root()).toHaveAttribute("aria-valuetext", "3.0 dBFS");
  });

  it("places limit markers and labels them", () => {
    const { root } = renderWithTheme(
      <AudioLevelMeter value={-20} limits={[{ at: -3, label: "ACX peak", tone: "red" }]} {...still} />
    );
    const limit = root().querySelector(".vf-audio-level-meter__limit--red") as HTMLElement;
    expect(limit.style.left).toBe("95.00%");
    expect(limit.title).toBe("ACX peak (-3.0 dBFS)");
    expect(root().className).not.toContain("over-");
  });

  it("switches tone once the level crosses a limit", () => {
    const limits = [
      { at: -12, tone: "amber" as const },
      { at: -3, tone: "red" as const },
    ];
    const amber = renderWithTheme(<AudioLevelMeter value={-8} limits={limits} {...still} />);
    expect(amber.root().className).toContain("vf-audio-level-meter--over-amber");
    amber.unmount();
    const red = renderWithTheme(<AudioLevelMeter value={-1} limits={limits} {...still} />);
    expect(red.root().className).toContain("vf-audio-level-meter--over-red");
  });

  it("shows the hold marker only when given a finite hold", () => {
    const withHold = renderWithTheme(<AudioLevelMeter value={-30} hold={-6} {...still} />);
    const hold = withHold.root().querySelector(".vf-audio-level-meter__hold") as HTMLElement;
    expect(hold.style.left).toBe("90.00%");
    withHold.unmount();
    const noHold = renderWithTheme(<AudioLevelMeter value={-30} hold={null} {...still} />);
    expect(noHold.root().querySelector(".vf-audio-level-meter__hold")).toBeNull();
    noHold.unmount();
    const infHold = renderWithTheme(<AudioLevelMeter value={-30} hold={-Infinity} {...still} />);
    expect(infHold.root().querySelector(".vf-audio-level-meter__hold")).toBeNull();
  });

  it("renders one track per channel and reports the loudest", () => {
    const { root } = renderWithTheme(<AudioLevelMeter channels={[-20, -6]} {...still} />);
    expect(root().querySelectorAll(".vf-audio-level-meter__track")).toHaveLength(2);
    expect(root()).toHaveAttribute("aria-valuenow", "-6");
  });

  it("vertical orientation positions along the height", () => {
    const { root } = renderWithTheme(
      <AudioLevelMeter value={-30} orientation="vertical" limits={[{ at: -3 }]} {...still} />
    );
    const fill = root().querySelector(".vf-audio-level-meter__fill") as HTMLElement;
    expect(fill.style.height).toBe("50.00%");
    const limit = root().querySelector(".vf-audio-level-meter__limit") as HTMLElement;
    expect(limit.style.bottom).toBe("95.00%");
  });

  it("shows a 10 dB scale and a readout on request", () => {
    renderWithTheme(<AudioLevelMeter value={-30} showScale showValue unit="LUFS" {...still} />);
    expect(screen.getByText("-60")).toBeInTheDocument();
    expect(screen.getByText("-30")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("-30.0 LUFS")).toBeInTheDocument();
  });

  it("honours a custom formatter and label", () => {
    const { root } = renderWithTheme(
      <AudioLevelMeter value={-23.456} label="Integrated" formatValue={(db) => `${db.toFixed(0)} LU`} {...still} />
    );
    expect(root()).toHaveAttribute("aria-label", "Integrated");
    expect(root()).toHaveAttribute("aria-valuetext", "-23 LU");
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(<AudioLevelMeter value={-20} size={size} {...still} />);
    expect(root().className).toContain(`vf-audio-level-meter--${size}`);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <AudioLevelMeter
        value={-14}
        hold={-6}
        showScale
        showValue
        limits={[{ at: -3, label: "ACX peak" }]}
        {...still}
      />
    );
    await expectNoA11yViolations(container);
  });
});
