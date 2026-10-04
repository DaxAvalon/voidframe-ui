import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { TransportStrip, formatClock, rollFraction, type TransportAction } from "../TransportStrip";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const ACTIONS: TransportAction[] = [
  { id: "record", label: "Record", binding: "Numpad 0", tone: "danger" },
  { id: "stop", label: "Stop", binding: "Numpad ." },
  { id: "punch", label: "Punch", binding: "Enter", tone: "warning" },
  { id: "marker", label: "Marker", binding: "Numpad +" },
  { id: "flag", label: "Flag", binding: "Numpad -", enabled: false },
];

describe("rollFraction", () => {
  it("maps remaining over total to 0..1 and clamps", () => {
    expect(rollFraction(5, 5)).toBe(1);
    expect(rollFraction(2.5, 5)).toBe(0.5);
    expect(rollFraction(0, 5)).toBe(0);
    expect(rollFraction(9, 5)).toBe(1);
    expect(rollFraction(-1, 5)).toBe(0);
  });
  it("is 0 without a positive total or with non-finite input", () => {
    expect(rollFraction(3, 0)).toBe(0);
    expect(rollFraction(Infinity, 5)).toBe(0);
    expect(rollFraction(3, NaN)).toBe(0);
  });
});

describe("formatClock", () => {
  it("formats minutes and seconds, and hours when needed", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(724.9)).toBe("12:04");
    expect(formatClock(3723)).toBe("1:02:03");
  });
  it("reads negative and non-finite as 0:00", () => {
    expect(formatClock(-4)).toBe("0:00");
    expect(formatClock(NaN)).toBe("0:00");
  });
});

describe("TransportStrip", () => {
  it("renders the actions as a toolbar of buttons named with their bindings", () => {
    renderWithTheme(<TransportStrip actions={ACTIONS} state={{ label: "Idle" }} onAction={() => {}} />);
    const toolbar = screen.getByRole("toolbar", { name: "Transport" });
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Punch, Enter" })).toHaveAttribute("aria-keyshortcuts", "Enter");
    expect(screen.getByRole("button", { name: "Record, Numpad 0" })).toHaveAttribute("data-tone", "danger");
    expect(screen.getByRole("button", { name: "Flag, Numpad -" })).toBeDisabled();
    expect(toolbar.querySelectorAll("kbd")).toHaveLength(5);
  });

  it("fires onAction with the id, and not for a disabled action", () => {
    const onAction = vi.fn();
    renderWithTheme(<TransportStrip actions={ACTIONS} state={{ label: "Idle" }} onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Punch, Enter" }));
    fireEvent.click(screen.getByRole("button", { name: "Flag, Numpad -" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("punch");
  });

  it("marks a pressed action", () => {
    renderWithTheme(
      <TransportStrip actions={[{ id: "arm", label: "Arm", pressed: true }]} state={{ label: "Armed", tone: "warning" }} onAction={() => {}} data-testid="t" />
    );
    expect(screen.getByRole("button", { name: "Arm" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("t")).toHaveAttribute("data-tone", "warning");
  });

  it("shows the state word, and the recording indicator while recording", () => {
    const { rerender } = renderWithTheme(<TransportStrip actions={ACTIONS} state={{ label: "Rolling", tone: "warning" }} onAction={() => {}} data-testid="t" />);
    expect(screen.getByTestId("t").querySelector(".vf-transport__word")).toHaveTextContent("Rolling");
    rerender(<TransportStrip actions={ACTIONS} state={{ label: "Recording", tone: "danger", recording: true }} onAction={() => {}} data-testid="t" />);
    const t = screen.getByTestId("t");
    expect(t.querySelector(".vf-live-indicator__pulse--recording")).not.toBeNull();
    expect(t).toHaveAttribute("data-state", "Recording");
  });

  it("formats elapsed and remaining, and sizes the roll bar", () => {
    renderWithTheme(
      <TransportStrip actions={ACTIONS} state={{ label: "Rolling", tone: "warning" }} elapsed={724} remaining={2.5} rollTotal={5} onAction={() => {}} data-testid="t" />
    );
    const t = screen.getByTestId("t");
    expect(t.querySelector(".vf-transport__time")).toHaveTextContent("elapsed 12:04");
    expect(t.querySelector(".vf-transport__remaining")).toHaveTextContent("remaining 0:02");
    expect(t).toHaveClass("vf-transport--rolling");
    expect((t.querySelector(".vf-transport__roll-bar") as HTMLElement).style.width).toBe("50%");
  });

  it("hides the roll bar and the remaining clock when not rolling", () => {
    renderWithTheme(<TransportStrip actions={ACTIONS} state={{ label: "Idle" }} elapsed={3} remaining={null} onAction={() => {}} data-testid="t" />);
    const t = screen.getByTestId("t");
    expect(t.querySelector(".vf-transport__roll")).toBeNull();
    expect(t.querySelector(".vf-transport__remaining")).toBeNull();
    expect(t).not.toHaveClass("vf-transport--rolling");
  });

  it("honours a custom formatter, label and size", () => {
    renderWithTheme(
      <TransportStrip actions={ACTIONS} state={{ label: "Idle" }} elapsed={61} formatTime={(s) => `${s}s`} label="Booth" size="lg" onAction={() => {}} data-testid="t" />
    );
    expect(screen.getByRole("toolbar", { name: "Booth" })).toBeInTheDocument();
    expect(screen.getByTestId("t")).toHaveClass("vf-transport--lg");
    expect(screen.getByTestId("t").querySelector(".vf-transport__time")).toHaveTextContent("61s");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <TransportStrip actions={ACTIONS} state={{ label: "Recording", tone: "danger", recording: true }} elapsed={724} remaining={2.5} rollTotal={5} size="lg" onAction={() => {}} />
    );
    await expectNoA11yViolations(container);
  });
});
