import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "../TimePicker";
import { DateTimePicker } from "../DateTimePicker";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("TimePicker (24h)", () => {
  it("renders hour + minute selects", () => {
    renderWithTheme(<TimePicker label="Time" defaultValue="14:30" />);
    const hour = screen.getByLabelText("Hours") as HTMLSelectElement;
    const minute = screen.getByLabelText("Minutes") as HTMLSelectElement;
    expect(hour.value).toBe("14");
    expect(minute.value).toBe("30");
  });

  it("hour select has 24 options", () => {
    renderWithTheme(<TimePicker label="Time" defaultValue="00:00" />);
    const hour = screen.getByLabelText("Hours") as HTMLSelectElement;
    expect(hour.options.length).toBe(24);
  });

  it("step reduces the minute option count", () => {
    renderWithTheme(<TimePicker label="Time" defaultValue="00:00" step={15} />);
    const minute = screen.getByLabelText("Minutes") as HTMLSelectElement;
    expect(minute.options.length).toBe(4); // 0, 15, 30, 45
  });

  it("changing hour calls onChange with canonical HH:mm", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker label="Time" defaultValue="09:00" onChange={onChange} />
    );
    await userEvent.selectOptions(screen.getByLabelText("Hours"), "14");
    expect(onChange).toHaveBeenCalledWith("14:00");
  });

  it("does not emit when value would violate min", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker
        label="Time"
        defaultValue="10:00"
        min="09:00"
        onChange={onChange}
      />
    );
    await userEvent.selectOptions(screen.getByLabelText("Hours"), "8");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("showSeconds exposes a seconds select", () => {
    renderWithTheme(<TimePicker label="Time" defaultValue="00:00:00" showSeconds />);
    expect(screen.getByLabelText("Seconds")).toBeInTheDocument();
  });
});

describe("TimePicker (12h)", () => {
  it("hour select has 12 options and correct mapping for PM", () => {
    renderWithTheme(<TimePicker label="Time" defaultValue="15:00" format="12h" />);
    const hour = screen.getByLabelText("Hours") as HTMLSelectElement;
    expect(hour.options.length).toBe(12);
    expect(hour.value).toBe("3"); // 15:00 → 3 PM
  });

  it("toggling PM moves 9 to 21", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker
        label="Time"
        defaultValue="09:00"
        format="12h"
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: "PM" }));
    expect(onChange).toHaveBeenCalledWith("21:00");
  });

  it("toggling AM at 21:00 drops to 09:00", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker
        label="Time"
        defaultValue="21:00"
        format="12h"
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: "AM" }));
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("12h setHour clamps correctly for hour 12 PM", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker
        label="Time"
        defaultValue="12:00"
        format="12h"
        onChange={onChange}
      />
    );
    // 12:00 PM → hour 12 in 24h. Change minute to verify we're at 12:xx
    await userEvent.selectOptions(screen.getByLabelText("Minutes"), "30");
    expect(onChange).toHaveBeenCalledWith("12:30");
  });

  it("12h setHour handles hour 12 AM (midnight)", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimePicker
        label="Time"
        defaultValue="00:00"
        format="12h"
        onChange={onChange}
      />
    );
    // 00:00 is 12 AM. Change minute.
    await userEvent.selectOptions(screen.getByLabelText("Minutes"), "15");
    expect(onChange).toHaveBeenCalledWith("00:15");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <TimePicker label="Start" defaultValue="09:30" format="12h" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("DateTimePicker", () => {
  it("renders a Date input and TimePicker selects", () => {
    renderWithTheme(
      <DateTimePicker
        label="When"
        defaultValue={new Date(2026, 2, 7, 14, 30)}
      />
    );
    expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
  });

  it("time change preserves the date", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DateTimePicker
        label="When"
        defaultValue={new Date(2026, 2, 7, 9, 0)}
        onChange={onChange}
      />
    );
    await userEvent.selectOptions(screen.getByLabelText("Hours"), "15");
    const last = onChange.mock.calls.at(-1)![0] as Date;
    expect(last.getFullYear()).toBe(2026);
    expect(last.getMonth()).toBe(2);
    expect(last.getDate()).toBe(7);
    expect(last.getHours()).toBe(15);
    expect(last.getMinutes()).toBe(0);
  });

  it("disables time inputs until a date is selected", () => {
    renderWithTheme(<DateTimePicker label="When" />);
    const hour = screen.getByLabelText("Hours") as HTMLSelectElement;
    expect(hour).toBeDisabled();
  });

  it("controlled mode round-trips through parent state", async () => {
    function Ctl() {
      const [v, setV] = useState<Date | null>(new Date(2026, 2, 7, 9, 0));
      return (
        <>
          <DateTimePicker label="When" value={v} onChange={setV} />
          <span data-testid="h">{v?.getHours()}</span>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    await userEvent.selectOptions(screen.getByLabelText("Hours"), "12");
    expect(screen.getByTestId("h")).toHaveTextContent("12");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <DateTimePicker label="When" defaultValue={new Date(2026, 2, 7, 14, 30)} />
    );
    await expectNoA11yViolations(container);
  });
});
