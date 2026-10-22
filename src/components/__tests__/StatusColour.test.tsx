// Badge tone × variant, hue on Badge/Tag/Dots/StatusIndicator, Dots total.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Badge, Dots } from "../Badge";
import { Tag } from "../DataExtended";
import { StatusIndicator } from "../Metrics";

const css = (rel: string) => readFileSync(resolve(__dirname, "../../css/components", rel), "utf8");

describe("Badge tone × variant and hue", () => {
  it("emits tone and variant classes for non-solid variants and the muted tone", () => {
    const { container } = renderWithTheme(
      <>
        <Badge tone="danger" variant="outline">a</Badge>
        <Badge tone="muted" variant="subtle">b</Badge>
      </>
    );
    const [a, b] = Array.from(container.querySelectorAll(".vf-badge"));
    expect(a).toHaveClass("vf-badge--danger", "vf-badge--outline");
    expect(a).toHaveAttribute("data-tone", "danger");
    expect(b).toHaveClass("vf-badge--muted", "vf-badge--subtle");
  });

  it("the stylesheet colours outline, ghost and subtle by tone", () => {
    const d = css("data-display.css");
    expect(d).toMatch(/\.vf-badge--danger\.vf-badge--outline,\n\.vf-badge--danger\.vf-badge--ghost,\n\.vf-badge--danger\.vf-badge--subtle \{ color: var\(--vf-danger\); \}/);
    expect(d).toContain(".vf-badge--muted.vf-badge--solid { background: var(--vf-bg-3); color: var(--vf-text-2); }");
    expect(d).toContain(".vf-badge--outline:not(.vf-badge--neutral) { border-color: color-mix(in srgb, currentColor 55%, transparent); }");
  });

  it("hue sets a class and data-hue and wins over tone in CSS order", () => {
    const { container } = renderWithTheme(<Badge hue="purple" tone="danger" variant="subtle">x</Badge>);
    const el = container.querySelector(".vf-badge")!;
    expect(el).toHaveClass("vf-badge--hue-purple");
    expect(el).toHaveAttribute("data-hue", "purple");
    const d = css("data-display.css");
    expect(d).toContain(".vf-badge--hue-purple { --vf-badge-hue: var(--vf-purple); --vf-badge-hue-20: var(--vf-purple-20); }");
    expect(d).toContain(".vf-badge[data-hue].vf-badge--subtle { background: var(--vf-badge-hue-20); color: var(--vf-badge-hue); }");
    expect(d.indexOf(".vf-badge[data-hue].vf-badge--subtle")).toBeGreaterThan(d.indexOf(".vf-badge--danger.vf-badge--subtle"));
  });
});

describe("Tag hue", () => {
  it("adds the hue class and attribute", () => {
    const { container } = renderWithTheme(<Tag hue="cyan">t</Tag>);
    const el = container.querySelector(".vf-tag")!;
    expect(el).toHaveClass("vf-tag--hue-cyan");
    expect(el).toHaveAttribute("data-hue", "cyan");
    expect(css("data-extended.css")).toContain(".vf-tag--hue-cyan { --vf-accent: var(--vf-cyan); background: var(--vf-cyan-20); }");
  });
});

describe("Dots total, label, tone", () => {
  it("draws filled then hollow dots and names itself 'n of m'", () => {
    renderWithTheme(<Dots count={3} total={4} />);
    const img = screen.getByRole("img", { name: "3 of 4" });
    expect(img.querySelectorAll(".vf-dots__dot").length).toBe(4);
    expect(img.querySelectorAll(".vf-dots__dot--hollow").length).toBe(1);
    expect(img.textContent).toBe("●●●○");
    expect(img).toHaveAttribute("data-count", "3");
    expect(img).toHaveAttribute("data-total", "4");
  });

  it("clamps to max, honours an explicit label, and is decorative without one", () => {
    const { container, rerender } = renderWithTheme(<Dots count={2} total={20} max={5} label="Progress" />);
    const img = screen.getByRole("img", { name: "Progress" });
    expect(img.querySelectorAll(".vf-dots__dot").length).toBe(5);
    expect(img.querySelectorAll(".vf-dots__dot--hollow").length).toBe(3);
    rerender(<Dots count={2} />);
    const plain = container.querySelector(".vf-dots")!;
    expect(plain).toHaveAttribute("aria-hidden", "true");
    expect(plain).not.toHaveAttribute("role");
  });

  it("tone and hue classes", () => {
    const { container } = renderWithTheme(<Dots count={1} tone="success" hue="rose" />);
    const el = container.querySelector(".vf-dots")!;
    expect(el).toHaveClass("vf-dots--success", "vf-dots--hue-rose");
    expect(css("badge.css")).toContain(".vf-dots__dot--hollow { color: var(--vf-text-4); }");
  });
});

describe("StatusIndicator tone, hue, pulse", () => {
  it("colours a non-presence state without a status word", () => {
    const { container } = renderWithTheme(<StatusIndicator tone="warning" pulse label="Running" />);
    const el = container.querySelector(".vf-status-indicator")!;
    expect(el).toHaveClass("vf-status-indicator--tone-warning", "vf-status-indicator--pulse");
    expect(el).not.toHaveAttribute("data-status");
    expect(el).toHaveAttribute("aria-label", "Running");
    expect(screen.getByRole("status")).toBe(el);
  });

  it("hue and the presence status still work; aria-label falls back sensibly", () => {
    const { container } = renderWithTheme(
      <>
        <StatusIndicator status="online" />
        <StatusIndicator hue="purple" />
      </>
    );
    const [a, b] = Array.from(container.querySelectorAll(".vf-status-indicator"));
    expect(a).toHaveClass("vf-status-indicator--online");
    expect(a).toHaveAttribute("aria-label", "online");
    expect(b).toHaveClass("vf-status-indicator--hue-purple");
    expect(b).toHaveAttribute("aria-label", "purple");
    const d = css("data-display.css");
    expect(d).toContain(".vf-status-indicator--hue-purple .vf-status-indicator__dot { background: var(--vf-purple); }");
    expect(d).toMatch(/prefers-reduced-motion: reduce\) \{\n  \.vf-status-indicator--pulse/);
  });
});
