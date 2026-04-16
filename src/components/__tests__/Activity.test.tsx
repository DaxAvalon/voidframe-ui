import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Activity } from "../Activity";

describe("Activity", () => {
  it("renders with feed role and label", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" action="created" target="Project X" />
      </Activity>
    );
    expect(screen.getByRole("feed", { name: "Activity feed" })).toBeInTheDocument();
  });

  it("renders actor, action, and target", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Bob" action="merged" target="PR #42" />
      </Activity>
    );
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("merged")).toBeInTheDocument();
    expect(screen.getByText("PR #42")).toBeInTheDocument();
  });

  it("renders avatar", () => {
    const { container } = renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" avatar={<img src="avatar.jpg" alt="" />} />
      </Activity>
    );
    expect(container.querySelector(".vf-activity__avatar")).toBeInTheDocument();
  });

  it("renders preview slot", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" preview={<p>Preview content</p>} />
      </Activity>
    );
    expect(screen.getByText("Preview content")).toBeInTheDocument();
  });

  it("renders relative time by default", () => {
    const recentTime = new Date(Date.now() - 120000);
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={recentTime} />
      </Activity>
    );
    expect(screen.getByText(/2m ago/)).toBeInTheDocument();
  });

  it("renders absolute time when absoluteTime=true", () => {
    const date = new Date("2026-01-15T10:30:00Z");
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={date} absoluteTime />
      </Activity>
    );
    const timeEl = document.querySelector(".vf-activity__time");
    expect(timeEl).toBeInTheDocument();
    // Should use toLocaleString instead of relative
    expect(timeEl?.textContent).not.toMatch(/ago$/);
  });

  it("applies tone class", () => {
    const { container } = renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" tone="danger" />
      </Activity>
    );
    expect(container.querySelector(".vf-activity__item--danger")).toBeInTheDocument();
  });

  it("renders multiple items", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" action="created" />
        <Activity.Item actor="Bob" action="deleted" />
        <Activity.Item actor="Carol" action="updated" />
      </Activity>
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("renders seconds-ago time format", () => {
    const justNow = new Date(Date.now() - 30000); // 30 seconds ago
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={justNow} />
      </Activity>
    );
    expect(screen.getByText(/30s ago/)).toBeInTheDocument();
  });

  it("renders hours-ago time format", () => {
    const hoursAgo = new Date(Date.now() - 3600000 * 3); // 3 hours ago
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={hoursAgo} />
      </Activity>
    );
    expect(screen.getByText(/3h ago/)).toBeInTheDocument();
  });

  it("renders days-ago time format", () => {
    const daysAgo = new Date(Date.now() - 86400000 * 5); // 5 days ago
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={daysAgo} />
      </Activity>
    );
    expect(screen.getByText(/5d ago/)).toBeInTheDocument();
  });

  it("renders date string for times over 30 days", () => {
    const longAgo = new Date(Date.now() - 86400000 * 60); // 60 days ago
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={longAgo} />
      </Activity>
    );
    const timeEl = document.querySelector(".vf-activity__time");
    expect(timeEl).toBeInTheDocument();
    // Should not show "ago" - uses toLocaleDateString
    expect(timeEl?.textContent).not.toMatch(/ago$/);
  });

  it("renders time from string ISO format", () => {
    const isoTime = new Date(Date.now() - 120000).toISOString();
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={isoTime} />
      </Activity>
    );
    expect(screen.getByText(/2m ago/)).toBeInTheDocument();
  });

  it("renders absolute time as string for string time prop", () => {
    const isoStr = "2026-01-15T10:30:00Z";
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={isoStr} absoluteTime />
      </Activity>
    );
    const timeEl = document.querySelector(".vf-activity__time");
    // String time + absoluteTime → just renders the string
    expect(timeEl?.textContent).toBe(isoStr);
  });

  it("applies all tone classes", () => {
    const tones = ["neutral", "success", "warning", "danger", "info"] as const;
    const { container } = renderWithTheme(
      <Activity>
        {tones.map((tone) => (
          <Activity.Item key={tone} actor={tone} tone={tone} />
        ))}
      </Activity>
    );
    for (const tone of tones) {
      expect(
        container.querySelector(`.vf-activity__item--${tone}`)
      ).toBeInTheDocument();
    }
  });

  it("renders preview content slot", () => {
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" preview={<div>Preview data</div>} />
      </Activity>
    );
    const preview = document.querySelector(".vf-activity__preview");
    expect(preview).toBeInTheDocument();
    expect(screen.getByText("Preview data")).toBeInTheDocument();
  });

  it("sets datetime attribute on time element", () => {
    const date = new Date("2026-03-15T12:00:00Z");
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Alice" time={date} />
      </Activity>
    );
    const timeEl = document.querySelector(".vf-activity__time");
    expect(timeEl?.getAttribute("datetime")).toBe(date.toISOString());
  });
});
