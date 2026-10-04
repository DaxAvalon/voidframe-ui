import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { StatusStrip, toneWord, type StatusSegment } from "../StatusStrip";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const SEGMENTS: StatusSegment[] = [
  { id: "device", value: "Scarlett 2i2" },
  { id: "format", label: "format", value: "44.1 kHz / 128" },
  { id: "latency", label: "latency", value: "6.2 ms", tone: "success", title: "Measured round trip" },
  { id: "dropouts", label: "dropouts", value: "1", tone: "danger" },
  { id: "saved", label: "saved", value: "20 s ago", tone: "info" },
];

describe("toneWord", () => {
  it("names every non-neutral tone and nothing for neutral", () => {
    expect(["neutral", "success", "warning", "danger", "info"].map((t) => toneWord(t as never))).toEqual(["", "ok", "warning", "alert", "info"]);
    expect(toneWord(undefined)).toBe("");
  });
});

describe("StatusStrip", () => {
  it("renders a named list with one item per segment", () => {
    renderWithTheme(<StatusStrip segments={SEGMENTS} />);
    const list = screen.getByRole("list", { name: "Status" });
    expect(list.querySelectorAll("li")).toHaveLength(5);
    expect(list.querySelector('[data-segment="format"] .vf-status-strip__label')).toHaveTextContent("format");
    expect(list.querySelector('[data-segment="format"] .vf-status-strip__value')).toHaveTextContent("44.1 kHz / 128");
    expect(list.querySelector('[data-segment="device"] .vf-status-strip__label')).toBeNull();
  });

  it("adds a hidden tone word for non-neutral segments only", () => {
    renderWithTheme(<StatusStrip segments={SEGMENTS} />);
    const list = screen.getByRole("list");
    expect(list.querySelector('[data-segment="latency"]')).toHaveAttribute("data-tone", "success");
    expect(list.querySelector('[data-segment="latency"]')).toHaveTextContent("latency6.2 ms, ok");
    expect(list.querySelector('[data-segment="dropouts"]')).toHaveTextContent("alert");
    expect(list.querySelector('[data-segment="device"]')).toHaveAttribute("data-tone", "neutral");
    expect(list.querySelector('[data-segment="device"]')?.textContent).toBe("Scarlett 2i2");
  });

  it("passes titles, label, size, wrap and the separator", () => {
    renderWithTheme(<StatusStrip segments={SEGMENTS} label="Engine" size="lg" wrap separator="|" data-testid="s" />);
    const list = screen.getByRole("list", { name: "Engine" });
    expect(list).toHaveClass("vf-status-strip--lg");
    expect(list).toHaveClass("vf-status-strip--wrap");
    expect(list.querySelector('[data-segment="latency"]')).toHaveAttribute("title", "Measured round trip");
    expect((list as HTMLElement).style.getPropertyValue("--vf-status-strip-separator")).toBe('"|"');
  });

  it("defaults to one line and the middle dot", () => {
    renderWithTheme(<StatusStrip segments={SEGMENTS} />);
    const list = screen.getByRole("list");
    expect(list).not.toHaveClass("vf-status-strip--wrap");
    expect((list as HTMLElement).style.getPropertyValue("--vf-status-strip-separator")).toBe('"·"');
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<StatusStrip segments={SEGMENTS} size="lg" />);
    await expectNoA11yViolations(container);
  });
});
