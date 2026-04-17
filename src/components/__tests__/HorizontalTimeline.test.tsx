import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  HorizontalTimeline,
  type HorizontalTimelineEvent,
} from "../HorizontalTimeline";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const events: HorizontalTimelineEvent[] = [
  { key: "a", label: "Step 1", date: "Jan 1", status: "completed" },
  {
    key: "b",
    label: "Step 2",
    date: "Feb 1",
    description: "In progress",
    status: "active",
  },
  { key: "c", label: "Step 3", date: "Mar 1", status: "pending" },
  { key: "d", label: "Step 4", status: "error" },
];

describe("HorizontalTimeline", () => {
  it("renders events horizontally", () => {
    renderWithTheme(<HorizontalTimeline events={events} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
  });

  it("displays label and date", () => {
    renderWithTheme(<HorizontalTimeline events={events} />);
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Jan 1")).toBeInTheDocument();
  });

  it("applies active event class", () => {
    const { container } = renderWithTheme(
      <HorizontalTimeline events={events} />
    );
    const activeEvent = container.querySelector(
      ".vf-htimeline__event--active"
    );
    expect(activeEvent).toBeInTheDocument();
  });

  it.each(["completed", "active", "pending", "error"] as const)(
    "status=%s applies correct class",
    (status) => {
      const { container } = renderWithTheme(
        <HorizontalTimeline
          events={[{ key: "x", label: "Test", status }]}
        />
      );
      expect(
        container.querySelector(`.vf-htimeline__event--${status}`)
      ).toBeInTheDocument();
    }
  );

  it("renders connectors between events but not after last", () => {
    const { container } = renderWithTheme(
      <HorizontalTimeline events={events} />
    );
    const connectors = container.querySelectorAll(
      ".vf-htimeline__connector"
    );
    expect(connectors).toHaveLength(events.length - 1);
  });

  it("fires onEventClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(
      <HorizontalTimeline events={events} onEventClick={onClick} />
    );
    await user.click(screen.getByText("Step 2"));
    expect(onClick).toHaveBeenCalledWith("b");
  });

  it("scrollable adds scroll container class", () => {
    const { container } = renderWithTheme(
      <HorizontalTimeline events={events} scrollable />
    );
    expect(
      container.querySelector(".vf-htimeline--scrollable")
    ).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    const customEvents: HorizontalTimelineEvent[] = [
      { key: "x", label: "Custom", icon: <span data-testid="custom-icon">★</span> },
    ];
    renderWithTheme(<HorizontalTimeline events={customEvents} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders description", () => {
    renderWithTheme(<HorizontalTimeline events={events} />);
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it.each(["line", "arrow", "dots"] as const)(
    "connector=%s applies class",
    (connector) => {
      const { container } = renderWithTheme(
        <HorizontalTimeline events={events} connector={connector} />
      );
      expect(
        container.querySelector(`.vf-htimeline--connector-${connector}`)
      ).toBeInTheDocument();
    }
  );

  it.each(["sm", "md"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <HorizontalTimeline events={events} size={size} />
    );
    expect(
      container.querySelector(`.vf-htimeline--${size}`)
    ).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <HorizontalTimeline events={events} />
    );
    await expectNoA11yViolations(container);
  });
});
