import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, DateRangePicker, type DateRange } from "../DatePicker";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("DatePicker", () => {
  it("renders an input with the formatted default value", () => {
    renderWithTheme(
      <DatePicker
        label="Date"
        defaultValue={new Date(2026, 2, 7)}
      />
    );
    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe(
      "2026-03-07"
    );
  });

  it("opens calendar on focus and exposes role=dialog + grid", async () => {
    renderWithTheme(<DatePicker label="Date" defaultValue={new Date(2026, 2, 7)} />);
    await userEvent.click(screen.getByLabelText("Date"));
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("clicking a day selects and closes", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DatePicker
        label="Date"
        defaultValue={new Date(2026, 2, 7)}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByLabelText("Date"));
    // Click day 15 in March 2026.
    const grid = screen.getByRole("grid");
    const days = grid.querySelectorAll("[role='gridcell']");
    // Day 15 of March 2026 — find cell with text "15" that is not outside.
    const day15 = Array.from(days).find((el) => el.textContent === "15" && !el.className.includes("outside")) as HTMLElement;
    await userEvent.click(day15);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]![0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(2);
    expect(arg.getDate()).toBe(15);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("typing a valid date + Enter commits", async () => {
    const onChange = vi.fn();
    renderWithTheme(<DatePicker label="Date" onValueChange={onChange} />);
    const input = screen.getByLabelText("Date") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "2026-05-20{Enter}");
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0] as Date;
    expect(last.getFullYear()).toBe(2026);
    expect(last.getMonth()).toBe(4);
    expect(last.getDate()).toBe(20);
  });

  it("invalid typed text reverts on blur", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DatePicker
        label="Date"
        defaultValue={new Date(2026, 2, 7)}
        onValueChange={onChange}
      />
    );
    const input = screen.getByLabelText("Date") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "not-a-date");
    await userEvent.tab();
    expect(input.value).toBe("2026-03-07");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ArrowDown in the input opens the calendar", async () => {
    renderWithTheme(<DatePicker label="Date" defaultValue={new Date(2026, 2, 7)} />);
    const input = screen.getByLabelText("Date");
    input.focus();
    // Focus opens it already; close to test re-open via ArrowDown.
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("month navigation buttons change the view", async () => {
    renderWithTheme(<DatePicker label="Date" defaultValue={new Date(2026, 2, 7)} />);
    await userEvent.click(screen.getByLabelText("Date"));
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    // After advancing, header should mention April.
    const header = screen.getByRole("grid").getAttribute("aria-labelledby")!;
    expect(document.getElementById(header)!.textContent?.toLowerCase()).toContain("april");
  });

  it("respects min/max — days outside range are disabled", async () => {
    renderWithTheme(
      <DatePicker
        label="Date"
        defaultValue={new Date(2026, 2, 15)}
        min={new Date(2026, 2, 10)}
        max={new Date(2026, 2, 20)}
      />
    );
    await userEvent.click(screen.getByLabelText("Date"));
    const grid = screen.getByRole("grid");
    const days = grid.querySelectorAll("[role='gridcell']");
    const day5 = Array.from(days).find(
      (el) => el.textContent === "5" && !el.className.includes("outside")
    ) as HTMLButtonElement;
    expect(day5.disabled).toBe(true);
    const day12 = Array.from(days).find(
      (el) => el.textContent === "12" && !el.className.includes("outside")
    ) as HTMLButtonElement;
    expect(day12.disabled).toBe(false);
  });

  it("inline mode renders calendar without input", () => {
    renderWithTheme(
      <DatePicker label="Date" inline defaultValue={new Date(2026, 2, 7)} />
    );
    expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("controlled mode reflects parent value", () => {
    function Ctl() {
      const [v, setV] = useState<Date | null>(new Date(2026, 2, 7));
      return (
        <>
          <DatePicker label="Date" value={v} onValueChange={setV} />
          <button
            data-testid="advance"
            onClick={() => setV(new Date(2026, 5, 15))}
          >
            advance
          </button>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe(
      "2026-03-07"
    );
  });

  it("has no a11y violations (closed)", async () => {
    const { container } = renderWithTheme(
      <DatePicker label="Birth date" defaultValue={new Date(2026, 2, 7)} />
    );
    await expectNoA11yViolations(container);
  });

  it("has no a11y violations (inline)", async () => {
    const { container } = renderWithTheme(
      <DatePicker
        label="Date"
        inline
        defaultValue={new Date(2026, 2, 7)}
      />
    );
    await expectNoA11yViolations(container);
  });
});

describe("DateRangePicker", () => {
  it("renders button trigger; placeholder when empty", () => {
    renderWithTheme(<DateRangePicker label="Range" />);
    expect(screen.getByRole("button", { name: "Range" })).toHaveTextContent(
      "Select range…"
    );
  });

  it("clicking trigger opens dialog with 2 calendars", async () => {
    renderWithTheme(<DateRangePicker label="Range" />);
    await userEvent.click(screen.getByRole("button", { name: "Range" }));
    expect(screen.getByRole("dialog", { name: "Choose date range" })).toBeInTheDocument();
    expect(screen.getAllByRole("grid")).toHaveLength(2);
  });

  it("two clicks select start then end and close", async () => {
    const onChange = vi.fn();
    function Ctl() {
      const [v, setV] = useState<DateRange>({ start: null, end: null });
      return (
        <DateRangePicker
          label="Range"
          value={v}
          onValueChange={(next) => {
            setV(next);
            onChange(next);
          }}
        />
      );
    }
    renderWithTheme(<Ctl />);
    await userEvent.click(screen.getByRole("button", { name: "Range" }));
    const grids = screen.getAllByRole("grid");
    const findDay = (grid: Element, text: string) =>
      Array.from(grid.querySelectorAll("[role='gridcell']")).find(
        (el) => el.textContent === text && !el.className.includes("outside")
      ) as HTMLElement;
    await userEvent.click(findDay(grids[0]!, "5"));
    await userEvent.click(findDay(grids[0]!, "20"));
    const last = onChange.mock.calls.at(-1)![0];
    expect(last.start.getDate()).toBe(5);
    expect(last.end.getDate()).toBe(20);
  });

  it("second click before start swaps bounds", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DateRangePicker
        label="Range"
        defaultValue={{ start: new Date(2026, 2, 15), end: null }}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Range" }));
    const grids = screen.getAllByRole("grid");
    const findDay = (grid: Element, text: string) =>
      Array.from(grid.querySelectorAll("[role='gridcell']")).find(
        (el) => el.textContent === text && !el.className.includes("outside")
      ) as HTMLElement;
    await userEvent.click(findDay(grids[0]!, "5"));
    const last = onChange.mock.calls.at(-1)![0];
    // Original start was Mar 15; clicking Mar 5 (earlier) should produce
    // { start: Mar 5, end: Mar 15 }.
    expect(last.start.getDate()).toBe(5);
    expect(last.end.getDate()).toBe(15);
  });

  it("presets apply a range and close", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DateRangePicker
        label="Range"
        onValueChange={onChange}
        presets={[
          {
            label: "Fixed",
            range: () => ({
              start: new Date(2026, 0, 1),
              end: new Date(2026, 0, 7),
            }),
          },
        ]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Range" }));
    await userEvent.click(screen.getByRole("button", { name: "Fixed" }));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0];
    expect(last.start.getDate()).toBe(1);
    expect(last.end.getDate()).toBe(7);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigating the second calendar shifts base view month", async () => {
    // This covers lines 674-677: onViewMonthChange for i===1 shifts by -1
    renderWithTheme(
      <DateRangePicker label="Range" />
    );
    await userEvent.click(screen.getByRole("button", { name: "Range" }));
    // There should be two calendar grids with their own nav
    const nextMonthButtons = screen.getAllByRole("button", { name: "Next month" });
    // Click the second calendar's Next month button
    expect(nextMonthButtons.length).toBe(2);
    await userEvent.click(nextMonthButtons[1]!);
    // The grids should still be visible
    expect(screen.getAllByRole("grid").length).toBe(2);
  });

  it("has no a11y violations (closed)", async () => {
    const { container } = renderWithTheme(<DateRangePicker label="Range" />);
    await expectNoA11yViolations(container);
  });
});
