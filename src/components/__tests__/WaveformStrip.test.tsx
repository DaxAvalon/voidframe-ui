import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { WaveformStrip, bucketTiles, formatTimecode, rulerTicks, timeToX, xToTime, type WaveformTile } from "../WaveformStrip";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const TILES: WaveformTile[] = [
  { start: 0, end: 5, min: [-0.2, -0.4, -0.6, -0.8, -1], max: [0.2, 0.4, 0.6, 0.8, 1] },
  { start: 5, end: 10, min: [-0.5, -0.5, -0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5, 0.5, 0.5] },
];
const SEGMENTS = [
  { id: "t1", start: 0, end: 6, label: "Take 1" },
  { id: "t1h", start: 4, end: 6, hidden: true, label: "replaced" },
  { id: "t2", start: 6, end: 10, label: "Take 2" },
];
const MARKERS = [
  { id: "m1", at: 2, kind: "marker" as const, label: "Come back" },
  { id: "f1", at: 7, kind: "flag" as const },
  { id: "p1", at: 9, kind: "peak" as const, label: "-1.8 dBFS" },
];

describe("geometry helpers", () => {
  it("maps time to x and back, clamped", () => {
    expect(timeToX(5, 10, 600)).toBe(300);
    expect(timeToX(12, 10, 600)).toBe(600);
    expect(timeToX(-1, 10, 600)).toBe(0);
    expect(xToTime(300, 10, 600)).toBe(5);
    expect(xToTime(900, 10, 600)).toBe(10);
    expect(timeToX(2, 10, 600, 100)).toBe(200);
    expect(xToTime(0, 0, 600)).toBe(0);
  });
  it("buckets tiles into per-column min and max", () => {
    const { min, max } = bucketTiles(TILES, 0, 10, 10);
    expect(Array.from(max)).toEqual([0.2, 0.4, 0.6, 0.8, 1, 0.5, 0.5, 0.5, 0.5, 0.5].map((v) => Math.fround(v)));
    expect(min[4]).toBe(-1);
    expect(min[7]).toBe(Math.fround(-0.5));
  });
  it("buckets safely with no data or an empty range", () => {
    expect(Array.from(bucketTiles([], 0, 10, 4).max)).toEqual([0, 0, 0, 0]);
    expect(bucketTiles(TILES, 0, 0, 4).max.length).toBe(4);
    expect(bucketTiles(TILES, 0, 10, 0).max.length).toBe(0);
  });
  it("picks ruler steps that keep labels apart", () => {
    expect(rulerTicks(10, 600)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(rulerTicks(600, 600)).toEqual([0, 120, 240, 360, 480, 600]);
    expect(rulerTicks(0, 600)).toEqual([]);
  });
  it("formats timecodes", () => {
    expect(formatTimecode(0)).toBe("0:00");
    expect(formatTimecode(724)).toBe("12:04");
    expect(formatTimecode(3723)).toBe("1:02:03");
  });
});

describe("WaveformStrip", () => {
  it("draws segments, hidden ranges, boundaries, a playhead and a selection at the right x", () => {
    renderWithTheme(
      <WaveformStrip duration={10} width={600} tiles={TILES} segments={SEGMENTS} boundaries={[{ at: 6, crossfadeMs: 500 }]} playhead={2.5} selection={{ start: 1, end: 3 }} data-testid="w" />
    );
    const w = screen.getByTestId("w");
    expect(w.querySelectorAll(".vf-waveform-strip__segment")).toHaveLength(3);
    const hidden = w.querySelector('[data-segment="t1h"]') as HTMLElement;
    expect(hidden).toHaveAttribute("data-hidden", "true");
    expect(hidden.style.left).toBe("240px");
    expect(hidden.style.width).toBe("120px");
    const boundary = w.querySelector(".vf-waveform-strip__boundary") as HTMLElement;
    expect(boundary.style.width).toBe("30px");
    expect(boundary.style.left).toBe("345px");
    expect((w.querySelector(".vf-waveform-strip__playhead") as HTMLElement).style.left).toBe("150px");
    const sel = w.querySelector(".vf-waveform-strip__selection") as HTMLElement;
    expect(sel.style.left).toBe("60px");
    expect(sel.style.width).toBe("120px");
    expect(w.querySelector("path.vf-waveform-strip__envelope")?.getAttribute("d")).toMatch(/^M0 36 L0 /);
  });

  it("renders one lane per marker kind present, with focusable named markers", () => {
    const onMarkerClick = vi.fn();
    renderWithTheme(<WaveformStrip duration={10} width={600} markers={MARKERS} onMarkerClick={onMarkerClick} onSeek={() => {}} data-testid="w" />);
    const w = screen.getByTestId("w");
    expect(w.querySelectorAll(".vf-waveform-strip__lane")).toHaveLength(3);
    expect(w.querySelector('[data-lane="gap"]')).toBeNull();
    const peak = screen.getByRole("button", { name: "Peak: -1.8 dBFS, 0:09" });
    expect((peak as HTMLElement).style.left).toBe("540px");
    fireEvent.click(screen.getByRole("button", { name: "Marker: Come back, 0:02" }));
    expect(onMarkerClick).toHaveBeenCalledWith("m1");
    expect(screen.getByRole("button", { name: "Pickup flag, 0:07" })).toBeInTheDocument();
  });

  it("is a slider when seekable and an image otherwise, with a summary value text", () => {
    const { rerender } = renderWithTheme(<WaveformStrip duration={600} width={600} segments={SEGMENTS} markers={MARKERS} playhead={724 - 600} onSeek={() => {}} label="Chapter 4" />);
    const slider = screen.getByRole("slider", { name: "Chapter 4" });
    expect(slider).toHaveAttribute("aria-valuemax", "600");
    expect(slider).toHaveAttribute("aria-valuenow", "124");
    expect(slider).toHaveAttribute("aria-valuetext", "2:04 of 10:00 · 3 takes (1 replaced) · 3 markers");
    expect(slider).toHaveAttribute("tabindex", "0");
    rerender(<WaveformStrip duration={600} width={600} label="Chapter 4" />);
    expect(screen.getByRole("img", { name: "Chapter 4" })).not.toHaveAttribute("tabindex");
  });

  it("seeks with the keyboard: arrows, shift, home and end, clamped", () => {
    const onSeek = vi.fn();
    renderWithTheme(<WaveformStrip duration={10} width={600} playhead={5} onSeek={onSeek} />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowLeft", shiftKey: true });
    fireEvent.keyDown(slider, { key: "End" });
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onSeek.mock.calls.map((c) => c[0])).toEqual([6, 0, 10, 0]);
  });

  it("click seeks and reports the take under it; drag selects", () => {
    const onSeek = vi.fn();
    const onSelect = vi.fn();
    const onSegmentClick = vi.fn();
    renderWithTheme(<WaveformStrip duration={10} width={600} segments={SEGMENTS} onSeek={onSeek} onSelect={onSelect} onSegmentClick={onSegmentClick} />);
    const slider = screen.getByRole("slider");
    fireEvent.pointerDown(slider, { button: 0, clientX: 300, pointerId: 1 });
    fireEvent.pointerUp(slider, { button: 0, clientX: 300, pointerId: 1 });
    expect(onSeek).toHaveBeenCalledWith(5);
    expect(onSegmentClick).toHaveBeenCalledWith("t1");
    fireEvent.pointerDown(slider, { button: 0, clientX: 120, pointerId: 1 });
    fireEvent.pointerMove(slider, { clientX: 180, pointerId: 1 });
    fireEvent.pointerUp(slider, { button: 0, clientX: 240, pointerId: 1 });
    expect(onSelect).toHaveBeenLastCalledWith({ start: 2, end: 4 });
  });

  it("asks for tiles for the visible range at the current density", () => {
    const onTilesNeeded = vi.fn();
    renderWithTheme(<WaveformStrip duration={10} width={600} onTilesNeeded={onTilesNeeded} />);
    expect(onTilesNeeded).toHaveBeenCalledWith({ start: 0, end: 10 }, 60);
  });

  it("honours zoom by widening the content", () => {
    renderWithTheme(<WaveformStrip duration={10} width={600} zoom={100} data-testid="w" />);
    expect((screen.getByTestId("w").querySelector(".vf-waveform-strip__content") as HTMLElement).style.width).toBe("1000px");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <WaveformStrip duration={10} width={600} tiles={TILES} segments={SEGMENTS} boundaries={[{ at: 6, crossfadeMs: 20 }]} markers={MARKERS} playhead={2.5} selection={{ start: 1, end: 3 }} onSeek={() => {}} onMarkerClick={() => {}} label="Chapter 4" />
    );
    await expectNoA11yViolations(container);
  });
});
