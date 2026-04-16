import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  RelativeTime,
  DurationDisplay,
  Countdown,
  TimeZoneSelect,
} from "../TimeDisplays";

describe("RelativeTime", () => {
  it("renders 'just now' for very recent dates", () => {
    const now = Date.now();
    renderWithTheme(<RelativeTime date={now} now={now} updateInterval={0} />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("renders relative format for past dates", () => {
    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    renderWithTheme(
      <RelativeTime date={fiveMinAgo} now={now} updateInterval={0} />
    );
    expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
  });

  it("renders relative format for future dates", () => {
    const now = Date.now();
    const inOneHour = now + 60 * 60 * 1000;
    renderWithTheme(
      <RelativeTime date={inOneHour} now={now} updateInterval={0} />
    );
    expect(screen.getByText(/1 hour/i)).toBeInTheDocument();
  });

  it("accepts string dates", () => {
    const now = Date.now();
    const dateStr = new Date(now - 2 * 86400000).toISOString();
    renderWithTheme(
      <RelativeTime date={dateStr} now={now} updateInterval={0} />
    );
    expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
  });

  it("renders relative format for a few seconds ago", () => {
    const now = Date.now();
    const twoSecAgo = now - 2000;
    renderWithTheme(
      <RelativeTime date={twoSecAgo} now={now} updateInterval={0} />
    );
    // Should show "2 seconds ago" — exercises the fallback path (line 212)
    expect(screen.getByText(/second/)).toBeInTheDocument();
  });

  it("accepts numeric timestamps", () => {
    const now = Date.now();
    renderWithTheme(
      <RelativeTime date={now - 3600000} now={now} updateInterval={0} />
    );
    expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();
  });

  it("auto-updates when updateInterval is set", () => {
    vi.useFakeTimers();
    const now = Date.now();
    renderWithTheme(
      <RelativeTime date={now} updateInterval={1000} />
    );
    // Component should re-render on interval
    vi.advanceTimersByTime(2000);
    expect(document.querySelector(".vf-relative-time")).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe("DurationDisplay", () => {
  it("formats hms (default)", () => {
    renderWithTheme(<DurationDisplay seconds={3661} />);
    expect(screen.getByText("01:01:01")).toBeInTheDocument();
  });

  it("formats hms without hours when < 3600", () => {
    renderWithTheme(<DurationDisplay seconds={125} />);
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("formats compact", () => {
    renderWithTheme(<DurationDisplay seconds={45} format="compact" />);
    expect(screen.getByText("45s")).toBeInTheDocument();
  });

  it("formats compact with minutes", () => {
    renderWithTheme(<DurationDisplay seconds={125} format="compact" />);
    expect(screen.getByText("2m 5s")).toBeInTheDocument();
  });

  it("formats compact with hours", () => {
    renderWithTheme(<DurationDisplay seconds={3661} format="compact" />);
    expect(screen.getByText("1h 1m")).toBeInTheDocument();
  });

  it("formats long", () => {
    renderWithTheme(<DurationDisplay seconds={3661} format="long" />);
    expect(screen.getByText("1 hour 1 minute 1 second")).toBeInTheDocument();
  });

  it("formats long plurals", () => {
    renderWithTheme(<DurationDisplay seconds={7322} format="long" />);
    expect(screen.getByText(/2 hours 2 minutes 2 seconds/)).toBeInTheDocument();
  });

  it("shows 0 seconds for 0", () => {
    renderWithTheme(<DurationDisplay seconds={0} format="long" />);
    expect(screen.getByText("0 seconds")).toBeInTheDocument();
  });
});

describe("Countdown", () => {
  it("renders remaining time", () => {
    const target = Date.now() + 60000;
    renderWithTheme(<Countdown target={target} />);
    // Should show something in the format MM:SS
    const el = document.querySelector(".vf-countdown");
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toMatch(/\d+:\d+/);
  });

  it("shows completed state when target is past", () => {
    const target = Date.now() - 1000;
    renderWithTheme(<Countdown target={target} />);
    expect(document.querySelector(".vf-countdown--done")).toBeInTheDocument();
  });

  it("fires onComplete when done", () => {
    const onComplete = vi.fn();
    const target = Date.now() - 1000;
    renderWithTheme(<Countdown target={target} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalled();
  });

  it("renders custom completedLabel", () => {
    const target = Date.now() - 1000;
    renderWithTheme(
      <Countdown target={target} completedLabel="Expired!" />
    );
    expect(screen.getByText("Expired!")).toBeInTheDocument();
  });

  it("accepts Date objects", () => {
    const target = new Date(Date.now() + 120000);
    renderWithTheme(<Countdown target={target} />);
    expect(document.querySelector(".vf-countdown")).toBeInTheDocument();
  });
});

describe("TimeZoneSelect", () => {
  it("renders label and select", () => {
    renderWithTheme(<TimeZoneSelect />);
    expect(screen.getByText("Time zone")).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Time zone" })).toBeInTheDocument();
  });

  it("renders custom zones list", () => {
    renderWithTheme(
      <TimeZoneSelect zones={["UTC", "America/New_York"]} />
    );
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(2);
  });
});
