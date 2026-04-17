// Coverage tests for LogViewer.tsx — pause/resume buffering, regex filter,
// highlight rendering, timestamp formats, Terminal history navigation.
//
// Targets uncovered lines: 75-94 (pause/buffer), 116-117 (filterText fallback
// when regex invalid), 133-146 (renderMessage highlight), 204 (Date timestamp),
// 213 (source), 277-293 (Terminal history navigation), 310-319 (Terminal ArrowDown).

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { LogViewer, Terminal, type LogEntry } from "../Viewers/LogViewer";

describe("LogViewer pause/resume buffering", () => {
  it("buffers new entries while paused and flushes on resume", async () => {
    const entries1: LogEntry[] = [
      { message: "line 1" },
      { message: "line 2" },
    ];
    const { rerender } = renderWithTheme(
      <LogViewer entries={entries1} />
    );

    // Pause
    const pauseBtn = screen.getByText("\u23F8 Pause");
    await userEvent.click(pauseBtn);
    expect(screen.getByText(/Resume/)).toBeInTheDocument();

    // Add new entries while paused
    const entries2 = [...entries1, { message: "line 3" }, { message: "line 4" }];
    rerender(<LogViewer entries={entries2} />);

    // New entries should NOT appear while paused
    expect(screen.queryByText("line 3")).not.toBeInTheDocument();

    // Resume — buffered entries flush
    const resumeBtn = screen.getByText(/Resume/);
    await userEvent.click(resumeBtn);

    expect(screen.getByText("line 3")).toBeInTheDocument();
    expect(screen.getByText("line 4")).toBeInTheDocument();
  });

  it("shows buffered count on pause button after re-render", async () => {
    const entries1: LogEntry[] = [{ message: "a" }];
    const { rerender } = renderWithTheme(
      <LogViewer entries={entries1} />
    );

    await userEvent.click(screen.getByText("\u23F8 Pause"));

    const entries2 = [...entries1, { message: "b" }, { message: "c" }];
    rerender(<LogViewer entries={entries2} />);

    // The buffer is filled in an effect, so we need another render cycle
    // to reflect it in the button text. Trigger it by updating entries again.
    const entries3 = [...entries2, { message: "d" }];
    rerender(<LogViewer entries={entries3} />);

    // Button should show count of buffered entries
    const btn = screen.getByText(/Resume/);
    expect(btn.textContent).toContain("(");
  });
});

describe("LogViewer filter regex", () => {
  it("filters by regex pattern", async () => {
    const entries: LogEntry[] = [
      { message: "error: something failed" },
      { message: "info: all good" },
      { message: "error: another failure" },
    ];
    renderWithTheme(<LogViewer entries={entries} />);

    const filterInput = screen.getByPlaceholderText("Filter (regex)...");
    await userEvent.type(filterInput, "error:");

    expect(screen.getByText("error: something failed")).toBeInTheDocument();
    expect(screen.queryByText("info: all good")).not.toBeInTheDocument();
  });

  it("falls back to string.includes when regex is invalid", async () => {
    const entries: LogEntry[] = [
      { message: "test[abc" },
      { message: "other" },
    ];
    renderWithTheme(<LogViewer entries={entries} />);

    const filterInput = screen.getByPlaceholderText("Filter (regex)...");
    // Invalid regex: unclosed bracket — use fireEvent to avoid userEvent
    // parsing the brackets as special key syntax
    fireEvent.change(filterInput, { target: { value: "test[abc" } });

    // Should still match via string includes
    expect(screen.getByText("test[abc")).toBeInTheDocument();
    expect(screen.queryByText("other")).not.toBeInTheDocument();
  });
});

describe("LogViewer highlight", () => {
  it("wraps matching text in <mark> elements", () => {
    const entries: LogEntry[] = [
      { message: "foo bar baz bar" },
    ];
    const { container } = renderWithTheme(
      <LogViewer entries={entries} highlight={/bar/} />
    );
    const marks = container.querySelectorAll(".vf-log-viewer__mark");
    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe("bar");
  });

  it("renders unmatched portions as plain text", () => {
    const entries: LogEntry[] = [
      { message: "hello world" },
    ];
    renderWithTheme(
      <LogViewer entries={entries} highlight={/world/} />
    );
    expect(screen.getByText("hello")).toBeTruthy();
  });
});

describe("LogViewer timestamp formats", () => {
  it("renders Date objects as ISO strings", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const entries: LogEntry[] = [
      { message: "test", timestamp: date },
    ];
    renderWithTheme(<LogViewer entries={entries} />);
    expect(screen.getByText(date.toISOString())).toBeInTheDocument();
  });

  it("renders string timestamps directly", () => {
    const entries: LogEntry[] = [
      { message: "test", timestamp: "2024-01-15 10:30" },
    ];
    renderWithTheme(<LogViewer entries={entries} />);
    expect(screen.getByText("2024-01-15 10:30")).toBeInTheDocument();
  });
});

describe("LogViewer source field", () => {
  it("renders source in brackets", () => {
    const entries: LogEntry[] = [
      { message: "test", source: "api-server" },
    ];
    renderWithTheme(<LogViewer entries={entries} />);
    expect(screen.getByText("[api-server]")).toBeInTheDocument();
  });
});

describe("Terminal history navigation", () => {
  it("navigates history with ArrowUp and ArrowDown", async () => {
    const onCommand = vi.fn();
    renderWithTheme(<Terminal onCommand={onCommand} />);
    const input = screen.getByRole("textbox", { name: "Terminal input" });

    // Submit two commands
    await userEvent.type(input, "first");
    fireEvent.keyDown(input, { key: "Enter" });
    await userEvent.type(input, "second");
    fireEvent.keyDown(input, { key: "Enter" });

    // ArrowUp brings back "second"
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("second");

    // ArrowUp again brings back "first"
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("first");

    // ArrowDown goes forward to "second"
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("second");

    // ArrowDown past the end clears input
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("");
  });

  it("ArrowUp does nothing with no history", () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByRole("textbox", { name: "Terminal input" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("");
  });

  it("ArrowDown does nothing when not navigating history", () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByRole("textbox", { name: "Terminal input" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveValue("");
  });

  it("submits command via form submit", async () => {
    const onCommand = vi.fn();
    renderWithTheme(<Terminal onCommand={onCommand} />);
    const input = screen.getByRole("textbox", { name: "Terminal input" });
    await userEvent.type(input, "hello");
    // Submit via the form
    const form = input.closest("form")!;
    fireEvent.submit(form);
    expect(onCommand).toHaveBeenCalledWith("hello");
  });

  it("does not call onCommand for empty input", () => {
    const onCommand = vi.fn();
    renderWithTheme(<Terminal onCommand={onCommand} />);
    const input = screen.getByRole("textbox", { name: "Terminal input" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommand).not.toHaveBeenCalled();
  });
});
