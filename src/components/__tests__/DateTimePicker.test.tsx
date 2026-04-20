import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DateTimePicker } from "../DateTimePicker";

describe("DateTimePicker", () => {
  it("renders the wrapper with the documented class and default aria-label", () => {
    const { container } = renderWithTheme(
      <DateTimePicker defaultValue={new Date(2024, 0, 15, 9, 30)} />
    );
    const wrapper = container.querySelector(".vf-datetime-picker");
    expect(wrapper).toBeTruthy();
    expect(wrapper!.getAttribute("aria-label")).toBe("Date and time");
  });

  it("uses a custom aria-label when a label prop is provided", () => {
    const { container } = renderWithTheme(
      <DateTimePicker
        label="Start"
        defaultValue={new Date(2024, 0, 15, 9, 30)}
      />
    );
    expect(
      container.querySelector(".vf-datetime-picker")!.getAttribute("aria-label")
    ).toBe("Start");
  });

  it("fires onValueChange with a new Date when the hour selector changes", () => {
    const onValueChange = vi.fn();
    const { container } = renderWithTheme(
      <DateTimePicker
        defaultValue={new Date(2024, 0, 15, 9, 30)}
        onValueChange={onValueChange}
      />
    );
    // TimePicker uses <select> for hour/minute. Find the hour select via its
    // aria-labelledby or position: it's the first <select> under the time block.
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBeGreaterThan(0);
    const hourSelect = selects[0]!;
    fireEvent.change(hourSelect, { target: { value: "14" } });
    expect(onValueChange).toHaveBeenCalled();
    const passed = onValueChange.mock.calls[0]![0] as Date;
    expect(passed.getHours()).toBe(14);
  });

  it("disables the time selects when no date is selected", () => {
    const { container } = renderWithTheme(<DateTimePicker />);
    const selects = Array.from(container.querySelectorAll("select"));
    expect(selects.length).toBeGreaterThan(0);
    // All time selects should be disabled since no date is chosen.
    for (const s of selects) {
      expect(s.disabled).toBe(true);
    }
  });
});
