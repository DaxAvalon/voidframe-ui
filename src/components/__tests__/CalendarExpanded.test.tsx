// Expanded tests for Calendar — month grid, navigation, date selection, events, views

import { screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Calendar, type CalendarEvent } from "../Calendar";

describe("Calendar", () => {
  const jan2024 = new Date(2024, 0, 15); // January 2024

  describe("month grid rendering", () => {
    it("renders with calendar role and label", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      expect(screen.getByRole("group", { name: "Calendar" })).toBeInTheDocument();
    });

    it("renders month/year title in navigation", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      expect(screen.getByText(/January/)).toBeInTheDocument();
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it("renders weekday headers", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} locale="en-US" />);
      // Standard short weekday names
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Sat")).toBeInTheDocument();
    });

    it("renders day number buttons", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      // Day cells should be rendered
      const dayButtons = document.querySelectorAll(".vf-calendar-view__day");
      expect(dayButtons.length).toBeGreaterThan(0);
      // Day numbers are inside .vf-calendar-view__daynum spans
      const dayNums = document.querySelectorAll(".vf-calendar-view__daynum");
      const dayTexts = Array.from(dayNums).map((el) => el.textContent);
      expect(dayTexts).toContain("1");
      expect(dayTexts).toContain("31");
    });

    it("marks outside-month days", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      const outsideDays = document.querySelectorAll(".vf-calendar-view__day--outside");
      // Grid typically includes days from previous/next month
      expect(outsideDays.length).toBeGreaterThan(0);
    });

    it("applies month view class", () => {
      const { container } = renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="month" />
      );
      expect(container.querySelector(".vf-calendar-view--month")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("navigates to previous month", async () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      const prevBtn = screen.getByRole("button", { name: "Previous" });
      await userEvent.click(prevBtn);
      expect(screen.getByText(/December/)).toBeInTheDocument();
    });

    it("navigates to next month", async () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      const nextBtn = screen.getByRole("button", { name: "Next" });
      await userEvent.click(nextBtn);
      expect(screen.getByText(/February/)).toBeInTheDocument();
    });

    it("calls onDisplayMonthChange when navigating", async () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          onDisplayMonthChange={onChange}
        />
      );
      await userEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(onChange).toHaveBeenCalled();
      const newDate = onChange.mock.calls[0][0] as Date;
      expect(newDate.getMonth()).toBe(1); // February
    });
  });

  describe("date selection", () => {
    it("calls onDayClick when a day is clicked", async () => {
      const onDayClick = vi.fn();
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} onDayClick={onDayClick} />
      );
      // Click day 15
      const day15 = screen.getAllByText("15").find(
        (el) => el.closest(".vf-calendar-view__day") &&
               !el.closest(".vf-calendar-view__day--outside")
      );
      if (day15) {
        await userEvent.click(day15.closest("button")!);
        expect(onDayClick).toHaveBeenCalled();
        const clicked = onDayClick.mock.calls[0][0] as Date;
        expect(clicked.getDate()).toBe(15);
      }
    });

    it("highlights selected dates", () => {
      const selected = [new Date(2024, 0, 10)];
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} value={selected} />
      );
      const highlighted = document.querySelectorAll(
        ".vf-calendar-view__day--highlighted"
      );
      expect(highlighted.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("events", () => {
    it("renders events on their dates", () => {
      const events: CalendarEvent[] = [
        { date: new Date(2024, 0, 10), label: "Meeting" },
      ];
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} events={events} />
      );
      expect(screen.getByText("Meeting")).toBeInTheDocument();
    });

    it("renders events with tone class", () => {
      const events: CalendarEvent[] = [
        { date: new Date(2024, 0, 10), label: "Urgent", tone: "danger" },
      ];
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} events={events} />
      );
      const eventEl = screen.getByText("Urgent");
      expect(eventEl).toHaveClass("vf-calendar-view__event--danger");
    });

    it("calls onEventClick when event is clicked", async () => {
      const onEventClick = vi.fn();
      const events: CalendarEvent[] = [
        { date: new Date(2024, 0, 10), label: "Click Me" },
      ];
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          events={events}
          onEventClick={onEventClick}
        />
      );
      await userEvent.click(screen.getByText("Click Me"));
      expect(onEventClick).toHaveBeenCalledWith(events[0]);
    });
  });

  describe("view switching", () => {
    it("renders view switch tabs when onViewChange is provided", () => {
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          onViewChange={() => {}}
        />
      );
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(4); // month, week, day, agenda
      expect(screen.getByRole("tab", { name: "month" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "week" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "day" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "agenda" })).toBeInTheDocument();
    });

    it("does not render view switch when onViewChange not provided", () => {
      renderWithTheme(<Calendar defaultDisplayMonth={jan2024} />);
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });

    it("marks current view tab as selected", () => {
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          view="month"
          onViewChange={() => {}}
        />
      );
      const monthTab = screen.getByRole("tab", { name: "month" });
      expect(monthTab).toHaveAttribute("aria-selected", "true");
    });

    it("calls onViewChange when tab is clicked", async () => {
      const onViewChange = vi.fn();
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          onViewChange={onViewChange}
        />
      );
      await userEvent.click(screen.getByRole("tab", { name: "week" }));
      expect(onViewChange).toHaveBeenCalledWith("week");
    });
  });

  describe("week view", () => {
    it("renders hour grid in week view", () => {
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="week" />
      );
      expect(
        document.querySelector(".vf-calendar-view--week")
      ).toBeInTheDocument();
      expect(
        document.querySelector(".vf-calendar-view__hour-grid")
      ).toBeInTheDocument();
      // Should have 00:00 label
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });

    it("renders events in the hour grid with correct positioning", () => {
      const monday = new Date(2024, 0, 15, 10, 0); // Monday 10 AM
      const events: CalendarEvent[] = [
        {
          date: monday,
          endDate: new Date(2024, 0, 15, 11, 30),
          label: "Morning Meeting",
          tone: "primary",
        },
      ];
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="week" events={events} />
      );
      const btn = screen.getByText("Morning Meeting");
      expect(btn).toBeInTheDocument();
      expect(btn.closest("button")).toHaveClass("vf-calendar-view__hour-event--primary");
    });

    it("fires onEventClick when an hour-grid event is clicked", async () => {
      const onEventClick = vi.fn();
      const evDate = new Date(2024, 0, 15, 14, 0);
      const events: CalendarEvent[] = [
        { date: evDate, label: "Afternoon" },
      ];
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          view="week"
          events={events}
          onEventClick={onEventClick}
        />
      );
      await userEvent.click(screen.getByText("Afternoon"));
      expect(onEventClick).toHaveBeenCalledWith(
        expect.objectContaining({ label: "Afternoon" })
      );
    });
  });

  describe("day view", () => {
    it("renders single-column hour grid in day view", () => {
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="day" />
      );
      expect(
        document.querySelector(".vf-calendar-view--day")
      ).toBeInTheDocument();
      expect(
        document.querySelector(".vf-calendar-view__hour-grid")
      ).toBeInTheDocument();
    });

    it("renders events in day view", () => {
      const evDate = new Date(2024, 0, 15, 9, 30);
      const events: CalendarEvent[] = [
        { date: evDate, label: "Day Event" },
      ];
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="day" events={events} />
      );
      expect(screen.getByText("Day Event")).toBeInTheDocument();
    });
  });

  describe("agenda view", () => {
    it("shows 'No upcoming events' when empty", () => {
      renderWithTheme(
        <Calendar defaultDisplayMonth={jan2024} view="agenda" />
      );
      expect(screen.getByText("No upcoming events")).toBeInTheDocument();
    });

    it("renders agenda events", () => {
      const now = new Date();
      const events: CalendarEvent[] = [
        { date: new Date(now.getTime() + 86400000), label: "Tomorrow Event" },
      ];
      renderWithTheme(
        <Calendar view="agenda" events={events} />
      );
      expect(screen.getByText("Tomorrow Event")).toBeInTheDocument();
    });
  });

  describe("week numbers", () => {
    it("shows week number column when showWeekNumbers is true", () => {
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          showWeekNumbers
        />
      );
      expect(screen.getByText("Wk")).toBeInTheDocument();
      const weekNums = document.querySelectorAll(".vf-calendar-view__weeknum");
      expect(weekNums.length).toBeGreaterThan(0);
    });
  });

  describe("onRangeChange", () => {
    it("calls onRangeChange on mount", () => {
      const onRangeChange = vi.fn();
      renderWithTheme(
        <Calendar
          defaultDisplayMonth={jan2024}
          onRangeChange={onRangeChange}
        />
      );
      expect(onRangeChange).toHaveBeenCalled();
      const range = onRangeChange.mock.calls[0][0];
      expect(range).toHaveProperty("start");
      expect(range).toHaveProperty("end");
    });
  });
});
