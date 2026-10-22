// Limit words, true minus, xl size, caption and pending/unavailable states.
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { AudioLevelMeter, formatDb } from "../AudioLevelMeter";

const limits = [
  { at: -3, label: "ACX peak", tone: "red" as const },
  { at: -18, label: "Floor", tone: "amber" as const },
];

describe("formatDb", () => {
  it("uses U+2212 and never a hyphen-minus", () => {
    expect(formatDb(-12.34)).toBe("−12.3");
    expect(formatDb(-Infinity)).toBe("−∞");
    expect(formatDb(0)).toBe("0.0");
    expect(formatDb(-0.04)).toBe("0.0");
    expect(formatDb(3)).toBe("3.0");
    expect(formatDb(-3, 0)).toBe("−3");
  });
});

describe("AudioLevelMeter limits and states", () => {
  it("showScale prints a tick at each limit and the limit words", () => {
    const { container } = renderWithTheme(
      <AudioLevelMeter value={-20} limits={limits} showScale />
    );
    const ticks = Array.from(container.querySelectorAll(".vf-audio-level-meter__tick")).map((t) => t.textContent);
    expect(ticks).toContain("−3");
    expect(ticks).toContain("−18");
    expect(ticks).toContain("−60");
    expect(ticks).toContain("0");
    expect(container.querySelector(".vf-audio-level-meter__tick--limit")).toHaveClass("vf-audio-level-meter__tick--amber");
    const words = Array.from(container.querySelectorAll(".vf-audio-level-meter__limit-label")).map((l) => l.textContent);
    expect(words).toEqual(["ACX peak −3.0", "Floor −18.0"]);
    // A limit past the midpoint hangs to the start side.
    expect(container.querySelectorAll(".vf-audio-level-meter__limit-label")[0]).toHaveClass("vf-audio-level-meter__limit-label--end");
  });

  it("limits are described to assistive tech without hover", () => {
    renderWithTheme(<AudioLevelMeter value={-20} limits={limits} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAccessibleDescription("ACX peak −3.0 dBFS, Floor −18.0 dBFS");
  });

  it("limits[].showLabel prints a word without the scale and can opt one out", () => {
    const { container } = renderWithTheme(
      <AudioLevelMeter
        value={-20}
        limits={[{ at: -3, label: "Peak", showLabel: true }, { at: -18, label: "Floor" }]}
      />
    );
    const words = Array.from(container.querySelectorAll(".vf-audio-level-meter__limit-label")).map((l) => l.textContent);
    expect(words).toEqual(["Peak −3.0"]);
    const { container: c2 } = renderWithTheme(
      <AudioLevelMeter value={-20} showScale limits={[{ at: -3, label: "Peak", showLabel: false }]} />
    );
    expect(c2.querySelector(".vf-audio-level-meter__limit-label")).toBeNull();
  });

  it("caption is rendered and linked by aria-describedby", () => {
    renderWithTheme(
      <AudioLevelMeter value={-6} limits={[{ at: -3, label: "Peak" }]} caption={<>The profile allows −3 dBFS peaks.</>} />
    );
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAccessibleDescription("Peak −3.0 dBFS The profile allows −3 dBFS peaks.");
  });

  it("size xl and valueSize classes", () => {
    const { container } = renderWithTheme(
      <AudioLevelMeter value={-6} size="xl" valueSize="3xl" showValue />
    );
    expect(screen.getByRole("meter")).toHaveClass("vf-audio-level-meter--xl");
    expect(container.querySelector(".vf-audio-level-meter__value")).toHaveClass("vf-audio-level-meter__value--3xl");
  });

  it("pending and unavailable empty the bar and show the state word", () => {
    const { container, rerender } = renderWithTheme(
      <AudioLevelMeter value={-6} state="pending" showValue limits={limits} />
    );
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuetext", "Pending");
    expect(meter).toHaveAttribute("aria-valuenow", "-60");
    expect(meter).toHaveAttribute("data-state", "pending");
    expect(screen.getByRole("meter")).toHaveClass("vf-audio-level-meter--pending");
    expect(screen.getByRole("meter")).not.toHaveClass("vf-audio-level-meter--over-red");
    expect((container.querySelector(".vf-audio-level-meter__fill") as HTMLElement).style.width).toBe("0.00%");
    expect(container.querySelector(".vf-audio-level-meter__value")).toHaveTextContent("Pending");
    rerender(<AudioLevelMeter value={-6} state="unavailable" stateLabel="No input" showValue />);
    expect(meter).toHaveAttribute("aria-valuetext", "No input");
    expect(screen.getByRole("meter")).toHaveClass("vf-audio-level-meter--unavailable");
  });

  it("the readout uses a true minus sign", () => {
    const { container } = renderWithTheme(<AudioLevelMeter value={-12.34} showValue />);
    expect(container.querySelector(".vf-audio-level-meter__value")).toHaveTextContent("−12.3 dBFS");
    expect(container.textContent).not.toMatch(/-\d/);
  });
});
